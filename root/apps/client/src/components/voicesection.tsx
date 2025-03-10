import React, { useEffect } from "react";
import { Player } from "../redux/playerslice";
import { useSelector } from "react-redux";
import useWebRTC from "../utils/voice";

interface VoiceSectionProps {
  ws: React.RefObject<WebSocket>;
}

const VoiceSection = ({ ws }: VoiceSectionProps) => {
  const players = useSelector((state: any) => state.players.players);
  const myId = useSelector((state: any) => state.auth.myId);

  const { startCapture, toggleMute, audioRefs, videoRefs, localVideoRef } =
    useWebRTC({ wsRef: ws });

  useEffect(() => {
    startCapture();
  });

  // useEffect(() => {
  //   // Initialize media capture once
  //   startCapture();

  //   // Setup WebSocket message listener to detect connection establishment
  //   const handleConnectionEstablished = (event: MessageEvent) => {
  //     try {
  //       const data = JSON.parse(event.data);
  //       // When we receive the first ICE candidate or SDP, mark connection as established
  //       if (
  //         (data.type === "ice" || data.type === "sdp") &&
  //         !isConnected.current
  //       ) {
  //         isConnected.current = true;
  //         console.log("WebRTC connection established successfully");
  //       }
  //     } catch (e) {
  //       // Ignore parsing errors
  //       console.log(e);
  //     }
  //   };

  //   ws.current?.addEventListener("message", handleConnectionEstablished);

  //   // Listen for connection failures and retry
  //   const connectionTimeout = setTimeout(() => {
  //     if (!isConnected.current) {
  //       console.log("Connection timeout, retrying...");
  //       resetConnection();
  //       startCapture();
  //     }
  //   }, 5000); // 5 second timeout

  //   return () => {
  //     ws.current?.removeEventListener("message", handleConnectionEstablished);
  //     clearTimeout(connectionTimeout);
  //   };
  // }, []);

  const handleToggleMute = (type: "audio" | "video") => {
    toggleMute(type);
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-4">
      <h2 className="text-xl text-white mb-4">Video Chat</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Local video */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted // Must mute local video to prevent feedback
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            You
          </div>
          <div className="absolute bottom-2 right-2 flex gap-2">
            <button
              onClick={() => handleToggleMute("audio")}
              className="bg-gray-700 hover:bg-gray-600 p-2 rounded-full"
              title="Toggle Microphone"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </button>
            <button
              onClick={() => handleToggleMute("video")}
              className="bg-gray-700 hover:bg-gray-600 p-2 rounded-full"
              title="Toggle Camera"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Remote videos */}
        {players
          .filter((player: Player) => player.id !== myId)
          .map((player: Player) => (
            <div
              key={player.id}
              className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video"
            >
              <video
                ref={(el) => {
                  if (el) videoRefs.current[player.id] = el;
                }}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <audio
                ref={(el) => {
                  if (el) audioRefs.current[player.id] = el;
                }}
                autoPlay
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                {player.name || `Player ${player.id.slice(0, 5)}`}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(VoiceSection);
