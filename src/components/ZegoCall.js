// File Name: src/components/ZegoCall.js
import React, { useEffect, useRef, useState } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { FileText, ChevronDown, ChevronUp, User, Calendar, Clock, MapPin, Sparkles } from 'lucide-react';

/**
 * ZegoCall Component
 * Handles active Audio/Video consultation, ZegoCloud signaling invitation,
 * built-in in-room text chat, and displays client Kundali Birth Details.
 */
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

  useEffect(() => {
    let zp = null;
    let isMounted = true;

    const initZego = async () => {
      try {
        if (!containerRef.current) return;

        // Resolve App ID and ServerSecret/Sign from props or environment variables
        const finalAppID = Number(
          appID || import.meta.env?.VITE_ZEGO_APP_ID || 123456789
        );
        const finalAppSign =
          appSign ||
          import.meta.env?.VITE_ZEGO_APP_SIGN ||
          '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

        const safeUserID = String(userID || `user_${Date.now()}`);
        const safeUserName = String(userName || 'Client');
        const safeRoomID = String(roomID || `room_${Date.now()}`);

        // Generate Kit Token using Zego Test token generator for frontend WebRTC
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          finalAppID,
          finalAppSign,
          safeRoomID,
          safeUserID,
          safeUserName
        );

        // Create ZegoUIKitPrebuilt instance
        zp = ZegoUIKitPrebuilt.create(kitToken);
        zegoInstanceRef.current = zp;

        // Requirement: Setup Call Invitation Config (Signaling)
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

        // Send signaling invitation to Guru if this user is initiating
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

        // Join active consultation room
        zp.joinRoom({
          container: containerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.OneONoneCall || 0,
          },
          // Requirement: Built-in In-Room Text Chat Enabled
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
        <div className="bg-slate-950 px-4 sm:px-6 py-3 border-b border-slate-800 flex items-center justify-between">
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
              <p className="text-[11px] text-emerald-400 font-mono">
                {callStatusText} • Room ID: {roomID}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Birth Details Drawer Button */}
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

        {/* Client Birth Details Floating Banner (For Guru's Astrological Reference) */}
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

        {/* Error Notification if any */}
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

        {/* Zego Prebuilt Container with In-Room Chat */}
        <div
          ref={containerRef}
          className="flex-1 w-full h-full bg-slate-950 overflow-hidden"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}
