import { Player } from "../utils/arena";
import VoiceBox from "./VoiceBox";

interface VoiceSectionProps {
  ws: any;
  players: any;
  streams: any;
  myId: string;
  setPlayers: any;
}

const VoiceSection = ({ ws, players, setPlayers, myId }: VoiceSectionProps) => {
  // const localStream = useRef<any>(null);
  // const connections = useRef<any>({});
  // const audioRefs = useRef<any>({});

  const me = players.find((p: Player) => p.id === myId);

  const onMuteToggle = () => {
    // websocket logic to send mute message
    ws.current?.send(
      JSON.stringify({
        type: me.isMuted ? "unmute" : "mute",
        payload: {
          userId: myId,
          isMuted: !me.isMuted,
        },
      })
    );
    console.log(me.isMuted ? "unmuted" : "muted");
    // logic to update the state of the player
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
    console.log(me.isDeafened ? "undeafened" : "deafened");
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
            />
          );
        })}
    </div>
  );
};

export default VoiceSection;
