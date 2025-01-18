import { useEffect } from "react";

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
    startCapture()
      .then(() => {
        // localAudio.volume = 0;
        audioRefs.current[myId].srcObject = localStream.current;
      })
      .catch((e) => {
        console.log(localStream.current);
        console.log(e);
      });
  }, [audioRefs, players]);

  return;
};
