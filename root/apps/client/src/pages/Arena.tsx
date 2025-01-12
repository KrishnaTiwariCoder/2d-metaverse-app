import { useEffect, useRef, useState } from "react";

const Arena = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const spaceId = params.get("spaceId");

  const canvasRef = useRef<any>(null);
  const wsRef = useRef<any>(null);
  const reconnectAttemptRef = useRef<number>(0);
  const maxReconnectAttempts = 5;

  const [players, setPlayers] = useState<Map<any, any>>(new Map());
  const [currentPosition, setCurrentPosition] = useState<any>({ x: 0, y: 0 });
  const [myId, setMyId] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<any>("connecting");

  // Validate required parameters
  useEffect(() => {
    if (!token || !spaceId) {
      setError("Missing required parameters: token and spaceId");
      return;
    }
  }, [token, spaceId]);

  // WebSocket connection setup with retry mechanism
  const setupWebSocket = () => {
    try {
      wsRef.current = new WebSocket("ws://localhost:3001");

      wsRef.current.onopen = () => {
        console.log("WebSocket connected");
        setConnectionStatus("connected");
        reconnectAttemptRef.current = 0;

        wsRef.current.send(
          JSON.stringify({
            type: "join",
            payload: {
              spaceId,
              token,
            },
          })
        );
      };

      wsRef.current.onmessage = (event: any) => {
        const message = JSON.parse(event.data);
        handleServerMessage(message);
      };

      wsRef.current.onerror = (error: any) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("error");
      };

      wsRef.current.onclose = () => {
        console.log("WebSocket closed");
        setConnectionStatus("disconnected");

        if (reconnectAttemptRef.current < maxReconnectAttempts) {
          reconnectAttemptRef.current += 1;
          console.log(
            `Reconnection attempt ${reconnectAttemptRef.current}/${maxReconnectAttempts}`
          );
          setConnectionStatus(
            `reconnecting (${reconnectAttemptRef.current}/${maxReconnectAttempts})`
          );

          const timeout = Math.min(
            1000 * Math.pow(2, reconnectAttemptRef.current - 1),
            10000
          );
          setTimeout(setupWebSocket, timeout);
        } else {
          setError("Failed to connect to game server after multiple attempts");
        }
      };
    } catch (err) {
      console.error("WebSocket setup error:", err);
      setError("Failed to initialize game connection");
    }
  };

  useEffect(() => {
    if (!token || !spaceId) return;

    setupWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [token, spaceId]);

  const handleServerMessage = (message: any) => {
    switch (message.type) {
      case "space-joined":
        const { spawn, users } = message.payload;
        setCurrentPosition(spawn);

        const newPlayers = new Map();
        users.forEach((user: any) => {
          newPlayers.set(user.id, user.spawn);
          if (user.spawn.x === spawn.x && user.spawn.y === spawn.y) {
            setMyId(user.id);
          }
        });
        setPlayers(newPlayers);
        break;

      case "movement":
        const { userId, x, y } = message.payload;
        setPlayers((prev: any) => {
          const updated = new Map(prev);
          updated.set(userId, { x, y });
          return updated;
        });
        break;

      case "movement-rejected":
        setCurrentPosition(message.payload);
        break;

      case "user-left":
        setPlayers((prev: any) => {
          const updated = new Map(prev);
          updated.delete(message.payload.userId);
          return updated;
        });
        break;
    }
  };

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
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPosition, connectionStatus]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    players.forEach((pos: any, id: any) => {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
      ctx.fillStyle = id === myId ? "#4f46e5" : "#64748b";
      ctx.fill();
      ctx.closePath();
    });
  }, [players, myId]);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-green-500";
      case "connecting":
        return "text-yellow-500";
      case "disconnected":
        return "text-red-500";
      case "error":
        return "text-red-500";
      default:
        return "text-yellow-500";
    }
  };

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className={`mb-2 ${getStatusColor()}`}>
        Status: {connectionStatus}
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-gray-200 rounded-lg"
      />
      <div className="mt-4 text-sm text-gray-500">
        Use arrow keys to move around
      </div>
    </div>
  );
};

export default Arena;
