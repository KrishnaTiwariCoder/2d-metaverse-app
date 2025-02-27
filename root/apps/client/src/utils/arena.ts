import store, { appDispatch } from "../redux/store";
import { Message, receive } from "../redux/chatslice";

import {
  Player,
  setCurrentPosition,
  setError,
  setSpaceDimensions,
} from "../redux/gameslice";
import { setCurrentUser, setMyId } from "../redux/authslice";
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
      appDispatch(
        setCurrentUser({
          id: myId,
          name: message.payload.users.find((u: any) => u.id == myId).name,
        })
      );
      localStorage.setItem("myId", myId);
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

// export const tokens = [
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2IwNjE5ZjIxNzViZjc0OTFkOWI2MmEiLCJ1c2VybmFtZSI6ImtyaXNobmF1c2VyMSIsInR5cGUiOiJ1c2VyIiwiaWF0IjoxNzM5NjE4OTM5fQ.v146-WJnkEP_cUxReoPNbuiPlu2sOvfs6jHplX-pohE",
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2IwNjFiOTIxNzViZjc0OTFkOWI2MmYiLCJ1c2VybmFtZSI6ImtyaXNobmF1c2VyMiIsInR5cGUiOiJ1c2VyIiwiaWF0IjoxNzM5NjE4OTU0fQ.EIAO0OWG0VugcCT_s6mf033ksgiv41bpdXLDiLLW8Ak",
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2IwNTY2MDcxMTE4MTM5ZTQ5NWQxNTQiLCJ1c2VybmFtZSI6ImtyaXNobmF1c2VyMyIsInR5cGUiOiJ1c2VyIiwiaWF0IjoxNzM5NjE4OTcwfQ.l7yQ6p3Hlqf-Bnns4gD1WekzHzljvA-q-Bp-YIeTDNQ",
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2IwNjFjYjIxNzViZjc0OTFkOWI2MzMiLCJ1c2VybmFtZSI6ImtyaXNobmF1c2VyNCIsInR5cGUiOiJ1c2VyIiwiaWF0IjoxNzM5NjE4OTg4fQ.BsEqCfRmFPwncyqXRlL8jq0fvHAhOCXAzQCLZuXV_8E",
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2IwNjFjZjIxNzViZjc0OTFkOWI2MzYiLCJ1c2VybmFtZSI6ImtyaXNobmF1c2VyNSIsInR5cGUiOiJ1c2VyIiwiaWF0IjoxNzM5NjE5MDA0fQ.uL4xhbiGdeSPAfbV3-Y1PiEUFxttgwrylCR4xa97jmY",
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2IwNzA1NWM2MTc0ZDNmMmJmMjAwYTgiLCJ1c2VybmFtZSI6ImtyaXNobmF1c2VyNiIsInR5cGUiOiJ1c2VyIiwiaWF0IjoxNzM5NjE5MDE5fQ.GXr8z_viAz55Dv796Z3swE-bJbfRNnA990hfLkxBsGg",
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2IwNzA1OGM2MTc0ZDNmMmJmMjAwYWIiLCJ1c2VybmFtZSI6ImtyaXNobmF1c2VyNyIsInR5cGUiOiJ1c2VyIiwiaWF0IjoxNzM5NjE5MDMyfQ.widXJX-0OOJ475bTttthJJ8QjjF257qpgmGo5-x5NGE",
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2IwNzA1Y2M2MTc0ZDNmMmJmMjAwYWUiLCJ1c2VybmFtZSI6ImtyaXNobmF1c2VyOCIsInR5cGUiOiJ1c2VyIiwiaWF0IjoxNzM5NjE5MDUwfQ.GVX8sdnXyIVJpEB_SVWGCXFZwyiVMdo-RCgfNTgRAig",
// ];

export const tokens = [
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2IwNzA1Y2M2MTc0ZDNmMmJmMjAwYWUiLCJ1c2VybmFtZSI6ImtyaXNobmF1c2VyOCIsInR5cGUiOiJ1c2VyIiwiaWF0IjoxNzM5NjIyODM5fQ.ip0GaQIX9XOwjumYlrvLCRC6cdG3lUI_fD4l3Eba75w",
];
export const sampleSpaceId = "67b0568e71118139e495d158";
