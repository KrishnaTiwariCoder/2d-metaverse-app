import React from "react";
import { Player } from "../../redux/playerslice";
import { useSelector } from "react-redux";

 const VoiceSection = ()=> {
  const players = useSelector((state: any) => state.players.players);
  const username = useSelector((state: any) => state.auth.currentUser.username);
  const myId = useSelector((state:any)=>state.auth.myId);


  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-4">
      <h2 className="text-xl text-white mb-4">Video Chat</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">{username}</div>

        {players
          .filter((player: Player) => player.id !== myId)
          .map((player: Player) => (
            <div key={player.id}
              className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                {player.name}
            </div>
          ))}
      </div>
    </div>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(VoiceSection);
