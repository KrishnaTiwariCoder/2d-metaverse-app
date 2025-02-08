import { useEffect, useRef } from "react";
import { getStatusColor, handleServerMessage, tokens } from "../utils/arena";
import Canvas from "../components/Canvas";
import ChatRoom from "../components/ChatBox";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setConnectionStatus, setError, setSpaceId } from "../redux/gameSlice";
import { storeToken } from "../redux/authSlice";
import { getWebSocket } from "../utils/websocket";

const Arena = () => {
  const token = useSelector((state: any) => state.auth.token);
  const canvasRef = useRef<any>(null);
  const { spaceId, myId, error, connectionStatus } = useSelector(
    (state: any) => state.game
  );
  const { players } = useSelector((state: any) => state.players);
  const localWsRef = useRef<WebSocket | null>(null);

  const dispatch = useDispatch();

  // Validate required parameters
  useEffect(() => {
    const localToken = localStorage.getItem("token");
    const localSpaceId = localStorage.getItem("spaceId");
    if (!localToken || !localSpaceId) {
      dispatch(setError("Missing required parameters: token and spaceId"));
      return;
    } else {
      dispatch(storeToken({ token: localToken, myId: "", name: "" }));
      dispatch(setSpaceId(localSpaceId));
    }

    if (!token || !spaceId) {
      dispatch(setError("Missing required parameters: token and spaceId"));
      return;
    }
  }, [token, spaceId]);
  // Setup WebSocket connection
  const setupWebSocket = () => {
    try {
      localWsRef.current = new WebSocket("ws://192.168.215.115:3001");

      localWsRef.current.onopen = async () => {
        dispatch(setConnectionStatus("connected"));
        dispatch(setError(""));
        console.log("WebSocket connected");
        localWsRef.current?.send(
          JSON.stringify({
            type: "join",
            payload: {
              spaceId: localStorage.getItem("spaceId"),
              token: localStorage.getItem("token"),
            },
          })
        );
      };
      localWsRef.current.onmessage = handleServerMessage;
      localWsRef.current.onerror = (error) => {
        dispatch(setConnectionStatus("error"));
        console.error("WebSocket error:", error);
      };
      localWsRef.current.onclose = () => {
        console.log("WebSocket closed");
        dispatch(setConnectionStatus("disconnected"));
        //  socket = null; // Reset on close
        localWsRef.current = null;
      };
    } catch (err) {
      console.error("WebSocket setup error:", err);
      dispatch(setError("Failed to initialize game connection"));
      // alert("error: " + err);
    }
  };

  useEffect(() => {
    if (!token || !spaceId) return;
    setupWebSocket();

    return () => {
      if (getWebSocket()) {
        console.log("yes ws closed");
        getWebSocket()?.close();
      }
    };
  }, [token, spaceId]);
  // Dummy data for testing
  const handleDummyData = () => {
    const used = Math.floor(Math.random() * tokens.length);
    dispatch(storeToken({ token: tokens[used], myId: "", name: "" }));
    dispatch(setSpaceId("6787acdaa29ceb6ed47a6f4a"));
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    players.forEach((player: any) => {
      const { x, y, id } = player;

      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fillStyle =
        id == localStorage.getItem("myId") ? "#4f46e5" : "#64748b";
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
            onChange={(e) =>
              dispatch(
                storeToken({ token: e.target.value, myId: "", name: "" })
              )
            }
          />
          <input
            type="text"
            value={spaceId}
            onChange={(e) => dispatch(setSpaceId(e.target.value))}
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
      {/* <VoiceSection
        ws={wsRef}
        players={players}
        myId={myId}
        setPlayers={setPlayers}
      /> */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className={`mb-2 ${getStatusColor(connectionStatus)}`}>
          Status: {connectionStatus}
        </div>
      </div>
      <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex items-center justify-center w-full h-full min-h-[400px] p-4">
          <Canvas canvasRef={canvasRef} wsRef={localWsRef} />
          <div>
            <ChatRoom />
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
