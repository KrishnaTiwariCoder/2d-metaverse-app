import { useCallback, useEffect, useRef } from "react";
import { Player } from "./arena";

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
        audioRefs.current[myId].volume = 0;
        audioRefs.current[myId].srcObject = stream;
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
          { urls: "stun:stun.stunprotocol.org:3478" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      // Handle ICE candidates
      connection.onicecandidate = (event) => {
        if (event.candidate) {
          sendIceCandidate(userId, event.candidate);
        }
      };

      // Handle incoming tracks
      connection.ontrack = ({ streams: [remoteStream] }) => {
        const audioElement = audioRefs.current[userId];
        if (audioElement && remoteStream) {
          audioElement.srcObject = remoteStream;
        }
      };

      // Add local stream tracks to the connection
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => {
          connection.addTrack(track, localStream.current!);
        });
      } else {
        console.warn(
          "Local stream is not initialized when creating the connection."
        );
      }

      return connection;
    },
    [audioRefs, sendIceCandidate, localStream]
  );

  const handleNewPeer = useCallback(
    async (userId: string, createOffer: boolean) => {
      const playerExist = players.find((p) => p.id === userId);
      if (playerExist?.connection) {
        console.warn(`You are already connected with ${playerExist.name}`);
        return;
      }

      const newConnection = createPeerConnection(userId);

      setPlayers((prev) =>
        prev.map((p) =>
          p.id === userId ? { ...p, connection: newConnection } : p
        )
      );

      if (createOffer) {
        try {
          const offer = await newConnection.createOffer();
          await newConnection.setLocalDescription(offer);

          ws.current?.send(
            JSON.stringify({
              type: "relay-sdp",
              payload: {
                userId,
                sdp: offer,
              },
            })
          );
        } catch (error) {
          console.error("Offer creation error:", error);
        }
      }
    },
    [players, createPeerConnection, ws]
  );

  const handleIceCandidate = useCallback(
    async (userId: string, iceCandidate: RTCIceCandidate) => {
      const player = players.find((p) => p.id === userId);
      if (player?.connection) {
        try {
          await player.connection.addIceCandidate(iceCandidate);
        } catch (error) {
          console.error("ICE candidate error:", error);
        }
      }
    },
    [players]
  );

  const handleRemoteSdp = useCallback(
    async (userId: string, remoteSdp: RTCSessionDescriptionInit) => {
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
      } catch (error) {
        console.error("Remote SDP error:", error);
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
          console.warn("Unknown message type:", message.type);
      }
    };

    ws.current.addEventListener("message", handleMessage);
    return () => ws.current?.removeEventListener("message", handleMessage);
  }, [handleNewPeer, handleIceCandidate, handleRemoteSdp, ws]);

  return { localStream };
};

export default useWebRTC;
