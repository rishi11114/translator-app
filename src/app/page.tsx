// page.tsx
"use client";

import { useState, useEffect, useRef } from "react";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function TranslatorApp() {
  type LanguageCode = "en" | "es" | "fr" | "de" | "it" | "pt" | "ru" | "zh" | "ja" | "ar" | "bn";
  const langMap: Record<LanguageCode, string> = {
    en: "en-US",
    es: "es-ES",
    fr: "fr-FR",
    de: "de-DE",
    it: "it-IT",
    pt: "pt-PT",
    ru: "ru-RU",
    zh: "zh-CN",
    ja: "ja-JP",
    ar: "ar-SA",
    bn: "bn-IN",
  };

  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [inputLang, setInputLang] = useState<LanguageCode>("en");
  const [targetLang, setTargetLang] = useState<LanguageCode>("es");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = langMap[inputLang] || inputLang;
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          setIsListening(false);
          setErrorMessage("");
        };
        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
          if (event.error === "network" && inputLang === "bn") {
            setErrorMessage("Speech recognition for Bengali is not available right now. Please type your text instead.");
          } else {
            setErrorMessage(`Speech recognition error: ${event.error}. Please check your internet connection and try again.`);
          }
        };
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      } else {
        setErrorMessage("Speech recognition is not supported in your browser. Please use Google Chrome.");
      }
    }
  }, [inputLang]);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      setErrorMessage("");
      recognitionRef.current.start();
    }
  };

  const translateText = async () => {
    if (!inputText.trim()) {
      setTranslatedText("");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          input_lang: inputLang,
          target_lang: targetLang,
        }),
      });
      if (!response.ok) {
        throw new Error(`Translation failed with status: ${response.status}`);
      }
      const data = await response.json();
      setTranslatedText(data.translatedText);
    } catch (error) {
      console.error("Translation error:", error);
      setTranslatedText("Translation failed. Please try again later.");
    }
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      translateText();
    }, 500);
    return () => clearTimeout(timer);
  }, [inputText, inputLang, targetLang]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [translatedText]);

  return (
    <div className="app-container">
      <div className="glow-effect"></div>
      <div className="glow-effect-2"></div>
      
      <div className="translator-card">
        <h1 className="translator-title">TRANSLATOR APP</h1>
        
        <div className="instruction-text">
          TYPE TEXT, OR CLICK THE <span className="highlight">'SPEAK'</span> BUTTON TO USE YOUR VOICE.
        </div>
        
        <div className="input-section">
          <div className="input-group">
            <input
              type="text"
              className="translator-input"
              placeholder="Enter text to translate"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button
              onClick={startListening}
              className={`speak-button ${isListening ? 'listening' : ''}`}
            >
              {isListening ? (
                <div className="pulse-animation">
                  <span className="mic-icon">🎤</span>
                </div>
              ) : (
                "Speak"
              )}
            </button>
          </div>
          
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          
          <div className="language-selectors">
            <div className="language-selector">
              <label className="language-label">Input Language:</label>
              <select
                className="language-select"
                value={inputLang}
                onChange={(e) => setInputLang(e.target.value as LanguageCode)}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="ru">Russian</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
                <option value="ar">Arabic</option>
                <option value="bn">Bengali</option>
              </select>
            </div>
            
            <div className="language-selector">
              <label className="language-label">Translation Language:</label>
              <select
                className="language-select"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value as LanguageCode)}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="ru">Russian</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
                <option value="ar">Arabic</option>
                <option value="bn">Bengali</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="output-section">
          <div className="output-title">Translation:</div>
          <div ref={outputRef} className={`output-content ${loading ? 'loading' : ''}`}>
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              translatedText || "Your translation will appear here..."
            )}
          </div>
        </div>
      </div>
    </div>
  );
}