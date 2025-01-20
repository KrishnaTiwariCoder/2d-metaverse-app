import { useEffect } from "react";
import freeice from "freeice";
// import { Player } from "./arena";
export const useWebRTC = ({
  ws,
  players,
  setPlayers,
  myId,
  audioRefs,
  localStream,
}: any) => {
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
    startCapture().then(() => {
      audioRefs.current[myId].volume = 0;
      audioRefs.current[myId].srcObject = localStream.current;
    });
  }, [audioRefs, players.length]);

  // useEffect(() => {
  //   const handleNewPeer = async ({userId , createOffer})
  //   // set a new peer connection in the player object
  //   setPlayers((prev: Player[]) => {
  //     const updated = prev.map((p: any) => {
  //       if (p.id === myId) {
  //         const peerConnection = new RTCPeerConnection({
  //           iceServers: freeice(),
  //         });
  //         peerConnection.onicecandidate = (event: any) => {
  //           if (event.candidate) {
  //             ws.current?.send(
  //               JSON.stringify({
  //                 type: "ice-candidate",
  //                 payload: {
  //                   userId: myId,
  //                   candidate: event.candidate,
  //                 },
  //               })
  //             );
  //           }
  //         };
  //         peerConnection.ontrack = ({streams:[remoteStream]}: any) => {
  //           audioRefs.current[  ].srcObject = remoteStream;
  //         };
  //         return {
  //           ...p,
  //           connection: peerConnection,
  //         };
  //       }
  //       return p;
  //     });
  //     return [...updated];
  //   });

  // },[])
  useEffect(() => {
    ws.current.onmessage = (event: any) => {
      const message = JSON.parse(event.data);
      if (message.type === "add-peer") {
        const { userId, createOffer } = message.payload;
        handleNewPeer(userId, createOffer);
      }

      async function handleNewPeer(userId: any, createOffer: boolean) {
        const playerExist = players.find((p: any) => p.id === userId);
        if (playerExist) {
          return console.warn(
            `You are already connected with ${playerExist.name})`
          );
        }
        console.log(createOffer);
        // Store i  t to connections
        setPlayers((prev: any) => {
          const updated = prev.map((p: any) => {
            if (p.id === userId) {
              p.connection = new RTCPeerConnection({
                iceServers: freeice(),
              });
              p.connection.onicecandidate = (event: any) => {
                ws.current.send("relay-ice", {
                  userId,
                  icecandidate: event.candidate,
                });
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
              };

              return { ...p };
            }
            return p;
          });
          return [...updated];
        });

        // connections.current[peerId] = new RTCPeerConnection({
        //     iceServers: freeice(),
        // });

        // Handle new ice candidate on this peer connection

        // connections.current[peerId].onicecandidate = (event) => {
        //     socket.current.emit(ACTIONS.RELAY_ICE, {
        //         peerId,
        //         icecandidate: event.candidate,
        //     });
        // };

        // Handle on track event on this connection
        // connections.current[peerId].ontrack = ({
        //     streams: [remoteStream],
        // }) => {
        //     addNewClient({ ...p, muted: true }, () => {
        //         // get current users mute info
        //         const currentUser = clientsRef.current.find(
        //             (client) => client.id === user.id
        //         );
        //         if (currentUser) {
        //             socket.current.emit(ACTIONS.MUTE_INFO, {
        //                 userId: user.id,
        //                 roomId,
        //                 isMute: currentUser.muted,
        //             });
        //         }
        //         if (audioRefs.current[p.id]) {
        //             audioRefs.current[p.id].srcObject =
        //                 remoteStream;
        //         } else {
        //             let settled = false;
        //             const interval = setInterval(() => {
        //                 if (audioRefs.current[p.id]) {
        //                     audioRefs.current[
        //                         p.id
        //                     ].srcObject = remoteStream;
        //                     settled = true;
        //                 }

        //                 if (settled) {
        //                     clearInterval(interval);
        //                 }
        //             }, 300);
        //         }
        //     });
        // };

        // Add connection to peer connections track
        // localMediaStream.current.getTracks().forEach((track) => {
        //     connections.current[peerId].addTrack(
        //         track,
        //         localMediaStream.current
        //     );
        // });

        // // Create an offer if required
        // if (createOffer) {
        //     const offer = await connections.current[
        //         peerId
        //     ].createOffer();

        //     // Set as local description
        //     await connections.current[peerId].setLocalDescription(
        //         offer
        //     );

        //     // send offer to the server
        //     socket.current.emit(ACTIONS.RELAY_SDP, {
        //         peerId,
        //         sessionDescription: offer,
        //     });
        // }
      }
    };
  }, []);
  // return;
};
