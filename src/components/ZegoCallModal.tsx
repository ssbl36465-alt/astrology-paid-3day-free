import React, { useEffect, useRef } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

interface ZegoCallModalProps {
  appID: number;
  appSign: string;
  roomID: string;
  userID: string;
  userName: string;
  callType: 'audio' | 'video';
  onCallEnd: () => void;
}

export const ZegoCallModal: React.FC<ZegoCallModalProps> = ({
  appID,
  appSign,
  roomID,
  userID,
  userName,
  callType,
  onCallEnd,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let zp: any = null;

    const initZego = async () => {
      if (!containerRef.current) return;

      // Generate kit token
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
        appID,
        appSign,
        roomID,
        userID,
        userName
      );

      // Create instance
      zp = ZegoUIKitPrebuilt.create(kitToken);

      // Configure based on call type
      const scenario =
        callType === 'video'
          ? ZegoUIKitPrebuilt.VideoConference
          : ZegoUIKitPrebuilt.OneONoneCall;

      zp.joinRoom({
        container: containerRef.current,
        scenario: {
          mode: scenario,
        },
        sharedLinks: [
          {
            name: 'Copy Call Link',
            url: window.location.protocol + '//' + window.location.host + window.location.pathname + '?roomID=' + roomID,
          },
        ],
        onLeaveRoom: () => {
          onCallEnd();
        },
        turnOnMicrophoneWhenJoining: true,
        turnOnCameraWhenJoining: callType === 'video',
        showMyCameraToggleButton: true,
        showAudioVideoSettingsButton: true,
        showScreenSharingButton: callType === 'video',
        showTextChat: true,
        showUserList: true,
      });
    };

    initZego();

    return () => {
      if (zp && typeof zp.destroy === 'function') {
        zp.destroy();
      }
    };
  }, [appID, appSign, roomID, userID, userName, callType, onCallEnd]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-2 sm:p-4">
      <div className="bg-slate-900 border border-amber-600/60 rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
            <h3 className="font-serif font-bold text-amber-200 text-base">
              {callType === 'video' ? 'ZegoLive Video Consultation' : 'ZegoLive Audio Consultation'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCallEnd}
            className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-1.5 rounded-xl text-xs transition-all cursor-pointer"
          >
            End Call (कल अन्त्य गर्नुहोस्)
          </button>
        </div>
        <div ref={containerRef} className="flex-1 w-full h-full bg-slate-950" />
      </div>
    </div>
  );
};
