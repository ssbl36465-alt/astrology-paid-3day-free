// File Name: src/components/ZegoCall.js
import React, { useEffect, useRef, useState } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { FileText, ChevronDown, ChevronUp, User, Calendar, Clock, MapPin, Sparkles, Wallet, Timer } from 'lucide-react';

export default function ZegoCall({
  appID,
  appSign,
  roomID,
  userID,
  userName = 'Devotee',
  calleeID,
  calleeName = 'Guru Ji',
  callType = 'audio', // 'audio' | 'video'
  isInitiator = true,
  birthDetails = null,
  onCallEnd,
}) {
  const containerRef = useRef(null);
  const zegoInstanceRef = useRef(null);
  const [callStatusText, setCallStatusText] = useState('Connecting to secure consultation room...');
  const [initError, setInitError] = useState(null);
  const [showBirthDetailsCard, setShowBirthDetailsCard] = useState(Boolean(birthDetails));

  // Dynamic rates per rules:
  // Audio: Deduct Rs. 20/min, Astrologer gets Rs. 9/min, Platform gets Rs. 11/min
  // Video: Deduct Rs. 25/min, Astrologer gets Rs. 12/min, Platform gets Rs. 13/min
  const ratePerMinute = callType === 'video' ? 25 : 20;
  const astrologerRatePerMinute = callType === 'video' ? 12 : 9;

  const [seconds, setSeconds] = useState(0);
  const [userBalance, setUserBalance] = useState(() => {
    const stored = localStorage.getItem('vaidik_client_wallet_balance');
    return stored !== null ? parseFloat(stored) : 500;
  });

  // Pre-call check: Ensure at least 1 minute worth of balance
  useEffect(() => {
    const currentBal = parseFloat(localStorage.getItem('vaidik_client_wallet_balance') || String(userBalance));
    if (currentBal < ratePerMinute) {
      alert(callType === 'video' ? "पर्याप्त ब्यालेन्स छैन (कम्तीमा रु २५ आवश्यक)" : "पर्याप्त ब्यालेन्स छैन (कम्तीमा रु २० आवश्यक)");
      if (typeof onCallEnd === 'function') onCallEnd();
    }
  }, [callType, ratePerMinute, userBalance, onCallEnd]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Every 60 seconds (1 minute) interval deduction
    if (seconds > 0 && seconds % 60 === 0) {
      deductBalanceAndPayout();
    }
  }, [seconds]);

  const deductBalanceAndPayout = async () => {
    const currentBal = parseFloat(localStorage.getItem('vaidik_client_wallet_balance') || String(userBalance));
    if (currentBal >= ratePerMinute) {
      const newBalance = currentBal - ratePerMinute;
      setUserBalance(newBalance);
      localStorage.setItem('vaidik_client_wallet_balance', newBalance.toString());

      // Update Astrologer earnings in localStorage/database
      try {
        const gurusData = JSON.parse(localStorage.getItem('vaidik_jyotish_gurus') || '[]');
        const updatedGurus = gurusData.map((g) => {
          if (calleeID && String(g.id) === String(calleeID)) {
            return {
              ...g,
              totalEarningsRs: (g.totalEarningsRs || 0) + astrologerRatePerMinute,
              consultationMinutes: (g.consultationMinutes || 0) + 1,
            };
          }
          return g;
        });
        localStorage.setItem('vaidik_jyotish_gurus', JSON.stringify(updatedGurus));
      } catch (e) {}
      
      // API Call for backend synchronization
      try {
        await fetch('/api/wallet/deduct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callType,
            deductAmount: ratePerMinute,
            astrologerCredit: astrologerRatePerMinute,
            astrologerId: calleeID,
          }),
        });
      } catch (err) {
        // Fallback handled locally
      }
    } else {
      // Auto Disconnect when balance reaches 0 or below rate
      alert("⚠️ तपाईंको वालेट ब्यालेन्स सकियो! (Insufficient balance)");
      if (zegoInstanceRef.current && typeof zegoInstanceRef.current.logoutRoom === 'function') {
        zegoInstanceRef.current.logoutRoom();
      }
      if (typeof onCallEnd === 'function') onCallEnd();
    }
  };

  useEffect(() => {
    let zp = null;
    let isMounted = true;

    const initZego = async () => {
      try {
        if (!containerRef.current) return;

        const finalAppID = Number(
          import.meta.env?.NEXT_PUBLIC_ZEGO_APP_ID || import.meta.env?.VITE_ZEGO_APP_ID || 123456789
        );
        const finalAppSign =
          import.meta.env?.NEXT_PUBLIC_ZEGO_APP_SIGN ||
          import.meta.env?.VITE_ZEGO_APP_SIGN ||
          '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

        const safeUserID = String(userID || `user_${Date.now()}`);
        const safeUserName = String(userName || 'Client');
        const safeRoomID = String(roomID || `room_${Date.now()}`);

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          finalAppID,
          finalAppSign,
          safeRoomID,
          safeUserID,
          safeUserName
        );

        zp = ZegoUIKitPrebuilt.create(kitToken);
        zegoInstanceRef.current = zp;

        if (typeof zp.setCallInvitationConfig === 'function') {
          zp.setCallInvitationConfig({
            enableCustomCallInvitationWaitingPage: false,
            enableCustomCallInvitationDialog: false,
            onWaitingPageWhenSending: (type, callees) => {
              if (isMounted) {
                setCallStatusText(`Calling ${calleeName}... Waiting for response.`);
              }
            },
            onConfirmDialogWhenReceiving: (type, caller, refuse, accept) => {
              if (isMounted) {
                setCallStatusText(`Incoming ${type === 1 ? 'Video' : 'Audio'} Call from ${caller.userName}`);
              }
            },
            onOutgoingCallAccepted: () => {
              if (isMounted) {
                setCallStatusText('Call connected with Guru ji.');
              }
            },
            onOutgoingCallRejected: () => {
              alert('Guru ji declined the call.');
              if (onCallEnd) onCallEnd();
            },
            onOutgoingCallDeclined: () => {
              alert('Guru ji is currently busy.');
              if (onCallEnd) onCallEnd();
            },
            onCallInvitationEnded: (reason) => {
              console.log('Call invitation ended. Reason:', reason);
            },
          });
        }

        if (isInitiator && calleeID && typeof zp.sendCallInvitation === 'function') {
          const invitationType =
            callType === 'video'
              ? ZegoUIKitPrebuilt.InvitationTypeVideoCall || 1
              : ZegoUIKitPrebuilt.InvitationTypeVoiceCall || 0;

          zp.sendCallInvitation({
            callees: [
              {
                userID: String(calleeID),
                userName: String(calleeName),
              },
            ],
            callType: invitationType,
            timeout: 60,
            roomID: safeRoomID,
            data: JSON.stringify({
              roomID: safeRoomID,
              callType,
              callerName: safeUserName,
              birthDetails,
            }),
          }).catch((err) => {
            console.warn('Call invitation signaling note:', err);
          });
        }

        zp.joinRoom({
          container: containerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.OneONoneCall || 0,
          },
          showTextChat: true,
          showUserList: true,
          turnOnMicrophoneWhenJoining: true,
          turnOnCameraWhenJoining: callType === 'video',
          showMyCameraToggleButton: true,
          showAudioVideoSettingsButton: true,
          showScreenSharingButton: callType === 'video',
          showPreJoinView: false,
          layout: 'Auto',
          sharedLinks: [
            {
              name: 'Copy Consultation Link',
              url: `${window.location.origin}${window.location.pathname}?roomID=${safeRoomID}&type=${callType}`,
            },
          ],
          onLeaveRoom: () => {
            if (onCallEnd) onCallEnd();
          },
        });
      } catch (err) {
        console.error('Failed to initialize ZegoCall:', err);
        if (isMounted) {
          setInitError(err?.message || 'Failed to initialize Zego video service');
        }
      }
    };

    initZego();

    return () => {
      isMounted = false;
      if (zegoInstanceRef.current && typeof zegoInstanceRef.current.destroy === 'function') {
        try {
          zegoInstanceRef.current.destroy();
        } catch (e) {
          console.warn('Error destroying Zego instance:', e);
        }
      }
    };
  }, [appID, appSign, roomID, userID, userName, calleeID, calleeName, callType, isInitiator, birthDetails, onCallEnd]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-2 sm:p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-amber-600/60 rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden shadow-2xl relative">
        {/* Top Header */}
        <div className="bg-slate-950 px-4 sm:px-6 py-3 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
            <div>
              <h3 className="font-serif font-bold text-amber-200 text-sm sm:text-base flex items-center gap-2">
                <span>
                  {callType === 'video'
                    ? '🔴 ZegoLive Video Consultation'
                    : '📞 ZegoLive Audio Consultation'}
                </span>
                <span className="text-xs font-mono text-slate-400 font-normal">
                  ({calleeName ? `with ${calleeName}` : 'Live Session'})
                </span>
              </h3>
              <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <Timer className="w-3 h-3" />
                  कल समय: {Math.floor(seconds / 60)} मिनेट {seconds % 60} सेकेन्ड (दर: रु {ratePerMinute}/मिनट)
                </span>
                <span className="text-amber-300 font-bold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  <Wallet className="w-3 h-3" />
                  बाँकी ब्यालेन्स: रु {userBalance}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {birthDetails && (
              <button
                type="button"
                onClick={() => setShowBirthDetailsCard(!showBirthDetailsCard)}
                className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">कुण्डली विवरण</span>
                {showBirthDetailsCard ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}

            <button
              type="button"
              onClick={onCallEnd}
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 sm:px-4 py-1.5 rounded-xl text-xs transition-all cursor-pointer shadow-lg hover:scale-105"
            >
              कल अन्त्य गर्नुहोस् (End)
            </button>
          </div>
        </div>

        {birthDetails && showBirthDetailsCard && (
          <div className="bg-slate-950/95 border-b border-amber-600/40 px-4 sm:px-6 py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs animate-fadeIn z-10 shadow-lg">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ग्राहकको जन्म विवरण (Client Kundali Data):</span>
            </div>

            <div className="flex items-center flex-wrap gap-3 text-slate-300">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <strong className="text-white">{birthDetails.fullName || userName}</strong>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>{birthDetails.birthDate || 'N/A'}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>{birthDetails.birthTime || 'N/A'}</span>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>{birthDetails.birthPlace || 'N/A'}</span>
              </span>
              {birthDetails.topic && (
                <span className="bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 text-[11px]">
                  {birthDetails.topic}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowBirthDetailsCard(false)}
              className="text-slate-400 hover:text-white text-xs underline cursor-pointer"
            >
              लुकाउनुहोस्
            </button>
          </div>
        )}

        {initError && (
          <div className="bg-rose-950/80 border-b border-rose-800 text-rose-200 text-xs px-4 py-2 flex items-center justify-between">
            <span>⚠️ Note: {initError}</span>
            <button
              type="button"
              onClick={() => setInitError(null)}
              className="text-rose-400 hover:text-white underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div
          ref={containerRef}
          className="flex-1 w-full h-full bg-slate-950 overflow-hidden"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}
