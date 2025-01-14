import { useEffect, useRef, useState } from "react";
import VoiceSection from "../components/voiceSection";
import ChatBox from "../components/chatBox";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
}

const Arena = () => {
  const [token, setToken] = useState<string>("");
  const [spaceId, setSpaceId] = useState<string>("");

  const canvasRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  const [players, setPlayers] = useState<Map<string, { x: number; y: number }>>(
    new Map()
  );
  const [currentPosition, setCurrentPosition] = useState<{
    x: number;
    y: number;
  }>({
    x: 0,
    y: 0,
  });
  const [myId, setMyId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [connectionStatus, setConnectionStatus] =
    useState<string>("connecting");
  const [spaceDimensions, setSpaceDimensions] = useState<{
    width: number;
    height: number;
  }>({
    width: 800,
    height: 600,
  });

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

      wsRef.current.onopen = async () => {
        console.log("WebSocket connected");
        setConnectionStatus("connected");
        setError("");

        wsRef.current?.send(
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
      case "space-joined": {
        const { spawn, users } = message.payload;
        setCurrentPosition(spawn);
        setSpaceDimensions({
          width: message.payload.width,
          height: message.payload.height,
        });
        const newPlayers = new Map();
        users.forEach((user: any) => {
          newPlayers.set(user.id, user.spawn);
          if (user.spawn.x === spawn.x && user.spawn.y === spawn.y) {
            setMyId(user.id);
          }
        });
        setPlayers(newPlayers);
        break;
      }
      case "movement": {
        const { userId, x, y } = message.payload;
        setPlayers((prev) => {
          const updated = new Map(prev);
          updated.set(userId, { x, y });
          return updated;
        });
        break;
      }
      case "movement-rejected":
        setCurrentPosition(message.payload);
        break;

      case "user-joined":
        setPlayers((prev) => {
          const updated = new Map(prev);
          updated.set(message.payload.userId, {
            x: message.payload.x,
            y: message.payload.y,
          });
          return updated;
        });
        break;

      case "user-left": {
        setPlayers((prev) => {
          const updated = new Map(prev);
          updated.delete(message.payload.userId);
          return updated;
        });
        break;
      }
      case "got-message": {
        const { messageGot, sender } = message.payload;
        const messageNew: Message = {
          id: Date.now().toString(),
          text: messageGot,
          sender,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, messageNew]);
        break;
      }
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
      setPlayers((prev) => {
        const updated = new Map(prev);
        updated.set(myId, { x: newX, y: newY });
        return updated;
      });
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

  const sendMessage = (message: string) => {
    wsRef.current?.send(
      JSON.stringify({
        type: "send-message",
        payload: message,
      })
    );
  };

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-500">{error}</div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <input
            type="text"
            value={spaceId}
            onChange={(e) => setSpaceId(e.target.value)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen gap-4 p-4 bg-gray-900">
      <VoiceSection ws={wsRef} players={players} streams={[]} />
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className={`mb-2 ${getStatusColor()}`}>
          Status: {connectionStatus}
        </div>
      </div>
      <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex items-center justify-center w-full h-full min-h-[400px] p-4">
          <canvas
            ref={canvasRef}
            width={spaceDimensions.width}
            height={spaceDimensions.height}
            className="border border-gray-200 rounded-lg"
          />
          <div>
            <ChatBox
              messages={messages}
              setMessages={setMessages}
              currentUser={myId}
              sendMessage={sendMessage}
              participants={players.size}
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 flex flex-col gap-2"></div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <span className="text-sm text-gray-400">
          permissionAndCreatorInfoArea
        </span>
      </div>
    </div>
  );
};
export default Arena;
