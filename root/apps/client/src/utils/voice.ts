import { useEffect } from "react";
// import freeice from "freeice";
// import { Player } from "./arena";
export const useWebRTC = ({
  // ws,
  players,
  // setPlayers,
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

  return;
};
