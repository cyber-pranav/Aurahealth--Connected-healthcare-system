import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import api from '../services/api';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const STUN_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ]
};

export default function VideoConsultationRoom() {
  const { appointmentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const chatEndRef = useRef(null);

  // State
  const [status, setStatus] = useState('connecting'); // connecting | waiting | incall | ended
  const [remoteUser, setRemoteUser] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [appointment, setAppointment] = useState(null);
  const [remotePeerId, setRemotePeerId] = useState(null);

  const roomId = appointmentId;
  const timerRef = useRef(null);

  // Load appointment info
  useEffect(() => {
    api.get('/clinic/appointments').then(res => {
      const apt = res.data.find(a => a._id === appointmentId);
      setAppointment(apt);
    }).catch(() => {});
  }, [appointmentId]);

  // Start call timer
  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
  }, []);

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  // Create peer connection
  const createPC = useCallback(() => {
    const pc = new RTCPeerConnection(STUN_SERVERS);

    pc.onicecandidate = (e) => {
      if (e.candidate && remotePeerId) {
        socketRef.current?.emit('video_ice_candidate', {
          candidate: e.candidate,
          target: remotePeerId,
          from: socketRef.current.id
        });
      }
    };

    pc.ontrack = (e) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
      setStatus('incall');
      startTimer();
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        setStatus('ended');
      }
    };

    return pc;
  }, [remotePeerId, startTimer]);

  // Initialize media and socket
  useEffect(() => {
    let socket;

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        socket = io(SOCKET_URL);
        socketRef.current = socket;

        socket.emit('register_user', { userId: user._id, name: user.name, role: user.role });
        socket.emit('video_join', { roomId, userId: user._id, userName: user.name });

        // Someone else already in room
        socket.on('video_existing_participants', async (participants) => {
          if (participants.length > 0) {
            const peer = participants[0];
            setRemotePeerId(peer.socketId);
            setRemoteUser(peer);

            const pc = createPC();
            pcRef.current = pc;
            stream.getTracks().forEach(t => pc.addTrack(t, stream));

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit('video_offer', {
              sdp: offer,
              target: peer.socketId,
              caller: socket.id,
              callerName: user.name
            });
            setStatus('waiting');
          } else {
            setStatus('waiting');
          }
        });

        // Someone joined
        socket.on('video_user_joined', (data) => {
          setRemoteUser(data);
          setRemotePeerId(data.socketId);
        });

        // Receive offer
        socket.on('video_offer', async (data) => {
          setRemoteUser({ userName: data.callerName, socketId: data.caller });
          setRemotePeerId(data.caller);

          const pc = createPC();
          pcRef.current = pc;
          stream.getTracks().forEach(t => pc.addTrack(t, stream));

          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('video_answer', { sdp: answer, target: data.caller, answerer: socket.id });
          setStatus('incall');
          startTimer();
        });

        // Receive answer
        socket.on('video_answer', async (data) => {
          await pcRef.current?.setRemoteDescription(new RTCSessionDescription(data.sdp));
        });

        // ICE candidates
        socket.on('video_ice_candidate', async (data) => {
          try {
            await pcRef.current?.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch (e) {}
        });

        // User left
        socket.on('video_user_left', () => {
          setStatus('ended');
          clearInterval(timerRef.current);
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        });

        // In-call chat
        socket.on('video_chat_message', (data) => {
          setChatMessages(prev => [...prev, data]);
        });

      } catch (err) {
        console.error('Media error:', err);
        setStatus('error');
      }
    };

    init();

    return () => {
      clearInterval(timerRef.current);
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      pcRef.current?.close();
      socket?.emit('video_leave', { roomId, userId: user._id });
      socket?.disconnect();
    };
  }, [appointmentId]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
      setIsMuted(m => !m);
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
      setIsCameraOff(c => !c);
    }
  };

  const endCall = () => {
    socketRef.current?.emit('video_leave', { roomId, userId: user._id });
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
    clearInterval(timerRef.current);
    setStatus('ended');
  };

  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = { roomId, senderId: user._id, senderName: user.name, message: chatInput.trim(), timestamp: new Date().toISOString() };
    socketRef.current?.emit('video_chat_message', msg);
    setChatMessages(prev => [...prev, msg]);
    setChatInput('');
  };

  const otherPerson = appointment
    ? (user.role === 'DOCTOR' ? appointment.patientId : appointment.doctorId)
    : remoteUser;

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 glass-dark border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined filled text-on-primary text-base">cardiology</span>
          </div>
          <div>
            <p className="text-white text-sm font-semibold">Video Consultation</p>
            <p className="text-white/50 text-xs">
              {appointment ? (user.role === 'DOCTOR' ? `Patient: ${otherPerson?.name}` : `Dr. ${otherPerson?.name}`) : 'Connecting...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {status === 'incall' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-primary text-xs font-semibold">{formatTime(callDuration)}</span>
            </div>
          )}
          {status === 'waiting' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/20 border border-yellow-500/30">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-yellow-400 text-xs font-semibold">Waiting for patient...</span>
            </div>
          )}
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-white/70">close</span>
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Video Area */}
        <div className={`flex-1 relative ${chatOpen ? 'mr-80' : ''} transition-all duration-300`}>
          {/* Remote video */}
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            {status === 'waiting' || status === 'connecting' ? (
              <div className="text-center animate-fade-in">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <span className="material-symbols-outlined text-primary text-5xl">person</span>
                </div>
                <p className="text-white text-xl font-semibold">
                  {status === 'connecting' ? 'Setting up camera...' : 'Waiting for other participant...'}
                </p>
                <p className="text-white/50 mt-2 text-sm">Share this appointment link to invite them</p>
                <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 mx-auto max-w-xs">
                  <span className="material-symbols-outlined text-white/50 text-base">link</span>
                  <span className="text-white/70 text-xs truncate">Appointment #{appointmentId}</span>
                </div>
              </div>
            ) : status === 'ended' ? (
              <div className="text-center animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-error text-4xl">call_end</span>
                </div>
                <p className="text-white text-xl font-semibold">Call Ended</p>
                <p className="text-white/50 mt-1">Duration: {formatTime(callDuration)}</p>
                <button onClick={() => navigate(-1)} className="mt-6 px-6 py-2.5 bg-primary text-on-primary rounded-full font-semibold text-sm">
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            )}
          </div>

          {/* Local video PiP */}
          <div className="video-pip">
            <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${isCameraOff ? 'hidden' : ''}`} />
            {isCameraOff && (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-white/40 text-3xl">videocam_off</span>
              </div>
            )}
          </div>

          {/* Controls */}
          {status !== 'ended' && (
            <div className="video-controls">
              <button onClick={toggleMute} className={`video-control-btn ${isMuted ? 'bg-white/40' : ''}`} title={isMuted ? 'Unmute' : 'Mute'}>
                <span className="material-symbols-outlined">{isMuted ? 'mic_off' : 'mic'}</span>
              </button>
              <button onClick={toggleCamera} className={`video-control-btn ${isCameraOff ? 'bg-white/40' : ''}`} title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}>
                <span className="material-symbols-outlined">{isCameraOff ? 'videocam_off' : 'videocam'}</span>
              </button>
              <button onClick={() => setChatOpen(c => !c)} className={`video-control-btn ${chatOpen ? 'bg-primary/60' : ''}`} title="Chat">
                <span className="material-symbols-outlined">chat</span>
                {chatMessages.filter(m => m.senderId !== user._id).length > 0 && (
                  <div className="notification-badge">{chatMessages.filter(m => m.senderId !== user._id).length}</div>
                )}
              </button>
              <button onClick={endCall} className="video-control-btn danger" title="End call">
                <span className="material-symbols-outlined">call_end</span>
              </button>
            </div>
          )}
        </div>

        {/* In-call Chat Panel */}
        {chatOpen && (
          <div className="fixed right-0 top-[57px] bottom-0 w-80 glass-dark border-l border-white/10 flex flex-col animate-slide-in z-20">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">chat</span>
                In-call Chat
              </h3>
              <button onClick={() => setChatOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-white/50 text-base">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/30 text-sm">No messages yet. Say hello!</p>
                </div>
              ) : (
                chatMessages.map((msg, i) => {
                  const isMe = msg.senderId === user._id;
                  return (
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs ${isMe ? 'bg-primary text-white' : 'bg-white/10 text-white'}`}>
                        {!isMe && <p className="text-white/50 text-[10px] mb-1">{msg.senderName}</p>}
                        <p>{msg.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={sendChatMessage} className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs placeholder-white/30 focus:outline-none focus:border-primary/50"
                />
                <button type="submit" disabled={!chatInput.trim()}
                  className="p-2 bg-primary rounded-xl text-white disabled:opacity-30 hover:bg-primary/80 transition-colors">
                  <span className="material-symbols-outlined text-sm">send</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
