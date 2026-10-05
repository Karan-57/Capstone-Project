import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Sparkles, X, Send, Volume2, ArrowRight, Check, Command } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const CollaboVoiceAI = () => {
  const navigate = useNavigate();
  const { role, setRole } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('Hey, how can I assist your productions today?');
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Suggested Voice Prompts
  const suggestions = [
    "Create project for travel vlog, budget ₹15,000, cinematic style",
    "Show pending editor applications",
    "Show analytics for this month",
    "Open messages",
    "Switch to editor mode"
  ];

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Voice synthesis helper
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      // Fallback: simulate listening if microphone not permitted
      if (isListening) {
        setIsListening(false);
      } else {
        setIsListening(true);
        setTranscript('Listening...');
        setTimeout(() => {
          handleExecuteCommand("Create project for my travel vlog, budget ₹15000, need cinematic editing");
        }, 2200);
      }
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (transcript.trim()) {
        handleExecuteCommand(transcript);
      }
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start issue:', err);
      }
    }
  };

  // AI Intent Parser & Workflow Executor
  const handleExecuteCommand = (rawText) => {
    const text = (rawText || transcript).toLowerCase();
    setIsThinking(true);
    setTranscript(rawText || transcript);

    setTimeout(() => {
      setIsThinking(false);

      // 1. SMART FORM AUTO-FILL: Create Project Intent
      if (text.includes('create project') || text.includes('new project') || text.includes('travel vlog') || text.includes('vlog')) {
        let budgetNum = '15000';
        const budgetMatch = text.match(/(?:budget|₹|\$)\s*(\d+[\d,]*)/i);
        if (budgetMatch) {
          budgetNum = budgetMatch[1].replace(/,/g, '');
        }

        const projectData = {
          title: text.includes('travel')
            ? 'Cinematic Travel Vlog — 4K Iceland Sequence'
            : 'High-Retention YouTube Narrative Video',
          budget: budgetNum,
          category: 'YouTube Longform',
          editingStyle: text.includes('cinematic') ? 'Cinematic Storytelling' : 'Fast-Paced Kinetic & Memes',
          requiredSkills: ['Adobe Premiere Pro', 'Sound Design & Foley', 'Color Grading (LUTs)'],
          duration: '8 - 12 Minutes',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: `Auto-generated brief via Collabo Voice AI:\n${rawText}\n\nPlease deliver 4K 60fps cut with atmospheric sound design and -14 LUFS dialogue standard.`,
        };

        // Dispatch event for CreateProject page to listen and auto-fill
        window.__collaboAutoFill = projectData;
        window.dispatchEvent(new CustomEvent('collabo-ai-fill-project', { detail: projectData }));

        const responseMsg = `Navigating to project studio and auto-filling details with budget ₹${Number(budgetNum).toLocaleString('en-IN')}.`;
        setAiResponse(responseMsg);
        speakText(responseMsg);

        if (role !== 'creator') setRole('creator');
        navigate('/creator/create-project');
        return;
      }

      // 2. Profile Intent
      if (text.includes('profile') || text.includes('bio') || text.includes('showreel') || text.includes('account')) {
        const responseMsg = "Navigating to your profile.";
        setAiResponse(responseMsg);
        speakText(responseMsg);
        navigate(`/${role}/profile`);
        return;
      }

      // 3. Settings / Edit Profile Intent
      if (text.includes('setting') || text.includes('edit profile') || text.includes('preference')) {
        const responseMsg = "Opening your account settings and profile editor.";
        setAiResponse(responseMsg);
        speakText(responseMsg);
        navigate(`/${role}/edit-profile`);
        return;
      }

      // 4. Projects / My Projects Intent
      if (text.includes('my project') || text.includes('projects') || text.includes('active contract')) {
        const responseMsg = "Opening your projects workspace.";
        setAiResponse(responseMsg);
        speakText(responseMsg);
        navigate(role === 'creator' ? '/creator/projects' : '/editor/active-projects');
        return;
      }

      // 5. Notifications Intent
      if (text.includes('notification') || text.includes('alert') || text.includes('update')) {
        const responseMsg = "Showing your notifications and activity alerts.";
        setAiResponse(responseMsg);
        speakText(responseMsg);
        navigate(`/${role}/notifications`);
        return;
      }

      // 6. Applications Intent
      if (text.includes('application') || text.includes('proposals') || text.includes('pending') || text.includes('candidates')) {
        const responseMsg = "Opening editor proposals and applications.";
        setAiResponse(responseMsg);
        speakText(responseMsg);
        navigate(role === 'creator' ? '/creator/applications' : '/editor/applications');
        return;
      }

      // 7. Analytics Intent
      if (text.includes('analytic') || text.includes('revenue') || text.includes('stats') || text.includes('month') || text.includes('performance')) {
        const responseMsg = "Displaying your channel production analytics and retention curves.";
        setAiResponse(responseMsg);
        speakText(responseMsg);
        navigate('/creator/analytics');
        return;
      }

      // 8. Messages Intent
      if (text.includes('message') || text.includes('chat') || text.includes('inbox') || text.includes('rahul') || text.includes('client')) {
        const responseMsg = "Opening client conversations and editing feedback threads.";
        setAiResponse(responseMsg);
        speakText(responseMsg);
        navigate(role === 'creator' ? '/creator/messages' : '/editor/messages');
        return;
      }

      // 9. Switch Mode Intent
      if (text.includes('editor') && (text.includes('switch') || text.includes('mode') || text.includes('view'))) {
        setRole('editor');
        const responseMsg = "Switched to Editor Pro workspace.";
        setAiResponse(responseMsg);
        speakText(responseMsg);
        navigate('/editor/dashboard');
        return;
      }

      if (text.includes('creator') && (text.includes('switch') || text.includes('mode') || text.includes('view'))) {
        setRole('creator');
        const responseMsg = "Switched to Creator Studio workspace.";
        setAiResponse(responseMsg);
        speakText(responseMsg);
        navigate('/creator/dashboard');
        return;
      }

      // 10. Payments & Earnings Intent
      if (text.includes('payment') || text.includes('release') || text.includes('escrow') || text.includes('earning') || text.includes('balance') || text.includes('payout')) {
        const responseMsg = "Opening escrow security center and financial overview.";
        setAiResponse(responseMsg);
        speakText(responseMsg);
        navigate(role === 'creator' ? '/creator/payments' : '/editor/earnings');
        return;
      }

      // 11. Dashboard / Home Intent
      if (text.includes('dashboard') || text.includes('home') || text.includes('main')) {
        const responseMsg = "Taking you back to your main dashboard.";
        setAiResponse(responseMsg);
        speakText(responseMsg);
        navigate(`/${role}/dashboard`);
        return;
      }

      // 12. Browse Gigs Intent
      if (text.includes('browse') || text.includes('find gig') || text.includes('find editor') || text.includes('search')) {
        const responseMsg = "Opening open project listings.";
        setAiResponse(responseMsg);
        speakText(responseMsg);
        navigate('/editor/browse');
        return;
      }

      // Default Intelligent Response
      const responseMsg = `Understood: "${rawText}". I am ready to navigate anywhere or create projects. Try saying "go to profile", "show analytics", or "create project".`;
      setAiResponse(responseMsg);
      speakText(responseMsg);
    }, 500);
  };

  return (
    <>
      {/* Floating Glass Orb Button (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-50 select-none">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-[#7C3AED] via-[#6366F1] to-[#3B82F6] p-0.5 shadow-[0_0_30px_rgba(124,58,237,0.5)] hover:shadow-[0_0_45px_rgba(124,58,237,0.8)] hover:scale-105 active:scale-95 transition-all duration-300"
          title="Collabo Voice AI (Click to talk)"
        >
          {/* Siri-like spinning gradient border */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 blur-sm opacity-60 group-hover:opacity-100 animate-spin" style={{ animationDuration: '6s' }} />

          {/* Inner glass orb */}
          <div className="relative w-full h-full rounded-full bg-[#07090E]/90 backdrop-blur-md flex items-center justify-center border border-white/20">
            {isListening ? (
              <div className="flex items-center gap-0.5">
                <span className="w-1 h-3 bg-purple-400 rounded-full animate-wave-bar" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-5 bg-white rounded-full animate-wave-bar" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-4 bg-indigo-400 rounded-full animate-wave-bar" style={{ animationDelay: '300ms' }} />
              </div>
            ) : (
              <Sparkles className="w-6 h-6 text-purple-300 group-hover:text-white transition-colors" />
            )}
          </div>

          {/* Unread / Active indicator */}
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-[#050505] animate-pulse" />
        </button>
      </div>

      {/* Floating ChatGPT 4o / Siri Glass Modal matching Reference media_1788455856798.jpg */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[92vw] max-w-md rounded-3xl bg-[#0A0D15]/95 backdrop-blur-2xl border border-white/[0.12] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] p-6 animate-fade-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-900/40">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  Collabo AI <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-900/50 text-purple-300 border border-purple-500/20">Voice Agent</span>
                </h4>
              </div>
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                if (isListening && recognitionRef.current) recognitionRef.current.stop();
              }}
              className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Center Stage Waveform Matching Reference Screenshot media_1788455856798.jpg */}
          <div className="py-8 flex flex-col items-center justify-center text-center">
            {/* Siri / ChatGPT 4o Voice Waveform */}
            <div className="flex items-center justify-center gap-1.5 h-16 mb-4">
              {[16, 28, 48, 64, 42, 24, 14].map((h, idx) => (
                <div
                  key={idx}
                  className={`w-2.5 rounded-full transition-all duration-300 ${
                    isListening
                      ? 'bg-gradient-to-t from-purple-500 via-indigo-200 to-white shadow-[0_0_15px_rgba(255,255,255,0.7)] animate-wave-bar'
                      : isThinking
                      ? 'bg-purple-400 animate-pulse'
                      : 'bg-white/40'
                  }`}
                  style={{
                    height: isListening ? `${h}px` : '16px',
                    animationDelay: `${idx * 110}ms`,
                  }}
                />
              ))}
            </div>

            {/* Transcript or Status */}
            <p className="text-sm font-medium text-white max-w-xs min-h-[3rem] flex items-center justify-center italic leading-relaxed">
              {transcript ? `"${transcript}"` : aiResponse}
            </p>

            {/* State Pill */}
            <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/[0.04] text-purple-300 border border-purple-500/20">
              <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
              {isListening ? 'Listening to speech...' : isThinking ? 'Processing intent...' : 'Tap mic & speak'}
            </span>
          </div>

          {/* Quick Voice Suggestions */}
          <div className="space-y-1.5 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
              Try Saying:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.slice(0, 3).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExecuteCommand(prompt)}
                  className="px-2.5 py-1 text-left text-[11px] font-medium text-slate-300 hover:text-white bg-white/[0.03] hover:bg-purple-900/30 rounded-lg border border-white/[0.05] hover:border-purple-500/30 transition-all flex items-center gap-1 group"
                >
                  <span className="truncate max-w-[280px]">{prompt}</span>
                  <ArrowRight className="w-3 h-3 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Controls matching reference */}
          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Auto-fills projects & navigates pages
            </span>

            {/* Orange Stop / Microphone Button matching reference screenshot */}
            <button
              onClick={toggleListening}
              className={`p-3 rounded-full transition-all duration-300 ${
                isListening
                  ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/40'
              }`}
              title={isListening ? 'Stop listening' : 'Start speaking'}
            >
              {isListening ? (
                <div className="w-4 h-4 rounded-sm bg-black" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CollaboVoiceAI;
