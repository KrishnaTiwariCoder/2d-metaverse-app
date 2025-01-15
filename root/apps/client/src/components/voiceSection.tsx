import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useEffect } from "react";
// import VoiceBox from "./voiceBox";
import { MutableRefObject } from "react";

interface VoiceSectionProps {
  ws: MutableRefObject<WebSocket | null>;
  players: Map<string, any>;
  streams: any[];
}

const VoiceSection = ({ ws, players }: VoiceSectionProps) => {
  useEffect(() => {
    console.log(ws, "just test");
  }, []);
  const isCurrentUser = true;
  // a list of refs to media streams
  // const audioRefs;
  // const getARefToAudioStream = (userId: string) => {
  //   return audioRefs.find((ref) => ref.current?.id === userId);
  //   // return audioRefs.find((ref) => ref.current?.id === userId);
  // };
  const onMuteToggle = () => {
    console.log("muted");
  };
  const onDeafenToggle = () => {
    console.log("deafened");
  };

  useEffect(() => {
    if (!ws) return;
    ws.current!.onmessage = (event: any) => {
      const message = JSON.parse(event.data);
      console.log(message);
    };
    console.log(players);
  }, [players]);
  return (
    <div className="grid grid-cols-4 gap-2">
      {/* First three identical voice boxes */}

      {Array.from(players, ([userId, spawn]) => ({
        userId,
        spawn,
        isMuted: false,
        isDeafened: false,
        isSpeaking: false,
      })).map((player, index) => {
        console.log(player, index);
        return (
          <div
            className={`
          aspect-square bg-gray-800 rounded-lg border 
          border-green-500
          p-3 flex flex-col items-center justify-between
          w-32 h-32
        `}
          >
            {/* User Avatar/Identifier */}
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-gray-300 text-sm font-medium">
                {/* {player.name!.substring(0, 2).toUpperCase() ?? "Name"} */}
                {/* {"Name"} */}
                {/* {player.name} */}
              </span>
            </div>

            {/* Username */}
            <span className="text-sm text-gray-300 truncate w-full text-center">
              {/* {player.name} */}
              {/* {"Name"} */}
              {player.userId}
            </span>

            {/* Controls */}
            <div className="flex gap-2 mt-1">
              {/* <audio ref={audioRefs[index]} controls></audio> */}
              {isCurrentUser ? (
                <>
                  <button
                    onClick={onMuteToggle}
                    className="p-1.5 rounded-full hover:bg-gray-700 transition-colors"
                    title={player.isMuted ? "Unmute" : "Mute"}
                  >
                    {player.isMuted ? (
                      <MicOff className="w-4 h-4 text-red-400" />
                    ) : (
                      <Mic className="w-4 h-4 text-green-400" />
                    )}
                  </button>
                  <button
                    onClick={onDeafenToggle}
                    className="p-1.5 rounded-full hover:bg-gray-700 transition-colors"
                    title={player.isDeafened ? "Undeafen" : "Deafen"}
                  >
                    {player.isDeafened ? (
                      <VolumeX className="w-4 h-4 text-red-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-green-400" />
                    )}
                  </button>
                </>
              ) : (
                <div className="h-8 flex items-center">
                  {player.isSpeaking && !player.isMuted && (
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VoiceSection;
