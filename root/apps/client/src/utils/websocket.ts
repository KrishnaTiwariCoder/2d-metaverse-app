import { setConnectionStatus, setError } from "../redux/gameSlice";
import { appDispatch } from "../redux/store";
import { handleServerMessage } from "./arena";

let socket: WebSocket | null = null;

export const connectWebSocket = (url: string) => {
  if (!socket) {
    socket = new WebSocket(url);

    socket.onopen = async () => {
      appDispatch(setConnectionStatus("connected"));
      appDispatch(setError(""));
      console.log("WebSocket connected");
      socket?.send(
        JSON.stringify({
          type: "join",
          payload: {
            spaceId: localStorage.getItem("spaceId"),
            token: localStorage.getItem("token"),
          },
        })
      );
    };
    socket.onmessage = handleServerMessage;
    socket.onerror = (error) => {
      appDispatch(setConnectionStatus("error"));
      console.error("WebSocket error:", error);
    };
    socket.onclose = () => {
      console.log("WebSocket closed");
      appDispatch(setConnectionStatus("disconnected"));
      socket = null; // Reset on close
    };
  }

  return socket;
};

export const getWebSocket = () => socket; // Retrieve WebSocket instance
export const closeWebSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};
