import { useCallback, useEffect } from "react";
import freeice from "freeice";
import { Player } from "./arena";

const useWebRTC = ({
  ws,
  players,
  setPlayers,
  myId,
  audioRefs,
  localStream,
}: {
  ws: any;
  players: any;
  setPlayers: any;
  myId: string;
  audioRefs: any;
  localStream: any;
}) => {
  // capture media
  useEffect(() => {
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
        console.error("Error accessing local media stream", err);
      }
    };
    startCapture().catch(() => {});
  }, [myId]);

  const sendIceCandidate = useCallback(
    (userId: string, candidate: RTCIceCandidate) => {
      if (ws.current && candidate) {
        ws.current.send(
          JSON.stringify({
            type: "ice-candidate",
            payload: {
              userId,
              iceCandidate: {
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
    (userId: any) => {
      const connection = new RTCPeerConnection({
        iceServers: freeice(),
        iceCandidatePoolSize: 10,
      });

      connection.onicecandidate = (event) => {
        if (event.candidate) {
          sendIceCandidate(userId, event.candidate);
        }
      };

      connection.ontrack = ({ streams: [remoteStream] }: any) => {
        const audioElement = audioRefs.current[userId];

        if (audioElement) {
          audioElement.srcObject = remoteStream;
        } else {
          // let settled = false;
          // const interval = setInterval(() => {
          //   if (audioElement) {
          //     audioElement.srcObject = remoteStream;
          //     settled = true;
          //   }
          //   if (settled) {
          //     clearInterval(interval);
          //   }
          // }, 300);
        }
      };

      // Add local stream tracks if available
      if (localStream.current) {
        localStream.current.getTracks().forEach((track: any) => {
          connection.addTrack(track, localStream.current);
        });
      }

      return connection;
    },
    [localStream, audioRefs, sendIceCandidate]
  );

  const handleNewPeer = async (userId: any, createOffer: boolean) => {
    console.log(userId, createOffer);
    const playerExist = players.find((p: any) => p.id === userId);
    if (playerExist && playerExist.connection) {
      return console.warn(
        `You are already connected with ${playerExist.name})`
      );
    }

    setPlayers((prev: Player[]) => {
      return prev.map((p: Player) => {
        if (p.id === userId) {
          return { ...p, connection: createPeerConnection(userId) };
        }
        return p;
      });
    });

    if (createOffer) {
      const player = players.find((p: Player) => p.id === userId);
      if (player?.connection) {
        try {
          const offer = await player.connection.createOffer();
          await player.connection.setLocalDescription(offer);

          ws.current.send(
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
    }
  };

  const handleIceCandidate = async (
    userId: string,
    iceCandidate: RTCIceCandidate
  ) => {
    const player = players.find((p: Player) => p.id === userId);
    if (player?.connection) {
      try {
        await player.connection.addIceCandidate(
          new RTCIceCandidate(iceCandidate)
        );
      } catch (error) {
        console.error("ICE candidate error:", error);
      }
    }
  };

  const handleRemoteSdp = async (
    userId: string,
    remoteSdp: RTCSessionDescription
  ) => {
    const player = players.find((p: Player) => p.id === userId);
    if (!player?.connection) return;
    try {
      await player.connection.setRemoteDescription(
        new RTCSessionDescription(remoteSdp)
      );

      if (remoteSdp.type === "offer") {
        const answer = await player.connection.createAnswer();
        await player.connection.setLocalDescription(answer);

        ws.current.send(
          JSON.stringify({
            type: "relay-sdp",
            payload: {
              userId,
              sessionDescription: answer,
            },
          })
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!ws.current) return;

    const handleMessage = async (event: any) => {
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
      }
    };

    ws.current.addEventListener("message", handleMessage);

    return () => ws.current.removeEventListener("message", handleMessage);
  }, [players, ws]);

  return {
    ws,
    players,
    setPlayers,
    myId,
    audioRefs,
    localStream,
  };
};

export default useWebRTC;
