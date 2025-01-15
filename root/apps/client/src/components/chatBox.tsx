import { useState } from "react";
import { Send } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
}

const ChatRoom = ({
  currentUser,
  sendMessage,
  messages,
  setMessages,
  participants,
  wsRef,
}: any) => {
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: currentUser,
        timestamp: new Date(),
      };
      setMessages([...messages, message]);
      sendMessage(message, wsRef);
      setNewMessage("");
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-[400px] bg-slate-900 text-white">
      {/* Chat Header */}
      <div className="p-3 border-b border-slate-700">
        <p className="text-sm text-slate-400">{participants} participants</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message: Message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === currentUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-2 ${
                message.sender === currentUser ? "bg-blue-600" : "bg-slate-800"
              }`}
            >
              <div className="flex items-baseline space-x-2 mb-1">
                <span className="text-sm">{message.sender}</span>
                <span className="text-xs text-slate-400">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-sm">{message.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="border-t p-4 bg-white">
        <div className="flex items-end space-x-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 resize-none rounded-lg border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
