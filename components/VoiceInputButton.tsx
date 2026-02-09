
import React, { useState, useEffect, useRef } from 'react';

interface VoiceInputButtonProps {
    onTranscript: (text: string) => void;
    placeholder?: string;
}

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({ onTranscript, placeholder = "Voice Entry" }) => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const onTranscriptRef = useRef(onTranscript);

    // Keep the ref updated with the latest callback to avoid restarting recognition
    useEffect(() => {
        onTranscriptRef.current = onTranscript;
    }, [onTranscript]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    // Ignore errors during cleanup
                }
            }
        };
    }, []);

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            alert("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.");
            return;
        }

        try {
            // Create a fresh instance every time to avoid 'service-not-allowed' or stale state
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    onTranscriptRef.current(finalTranscript);
                }
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                if (event.error === 'not-allowed') {
                    alert("Microphone access denied. Please allow microphone permissions in your browser settings.");
                } else if (event.error === 'service-not-allowed') {
                    alert("Voice service unavailable. This often happens if the browser restricts speech services or if you aren't using HTTPS. Try using Chrome or Edge.");
                }
                setIsListening(false);
            };

            recognition.onend = () => {
                // When recognition stops (timeout or silence), update UI
                setIsListening(false);
            };

            recognition.start();
            recognitionRef.current = recognition;
            setIsListening(true);
        } catch (error) {
            console.error("Failed to initialize speech recognition:", error);
            setIsListening(false);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                console.error("Error stopping recognition:", e);
            }
        }
        setIsListening(false);
    };

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    return (
        <button
            type="button"
            onClick={toggleListening}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                isListening 
                ? 'bg-red-500/20 text-red-300 ring-1 ring-red-500/50 animate-pulse' 
                : 'bg-white/5 hover:bg-white/10 text-slate-400'
            }`}
            title="Toggle Voice Input"
        >
            <span className={`material-symbols-outlined text-base ${isListening ? 'animate-ping' : ''}`}>
                {isListening ? 'mic' : 'mic_none'}
            </span>
            <span>{isListening ? 'Recording...' : 'Voice'}</span>
        </button>
    );
};
