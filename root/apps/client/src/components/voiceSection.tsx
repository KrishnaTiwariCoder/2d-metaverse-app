import React, { useEffect } from "react";
import { Player } from "../redux/playerSlice";
import { useSelector } from "react-redux";
import useWebRTC from "../utils/voice";

interface VoiceSectionProps {
  ws: React.RefObject<WebSocket>;
}

const VoiceSection = ({ ws }: VoiceSectionProps) => {
  const players = useSelector((state: any) => state.players.players);
  const myId = useSelector((state: any) => state.auth.myId);

  const { startCapture, toggleMute, audioRefs } = useWebRTC({ wsRef: ws });

  const getInstance = (instance: any, userId: string) => {
    // dispatch(addAudioRef({ userId, audioRef: instance }));
    audioRefs.current[userId] = instance;
  };

  useEffect(() => {
    startCapture();
  });

  return (
    <div className="grid grid-cols-4 gap-2">
      <div className="">
        {players
          .filter((p: Player) => p.id !== myId)
          .map((player: Player, index: number) => {
            return (
              <div
                key={index}
                className="bg-gray-800 rounded-lg border border-gray-700 p-4 w-screen "
              >
                {player.name}
                <audio
                  autoPlay
                  ref={(instance) => getInstance(instance, player.id)}
                  controls
                ></audio>
                <button onClick={toggleMute}>Mute</button>
              </div>
            );
          })}
      </div>
      {/* {me && (
        <VoiceBox
          player={me}
          index={0}
          onMuteToggle={onMuteToggle}
          onDeafenToggle={onDeafenToggle}
          myId={myId}
          provideRef={provideRef}
        />
      )}
      {players
        .filter((p: Player) => p.id !== myId)
        .map((player: Player, index: number) => {
          return (
            <VoiceBox
              player={player}
              index={index}
              onMuteToggle={onMuteToggle}
              onDeafenToggle={onDeafenToggle}
              myId={myId}
              key={index}
              provideRef={provideRef}
            />
          );
        })} */}
    </div>
  );
};

export default VoiceSection;
