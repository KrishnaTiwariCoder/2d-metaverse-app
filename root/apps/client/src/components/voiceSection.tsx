import React, { useEffect } from "react";
import { Player } from "../redux/playerSlice.ts";
import { useSelector } from "react-redux";
import useWebRTC from "../utils/voice.ts";

interface VoiceSectionProps {
  ws: React.RefObject<WebSocket>;
}

const VoiceSection = ({ ws }: VoiceSectionProps) => {
  const players = useSelector((state: any) => state.players.players);
  // const myId = useSelector((state: any) => state.auth.myId);

  const { startCapture, toggleMute, audioRefs, videoRefs, localVideoRef } =
    useWebRTC({ wsRef: ws });

  useEffect(() => {
    startCapture();
  });

  const handleMute = (input: string) => {
    toggleMute(input as "audio" | "video");
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      <div className="">
        <video
          ref={(el) => (localVideoRef.current = el)}
          autoPlay
          muted
          playsInline
        />
        {players.map((player: Player) => (
          <div key={player.id}>
            <video
              ref={(el) => el && (videoRefs.current[player.id] = el)}
              autoPlay
              playsInline
            />
            <audio
              ref={(el) => el && (audioRefs.current[player.id] = el)}
              autoPlay
            />
          </div>
        ))}
        <button onClick={() => handleMute("video")}>Mute</button>
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
