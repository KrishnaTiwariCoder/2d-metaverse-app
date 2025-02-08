import { useCallback, useEffect, useRef } from "react";
import { Player } from "../redux/gameSlice";

const useWebRTC = ({
  ws,
  players,
  setPlayers,
  myId,
  audioRefs,
}: {
  ws: React.RefObject<WebSocket>;
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  myId: string;
  audioRefs: React.MutableRefObject<Record<string, HTMLAudioElement>>;
}) => {
  const localStream = useRef<MediaStream | null>(null);

  const startCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      localStream.current = stream;

      if (audioRefs.current[myId]) {
        audioRefs.current[myId].srcObject = stream;
        audioRefs.current[myId].volume = 0; // Mute your own audio to avoid echo
        audioRefs.current[myId].play();
      }
    } catch (err) {
      console.error("Error accessing local media stream:", err);
    }
  };

  useEffect(() => {
    startCapture().catch(console.error);
  }, [myId]);

  const sendIceCandidate = useCallback(
    (userId: string, candidate: RTCIceCandidate) => {
      if (ws.current && candidate) {
        ws.current.send(
          JSON.stringify({
            type: "relay-ice",
            payload: {
              userId,
              icecandidate: {
                candidate: candidate.candidate,
                sdpMid: candidate.sdpMid,
                sdpMLineIndex: candidate.sdpMLineIndex,
              },
            },
          })
        );
      }
    },
    [ws]
  );

  const createPeerConnection = useCallback(
    (userId: string) => {
      const connection = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      // Handle ICE candidates
      connection.onicecandidate = (event) => {
        if (event.candidate) {
          sendIceCandidate(userId, event.candidate);
        }
      };

      // Handle incoming remote tracks
      connection.ontrack = (event) => {
        const [remoteStream] = event.streams;
        const audioElement = audioRefs.current[userId];

        console.log(
          "when we joined the other room members add our stream to thier audioRefs ",
          audioElement,
          remoteStream
        );

        if (audioElement && remoteStream) {
          audioElement.srcObject = remoteStream;
        }
      };

      // Add local tracks to the connection
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => {
          connection.addTrack(track, localStream.current!);
          // console.log("--------------------------------------");
          // console.log(track, localStream.current);
          // console.log("--------------------------------------");
        });
      }
      // create a time interval so that until the addTracks is over the function shouold not proceed

      return connection;
    },
    [audioRefs, sendIceCandidate, localStream]
  );

  const handleNewPeer = useCallback(
    async (userId: string, createOffer: boolean) => {
      const existingPlayer = players.find((p) => p.id === userId);
      if (existingPlayer?.connection) {
        console.warn(`Already connected to ${existingPlayer.name}`);
        return;
      }

      const connection = createPeerConnection(userId);

      setPlayers((prev) =>
        prev.map((p) => (p.id === userId ? { ...p, connection } : p))
      );

      if (createOffer) {
        try {
          const offer = await connection.createOffer();
          await connection.setLocalDescription(offer);

          ws.current?.send(
            JSON.stringify({
              type: "relay-sdp",
              payload: {
                userId,
                sdp: offer,
              },
            })
          );
        } catch (err) {
          console.error("Error creating offer:", err);
        }
      }
    },
    [createPeerConnection, players, setPlayers, ws]
  );

  const handleIceCandidate = useCallback(
    async (userId: string, iceCandidate: RTCIceCandidate) => {
      const player = players.find((p) => p.id === userId);
      if (player?.connection) {
        try {
          await player.connection.addIceCandidate(iceCandidate);
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      }
    },
    [players]
  );

  const handleRemoteSdp = useCallback(
    async (userId: string, remoteSdp: RTCSessionDescription) => {
      const player = players.find((p) => p.id === userId);
      if (!player?.connection) {
        console.warn(`Connection not found for user: ${userId}`);
        return;
      }

      try {
        await player.connection.setRemoteDescription(remoteSdp);

        if (remoteSdp.type === "offer") {
          const answer = await player.connection.createAnswer();
          await player.connection.setLocalDescription(answer);

          ws.current?.send(
            JSON.stringify({
              type: "relay-sdp",
              payload: {
                userId,
                sdp: answer,
              },
            })
          );
        }
      } catch (err) {
        console.error("Error handling remote SDP:", err);
      }
    },
    [players, ws]
  );

  useEffect(() => {
    if (!ws.current) return;

    const handleMessage = async (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "add-peer": {
          const { userId, createOffer } = message.payload;
          await handleNewPeer(userId, createOffer);
          break;
        }
        case "ice-candidate": {
          const { userId, icecandidate } = message.payload;
          await handleIceCandidate(userId, icecandidate);
          break;
        }
        case "sdp": {
          const { userId, sdp } = message.payload;
          await handleRemoteSdp(userId, sdp);
          break;
        }
        default:
          console.warn(`Unknown message type: ${message.type}`);
      }
    };

    ws.current.addEventListener("message", handleMessage);
    return () => ws.current?.removeEventListener("message", handleMessage);
  }, [ws, handleNewPeer, handleIceCandidate, handleRemoteSdp]);

  return null;
};

export default useWebRTC;
