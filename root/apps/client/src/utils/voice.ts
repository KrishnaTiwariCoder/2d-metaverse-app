import { useSelector } from "react-redux";
import { useEffect, useRef } from "react";

const useWebRTC = ({ wsRef }: any) => {
  const localStream = useRef<MediaStream | null>(null);
  const connections = useRef<{ [userId: string]: RTCPeerConnection }>({});
  const audioRefs = useRef<{ [userId: string]: HTMLAudioElement }>({});
  const myId = useSelector((state: any) => state.auth.myId);

  const createOfferFunction = async (
    peerConnection: RTCPeerConnection,
    targetPeerId: string
  ) => {
    try {
      const rs = await new Promise((r) => {
        const timer = setInterval(() => {
          if (localStream.current) {
            clearInterval(timer);
            r(localStream.current);
          }
        }, 300);
      });
      if (rs) {
        console.log(rs.getTracks()[0], "tracks");
        peerConnection.addTrack(rs.getTracks()[0]);
      }
      // peerConnection.addTrack(localStream.current!.getTracks()[0]);
      const offer = await peerConnection.createOffer();
      console.log(offer, "offer created");
      await peerConnection.setLocalDescription(offer);

      // console.log("6");

      wsRef.current?.send(
        JSON.stringify({
          type: "relay-sdp",
          payload: {
            userId: targetPeerId,
            sdp: offer,
          },
        })
      );
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  const createPeerConnection = (targetPeerId: string, createOffer: boolean) => {
    // Prevent duplicate peer connections
    if (connections.current[targetPeerId])
      return connections.current[targetPeerId];

    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    // Add local stream tracks to the connection
    if (localStream.current) {
      // console.log("5");
      localStream.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream.current!);
        // console.log("adding tracks", track, localStream.current!, track.kind);
      });
    } else {
      new Promise((resolve) => {
        if (localStream.current) {
          resolve(localStream.current);
        }
      }).then((stream: any) => {
        // console.log("6");
        stream.getTracks().forEach((track: any) => {
          peerConnection.addTrack(track, localStream.current!);
          // console.log("adding tracks", track, localStream.current!, track.kind);
        });
      });
    }
    // console.log("4");

    // Handle ICE candidates - send only once
    const iceCandidatesSent = new Set<string>();
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        const candidateKey = JSON.stringify(event.candidate);
        if (!iceCandidatesSent.has(candidateKey)) {
          wsRef.current?.send(
            JSON.stringify({
              type: "relay-ice",
              payload: {
                userId: targetPeerId,
                ice: event.candidate,
              },
            })
          );
          iceCandidatesSent.add(candidateKey);
        }
      }
    };

    // Handle incoming tracks

    peerConnection.ontrack = (event) => {
      const audioRef = audioRefs.current[targetPeerId];
      if (!audioRefs.current[targetPeerId]) {
        console.warn("No audio element found for", targetPeerId);
        return;
      }
      audioRef.srcObject = event.streams[0];
      console.log("--------------------------------");
      console.log("streams came", event.streams[0]);

      console.log("local audioelement to be set", audioRef, targetPeerId);
      console.log("all the local audio elements", audioRefs.current);
      console.log("----------------------------------");
      // if (audioRef) {
      //   audioRef.srcObject = event.streams[0];
      // }
    };

    // Create and store the new peer

    // Create offer if required
    if (createOffer) {
      createOfferFunction(peerConnection, targetPeerId);
    }

    connections.current[targetPeerId] = peerConnection;
    return peerConnection;
  };

  const removePeerConnection = (targetPeerId: string) => {
    const peerConnection = connections.current[targetPeerId];
    if (peerConnection) {
      peerConnection.close();
      delete connections.current[targetPeerId];
    }
  };

  const handleServerMessage = async (message: any) => {
    message = JSON.parse(message.data);
    switch (message.type) {
      case "add-peer": {
        // console.log("3");
        const { userId, createOffer } = message.payload;
        if (userId === myId) break;
        if (connections.current[userId]) break;
        createPeerConnection(userId, createOffer);
        break;
      }
      case "remove-peer": {
        const { userId } = message.payload;
        removePeerConnection(userId);
        break;
      }
      case "ice": {
        const { userId, icecandidate } = message.payload;
        if (userId === myId) return;
        // console.log(8, userId, icecandidate);
        const connection = connections.current[userId];
        if (connection && icecandidate) {
          try {
            await connection.addIceCandidate(icecandidate);
          } catch (error) {
            console.error("Error adding ICE candidate:", error);
          }
        }
        break;
      }
      case "sdp": {
        const { userId, sdp } = message.payload;
        // console.log(7, userId, sdp);
        if (userId === myId) return;
        const connection = connections.current[userId];
        if (connection) {
          try {
            await connection.setRemoteDescription(sdp);
            if (sdp.type === "offer") {
              const answer = await connection.createAnswer();

              await connection.setLocalDescription(answer);

              wsRef.current?.send(
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
            console.error("Error handling remote SDP:", error);
          }
        }
        break;
      }
      default:
        console.warn(`Unknown message type: ${message.type}`);
        break;
    }
  };

  const startCapture = async () => {
    try {
      wsRef.current?.addEventListener("message", handleServerMessage);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      localStream.current = stream;
      // console.log("tracks ", stream.getTracks());
      // console.log("1");
    } catch (err) {
      console.error("Error accessing local media stream:", err);
    }
  };

  const toggleMute = () => {};

  useEffect(() => {
    // console.log("2");
    wsRef.current?.addEventListener("message", handleServerMessage);
    return () => {
      wsRef.current?.removeEventListener("message", handleServerMessage);
    };
  }, []);

  return {
    startCapture,
    toggleMute,
    audioRefs,
  };
};

export default useWebRTC;
