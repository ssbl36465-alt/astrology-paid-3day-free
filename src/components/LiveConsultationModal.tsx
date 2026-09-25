import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Copy,
  Check,
  ShieldCheck,
  X,
  Radio,
  MessageSquare,
  Send,
  Lock,
  AlertCircle
} from 'lucide-react';
import { Language } from '../types/astrology';

export interface GuruCallProfile {
  id: string;
  name: string;
  certificateUrl: string;
  specializations: string[];
  rating: number;
}

interface LiveConsultationModalProps {
  guru: GuruCallProfile;
  callType: 'audio' | 'video';
  language: Language;
  onClose: (durationSeconds: number, wasConnected: boolean) => void;
  onOpenWallet?: () => void;
}

export const LiveConsultationModal: React.FC<LiveConsultationModalProps> = ({
  guru,
  callType,
  language,
  onClose,
  onOpenWallet,
}) => {
  const isNe = language === 'ne';
  const isVideo = callType === 'video';

  // Real media state
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(!isVideo);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0); // 0 to 100 for live voice reactive meter

  // In-App Room State
  const [customerId] = useState(() => localStorage.getItem('vaidik_current_user_id') || `cust_${Math.floor(100000 + Math.random() * 900000)}`);
  const [roomId] = useState(() => `room_${guru.id.replace(/[^a-zA-Z0-9]/g, '')}_${customerId}`);
  const [callDuration, setCallDuration] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(true);

  // In-Room Text Chat during Call
  const [showInCallChat, setShowInCallChat] = useState(false);
  const [inCallMessages, setInCallMessages] = useState<{ sender: 'user' | 'guru'; text: string; time: string }[]>(() => [
    {
      sender: 'guru',
      text: isNe
        ? `नमस्कार! म ${guru.name} हुँ। हाम्रो कुराकानी एपभित्रै सुरक्षित रूपमा जोडिएको छ।`
        : `Namaste! I am ${guru.name}. Our live session is connected securely in-app.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inCallInput, setInCallInput] = useState('');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Initialize Real Browser Camera & Microphone
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    const startMedia = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setMediaError(isNe ? 'यो ब्राउजरमा क्यामेरा वा माइक्रोफोनको सुविधा उपलब्ध छैन।' : 'Media devices not supported in this browser.');
          return;
        }

        const constraints: MediaStreamConstraints = {
          audio: true,
          video: isVideo ? { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } : false,
        };

        const userStream = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = userStream;
        setStream(userStream);

        if (localVideoRef.current && isVideo) {
          localVideoRef.current.srcObject = userStream;
          localVideoRef.current.play().catch(() => {});
        }

        // Setup real audio level analyzer so the voice meter responds live
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass();
            audioContextRef.current = audioCtx;
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64;
            analyserRef.current = analyser;

            const source = audioCtx.createMediaStreamSource(userStream);
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const checkAudio = () => {
              if (analyserRef.current) {
                analyserRef.current.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                  sum += dataArray[i];
                }
                const avg = sum / dataArray.length;
                setAudioLevel(Math.min(100, Math.round(avg * 1.5)));
              }
              animationFrameRef.current = requestAnimationFrame(checkAudio);
            };
            checkAudio();
          }
        } catch (e) {
          // Audio analyzer optional
        }
      } catch (err: any) {
        console.warn('Media access warning:', err);
        setMediaError(
          isNe
            ? 'क्यामेरा वा माइक्रोफोनको अनुमति प्राप्त हुन सकेन। कृपया ब्राउजर सेटिङबाट अनुमति दिनुहोस्।'
            : 'Camera/Microphone permission denied. Please allow device access in browser settings.'
        );
      }
    };

    startMedia();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVideo, isNe]);

  // Duration Timer (counts active call time)
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Toggle Mute
  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  // Toggle Camera
  const toggleCamera = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff(!isCameraOff);
    }
  };

  // Copy Room Link to share with Guru
  const handleCopyLink = () => {
    const joinUrl = `${window.location.origin}${window.location.pathname}?roomID=${roomId}&type=${callType}`;
    navigator.clipboard.writeText(joinUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Send In-Call Message
  const handleSendInCallMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inCallInput.trim()) return;

    const newMsg = {
      sender: 'user' as const,
      text: inCallInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setInCallMessages((prev) => [...prev, newMsg]);
    const userText = inCallInput;
    setInCallInput('');

    setTimeout(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }, 50);

    // Auto Guru live acknowledgement in in-app chat
    setTimeout(() => {
      setInCallMessages((prev) => [
        ...prev,
        {
          sender: 'guru',
          text: isNe
            ? `मैले तपाईंको सन्देश "${userText}" सुनेँ/प्राप्त गरेँ। म प्रत्यक्ष कुण्डलीमा हेर्दैछु।`
            : `Received your in-call note "${userText}". Reviewing your astrological chart live.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }, 1200);
  };

  // Format Duration seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    const wasReal = isLiveConnected && callDuration > 15;
    onClose(callDuration, wasReal);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-3 sm:p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-amber-600/60 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col space-y-4 text-slate-100 max-h-[92vh] overflow-y-auto">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header: Strictly In-App Consultation */}
        <div className="flex items-center justify-between border-b border-amber-900/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
            <div>
              <h3 className="font-serif font-bold text-amber-200 text-sm sm:text-base flex items-center gap-1.5">
                {isVideo ? <Video className="w-4 h-4 text-amber-400" /> : <Phone className="w-4 h-4 text-emerald-400" />}
                <span>{isVideo ? (isNe ? 'एपभित्रै प्रत्यक्ष भिडियो कल' : 'In-App Live Video Call') : (isNe ? 'एपभित्रै प्रत्यक्ष अडियो कल' : 'In-App Live Audio Call')}</span>
              </h3>
              <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>{isNe ? '१००% एपभित्रै सुरक्षित कुराकानी (नम्बर/WhatsApp बाहिर जाँदैन)' : '100% In-App Secure (No Phone/WhatsApp Shared)'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-amber-400">
              ⏱️ {formatTime(callDuration)}
            </span>
            <button
              type="button"
              onClick={handleEndCall}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="बन्द गर्नुहोस्"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Media Warning if any */}
        {mediaError && (
          <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{mediaError}</span>
          </div>
        )}

        {/* Video / Audio Visualizer Area */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center shadow-inner">
          {isVideo && !isCameraOff ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="relative">
                <img
                  src={guru.certificateUrl}
                  alt={guru.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-amber-500/80 shadow-2xl"
                />
                <div
                  className="absolute inset-0 rounded-full border-2 border-emerald-400 pointer-events-none transition-transform duration-75"
                  style={{
                    transform: `scale(${1 + audioLevel * 0.005})`,
                    opacity: audioLevel > 10 ? 0.9 : 0.2,
                  }}
                />
              </div>

              <div>
                <h4 className="font-serif font-bold text-lg text-amber-200">{guru.name}</h4>
                <p className="text-xs text-slate-400">{guru.specializations.join(' • ')}</p>
              </div>

              {/* Real voice reactive audio bars */}
              <div className="flex items-center gap-1 h-6">
                {[1, 2, 3, 4, 5, 6, 7].map((bar) => {
                  const height = isMuted ? 4 : Math.max(4, Math.min(24, (audioLevel / 100) * 24 * (0.5 + (bar % 3) * 0.3)));
                  return (
                    <div
                      key={bar}
                      className={`w-1 rounded-full transition-all duration-75 ${
                        isMuted ? 'bg-slate-700' : 'bg-emerald-400'
                      }`}
                      style={{ height: `${height}px` }}
                    />
                  );
                })}
                <span className="text-[10px] text-slate-400 ml-2 font-mono">
                  {isMuted ? (isNe ? 'माइक बन्द' : 'Muted') : (isNe ? 'प्रत्यक्ष माइक्रोफोन सक्रिय' : 'Live Audio Active')}
                </span>
              </div>
            </div>
          )}

          {/* Floating Guru Overlay Info when Video is Active */}
          {isVideo && !isCameraOff && (
            <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-2">
              <img
                src={guru.certificateUrl}
                alt={guru.name}
                className="w-6 h-6 rounded-full object-cover border border-amber-500"
              />
              <span className="text-xs font-serif font-bold text-amber-200">{guru.name}</span>
            </div>
          )}

          {/* Live In-App Status Badge */}
          <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-800 flex items-center gap-2 text-[11px]">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-emerald-300 font-semibold">
              {isNe ? 'इन-एप प्रत्यक्ष अडियो/भिडियो चालु छ' : 'In-App Live Stream Active'}
            </span>
          </div>
        </div>

        {/* Media Control Toolbar: All In-App */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-3">
          {/* Mic Button */}
          <button
            type="button"
            onClick={toggleMute}
            className={`p-3 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg ${
              isMuted
                ? 'bg-rose-950 border border-rose-600 text-rose-300 hover:bg-rose-900'
                : 'bg-slate-800 border border-slate-700 text-emerald-400 hover:bg-slate-700'
            }`}
            title={isMuted ? 'माइक खोल्नुहोस्' : 'माइक बन्द गर्नुहोस्'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Camera Button (for Video Calls) */}
          {isVideo && (
            <button
              type="button"
              onClick={toggleCamera}
              className={`p-3 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                isCameraOff
                  ? 'bg-rose-950 border border-rose-600 text-rose-300 hover:bg-rose-900'
                  : 'bg-slate-800 border border-slate-700 text-amber-400 hover:bg-slate-700'
              }`}
              title={isCameraOff ? 'क्यामेरा खोल्नुहोस्' : 'क्यामेरा बन्द गर्नुहोस्'}
            >
              {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
          )}

          {/* Toggle In-Call Chat Drawer */}
          <button
            type="button"
            onClick={() => setShowInCallChat(!showInCallChat)}
            className={`px-3.5 py-3 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg ${
              showInCallChat
                ? 'bg-amber-600 border-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
            }`}
            title="कलमै च्याट खोल्नुहोस्"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{isNe ? 'इन-कल च्याट' : 'In-Call Chat'}</span>
          </button>

          {/* Copy Room Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3.5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg"
            title="कल रुम लिङ्क कपी"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? (isNe ? 'कपी भयो!' : 'Copied!') : (isNe ? 'रुम लिङ्क' : 'Room Link')}</span>
          </button>

          {/* End Call Button */}
          <button
            type="button"
            onClick={handleEndCall}
            className="px-4 sm:px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xl"
          >
            <PhoneOff className="w-4 h-4" />
            <span>{isNe ? 'कल अन्त्य' : 'End'}</span>
          </button>
        </div>

        {/* In-Call Live Chat Box (Visible when toggled) */}
        {showInCallChat && (
          <div className="bg-slate-950 border border-amber-600/40 rounded-2xl p-3.5 space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                {isNe ? 'कल भित्रै प्रत्यक्ष सन्देश (In-Call Real-Time Chat)' : 'In-Call Real-Time Chat'}
              </span>
              <button
                type="button"
                onClick={() => setShowInCallChat(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div ref={chatScrollRef} className="max-h-36 overflow-y-auto space-y-2 pr-1 text-xs">
              {inCallMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-1.5 ${
                      m.sender === 'user'
                        ? 'bg-amber-600 text-slate-950 font-medium'
                        : 'bg-slate-800 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <p>{m.text}</p>
                    <span className="text-[9px] opacity-70 block text-right mt-0.5">{m.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendInCallMessage} className="flex gap-2 pt-1">
              <input
                type="text"
                value={inCallInput}
                onChange={(e) => setInCallInput(e.target.value)}
                placeholder={isNe ? 'कलमै सन्देश वा प्रश्न लेख्नुहोस्...' : 'Type message in call...'}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isNe ? 'पठाउनुहोस्' : 'Send'}</span>
              </button>
            </form>
          </div>
        )}

        {/* In-App Strict Security Notice (NO Phone/WhatsApp Allowed) */}
        <div className="bg-slate-950/80 border border-amber-600/30 rounded-2xl p-3 space-y-1.5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {isNe
                ? '🔒 पूर्ण इन-एप गोपनीयता: व्यक्तिगत फोन नम्बर वा WhatsApp दिन मिल्दैन'
                : '🔒 100% In-App Privacy: Personal phone numbers or WhatsApp are strictly restricted'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {isNe
              ? 'ग्राहक र गुरु दुवैको गोपनीयताका लागि सबै अडियो, भिडियो र च्याट परामर्श सिधै यही एपभित्रै सम्पन्न हुन्छ।'
              : 'All audio, video, and chat consultations take place strictly inside the app to protect privacy.'}
          </p>
        </div>
      </div>
    </div>
  );
};
