import { useSelector } from "react-redux";
import { useCallback, useEffect, useRef } from "react";

const useWebRTC = ({ wsRef }: any) => {
  const localStream = useRef<MediaStream | null>(null);
  const connections = useRef<{ [userId: string]: RTCPeerConnection }>({});
  const audioRefs = useRef<{ [userId: string]: HTMLAudioElement }>({});
  const videoRefs = useRef<{ [userId: string]: HTMLVideoElement }>({});
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const myId = useSelector((state: any) => state.auth.myId);

  const createOfferFunction = async (
    peerConnection: RTCPeerConnection,
    targetPeerId: string
  ) => {
    try {
      const rs: MediaStream = await new Promise((r) => {
        const timer = setInterval(() => {
          if (localStream.current) {
            clearInterval(timer);
            r(localStream.current);
          }
        }, 300);
      });
      if (rs) {
        rs.getTracks().forEach((track) => {
          peerConnection.addTrack(track, rs);
        });
      }

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

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
    if (connections.current[targetPeerId])
      return connections.current[targetPeerId];

    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    const iceCandidatesSent = new Set<string>();
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        const candidateKey = `${event.candidate.candidate}-${event.candidate.sdpMid}`;
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

    peerConnection.ontrack = (event) => {
      const audioRef = audioRefs.current[targetPeerId];
      const videoRef = videoRefs.current[targetPeerId];

      if (event.streams && event.streams[0]) {
        const stream = event.streams[0];

        // Handle audio track
        if (audioRef && event.track.kind === "audio") {
          audioRef.srcObject = stream;
        }

        // Handle video track
        if (videoRef && event.track.kind === "video") {
          videoRef.srcObject = stream;
        }
      }
    };

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

      // Clean up media elements
      if (audioRefs.current[targetPeerId]) {
        const audioEl = audioRefs.current[targetPeerId];
        audioEl.srcObject = null;
        delete audioRefs.current[targetPeerId];
      }

      if (videoRefs.current[targetPeerId]) {
        const videoEl = videoRefs.current[targetPeerId];
        videoEl.srcObject = null;
        delete videoRefs.current[targetPeerId];
      }
    }
  };

  const handleRemoteSDP = async (
    sdp: RTCSessionDescriptionInit,
    peerConnection: RTCPeerConnection,
    userId: string
  ) => {
    try {
      if (sdp.type === "offer") {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(sdp)
        );

        if (localStream.current) {
          localStream.current.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localStream.current!);
          });
        }

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        wsRef.current?.send(
          JSON.stringify({
            type: "relay-sdp",
            payload: { userId, sdp: answer },
          })
        );
      } else if (sdp.type === "answer") {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(sdp)
        );
      }
    } catch (error) {
      console.error("Error in handleRemoteSDP:", error);
    }
  };

  const handleServerMessage = async (message: any) => {
    const parsedMessage = JSON.parse(message.data);
    switch (parsedMessage.type) {
      case "add-peer": {
        const { userId, createOffer } = parsedMessage.payload;
        console.log(userId, createOffer);
        if (userId === myId) return;
        createPeerConnection(userId, createOffer);
        break;
      }
      case "remove-peer": {
        const { userId } = parsedMessage.payload;
        removePeerConnection(userId);
        break;
      }
      case "sdp": {
        const { userId, sdp } = parsedMessage.payload;
        let connection = connections.current[userId];
        if (!connection) {
          const newConnection = createPeerConnection(userId, false);
          if (newConnection) {
            connection = newConnection;
          } else {
            return;
          }
        }
        if (connection) {
          await handleRemoteSDP(sdp, connection, userId);
        }
        break;
      }
      case "ice": {
        const { userId, ice } = parsedMessage.payload;
        if (userId === myId) return;
        const connection = connections.current[userId];
        if (connection && ice) {
          try {
            await connection.addIceCandidate(ice);
          } catch (error) {
            console.error("Error adding ICE candidate:", error);
          }
        }
        break;
      }
    }
  };

  const startCapture = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      localStream.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing local media stream:", err);
    }
  }, []);

  const toggleMute = (type: "audio" | "video") => {
    if (localStream.current) {
      if (type === "audio") {
        const audioTrack = localStream.current.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !audioTrack.enabled;
        }
      } else {
        const videoTrack = localStream.current.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = !videoTrack.enabled;
        }
      }
    }
  };

  useEffect(() => {
    wsRef.current?.addEventListener("message", handleServerMessage);
    return () => {
      wsRef.current?.removeEventListener("message", handleServerMessage);
      // Cleanup streams and connections
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
      }
      Object.keys(connections.current).forEach((userId) => {
        removePeerConnection(userId);
      });
    };
  }, []);

  return {
    startCapture,
    toggleMute,
    audioRefs,
    videoRefs,
    localVideoRef,
  };
};

export default useWebRTC;
