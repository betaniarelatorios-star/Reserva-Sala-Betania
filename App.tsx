
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Calendar as CalendarIcon,
  Bot,
  Info,
  User as UserIcon,
  LayoutGrid,
  Share2,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { Message, Room, Reservation } from './types';
import { ChatService } from './services/geminiService';
import { ROOMS } from './constants';
import CalendarPanel from './components/CalendarPanel';
import RoomSelectionPanel from './components/RoomSelectionPanel';
import RoomCardInline from './components/RoomCardInline';
import ReservationForm from './components/ReservationForm';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Olá! Sou seu assistente de reservas. Como posso ajudar você hoje?\n\nEscolha uma das salas abaixo para começar ou digite sua solicitação.`,
      timestamp: new Date(),
      type: 'text',
      payload: { showRooms: true }
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRoomPanelOpen, setIsRoomPanelOpen] = useState(false);
  
  const chatServiceRef = useRef<ChatService | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatServiceRef.current = new ChatService();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleRoomSelect = (room: Room) => {
    const userMessage: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: `Quero reservar a ${room.name}`, 
      timestamp: new Date() 
    };
    
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `Entendido. Por favor, preencha o formulário abaixo para confirmarmos a disponibilidade da ${room.name}.`,
      timestamp: new Date(),
      type: 'reservation_form',
      payload: { room }
    };

    setMessages(prev => [...prev, userMessage, botMessage]);
    setIsRoomPanelOpen(false);
  };

  const handleReservationSuccess = (res: Reservation) => {
    const formattedDate = res.data.split('-').reverse().join('/');
    const formatTime = (timeStr: string) => timeStr.split(':').slice(0, 2).join(':');
    
    const successMsg: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Sua reserva foi confirmada com sucesso. ✅\n\nSala: ${res.sala}\nResponsável: ${res.nome}\nData: ${formattedDate}\nHorário: ${formatTime(res.inicio)} até ${formatTime(res.fim)}`,
      timestamp: new Date(),
      type: 'status',
      payload: { status: 'success' }
    };
    setMessages(prev => [...prev, successMsg]);
  };

  const handleSend = async (content: string = inputValue) => {
    if (!content.trim()) return;

    const userMessage: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content, 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await chatServiceRef.current?.sendMessage(content);
      setIsTyping(false);

      if (response) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.text,
          timestamp: new Date(),
        }]);
      }
    } catch (error: any) {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro técnico. Por favor, tente novamente.',
        timestamp: new Date(),
        status: 'error'
      }]);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-white shadow-2xl relative overflow-hidden font-sans border-x border-slate-100">
      <header className="flex items-center px-6 py-4 bg-white sticky top-0 z-20 border-b border-slate-100 shadow-sm">
        <div className="flex-1 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-900 shadow-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-[15px] leading-tight">Reserva Betânia</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Online Agora</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsRoomPanelOpen(true)} 
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 transition-all border border-slate-200"
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="text-[11px] font-bold uppercase tracking-tight">Ver Salas</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-hide bg-[#F8FAFC]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-slate-900 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            
            <div className={`flex flex-col gap-1 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm border ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none border-blue-700' 
                  : 'bg-white text-slate-700 rounded-tl-none border-slate-200'
              }`}>
                {msg.content.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < msg.content.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}

                {msg.payload?.showRooms && (
                  <div className="mt-4 space-y-3">
                    {ROOMS.map(room => (
                      <RoomCardInline key={room.id} room={room} onSelect={handleRoomSelect} />
                    ))}
                  </div>
                )}

                {msg.type === 'reservation_form' && msg.payload?.room && (
                  <ReservationForm 
                    room={msg.payload.room} 
                    onSuccess={handleReservationSuccess}
                    onSelectAlternative={handleRoomSelect}
                  />
                )}
                
                {msg.type === 'status' && msg.payload?.status === 'success' && (
                  <div className="mt-4 flex items-center gap-2 text-emerald-600 font-bold text-[11px] uppercase tracking-wider bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4" /> Reserva Finalizada
                  </div>
                )}
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter px-1 mt-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 ml-11">
            <div className="flex gap-1 bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm">
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <div className="px-4 pb-6 pt-4 bg-white border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-slate-50 rounded-2xl px-5 py-1.5 flex items-center gap-2 border border-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-100 focus-within:border-slate-300 transition-all">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Digite sua mensagem..." 
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 text-[14px] py-2.5"
            />
          </div>
          <button 
            onClick={() => handleSend()} 
            disabled={!inputValue.trim()}
            className="w-11 h-11 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-md hover:bg-slate-800 disabled:bg-slate-200 disabled:shadow-none transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isRoomPanelOpen && (
        <RoomSelectionPanel onClose={() => setIsRoomPanelOpen(false)} onSelect={handleRoomSelect} />
      )}
    </div>
  );
};

export default App;
