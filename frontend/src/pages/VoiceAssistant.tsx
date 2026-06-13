import React, { useState, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Loader2,
  ChevronRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

interface VoiceAssistantProps {
  language: 'en' | 'te' | 'hi';
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ language }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [keyboardQuery, setKeyboardQuery] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const translations = {
    en: {
      title: "Multilingual Voice Assistant",
      subtitle: "Ask questions in Telugu, Hindi, or English using your voice",
      recordBtnStart: "Hold & Speak",
      recordBtnStop: "Analyzing Voice...",
      listening: "Listening carefully...",
      transcription: "You Said",
      reply: "Rythu Assistant",
      listenBtn: "Hear Response",
      playResponse: "Play Speech",
      silentNotice: "Audio playback matches Google Text-to-Speech API output.",
      keyboardPlaceholder: "Or type your question here...",
      keyboardSend: "Ask Assistant",
      micBlocked: "Microphone access is blocked or unsupported. Using text fallback."
    },
    te: {
      title: "వాయిస్ సహాయకుడు (మల్టీలింగ్వల్)",
      subtitle: "తెలుగు, హిందీ లేదా ఇంగ్లీషులో నోటి మాట ద్వారా ప్రశ్నలు అడగండి",
      recordBtnStart: "నొక్కి మాట్లాడండి",
      recordBtnStop: "ధ్వని విశ్లేషిస్తోంది...",
      listening: "మీ మాటలు వింటున్నాను...",
      transcription: "మీరు అడిగినది",
      reply: "రైతు సహాయకుడు",
      listenBtn: "సమాధానం వినండి",
      playResponse: "ప్లే చేయి",
      silentNotice: "ఆడియో ప్లేబ్యాక్ గూగుల్ టెక్స్ట్-టు-స్పీచ్ ద్వారా వస్తుంది.",
      keyboardPlaceholder: "లేదా మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి...",
      keyboardSend: "అడగండి",
      micBlocked: "మైక్రోఫోన్ అనుమతి లేదు. టైపింగ్ ద్వారా అడగవచ్చు."
    },
    hi: {
      title: "बहुभाषी आवाज सहायक",
      subtitle: "तेलुगु, हिंदी या अंग्रेजी में बोलकर सवाल पूछें",
      recordBtnStart: "दबाएं और बोलें",
      recordBtnStop: "आवाज का विश्लेषण...",
      listening: "सुन रहा हूँ...",
      transcription: "आपने कहा",
      reply: "कृषि सहायक",
      listenBtn: "उत्तर सुनें",
      playResponse: "ऑडियो चलाएं",
      silentNotice: "ऑडियो प्लेबैक गूगल स्पीच सिंथेसाइज़र द्वारा संचालित है।",
      keyboardPlaceholder: "या अपना प्रश्न यहाँ टाइप करें...",
      keyboardSend: "पूछें",
      micBlocked: "माइक्रोफोन ब्लॉक है। टेक्स्ट बॉक्स का उपयोग करें।"
    }
  };

  const t = translations[language];

  const startRecording = async () => {
    setIsRecording(true);
    setTranscript('');
    setResponse('');
    setAudioUrl(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await uploadAudio(audioBlob);
        // Stop all tracks in stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
    } catch (err) {
      console.warn("Microphone not available, using simulated voice fallback", err);
      // Simulate audio processing
      setLoading(true);
      setTimeout(async () => {
        // Create dummy blob
        const dummyBlob = new Blob([new Uint8Array(100)], { type: 'audio/wav' });
        await uploadAudio(dummyBlob);
      }, 1500);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const uploadAudio = async (audioBlob: Blob) => {
    setLoading(true);
    try {
      const res = await api.processVoice(audioBlob, language);
      setTranscript(res.transcription);
      setResponse(res.response);
      
      // Convert base64 audio response to a playable URL
      const audioBytes = atob(res.audio_base64);
      const arrayBuffer = new ArrayBuffer(audioBytes.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < audioBytes.length; i++) {
        uint8Array[i] = audioBytes.charCodeAt(i);
      }
      const playBlob = new Blob([uint8Array], { type: 'audio/mp3' });
      const playUrl = URL.createObjectURL(playBlob);
      setAudioUrl(playUrl);
      
      // Auto-play the synthesized speech
      setTimeout(() => {
        if (audioPlayerRef.current) {
          audioPlayerRef.current.src = playUrl;
          audioPlayerRef.current.play().catch(e => console.log("Auto-play blocked by browser:", e));
        }
      }, 200);
    } catch (err) {
      console.error(err);
      setTranscript("Error capturing audio.");
      setResponse("Could not connect to the speech synthesis server.");
    } finally {
      setLoading(false);
    }
  };

  // Keyboard text submit
  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyboardQuery.trim()) return;
    const query = keyboardQuery.trim();
    setLoading(true);
    setTranscript(query);
    setKeyboardQuery('');
    setResponse('');
    setAudioUrl(null);
    try {
      // 1. Get chatbot text response
      const chatRes = await api.queryChatbot(query, null, language);
      const botText = chatRes.bot_response;
      setResponse(botText);

      // 2. Synthesize speech for the bot response via TTS endpoint
      const ttsRes = await api.synthesizeSpeech(botText, language);
      if (ttsRes.audio_base64) {
        const audioBytes = atob(ttsRes.audio_base64);
        const arrayBuffer = new ArrayBuffer(audioBytes.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < audioBytes.length; i++) {
          uint8Array[i] = audioBytes.charCodeAt(i);
        }
        const playBlob = new Blob([uint8Array], { type: 'audio/mp3' });
        const playUrl = URL.createObjectURL(playBlob);
        setAudioUrl(playUrl);
        setTimeout(() => {
          if (audioPlayerRef.current) {
            audioPlayerRef.current.src = playUrl;
            audioPlayerRef.current.play().catch(e => console.log(e));
          }
        }, 100);
      }
    } catch (err) {
      console.error(err);
      setResponse('Failed to get a response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePlayback = () => {
    if (audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause();
        setIsPlaying(false);
      } else {
        audioPlayerRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto w-full max-w-4xl mx-auto flex flex-col justify-center">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center space-x-2">
          <Volume2 className="h-6 w-6 text-primary-600 animate-bounce" />
          <span>{t.title}</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1">{t.subtitle}</p>
      </div>

      {/* Main Microphone Button panel */}
      <div className="glass-panel p-8 rounded-3xl flex flex-col items-center justify-center space-y-6 shadow-md max-w-xl mx-auto w-full">
        {/* Animated wave form when listening */}
        <div className="h-24 flex items-center justify-center space-x-1.5 w-full">
          {isRecording ? (
            <>
              <div className="w-1.5 bg-primary-600 h-6 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-1.5 bg-primary-500 h-16 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-1.5 bg-gold-500 h-24 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              <div className="w-1.5 bg-primary-500 h-14 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              <div className="w-1.5 bg-primary-600 h-7 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
            </>
          ) : loading ? (
            <Loader2 className="h-10 w-10 text-primary-500 animate-spin" />
          ) : (
            <Sparkles className="h-12 w-12 text-gold-400 animate-pulse-subtle" />
          )}
        </div>

        {/* Record trigger */}
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          className={`
            h-36 w-36 rounded-full flex flex-col items-center justify-center text-white border-8 shadow-lg transition-transform duration-300 active:scale-95
            ${isRecording 
              ? 'bg-red-500 border-red-200 animate-pulse' 
              : 'bg-gradient-to-tr from-primary-600 to-primary-500 border-primary-100 hover:shadow-primary-600/20'}
          `}
        >
          {isRecording ? (
            <>
              <MicOff className="h-10 w-10" />
              <span className="text-[10px] font-bold uppercase tracking-wider mt-2">{t.listening}</span>
            </>
          ) : (
            <>
              <Mic className="h-10 w-10" />
              <span className="text-[10px] font-bold uppercase tracking-wider mt-2">{t.recordBtnStart}</span>
            </>
          )}
        </button>

        <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest leading-relaxed">
          {t.recordBtnStop}
        </p>
      </div>

      {/* Manual query keyboard */}
      <form onSubmit={handleTextSubmit} className="max-w-xl mx-auto w-full flex space-x-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
        <input 
          type="text" 
          value={keyboardQuery}
          onChange={(e) => setKeyboardQuery(e.target.value)}
          placeholder={t.keyboardPlaceholder}
          className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none text-slate-800"
        />
        <button 
          type="submit" 
          disabled={loading || !keyboardQuery.trim()}
          className="px-4 py-2 rounded-xl bg-primary-600 text-white font-bold text-xs hover:bg-primary-700 transition-all flex items-center space-x-1 shrink-0 disabled:bg-slate-200 disabled:text-slate-400"
        >
          <span>{t.keyboardSend}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </form>

      {/* Dialogue Box */}
      {(transcript || response) && (
        <div className="glass-panel p-6 rounded-2xl max-w-xl mx-auto w-full space-y-4">
          {/* User query */}
          {transcript && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t.transcription}</span>
              <p className="text-sm font-semibold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">
                "{transcript}"
              </p>
            </div>
          )}

          {/* Assistant Response */}
          {response && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-primary-700 uppercase tracking-wider block">{t.reply}</span>
              <p className="text-sm text-slate-700 leading-relaxed bg-primary-50/20 p-3 rounded-xl border border-primary-100/30">
                {response}
              </p>
            </div>
          )}

          {/* Audio Player Controls */}
          {audioUrl && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 bg-primary-950 text-white rounded-xl gap-3">
              <div className="flex items-center space-x-3">
                <button
                  onClick={togglePlayback}
                  className="h-10 w-10 rounded-full bg-gold-500 hover:bg-gold-600 text-primary-950 flex items-center justify-center transition-colors"
                >
                  {isPlaying ? <VolumeX className="h-5 w-5" /> : <Play className="h-5 w-5 fill-primary-950" />}
                </button>
                <div>
                  <h4 className="text-xs font-bold text-gold-400">{t.playResponse}</h4>
                  <p className="text-[9px] text-primary-300">{t.silentNotice}</p>
                </div>
              </div>
              
              <audio 
                ref={audioPlayerRef} 
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                className="hidden" 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
