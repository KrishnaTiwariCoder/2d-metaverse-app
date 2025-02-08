import store, { appDispatch } from "../redux/store";
import { Message, receive } from "../redux/chatSlice";

import {
  Player,
  setCurrentPosition,
  setError,
  setSpaceDimensions,
} from "../redux/gameSlice";
import { setMyId } from "../redux/authSlice";
import { addPlayer, setPlayer, setPlayers } from "../redux/playerSlice";

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
  wsRef.current!.send(
    JSON.stringify({
      type: "send-message",
      payload: message,
    })
  );
};

export const handleServerMessage = (message: any) => {
  const players = store.getState().players.players;
  message = JSON.parse(message.data);
  switch (message.type) {
    case "space-joined": {
      const { spawn, users, myId } = message.payload;
      appDispatch(setCurrentPosition(spawn));
      appDispatch(
        setSpaceDimensions({
          width: message.payload.width,
          height: message.payload.height,
        })
      );
      appDispatch(setPlayers([...users]));
      appDispatch(setMyId(myId));
      localStorage.setItem("myId", myId);
      break;
    }
    case "movement": {
      const { userId, x, y } = message.payload;

      // const payload = players.map((p: Player) =>
      //   p.id == userId ? { ...p, x, y } : { ...p }
      // );
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
      const payload = {
        id: message.payload.userId,
        x: message.payload.x,
        y: message.payload.y,
        isMuted: false,
        isDeafened: false,
        isSpeaking: false,
        name: message.payload.name,
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
      // setError("You are already in the space");
      break;
    }
    case "mute": {
      const { userId, isMuted } = message.payload;
      const payload = players.map((p: Player) => {
        if (p.id === userId) {
          return { ...p, isMuted };
        }
        return p;
      });
      appDispatch(setPlayers(payload));
      break;
    }

    case "unmute": {
      const { userId, isMuted } = message.payload;
      const payload = players.map((p: Player) => {
        if (p.id === userId) {
          return { ...p, isMuted };
        }
        return p;
      });
      appDispatch(setPlayers(payload));
      break;
    }
    case "deafen": {
      const { userId, isDeafened } = message.payload;
      const payload = players.map((p: Player) => {
        if (p.id === userId) {
          return { ...p, isDeafened };
        }
        return p;
      });
      appDispatch(setPlayers(payload));
      break;
    }
    case "undeafen": {
      const { userId, isDeafened } = message.payload;
      const payload = players.map((p: Player) => {
        if (p.id === userId) {
          return { ...p, isDeafened };
        }
        return p;
      });
      appDispatch(setPlayers(payload));
      break;
    }
  }
};

export const tokens = [
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzgyNTExYWIxODg2MTUzMTA3ZDM1MzQiLCJ1c2VybmFtZSI6ImtyaXNobmEiLCJ0eXBlIjoiYWRtaW4iLCJpYXQiOjE3MzcxMTQ0OTl9.kRfGkEe-ZwF06LSwgO85nCJX7JgPW_Ge9BXYSD-pLhY",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzgyNDkyNTNiN2E3ZjE2ZTBhODFhMjEiLCJ1c2VybmFtZSI6ImtyaXNobmEyIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzM3MTI0MjYzfQ.ClMqobwuhW7fVSZAcxIdlLeEshhGF0HD537l1nFYFhs",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzgyNjZmZTlhMzUyMTMyMWQ0ZDE1OTEiLCJ1c2VybmFtZSI6ImtyaXNobmF1c2VyMiIsInR5cGUiOiJ1c2VyIiwiaWF0IjoxNzM3Mjk2NTg3fQ.40gI_b5_fLBBH04oNDiTaKy6DsmLd6l8pTEXskavJRk",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzgyOTliZDM1ZGJmMGM2NzNkOTZhNWYiLCJ1c2VybmFtZSI6ImtyaXNobmF1c2VyMyIsInR5cGUiOiJ1c2VyIiwiaWF0IjoxNzM3Mjk2NjE0fQ.Uodtw3qsnmbFwTqDalJaH4asftp3MW5CFgxhh4QSs0U",
];
