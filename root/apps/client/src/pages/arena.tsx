import { useEffect, useRef } from "react";

import {
  getStatusColor,
  handleServerMessage,
} from "../utils/arena";
import { WS_URL } from "../utils/urls";

import Canvas from "../components/arena/canvas";
import ChatRoom from "../components/arena/chatbox";
import VoiceSection from "../components/arena/voicesection";

import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

import { useParams } from "react-router-dom";

import { Player } from "../redux/playerslice";
import { Space } from "../redux/spaceSlice";
import { setConnectionStatus, setError, setGameElements, setSpaceDimensions, setSpaceId } from "../redux/gameslice";
import ElementBox from "../components/arena/elementbox";
import { findSpaceById } from "../utils/spaces";

const Arena = () => {
  const {id : spaceId} = useParams();
  const {spaces} = useSelector((state:any)=>state.spaces)
  const { myId ,token } = useSelector((state: any) => state.auth);
  const canvasRef = useRef<any>(null);
  const { connectionStatus } = useSelector((state: any) => state.game);
  const gameElements = useSelector((state: any) => state.game.elements);
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
      };
    } catch (err) {
      console.error("WebSocket setup error:", err);
      dispatch(setError("Failed to initialize game connection"));
    }
  };
  const reconnect = () => {
  setTimeout(() => {
    console.log('reconnecting...');
    setupWebSocket(); 
  }, 1000); 
};
  useEffect(() => {
    if (localWsRef.current?.readyState === WebSocket.OPEN) return;
    setupWebSocket();

    return () => {
      if (localWsRef.current) {
        if (localWsRef.current.readyState === WebSocket.OPEN || localWsRef.current.readyState === WebSocket.CONNECTING) {
          localWsRef.current.close();
          if (!localWsRef.current) {
            reconnect();
          }
        }
      }
    };
  }, []);







  const imageCache: Record<string, HTMLImageElement> = {};

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = reject;

    img.crossOrigin = "anonymous";
    img.src = url;
  });
}

async function preloadImages(gameElements: any[]) {
  const uniqueUrls = [
    ...new Set(
      gameElements.map((item) => item.element.imageUrl)
    ),
  ];

  await Promise.all(
    uniqueUrls.map(async (url) => {
      imageCache[url] = await loadImage(url);
    })
  );

  return imageCache;
}

function drawGameElements(
  ctx: CanvasRenderingContext2D,
  gameElements: any[]
) {
  gameElements.forEach((item) => {
    const { x, y, element } = item;

    const img = imageCache[element.imageUrl];

    if (img) {
      ctx.drawImage(img, x, y, 50, 50);
    }
  });
}

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

  async function init() {
    await preloadImages(gameElements);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!ctx) return;

    drawGameElements(ctx, gameElements);
  }

  init();

  }, [players, myId, gameElements]);

  const space: Space | undefined = spaces.find((s: Space) => s.id === spaceId);
  
  useEffect(() => { 
  
    findSpaceById(spaceId!).then((spaceData:any)=>{
      if(spaceData){
        const elementsWithData = spaceData.elements.map((el:any)=>{
          return {
            element: el.id,
            x: el.x,
            y: el.y
          }
        })
        dispatch(setGameElements(elementsWithData));
        dispatch(setSpaceId(spaceId!));
        dispatch(setSpaceDimensions({width : spaceData.width, height : spaceData.height}));
      }
    });
  },[spaceId, spaces])
  
  if (!space || !spaceId) {
    return <div>404</div>;
  } 
  
  return (
    <div className="flex flex-col w-full min-h-screen gap-4 p-4 bg-gray-900">
      {}

      {/* <VoiceSection ws={localWsRef} /> */}
      <VoiceSection/>
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className={`mb-2 ${getStatusColor(connectionStatus)}`}>
          Status: {connectionStatus}
        </div>
        <div>{players.find((p: Player) => p.id === myId)?.name}</div>
      </div>
      <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex items-center justify-center w-full h-full min-h-[400px] p-4">

          <div className="flex flex-col md:flex-row w-full h-full gap-4">
          <Canvas canvasRef={canvasRef} wsRef={localWsRef}/>
          </div>
          
          <div className="flex-1 p-4">
            <ChatRoom wsRef={localWsRef} />
          </div>

          <div className=" bottom-2 right-2 flex gap-2">
          {
            // if space is owned by the user then show the element box
            space.creator._id === myId && (
              <ElementBox wsRef={localWsRef} /> )

          }
          </div>

        </div>
      </div>

    </div>
  );
};
export default Arena;
