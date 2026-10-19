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

      // 9. Switch Mode Intent (Disabled for strict role security)
      if (text.includes('switch') && (text.includes('role') || text.includes('mode') || text.includes('creator') || text.includes('editor'))) {
        const responseMsg = "Account role switching is disabled for security. Creator and editor roles are separate accounts.";
        setAiResponse(responseMsg);
        speakText(responseMsg);
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
      {/* Floating Editorial Brutalist Button (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-50 select-none">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center justify-center w-14 h-14 bg-[#FFEBAA] hover:bg-[#ffe58f] text-[#261615] border-2 border-[#382322] shadow-[4px_4px_0_#382322] hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-1 active:translate-y-1 transition-all duration-200 cursor-pointer"
          title="Collabo Voice AI (Click to talk)"
        >
          {isListening ? (
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-3 bg-[#382322] animate-wave-bar" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-5 bg-[#382322] animate-wave-bar" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-4 bg-[#382322] animate-wave-bar" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <Sparkles className="w-6 h-6 text-[#261615]" />
          )}

          {/* Active indicator */}
          <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-[#059669] border-2 border-[#382322] shadow-[1px_1px_0_#382322]" />
        </button>
      </div>

      {/* Floating Editorial Brutalist Voice Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[92vw] max-w-md bg-[#FFFDF9] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[8px_8px_0_#382322] dark:shadow-[8px_8px_0_#000] p-6 animate-fade-in overflow-hidden text-[#261615] dark:text-[#FDEBDE]">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#382322]/10 dark:border-[#FDEBDE]/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#FFEBAA] border-2 border-[#382322] flex items-center justify-center text-[#261615] shadow-[2px_2px_0_#382322]">
                <Sparkles className="w-4 h-4 text-[#261615]" />
              </div>
              <div>
                <h4 className="text-sm font-serif font-bold text-[#261615] dark:text-[#FDEBDE] tracking-tight flex items-center gap-1.5">
                  Collabo AI <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 bg-[#FFEBAA] text-[#261615] border border-[#382322]">Voice Agent</span>
                </h4>
              </div>
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                if (isListening && recognitionRef.current) recognitionRef.current.stop();
              }}
              className="p-1.5 border-2 border-[#382322] dark:border-[#FDEBDE]/30 bg-[#FFF7F1] dark:bg-[#19100F] text-[#261615] dark:text-[#FDEBDE] hover:bg-[#FDEBDE] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Center Stage Waveform */}
          <div className="py-7 flex flex-col items-center justify-center text-center">
            {/* Brutalist Voice Waveform */}
            <div className="flex items-center justify-center gap-1.5 h-16 mb-4">
              {[16, 28, 48, 64, 42, 24, 14].map((h, idx) => (
                <div
                  key={idx}
                  className={`w-2.5 transition-all duration-300 border border-[#382322] dark:border-[#FDEBDE]/30 ${
                    isListening
                      ? 'bg-[#FFEBAA] dark:bg-[#FFEBAA] animate-wave-bar shadow-[2px_2px_0_#382322]'
                      : isThinking
                      ? 'bg-[#B1C8EA] animate-pulse'
                      : 'bg-[#382322]/20 dark:bg-[#FDEBDE]/20'
                  }`}
                  style={{
                    height: isListening ? `${h}px` : '16px',
                    animationDelay: `${idx * 110}ms`,
                  }}
                />
              ))}
            </div>

            {/* Transcript or Status */}
            <p className="text-sm font-serif font-medium text-[#261615] dark:text-[#FDEBDE] max-w-xs min-h-[3rem] flex items-center justify-center italic leading-relaxed">
              {transcript ? `"${transcript}"` : aiResponse}
            </p>

            {/* State Pill */}
            <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider bg-[#FFF7F1] dark:bg-[#19100F] text-[#261615] dark:text-[#FDEBDE] border border-[#382322]/30 dark:border-[#FDEBDE]/30 shadow-[1px_1px_0_#382322]">
              <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-rose-600 animate-ping' : 'bg-[#059669]'}`} />
              {isListening ? 'Listening...' : isThinking ? 'Processing...' : 'Tap mic & speak'}
            </span>
          </div>

          {/* Quick Voice Suggestions */}
          <div className="space-y-1.5 mb-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5C3A38] dark:text-[#D4B8A8] block px-1">
              Try Saying:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.slice(0, 3).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExecuteCommand(prompt)}
                  className="px-2.5 py-1 text-left text-xs text-[#261615] dark:text-[#FDEBDE] bg-[#FFF7F1] dark:bg-[#19100F] hover:bg-[#FFEBAA] dark:hover:bg-[#FFEBAA] dark:hover:text-[#261615] border border-[#382322]/20 dark:border-[#FDEBDE]/20 hover:border-[#382322] transition-all flex items-center gap-1 group cursor-pointer font-sans"
                >
                  <span className="truncate max-w-[280px]">{prompt}</span>
                  <ArrowRight className="w-3 h-3 text-[#261615] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="pt-3 border-t-2 border-[#382322]/10 dark:border-[#FDEBDE]/10 flex items-center justify-between">
            <span className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] font-sans">
              Auto-fills projects & navigates pages
            </span>

            <button
              onClick={toggleListening}
              className={`p-3 border-2 border-[#382322] shadow-[3px_3px_0_#382322] transition-all duration-200 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-[#FFEBAA] hover:bg-[#ffe58f] text-[#261615]'
              }`}
              title={isListening ? 'Stop listening' : 'Start speaking'}
            >
              {isListening ? (
                <div className="w-4 h-4 bg-white" />
              ) : (
                <Mic className="w-5 h-5 text-[#261615]" />
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CollaboVoiceAI;
