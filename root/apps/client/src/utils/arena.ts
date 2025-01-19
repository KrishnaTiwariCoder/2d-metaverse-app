import { Message } from "../components/ChatBox";

export interface Player {
  id: string;
  x: number; // spawn.x
  y: number; // spawn.y
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
  name: string;
  connection?: RTCPeerConnection;
}

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
  wsRef.current?.send(
    JSON.stringify({
      type: "send-message",
      payload: message,
    })
  );
};

export const handleServerMessage = (
  message: any,
  setCurrentPosition: any,
  setSpaceDimensions: any,
  setPlayers: any,
  setMyId: any,
  setMessages: any,
  setError: any
) => {
  switch (message.type) {
    case "space-joined": {
      const { spawn, users, myId } = message.payload;
      setCurrentPosition(spawn);
      setSpaceDimensions({
        width: message.payload.width,
        height: message.payload.height,
      });
      setPlayers(() => [...users]);
      setMyId(myId);
      break;
    }
    case "movement": {
      const { userId, x, y } = message.payload;
      setPlayers((prev: any) => {
        const updated = prev.map((p: Player) => {
          if (p.id === userId) {
            return { ...p, x, y };
          }
          return p;
        });

        return [...updated];
      });
      break;
    }
    case "movement-rejected":
      setCurrentPosition(message.payload);
      break;

    case "user-joined":
      setPlayers((prev: any) => {
        const { userId, x, y, name } = message.payload;
        return [
          ...prev,
          {
            id: userId,
            x,
            y,
            isMuted: false,
            isDeafened: false,
            isSpeaking: false,
            name,
          },
        ];
      });
      break;

    case "user-left": {
      setPlayers((prev: any) => {
        const updated = prev.filter(
          (p: Player) => p.id !== message.payload.userId
        );

        return [...updated];
      });
      break;
    }
    case "got-message": {
      const { messageGot, sender, senderName } = message.payload;
      const messageNew: Message = {
        id: Date.now().toString(),
        text: messageGot,
        sender,
        timestamp: new Date(),
        senderName,
      };
      setMessages((prev: any) => [...prev, messageNew]);
      break;
    }
    case "already-in-space": {
      setError("You are already in the space");
      break;
    }
    case "mute": {
      const { userId, isMuted } = message.payload;
      setPlayers((prev: any) => {
        const updated = prev.map((p: Player) => {
          if (p.id === userId) {
            return { ...p, isMuted };
          }
          return p;
        });

        return [...updated];
      });
      break;
    }
    case "unmute": {
      const { userId, isMuted } = message.payload;
      setPlayers((prev: any) => {
        const updated = prev.map((p: Player) => {
          if (p.id === userId) {
            return { ...p, isMuted };
          }
          return p;
        });

        return [...updated];
      });
      break;
    }
    case "deafen": {
      const { userId, isDeafened } = message.payload;
      setPlayers((prev: any) => {
        const updated = prev.map((p: Player) => {
          if (p.id === userId) {
            return { ...p, isDeafened };
          }
          return p;
        });

        return [...updated];
      });
      break;
    }
    case "undeafen": {
      const { userId, isDeafened } = message.payload;
      setPlayers((prev: any) => {
        const updated = prev.map((p: Player) => {
          if (p.id === userId) {
            return { ...p, isDeafened };
          }
          return p;
        });

        return [...updated];
      });
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
