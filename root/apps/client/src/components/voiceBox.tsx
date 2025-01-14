// import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";

// interface Participant {
//   id?: string;
//   name?: string;
//   stream?: MediaStream;
//   isMuted?: boolean;
//   isDeafened?: boolean;
//   isSpeaking?: boolean;
// }

// interface VoiceBoxProps {
//   participant?: Participant;
//   stream?: any;
//   onMuteToggle?: () => void;
//   onDeafenToggle?: () => void;
//   isCurrentUser?: boolean;
// }

const VoiceBox = ({ participant }: any) => {
  // ${participant.isSpeaking ? "border-green-500" : "border-gray-700"}
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
          {/* {participant.name!.substring(0, 2).toUpperCase() ?? "Name"} */}
          {/* {"Name"} */}
          {/* {participant.name} */}
        </span>
      </div>

      {/* Username */}
      <span className="text-sm text-gray-300 truncate w-full text-center">
        {/* {participant.name} */}
        {/* {"Name"} */}
        {participant.name}
      </span>

      {/* Controls */}
      <div className="flex gap-2 mt-1">
        {/* {isCurrentUser ? (
          <>
            <button
              onClick={onMuteToggle}
              className="p-1.5 rounded-full hover:bg-gray-700 transition-colors"
              title={participant.isMuted ? "Unmute" : "Mute"}
            >
              {participant.isMuted ? (
                <MicOff className="w-4 h-4 text-red-400" />
              ) : (
                <Mic className="w-4 h-4 text-green-400" />
              )}
            </button>
            <button
              onClick={onDeafenToggle}
              className="p-1.5 rounded-full hover:bg-gray-700 transition-colors"
              title={participant.isDeafened ? "Undeafen" : "Deafen"}
            >
              {participant.isDeafened ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-green-400" />
              )}
            </button>
          </>
        ) : (
          <div className="h-8 flex items-center">
            {participant.isSpeaking && !participant.isMuted && (
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
            )}
          </div>
        )} */}
      </div>
    </div>
  );
};

export default VoiceBox;
