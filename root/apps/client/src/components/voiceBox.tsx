import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";

const VoiceBox = ({
  player,
  index,
  onMuteToggle,
  onDeafenToggle,
  myId,
  provideRef,
}: any) => {
  return (
    <div
      key={index}
      className={`
        aspect-square bg-gray-800 rounded-lg border 
        ${player.isSpeaking ? "border-green-500" : "border-gray-700"}
        p-3 flex flex-col items-center justify-between
        w-40 h-40
      `}
    >
      {/* <audio
        autoPlay
        ref={(instance) => provideRef(instance, player.id)}
      ></audio> */}
      <video
        autoPlay
        ref={(instance) => provideRef(instance, player.id)}
      ></video>
      {/* User Avatar/Identifier */}
      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
        <span className="text-gray-300 text-sm font-medium">
          {/* {(player.name!.substring(0, 2).toUpperCase() ?? "Name")} */}
          {player.name}
        </span>
      </div>
      {/* Username */}
      <span className="text-sm text-gray-300 truncate w-full text-center">
        {/* {player.name} */}
      </span>
      {/* Controls */}

      <div className="flex gap-2 mt-1">
        <button
          disabled={player.id != myId}
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
          disabled={player.id != myId}
          onClick={() => onDeafenToggle(myId)}
          className="p-1.5 rounded-full hover:bg-gray-700 transition-colors"
          title={player.isDeafened ? "Undeafen" : "Deafen"}
        >
          {player.isDeafened ? (
            <VolumeX className="w-4 h-4 text-red-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-green-400" />
          )}
        </button>
      </div>
    </div>
  );
};

export default VoiceBox;
