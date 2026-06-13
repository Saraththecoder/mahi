import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  BookOpen, 
  Sparkles,
  Loader2,
  HelpCircle,
  HelpCircle as HelpIcon
} from 'lucide-react';
import { api, ChatResponse } from '../services/api';

interface AIChatbotProps {
  language: 'en' | 'te' | 'hi';
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  source_documents?: Array<{ title: string; source: string }>;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({ language }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const translations = {
    en: {
      title: "AI Farming Assistant",
      subtitle: "Ask RAG chatbot about crop diseases, fertilizers, and govt schemes",
      inputPlaceholder: "Ask about fertilizers, plant diseases, schemes...",
      sendBtn: "Send",
      sources: "Sources Consulted",
      suggestedQuestions: "Suggested Queries",
      q1: "How to apply fertilizer in Cotton?",
      q2: "How to cure Tomato Early Blight?",
      q3: "What are the benefits of PM-KISAN?",
      q4: "How to perform soil testing in AP?",
      introGreeting: "Hello! I am your AI Agriculture assistant. I hold records from AP Agri Dept & ICAR. Ask me anything!"
    },
    te: {
      title: "AI వ్యవసాయ సహాయకుడు",
      subtitle: "పంట తెగుళ్లు, ఎరువులు మరియు ప్రభుత్వ పథకాల గురించి చాట్‌బాట్‌ను అడగండి",
      inputPlaceholder: "ఎరువులు, పంట తెగుళ్లు, పథకాల గురించి అడగండి...",
      sendBtn: "పంపు",
      sources: "ఆధార పత్రాలు",
      suggestedQuestions: "తరచుగా అడిగే ప్రశ్నలు",
      q1: "పత్తి పంటలో ఎరువులు ఎలా వేయాలి?",
      q2: "టొమాటో ఆకుమచ్చ తెగులు నివారణ ఎలా?",
      q3: "పీఎం-కిసాన్ పథకం ప్రయోజనాలు ఏమిటి?",
      q4: "ఆంధ్రప్రదేశ్ లో మట్టి పరీక్షలు ఎక్కడ చేస్తారు?",
      introGreeting: "నమస్తే! నేను మీ AI వ్యవసాయ సహాయకుడిని. ఆంధ్రప్రదేశ్ వ్యవసాయ శాఖ మరియు ICAR పత్రాల ఆధారంగా మీ ప్రశ్నలకు సమాధానమిస్తాను. అడగండి!"
    },
    hi: {
      title: "एआई कृषि सहायक",
      subtitle: "फसल रोग, उर्वरक और सरकारी योजनाओं के बारे में कृषि चैटबॉट से पूछें",
      inputPlaceholder: "खाद, फसल रोग, योजनाओं के बारे में पूछें...",
      sendBtn: "भेजें",
      sources: "परामर्शित स्रोत",
      suggestedQuestions: "सुझाए गए प्रश्न",
      q1: "कपास में खाद डालने का सही तरीका क्या है?",
      q2: "टमाटर का अगेती झुलसा रोग कैसे ठीक करें?",
      q3: "पीएम-किसान योजना के क्या लाभ हैं?",
      q4: "आंध्र प्रदेश में मिट्टी की जांच कैसे करें?",
      introGreeting: "नमस्ते! मैं आपका एआई कृषि सहायक हूँ। मैं आपको कृषि विभाग और आईसीएआर के दिशा-निर्देशों के अनुसार सटीक जानकारी प्रदान कर सकता हूँ।"
    }
  };

  const t = translations[language];

  // Set initial welcome greeting message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: t.introGreeting
      }
    ]);
  }, [language]);

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const queryText = textToSend || input;
    if (!queryText.trim() || loading) return;

    if (!textToSend) setInput('');

    // Append user message
    const userMsg: Message = {
      id: Math.random().toString(),
      role: 'user',
      content: queryText
    };
    setMessages(prev => [...prev, userMsg]);
    
    setLoading(true);
    try {
      const res = await api.queryChatbot(queryText, sessionId, language);
      if (!sessionId) setSessionId(res.session_id);
      
      const botMsg: Message = {
        id: res._id,
        role: 'assistant',
        content: res.bot_response,
        source_documents: res.source_documents
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting to the knowledge database. Please ensure the backend is running."
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow p-6 overflow-hidden flex flex-col h-full max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="shrink-0 mb-4">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
          <MessageSquare className="h-6 w-6 text-primary-600 animate-pulse-subtle" />
          <span>{t.title}</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1">{t.subtitle}</p>
      </div>

      {/* Main chat window and sidebar panel */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Chat box */}
        <div className="md:col-span-3 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-full">
          {/* Messages list */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`
                    flex items-start space-x-2 max-w-[85%]
                    ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}
                  `}>
                    {/* Avatar */}
                    <div className={`
                      h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm
                      ${isUser ? 'bg-primary-600 text-white' : 'bg-gold-500 text-primary-950'}
                    `}>
                      {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>

                    {/* Text block */}
                    <div className="space-y-1">
                      <div className={`
                        px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
                        ${isUser 
                          ? 'bg-gradient-to-tr from-primary-600 to-primary-700 text-white rounded-tr-none' 
                          : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none'}
                      `}>
                        {m.content}
                      </div>

                      {/* Source docs indicators */}
                      {!isUser && m.source_documents && m.source_documents.length > 0 && (
                        <div className="flex flex-wrap gap-1 px-1 pt-1">
                          {m.source_documents.map((doc, idx) => (
                            <span 
                              key={idx} 
                              className="inline-flex items-center space-x-1 text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200/50"
                            >
                              <BookOpen className="h-2.5 w-2.5" />
                              <span>{doc.title}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="h-8 w-8 rounded-full bg-gold-500 text-primary-950 flex items-center justify-center shadow-sm">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 rounded-tl-none flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                    <span className="text-xs text-slate-400 font-medium">Synthesizing agronomic response...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat input form */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
            className="p-3 border-t border-slate-150 bg-slate-50/50 flex space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.inputPlaceholder}
              className="flex-grow bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400 text-slate-800"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-10 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-sm transition-all disabled:bg-slate-200 disabled:text-slate-400"
            >
              <span>{t.sendBtn}</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        {/* Suggested Queries panel */}
        <div className="md:col-span-1 glass-panel p-4 rounded-3xl h-fit space-y-4">
          <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider flex items-center space-x-1.5">
            <HelpIcon className="h-4 w-4 text-primary-500" />
            <span>{t.suggestedQuestions}</span>
          </h3>
          <div className="flex flex-col space-y-2">
            {[t.q1, t.q2, t.q3, t.q4].map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200/50 text-left text-xs font-semibold text-slate-600 hover:bg-primary-50 hover:text-primary-950 hover:border-primary-200 transition-all leading-normal"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
