import { useRef } from "react";
import { Player } from "../utils/arena";
import VoiceBox from "./VoiceBox";
import useWebRTC from "../utils/voice";

interface VoiceSectionProps {
  ws: any;
  players: any;
  myId: string;
  setPlayers: any;
}

const VoiceSection = ({ ws, players, setPlayers, myId }: VoiceSectionProps) => {
  const audioRefs = useRef<any>({});
  const localStream = useRef<any>(null);
  // useDebugValue(localStream.current, (value: any) => `Current Value: ${value}`);
  const provideRef = (instance: any, userId: string) => {
    audioRefs.current[userId] = instance;
  };

  useWebRTC({
    ws,
    players,
    myId,
    audioRefs,
    localStream,
    setPlayers,
  });

  const me = players.find((p: Player) => p.id === myId);

  const onMuteToggle = () => {
    ws.current?.send(
      JSON.stringify({
        type: me.isMuted ? "unmute" : "mute",
        payload: {
          userId: myId,
          isMuted: !me.isMuted,
        },
      })
    );
    setPlayers((prev: any) => {
      const updated = prev.map((p: Player) => {
        if (p.id === myId) {
          return { ...p, isMuted: !p.isMuted };
        }
        return p;
      });

      return [...updated];
    });
  };
  const onDeafenToggle = () => {
    ws.current?.send(
      JSON.stringify({
        type: me.isDeafened ? "undeafen" : "deafen",
        payload: {
          userId: myId,
          isDeafened: !me.isDeafened,
        },
      })
    );
    // logic to update the state of the player
    setPlayers((prev: any) => {
      const updated = prev.map((p: Player) => {
        if (p.id === myId) {
          return { ...p, isDeafened: !p.isDeafened };
        }
        return p;
      });

      return [...updated];
    });
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      {me && (
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
        })}
    </div>
  );
};

export default VoiceSection;
