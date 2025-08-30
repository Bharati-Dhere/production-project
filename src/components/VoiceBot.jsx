import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// Command mapping for English, Hindi, Marathi
const commandMap = [
  // English
  { phrases: ["home", "open home", "go home", "main page"], path: "/" },
  { phrases: ["products", "open products", "show products", "product page"], path: "/products" },
  { phrases: ["accessory", "open accessory", "show accessories", "accessory page"], path: "/accessory" },
  { phrases: ["cart", "open cart", "show cart"], path: "/cart" },
  { phrases: ["wishlist", "open wishlist", "show wishlist"], path: "/wishlist" },
  { phrases: ["profile", "open profile", "show profile"], path: "/profile" },
  { phrases: ["help", "open help", "show help"], path: "/help" },
  // Hindi
  { phrases: ["ghar", "मुख्य पृष्ठ", "होम", "होम खोलो"], path: "/" },
  { phrases: ["उत्पाद", "products", "products खोलो", "products दिखाओ"], path: "/products" },
  { phrases: ["सामान", "accessory", "accessory खोलो"], path: "/accessory" },
  { phrases: ["कार्ट", "cart खोलो"], path: "/cart" },
  { phrases: ["इच्छा सूची", "wishlist खोलो"], path: "/wishlist" },
  { phrases: ["प्रोफ़ाइल", "profile खोलो"], path: "/profile" },
  { phrases: ["मदद", "help खोलो"], path: "/help" },
  // Marathi
  { phrases: ["मुख्य पृष्ठ", "होम", "होम उघडा"], path: "/" },
  { phrases: ["उत्पादने", "products उघडा", "products दाखवा"], path: "/products" },
  { phrases: ["सामान", "accessory उघडा"], path: "/accessory" },
  { phrases: ["कार्ट", "cart उघडा"], path: "/cart" },
  { phrases: ["इच्छा यादी", "wishlist उघडा"], path: "/wishlist" },
  { phrases: ["प्रोफाइल", "profile उघडा"], path: "/profile" },
  { phrases: ["मदत", "help उघडा"], path: "/help" },
];

const VoiceBot = () => {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");

  // Start/stop speech recognition
  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setError("Voice recognition not supported in this browser.");
      return;
    }
    setError("");
    if (!listening) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN"; // Covers English, Hindi, Marathi (best effort)
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        // Try to match command
        for (const cmd of commandMap) {
          if (cmd.phrases.some(p => transcript.includes(p))) {
            navigate(cmd.path);
            setListening(false);
            return;
          }
        }
        setError("Sorry, command not recognized.");
      };
      recognition.onerror = (event) => {
        setError(event.error || "Voice recognition error");
        setListening(false);
      };
      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
      recognition.start();
      setListening(true);
    } else {
      recognitionRef.current && recognitionRef.current.stop();
      setListening(false);
    }
  };

  return (
    <div style={{ position: 'fixed', left: 24, bottom: 24, zIndex: 1000 }}>
      <button
        onClick={toggleListening}
        style={{
          background: listening ? '#2563eb' : '#fff',
          color: listening ? '#fff' : '#2563eb',
          border: '2px solid #2563eb',
          borderRadius: '50%',
          width: 56,
          height: 56,
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          transition: 'all 0.2s',
          outline: 'none',
          cursor: 'pointer',
        }}
        aria-label={listening ? "Stop listening" : "Start voice bot"}
        title="Voice Bot"
      >
        <span role="img" aria-label="mic">🎤</span>
      </button>
      {error && (
        <div style={{ marginTop: 8, color: '#dc2626', background: '#fff', borderRadius: 8, padding: '4px 12px', fontSize: 13, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>{error}</div>
      )}
      {listening && (
        <div style={{ marginTop: 8, color: '#2563eb', background: '#e0e7ff', borderRadius: 8, padding: '4px 12px', fontSize: 13 }}>Listening...</div>
      )}
    </div>
  );
};

export default VoiceBot;
