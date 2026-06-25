import store, { appDispatch } from "../redux/store";
import { Message, receive } from "../redux/chatslice";

import {
  addGameElement,
  Player,
  setCurrentPosition,
  setError,
  setGameElements,
  setSpaceDimensions,
} from "../redux/gameslice";
import { addPlayer, setPlayer, setPlayers } from "../redux/playerslice";

export const getStatusColor = (connectionStatus: any) => {
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

export const sendMessage = (message: any, wsRef: any) => {
  if (wsRef.current!.readyState === WebSocket.OPEN) {
    wsRef.current!.send(
      JSON.stringify({
        type: "send-message",
        payload: message,
      })
    );
  }
};

export const handleServerMessage = (message: any) => {
  const players = store.getState().players.players;
  message = JSON.parse(message.data);
  switch (message.type) {
    case "space-joined": {
      const { spawn, users } = message.payload;
      appDispatch(setCurrentPosition(spawn));
      appDispatch(
        setSpaceDimensions({
          width: message.payload.width,
          height: message.payload.height,
        })
      );
      appDispatch(setPlayers([...users]));
      break;
    }
    case "movement": {
      const { userId, x, y } = message.payload;
      const toAdd = {
        ...players.find((p: Player) => p.id == userId),
        x,
        y,
      };
      appDispatch(setPlayer(toAdd));
      break;
    }
    case "movement-rejected": {
      appDispatch(setCurrentPosition(message.payload));
      break;
    }
    case "user-joined": {
      if (players.find((p) => p.id === message.payload.userId)) return;
      const payload = {
        id: message.payload.userId,
        x: message.payload.x,
        y: message.payload.y,
        username : message.payload.username,
      };
      appDispatch(addPlayer(payload));
      break;
    }
    case "user-left": {
      const payload = players.filter(
        (p: Player) => p.id !== message.payload.userId
      );
      appDispatch(setPlayers(payload));
      break;
    }
    case "got-message": {
      const { messageGot, senderId, senderName } = message.payload;
      const messageNew: Message = {
        message: messageGot,
        senderId,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        senderName,
      };
      appDispatch(receive(messageNew));
      break;
    }
    case "already-in-space": {
      appDispatch(setError("You are already in the space"));
      break;
    }
    case "element-add-rejected": {
      appDispatch(setError(message.payload.reason));
      break;
    }
    case "element-added": { 
      appDispatch(setError(''));
      appDispatch(
        setGameElements([
          ...store.getState().game.elements,
          {
            element: store.getState().elements.elements.find((e: any) => e._id === message.payload.elementId)!,
            x: message.payload.x,
            y: message.payload.y,
          },
        ])
      );
      break;
    }
    case "element-added-self": {
      appDispatch(setError(''));
      appDispatch(addGameElement({
        element: store.getState().elements.elements.find((e: any) => e._id === message.payload.elementId)!,
        x: message.payload.x,
        y: message.payload.y
      }));
      break;
    }
  }
};

