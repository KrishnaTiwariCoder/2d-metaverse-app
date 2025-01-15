import { useEffect, useRef, useState } from "react";
import VoiceSection from "../components/voiceSection";
import ChatBox from "../components/chatBox";
import {
  getStatusColor,
  handleServerMessage,
  sendMessage,
} from "../utils/arena";
import Canvas from "../components/canvas";

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
  // Setup WebSocket connection
  const setupWebSocket = () => {
    try {
      wsRef.current = new WebSocket("ws://192.168.0.108:3001");
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
        handleServerMessage(
          message,
          setCurrentPosition,
          setSpaceDimensions,
          setPlayers,
          setMyId,
          setMessages
        );
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
      alert("error: " + err);
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
  // Dummy data for testing
  const handleDummyData = () => {
    console.log("clicked");
    setToken(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzgyNjZmZTlhMzUyMTMyMWQ0ZDE1OTEiLCJ1c2VybmFtZSI6ImtyaXNobmF1c2VyMiIsInR5cGUiOiJ1c2VyIiwiaWF0IjoxNzM2OTQ0ODk3fQ.MCaMOrCl9TwzsdMVXcVhqN-hAxtIQAzEpephvUQWHO4"
    );
    setSpaceId("6787acdaa29ceb6ed47a6f4a");
  };
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
          <button
            className="bg-blue-500 text-white p-3 rounded-lg"
            onClick={handleDummyData}
          >
            Send dummy data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen gap-4 p-4 bg-gray-900">
      <VoiceSection ws={wsRef} players={players} streams={[]} />
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className={`mb-2 ${getStatusColor(connectionStatus)}`}>
          Status: {connectionStatus}
        </div>
      </div>
      <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex items-center justify-center w-full h-full min-h-[400px] p-4">
          <Canvas
            canvasRef={canvasRef}
            spaceDimensions={spaceDimensions}
            connectionStatus={connectionStatus}
            currentPosition={currentPosition}
            wsRef={wsRef}
            setCurrentPosition={setCurrentPosition}
            setPlayers={setPlayers}
            myId={myId}
          />
          <div>
            <ChatBox
              messages={messages}
              setMessages={setMessages}
              currentUser={myId}
              sendMessage={sendMessage}
              participants={players.size}
              wsRef={wsRef}
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
