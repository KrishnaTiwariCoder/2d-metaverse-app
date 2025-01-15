interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
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

export const sendMessage = (message: string, wsRef: any) => {
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
  setMessages: any
) => {
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
      setPlayers((prev: any) => {
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
      setPlayers((prev: any) => {
        const updated = new Map(prev);
        updated.set(message.payload.userId, {
          x: message.payload.x,
          y: message.payload.y,
        });
        return updated;
      });
      break;

    case "user-left": {
      setPlayers((prev: any) => {
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
      setMessages((prev: any) => [...prev, messageNew]);
      break;
    }
  }
};
