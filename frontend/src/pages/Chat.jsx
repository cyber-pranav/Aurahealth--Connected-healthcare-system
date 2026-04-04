import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import api from '../services/api';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Chat() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [showContacts, setShowContacts] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadContacts();
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket && selectedContact) {
      const roomId = [user._id, selectedContact._id].sort().join('_');
      socket.emit('join_room', roomId);

      socket.on('receive_message', (data) => {
        setMessages(prev => [...prev, data]);
      });

      return () => socket.off('receive_message');
    }
  }, [socket, selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadContacts = async () => {
    try {
      if (user.role === 'PATIENT') {
        // Patients see doctors from their appointments
        const res = await api.get('/clinic/appointments');
        const doctorMap = new Map();
        res.data.forEach(apt => {
          if (apt.doctorId && !doctorMap.has(apt.doctorId._id)) {
            doctorMap.set(apt.doctorId._id, apt.doctorId);
          }
        });
        setContacts(Array.from(doctorMap.values()));
      } else {
        // Doctors see patients from their appointments
        const res = await api.get('/clinic/appointments');
        const patientMap = new Map();
        res.data.forEach(apt => {
          if (apt.patientId && !patientMap.has(apt.patientId._id)) {
            patientMap.set(apt.patientId._id, apt.patientId);
          }
        });
        setContacts(Array.from(patientMap.values()));
      }
    } catch (err) {
      console.error('Failed to load contacts', err);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !selectedContact) return;

    const roomId = [user._id, selectedContact._id].sort().join('_');
    const messageData = {
      roomId,
      message: newMessage.trim(),
      senderId: user._id,
      senderName: user.name,
      timestamp: new Date().toISOString()
    };

    socket.emit('send_message', messageData);
    setMessages(prev => [...prev, messageData]);
    setNewMessage('');
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-surface-container-lowest rounded-3xl border border-outline-variant/20 
      shadow-elevation-1 overflow-hidden animate-fade-in">
      
      {/* Contacts Sidebar */}
      <div className={`${showContacts ? 'flex' : 'hidden'} md:flex w-full md:w-80 flex-col border-r border-outline-variant/20`}>
        <div className="p-5 border-b border-outline-variant/20">
          <h2 className="text-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined filled text-primary">forum</span>
            Messages
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            {user.role === 'PATIENT' ? 'Your healthcare providers' : 'Your patients'}
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {contacts.length === 0 ? (
            <div className="text-center py-12 px-4">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">group_off</span>
              <p className="text-on-surface-variant text-sm mt-3">No contacts yet</p>
              <p className="text-on-surface-variant/60 text-xs mt-1">
                Book an appointment to start messaging
              </p>
            </div>
          ) : (
            contacts.map((contact) => (
              <button
                key={contact._id}
                onClick={() => {
                  setSelectedContact(contact);
                  setMessages([]);
                  setShowContacts(false);
                }}
                className={`w-full p-4 flex items-center gap-3 hover:bg-surface-container-high/50 
                  transition-all duration-200 border-b border-outline-variant/10
                  ${selectedContact?._id === contact._id ? 'bg-secondary-container/30' : ''}`}
              >
                <div className="w-11 h-11 rounded-xl bg-secondary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined filled text-secondary">
                    {user.role === 'PATIENT' ? 'stethoscope' : 'person'}
                  </span>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">
                    {user.role === 'PATIENT' ? `Dr. ${contact.name}` : contact.name}
                  </p>
                  <p className="text-xs text-on-surface-variant truncate">
                    {contact.specialization || contact.email || 'Tap to chat'}
                  </p>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-primary/60 shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${!showContacts ? 'flex' : 'hidden'} md:flex flex-1 flex-col`}>
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-outline-variant/20 flex items-center gap-3">
              <button 
                onClick={() => setShowContacts(true)}
                className="md:hidden p-2 rounded-xl hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined filled text-secondary">
                  {user.role === 'PATIENT' ? 'stethoscope' : 'person'}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  {user.role === 'PATIENT' ? `Dr. ${selectedContact.name}` : selectedContact.name}
                </p>
                <p className="text-xs text-primary">Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-20">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant/20">chat_bubble_outline</span>
                  <p className="text-on-surface-variant/60 mt-3 text-sm">
                    Start a conversation with {user.role === 'PATIENT' ? `Dr. ${selectedContact.name}` : selectedContact.name}
                  </p>
                </div>
              )}
              {messages.map((msg, i) => {
                const isMe = msg.senderId === user._id;
                return (
                  <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                    <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm
                      ${isMe 
                        ? 'bg-primary text-on-primary rounded-br-md' 
                        : 'bg-surface-container text-on-surface rounded-bl-md'
                      }`}
                    >
                      <p>{msg.message}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? 'text-on-primary/60' : 'text-on-surface-variant/60'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-outline-variant/20">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/40
                    text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Type a message..."
                />
                <button type="submit" disabled={!newMessage.trim()}
                  className="p-3 bg-primary text-on-primary rounded-2xl hover:bg-primary/90 
                    transition-all disabled:opacity-30 shadow-sm">
                  <span className="material-symbols-outlined text-xl">send</span>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-3xl bg-surface-container flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">forum</span>
              </div>
              <p className="text-on-surface-variant font-medium">Select a conversation</p>
              <p className="text-on-surface-variant/60 text-sm mt-1">Choose a contact to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
