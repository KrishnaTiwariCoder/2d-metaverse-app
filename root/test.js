import React, { useEffect, useRef, useState } from 'react';

const AudioRoom: React.FC = () => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userId = 'user-' + Math.random().toString(36).substring(2, 15);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');
    setWs(socket);

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'join-room', room: 'test-room', userId }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'audio-chunk':
          // Play received audio
          if (audioRef.current) {
            const audioBlob = new Blob([data.data], { type: 'audio/webm' });
            const url = URL.createObjectURL(audioBlob);
            audioRef.current.src = url;
            audioRef.current.play();
          }
          break;

        case 'mute':
          if (data.userId === userId) setIsMuted(true);
          break;

        case 'unmute':
          if (data.userId === userId) setIsMuted(false);
          break;

        default:
          break;
      }
    };

    return () => {
      socket.close();
    };
  }, [userId]);

  const handleMuteToggle = () => {
    if (ws) {
      setIsMuted(!isMuted);
      ws.send(JSON.stringify({ type: isMuted ? 'unmute-user' : 'mute-user', targetUserId: userId }));
    }
  };

  const handleSendAudio = (stream: MediaStream) => {
    // const audioChunks: Blob[] = [];
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && ws) {
        ws.send(JSON.stringify({ type: 'audio-chunk', chunk: event.data, userId }));
      }
    };

    mediaRecorder.start(250); // Send audio chunks every 250ms
  };

  const startAudio = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    handleSendAudio(stream);
  };

  return (
    <div>
      <audio ref={audioRef} controls />
      <button onClick={startAudio}>Start Audio</button>
      <button onClick={handleMuteToggle}>{isMuted ? 'Unmute' : 'Mute'}</button>
    </div>
  );
};

export default AudioRoom;
