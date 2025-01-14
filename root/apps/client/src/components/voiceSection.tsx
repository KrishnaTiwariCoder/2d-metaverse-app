import { useEffect } from "react";
import VoiceBox from "./voiceBox";
import { MutableRefObject } from "react";

interface VoiceSectionProps {
  ws: MutableRefObject<WebSocket | null>;
  players: Map<string, any>;
  streams: any[];
}
const VoiceSection = ({ ws, players }: VoiceSectionProps) => {
  useEffect(() => {
    console.log(ws);
  }, []);
  return (
    <div className="grid grid-cols-4 gap-2">
      {/* First three identical voice boxes */}

      {Array.from(players, ([name, value]) => ({ name, value })).map(
        (player, index) => {
          console.log(player, index);
          return <VoiceBox participant={player} key={index} />;
        }
      )}
    </div>
  );
};

export default VoiceSection;
