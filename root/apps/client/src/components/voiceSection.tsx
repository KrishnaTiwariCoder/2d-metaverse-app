import VoiceBox from "./voiceBox";

const voiceSection = () => {
  return (
    <div className="grid grid-cols-4 gap-2">
      {/* First three identical voice boxes */}
      {[1, 2, 3].map((box) => (
        <VoiceBox key={box} />
      ))}
    </div>
  );
};

export default voiceSection;
