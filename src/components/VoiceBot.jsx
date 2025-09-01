import React, { useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

// Expanded command map for VoiceBot
// Add these to VoiceBot.jsx, replacing the old commandMap
const commandMap = [
  // User side
  { phrases: ["home", "open home", "go home", "main page", "मुख्य पृष्ठ", "होम", "होम खोलो"], path: "/" },
  { phrases: ["products", "open products", "show products", "product page", "उत्पाद", "products खोलो", "products दिखाओ", "उत्पादने", "products उघडा", "products दाखवा"], path: "/products" },
  { phrases: ["accessory", "open accessory", "show accessories", "accessory page", "सामान", "accessory खोलो", "accessory उघडा"], path: "/accessory" },
  { phrases: ["cart", "open cart", "show cart", "कार्ट", "cart खोलो", "cart उघडा"], path: "/cart" },
  { phrases: ["wishlist", "open wishlist", "show wishlist", "इच्छा सूची", "wishlist खोलो", "इच्छा यादी", "wishlist उघडा"], path: "/wishlist" },
  { phrases: ["profile", "open profile", "show profile", "प्रोफ़ाइल", "profile खोलो", "प्रोफाइल", "profile उघडा"], path: "/profile" },
  { phrases: ["help", "open help", "show help", "मदद", "help खोलो", "मदत", "help उघडा"], path: "/help" },
  { phrases: ["login", "log in", "sign in", "लॉगिन", "लॉग इन", "साइन इन"], action: "login" },
  { phrases: ["signup", "sign up", "register", "साइनअप", "रजिस्टर", "नोंदणी"], action: "signup" },
  { phrases: ["forgot password", "reset password", "पासवर्ड भूल गए", "पासवर्ड रीसेट", "पासवर्ड विसरलात"], action: "forgot" },
  { phrases: ["reviews", "open reviews", "show reviews", "review page", "समीक्षा", "reviews खोलो", "reviews उघडा"], path: "/review" },
  { phrases: ["add review", "add reviews", "write review", "समीक्षा लिखें", "समीक्षा जोडा"], path: "/add-review" },
  { phrases: ["orders", "my orders", "order history", "ऑर्डर", "माझी ऑर्डर", "ऑर्डर इतिहास"], path: "/orders" },
  { phrases: ["track order", "track my order", "ऑर्डर ट्रैक करें", "ऑर्डर ट्रॅक करा"], path: "/track-order" },
  { phrases: ["apply filter", "filter products", "फिल्टर लगाएं", "फिल्टर करा"], action: "filter" },
  // Admin side (expanded for natural language)
  { phrases: ["admin login", "open admin login", "एडमिन लॉगिन"], path: "/admin/login" },
  { phrases: [
    "admin dashboard", "open admin dashboard", "dashboard", "dashboard page", "एडमिन डॅशबोर्ड", "डॅशबोर्ड", "डॅशबोर्ड पेज"
  ], path: "/admin/dashboard" },
  { phrases: [
    "admin products", "open admin products", "show products", "products", "products page", "existing products", "existing product", "एडमिन उत्पाद", "उत्पाद", "उत्पाद पेज", "उत्पाद दाखवा", "उत्पादने", "products उघडा", "products दाखवा"
  ], path: "/admin/products" },
  { phrases: [
    "admin orders", "open admin orders", "orders", "orders page", "order page", "order", "ऑर्डर", "ऑर्डर पेज", "ऑर्डर उघडा", "ऑर्डर दाखवा", "एडमिन ऑर्डर"
  ], path: "/admin/orders" },
  { phrases: [
    "admin customers", "open admin customers", "customers", "customer", "customer details", "customers page", "ग्राहक", "ग्राहक पेज", "ग्राहक उघडा", "ग्राहक दाखवा", "एडमिन ग्राहक"
  ], path: "/admin/customers" },
  { phrases: [
    "admin feedback", "open admin feedback", "feedback", "feedback page", "फीडबॅक", "फीडबॅक पेज", "फीडबॅक उघडा", "फीडबॅक दाखवा", "एडमिन फीडबॅक"
  ], path: "/admin/feedback" },
  { phrases: [
    "admin add product", "add admin product", "add product", "add products", "add products page", "add product page", "open add product page", "open add products page", "open add admin product page", "open add admin products page", "उत्पाद जोडा", "उत्पाद जोडा पेज", "एडमिन उत्पाद जोडा"
  ], path: "/admin/add-product" },
  { phrases: [
    "admin edit product", "edit admin product", "edit product", "edit products", "open edit product page", "open edit products page", "उत्पाद संपादित करा", "एडमिन उत्पाद संपादित करा"
  ], path: "/admin/edit-product" },
  { phrases: [
    "admin existing products", "existing admin products", "existing products", "existing product", "show product", "show products", "view product", "view products", "open show product page", "open show products page", "open view product page", "open view products page", "open existing product page", "open existing products page", "open exisitngproduct page", "open exisitngproducts page", "exisitngproduct", "exisitngproducts", "विद्यमान उत्पाद", "एडमिन विद्यमान उत्पाद"
  ], path: "/admin/existing-products" },
  // Add more as needed
];

const VoiceBot = () => {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const { user } = useContext(AuthContext) || {};

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
            // If admin is logged in, only allow admin-side pages
            if (user && user.role === "admin") {
              if (cmd.path && cmd.path.startsWith("/admin")) {
                navigate(cmd.path);
                setListening(false);
                return;
              } else {
                setError("As admin, you can only open admin pages by voice.");
                setListening(false);
                return;
              }
            }
            // If not admin, allow all user-side pages and restrict admin pages
            if (cmd.path) {
              if (cmd.path.startsWith("/admin")) {
                setError("You must be logged in as admin to access this page.");
              } else {
                navigate(cmd.path);
              }
            } else if (cmd.action) {
              // Handle actions like login, signup, forgot password, filter
              switch (cmd.action) {
                case "login":
                  // Trigger login modal or navigate to login page
                  break;
                case "signup":
                  // Trigger signup modal or navigate to signup page
                  break;
                case "forgot":
                  // Trigger forgot password modal or navigate to forgot password page
                  break;
                case "filter":
                  // Apply filter logic
                  break;
                default:
                  break;
              }
            }
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
