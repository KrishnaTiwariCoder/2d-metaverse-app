import { useEffect, useRef } from "react";
import {
  getStatusColor,
  handleServerMessage,
} from "../utils/arena";
import Canvas from "../components/canvas";
import ChatRoom from "../components/chatbox";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setConnectionStatus, setError } from "../redux/gameslice";
import { logOut } from "../redux/authslice";
import VoiceSection from "../components/voicesection";
import { WS_URL } from "../utils/urls";
import { Player } from "../redux/playerslice";
import { useParams } from "react-router-dom";
import { Space } from "../redux/spaceSlice";
const Arena = () => {
  const {id:spaceId} = useParams();
  const {spaces} = useSelector((state:any)=>state.spaces)
  const { myId ,token } = useSelector((state: any) => state.auth);
  const canvasRef = useRef<any>(null);
  const { connectionStatus } = useSelector(
    (state: any) => state.game
  );
  const { players } = useSelector((state: any) => state.players);
  const localWsRef = useRef<WebSocket | null>(null);

  const dispatch = useDispatch();

  // Setup WebSocket connection
  const setupWebSocket = () => {
    try {
      localWsRef.current = new WebSocket(WS_URL);

      localWsRef.current.onopen = async () => {
        dispatch(setConnectionStatus("connected"));
        dispatch(setError(""));
        console.log("WebSocket connected");
        localWsRef.current?.send(
          JSON.stringify({
            type: "join",
            payload: {
              spaceId,
              token,
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
    }
  };

  useEffect(() => {
    if (!token || !spaceId) return;
    setupWebSocket();

    return () => {
      if (localWsRef.current) {
        console.log("yes ws closed");

        localWsRef.current.close();
      }
    };
  }, [token, spaceId]);

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
        id == myId ? "#4f46e5" : "#64748b";
      ctx.fill();
      ctx.closePath();
    });
  }, [players, myId]);

  
  const logOutBtn = () => {
    dispatch(logOut());
  };
  if (!spaces.find((space: Space) => space.id == spaceId)) {
    return <div>404</div>;
  }
  return (
    <div className="flex flex-col w-full min-h-screen gap-4 p-4 bg-gray-900">
      {}

      <VoiceSection ws={localWsRef} />
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className={`mb-2 ${getStatusColor(connectionStatus)}`}>
          Status: {connectionStatus}
        </div>
        <button onClick={logOutBtn}>Reset</button>
        <div>{players.find((p: Player) => p.id === myId)?.name}</div>
      </div>
      <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex items-center justify-center w-full h-full min-h-[400px] p-4">
          <Canvas canvasRef={canvasRef} wsRef={localWsRef} />
          <div>
            <ChatRoom wsRef={localWsRef} />
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
