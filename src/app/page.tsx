"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { languages } from "./languages"; // your languages array file

export default function TranslatorApp() {
  const [inputText, setInputText] = useState<string>("");
  const [translatedText, setTranslatedText] = useState<string>("");
  const [inputLang, setInputLang] = useState<string>("en");
  const [targetLang, setTargetLang] = useState<string>("es");
  const [loading, setLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const outputRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionConstructor =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionConstructor) {
        const recognition = new SpeechRecognitionConstructor();
        recognition.continuous = false;
        recognition.interimResults = false;
        // Set the recognition language (here we use the code directly)
        recognition.lang = inputLang;

        // Use a function declaration without an unused parameter:
        recognition.onresult = function (event: SpeechRecognitionEvent): void {
          // Access results by array notation since the built-in type implements iteration.
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          setIsListening(false);
          setErrorMessage("");
        };

        // Update onerror as before:
        recognition.onerror = function (
          this: SpeechRecognition,
          ev: SpeechRecognitionErrorEvent
        ): void {
          console.error("Speech recognition error:", ev.error);
          setIsListening(false);
          if (ev.error === "network" && inputLang === "bn") {
            setErrorMessage(
              "Speech recognition for Bengali is not available right now. Please type your text instead."
            );
          } else {
            setErrorMessage(
              `Speech recognition error: ${ev.error}. Please check your internet connection and try again.`
            );
          }
        };

        // Remove the unused parameter (_ev) from this handler:
        recognition.onend = function (this: SpeechRecognition): void {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setErrorMessage(
          "Speech recognition is not supported in your browser. Please use Google Chrome."
        );
      }
    }
  }, [inputLang]);

  const startListening = (): void => {
    if (recognitionRef.current) {
      setIsListening(true);
      setErrorMessage("");
      recognitionRef.current.start();
    }
  };

  const translateText = useCallback(async (): Promise<void> => {
    if (!inputText.trim()) {
      setTranslatedText("");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, input_lang: inputLang, target_lang: targetLang }),
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
  }, [inputText, inputLang, targetLang]);

  useEffect(() => {
    const timer = setTimeout(() => {
      translateText();
    }, 500);
    return () => clearTimeout(timer);
  }, [translateText]);

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
          TYPE TEXT, OR CLICK THE <span className="highlight">&quot;SPEAK&quot;</span> BUTTON TO USE YOUR VOICE.
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
            <button onClick={startListening} className={`speak-button ${isListening ? "listening" : ""}`}>
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
                style={{ color: "black" }}
                onChange={(e) => setInputLang(e.target.value)}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="language-selector">
              <label className="language-label">Translation Language:</label>
              <select
                className="language-select"
                value={targetLang}
                style={{ color: "black" }}
                onChange={(e) => setTargetLang(e.target.value)}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="output-section">
          <div className="output-title">Translation:</div>
          <div ref={outputRef} className={`output-content ${loading ? "loading" : ""}`}>
            {loading ? <div className="loading-spinner"></div> : translatedText || "Your translation will appear here..."}
          </div>
        </div>
      </div>
    </div>
  );
}
