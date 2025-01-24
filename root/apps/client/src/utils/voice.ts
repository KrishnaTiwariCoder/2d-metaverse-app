import { useEffect } from "react";
import freeice from "freeice";
import { Player } from "./arena";
// import { Player } from "./arena";
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
          video: true,
        });
        localStream.current = stream;
      } catch (err) {
        console.error("Error accessing local media stream", err);
      }
    };
    startCapture()
      .then(() => {
        audioRefs.current[myId].volume = 0;
        audioRefs.current[myId].srcObject = localStream.current;
      })
      .catch(() => {});
  }, [audioRefs, myId]);

  useEffect(() => {
    console.log(localStream.current, "changed");
  }, [localStream.current]);

  useEffect(() => {
    if (!ws.current) return;

    const handleNewPeer = async (userId: any, createOffer: boolean) => {
      const playerExist = players.find((p: any) => p.id === userId);
      if (playerExist && playerExist.connection) {
        return console.warn(
          `You are already connected with ${playerExist.name})`
        );
      }
      // Store i  t to connections
      setPlayers((prev: any) => {
        const updated = prev.map((p: Player) => {
          if (p.id === userId) {
            p.connection = new RTCPeerConnection({
              iceServers: freeice(),
            });
            p.connection.onicecandidate = (event: any) => {
              ws.current.send("relay-ice", {
                userId,
                icecandidate: event.candidate,
              });
            };
            p.connection.ontrack = ({ streams: [remoteStream] }: any) => {
              if (audioRefs.current[p.id]) {
                audioRefs.current[p.id].srcObject = remoteStream;
              } else {
                let settled = false;
                const interval = setInterval(() => {
                  if (audioRefs.current[p.id]) {
                    audioRefs.current[p.id].srcObject = remoteStream;
                    settled = true;
                  }

                  if (settled) {
                    clearInterval(interval);
                  }
                }, 300);
              }
            };

            if (localStream.current) {
              localStream.current.getTracks().forEach((track: any) => {
                p.connection!.addTrack(track, localStream.current);
              });
            }
            if (createOffer) {
              p.connection.createOffer().then((offer) => {
                // Set as local description
                p.connection!.setLocalDescription(offer);
                // send offer to the server
                ws.current.send(
                  JSON.stringify({
                    type: "relay-sdp",
                    payload: {
                      userId,
                      sessionDesciption: offer,
                    },
                  })
                );
              });
            }
            return { ...p };
          }
          return p;
        });
        return [...updated];
      });
    };

    ws.current.addEventListener("message", (event: any) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case "add-peer": {
          const { userId, createOffer } = message.payload;
          handleNewPeer(userId, createOffer);
          break;
        }
      }
    });
  }, [ws.current, audioRefs, localStream]);

  // return handleNewPeer;
};

export default useWebRTC;
