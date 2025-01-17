import { useEffect } from "react";
import { Player } from "../utils/arena";

const Canvas = ({
  canvasRef,
  spaceDimensions,
  connectionStatus,
  currentPosition,
  wsRef,
  setCurrentPosition,
  setPlayers,
  myId,
}: any) => {
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

      setCurrentPosition({ x: newX, y: newY });
      setPlayers((prev: any) => {
        const updated = prev.map((p: Player) => {
          if (p.id === myId) {
            return { ...p, x: newX, y: newY };
          }
          return p;
        });

        return [...updated];
      });
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
