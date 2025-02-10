import { useEffect } from "react";
import { useSelector } from "react-redux";
import { appDispatch } from "../redux/store.js";
import { setCurrentPosition } from "../redux/gameslice.js";
import { Player, setPlayer } from "../redux/playerslice.js";

const Canvas = ({ canvasRef, wsRef }: any) => {
  const { spaceDimensions, connectionStatus, currentPosition } = useSelector(
    (state: any) => state.game
  );

  const players = useSelector((state: any) => state.players.players);

  const myId = useSelector((state: any) => state.auth.myId);
  useEffect(() => {
    const handleKeyDown = (e: any) => {
      if (connectionStatus !== "connected") return;

      let newX = currentPosition.x;
      let newY = currentPosition.y;
      const step = 10;

      switch (e.key) {
        case "ArrowUp":
          newY -= step;
          break;
        case "ArrowDown":
          newY += step;
          break;
        case "ArrowLeft":
          newX -= step;
          break;
        case "ArrowRight":
          newX += step;
          break;
        default:
          return;
      }
      wsRef.current?.send(
        JSON.stringify({
          type: "move",
          payload: { x: newX, y: newY },
        })
      );
      appDispatch(setCurrentPosition({ x: newX, y: newY }));

      const toAdd = {
        ...players.find((p: Player) => p.id == myId),
        x: newX,
        y: newY,
      };

      appDispatch(setPlayer(toAdd));
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPosition, connectionStatus]);
  return (
    <canvas
      ref={canvasRef}
      width={spaceDimensions.width}
      height={spaceDimensions.height}
      className="border border-gray-200 rounded-lg"
    />
  );
};

export default Canvas;
