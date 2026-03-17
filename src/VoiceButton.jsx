import { useState } from "react";
import { parseTaskWithAI } from "./aiParser";

function VoiceButton({ onResult }) {
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Your browser doesn't support voice. Try Chrome!");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      setError("Couldn't hear you. Try again!");
      setTimeout(() => setError(""), 3000);
    };

    recognition.onresult = async (e) => {
      const transcript = e.results[0][0].transcript;
      setProcessing(true);
      try {
        const tasks = await parseTaskWithAI(transcript);
        onResult(tasks);
      } catch (err) {
        onResult([{ text: transcript, section: "now" }]);
      }
      setProcessing(false);
    };

    recognition.start();
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button
        onClick={startListening}
        disabled={processing}
        style={{
          padding: "10px 14px",
          borderRadius: "8px",
          border: listening ? "2px solid #4f46e5" : "1.5px solid #ddd",
          background: listening ? "#ede9fe" : processing ? "#f9f9f9" : "white",
          cursor: processing ? "wait" : "pointer",
          fontSize: "18px",
          transition: "all 0.2s",
          animation: listening ? "pulse 1s infinite" : "none"
        }}
        title="Click to speak a task"
      >
        {processing ? "⏳" : "🎤"}
      </button>
      {error && <span style={{ fontSize: "12px", color: "#e74c3c" }}>{error}</span>}
      {listening && <span style={{ fontSize: "12px", color: "#4f46e5" }}>Listening...</span>}
      {processing && <span style={{ fontSize: "12px", color: "#888" }}>AI is thinking...</span>}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}

export default VoiceButton;