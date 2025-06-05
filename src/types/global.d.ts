// src/types/global.d.ts

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
  readonly resultIndex: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  readonly isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
}

// Use declare const instead of var.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const SpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const webkitSpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

export {};
