
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ChevronLeft, 
  Info,
  Calendar as CalendarIcon,
  Clock,
  ArrowRight,
  CheckCircle2,
  Users,
  Loader2,
  AlertCircle,
  X,
  User,
  FileText,
  MapPin,
  CalendarDays,
  CalendarPlus
} from 'lucide-react';
import { Room, Reservation } from './types.ts';
import { ReservationService } from './services/reservationService.ts';

type Step = 'rooms' | 'datetime' | 'confirm' | 'success';

const App: React.FC = () => {
  const [step, setStep] = useState<Step>('rooms');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<{start: string, end: string | null} | null>(null);
  const [purpose, setPurpose] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastReservation, setLastReservation] = useState<Reservation | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const dateStripRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [unavailableReservations, setUnavailableReservations] = useState<Reservation[]>([]);

  const BRAND_COLOR = "#01AAFF";
  const DARK_BACKGROUND = "#0D0D0D";
  const DARK_SURFACE = "#1A1A1A";
  const DARK_BORDER = "#2E2E2E";
  const LIGHT_TEXT = "#FFFFFF";
  const MEDIUM_TEXT = "#A3A3A3";
  const LIGHT_GRAY_BG = "#262626";

  // Garante que o scroll volte para o topo ao mudar de etapa
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [step]);

  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      setError(null);
      const data = await ReservationService.getRooms();
      setRooms(data);
    } catch (e: any) {
      setError("Não foi possível carregar as salas.");
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const availableDates = useMemo(() => {
    const days = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 0; i < 30; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push({
        label: d.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase().replace('.', ''),
        num: d.getDate(),
        full: d.toISOString().split('T')[0],
        isToday: d.toISOString().split('T')[0] === todayStr
      });
    }
    return days;
  }, []);

  useEffect(() => {
    if (step === 'datetime' && dateStripRef.current) {
      const activeEl = dateStripRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [step, selectedDate]);

  useEffect(() => {
    const fetchUnavailable = async () => {
      if (selectedRoom && selectedDate) {
        try {
          const reservations = await ReservationService.getReservationsByRoomAndDate(selectedRoom.id, selectedDate);
          setUnavailableReservations(reservations);
        } catch (err) {
          setUnavailableReservations([]);
        }
      }
    };
    fetchUnavailable();
  }, [selectedRoom, selectedDate, step]);

  const timeSlots = {
    manha: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
    tarde: ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'],
    noite: ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00']
  };

  const allSlotsSorted = useMemo(() => [...timeSlots.manha, ...timeSlots.tarde, ...timeSlots.noite], []);

  const getUnavailableInfo = (slot: string) => {
    if (!selectedRoom || !selectedDate) return { isUnavailable: false, reservedBy: null, reason: null };
    const slotStart = new Date(`${selectedDate}T${slot}:00`);
    const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000); 

    for (const res of unavailableReservations) {
      const resStart = new Date(`${selectedDate}T${res.inicio.substring(0, 5)}:00`);
      const resEnd = new Date(`${selectedDate}T${res.fim.substring(0, 5)}:00`);
      if (slotStart.getTime() <= resEnd.getTime() && slotEnd.getTime() > resStart.getTime()) {
        return { isUnavailable: true, reservedBy: res.nome, reason: res.descricao };
      }
    }
    return { isUnavailable: false, reservedBy: null, reason: null };
  };

  const handleTimeClick = (slot: string) => {
    setError(null);
    const { isUnavailable, reservedBy, reason } = getUnavailableInfo(slot);
    if (isUnavailable) {
      const displayMsg = `Reservado para: ${reservedBy || 'Não informado'}${reason ? `\nmotivo: ${reason}` : ''}`;
      setError(displayMsg);
      return; 
    }
    if (!selectedTimeRange || (selectedTimeRange.start && selectedTimeRange.end)) {
      setSelectedTimeRange({ start: slot, end: null });
    } else {
      const startTime = selectedTimeRange.start;
      const startIdx = allSlotsSorted.indexOf(startTime);
      const endIdx = allSlotsSorted.indexOf(slot);
      if (endIdx > startIdx) {
        let hasConflict = false;
        for (let i = startIdx + 1; i <= endIdx; i++) {
          if (getUnavailableInfo(allSlotsSorted[i]).isUnavailable) {
            hasConflict = true;
            break;
          }
        }
        if (hasConflict) {
          setError("O período selecionado contém horários já reservados.");
          return;
        }
        setSelectedTimeRange({ start: startTime, end: slot });
      } else {
        setSelectedTimeRange({ start: slot, end: null });
      }
    }
  };

  const isSlotSelected = (slot: string) => {
    if (!selectedTimeRange) return false;
    if (selectedTimeRange.start === slot || selectedTimeRange.end === slot) return true;
    if (selectedTimeRange.start && selectedTimeRange.end) {
      const startIdx = allSlotsSorted.indexOf(selectedTimeRange.start);
      const endIdx = allSlotsSorted.indexOf(selectedTimeRange.end);
      const currentIdx = allSlotsSorted.indexOf(slot);
      return currentIdx > startIdx && currentIdx < endIdx;
    }
    return false;
  };

  const handleFinalize = async () => {
    if (!selectedRoom || !selectedTimeRange?.end || !userName) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    setLoading(true);
    try {
      let res = await ReservationService.createReservation({
        nome: userName,
        sala: selectedRoom.id,
        data: selectedDate,
        inicio: selectedTimeRange.start,
        fim: selectedTimeRange.end,
        descricao: purpose || "Reserva de sala"
      });
      
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      if (res && res.id) {
        const updatedRes = await ReservationService.getReservationById(res.id);
        if (updatedRes) res = updatedRes;
      }
      
      setLastReservation(res);
      setStep('success');
    } catch (e) {
      setError("Falha ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = (title: string, subtitle: string, stepNum: number) => (
    <div className="px-6 pt-10 pb-6">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => {
            if (step === 'datetime') setStep('rooms');
            if (step === 'confirm') setStep('datetime');
          }}
          className={`w-10 h-10 rounded-full ${DARK_SURFACE} flex items-center justify-center text-slate-300 border ${DARK_BORDER} ${step === 'rooms' ? 'invisible' : ''}`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Passo {stepNum} de 3</span>
           <div className="flex gap-1.5">
             {[1, 2, 3].map(i => (
               <div key={i} className="h-1 rounded-full transition-all duration-300 w-8" style={{ backgroundColor: stepNum >= i ? BRAND_COLOR : DARK_BORDER }}></div>
             ))}
           </div>
        </div>
        <div className="w-10 h-10"></div>
      </div>
      <h1 className={`text-3xl font-extrabold ${LIGHT_TEXT} mb-2`}>{title}</h1>
      <p className={`text-sm leading-relaxed ${MEDIUM_TEXT}`}>{subtitle}</p>
    </div>
  );

  return (
    <div className={`flex flex-col h-screen max-w-2xl mx-auto ${DARK_BACKGROUND} ${LIGHT_TEXT} overflow-hidden`}>
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scrollbar-hide pb-32">
        {step === 'rooms' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderHeader('Selecione a Sala', 'Escolha o espaço perfeito para sua reunião.', 1)}
            <div className="px-6 space-y-4">
              {loadingRooms ? (
                <div className="flex flex-col items-center py-20 gap-4">
                  <Loader2 className="w-10 h-10 animate-spin" style={{ color: BRAND_COLOR }} />
                  <p className={`${MEDIUM_TEXT} font-bold text-xs uppercase`}>Carregando salas...</p>
                </div>
              ) : (
                rooms.map((room) => (
                  <div 
                    key={room.id}
                    onClick={() => { setSelectedRoom(room); setSelectedTimeRange(null); setError(null); }}
                    className={`flex ${DARK_SURFACE} rounded-[28px] p-4 gap-4 border-2 transition-all cursor-pointer ${selectedRoom?.id === room.id ? `border-[${BRAND_COLOR}] shadow-[0_0_30px_rgba(1,170,255,0.2)]` : `border-transparent shadow-lg`}`}
                  >
                    <div className={`w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-black/40 border ${DARK_BORDER}`}>
                      <img src={room.image} className="w-full h-full object-cover" alt={room.name} />
                    </div>
                    <div className="flex-1 py-1">
                      <h3 className={`text-[17px] font-bold ${LIGHT_TEXT} mb-1`}>{room.name}</h3>
                      <div className={`flex items-center gap-1.5 ${MEDIUM_TEXT} text-xs mb-3`}>
                        <Users className="w-3.5 h-3.5" />
                        <span>{room.capacity} pessoas</span>
                      </div>
                      <div className="flex gap-2">
                        {room.tags?.slice(0, 2).map(tag => (
                          <span key={tag} className={`px-2.5 py-1 rounded-lg text-[9px] font-black ${LIGHT_GRAY_BG} ${MEDIUM_TEXT} uppercase tracking-tight`}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {step === 'datetime' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
             {renderHeader('Horário', 'Quando você precisa da sala?', 2)}
             <div className="px-6">
               <div className="flex items-center justify-between mb-8">
                 <h2 className={`text-sm font-black uppercase tracking-widest ${LIGHT_TEXT}`}>
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                 </h2>
                 <button onClick={() => setIsDatePickerOpen(true)} className={`flex items-center gap-2 px-4 py-2 ${DARK_SURFACE} border ${DARK_BORDER} rounded-xl text-[11px] font-black uppercase`} style={{ color: BRAND_COLOR }}>
                   <CalendarIcon className="w-4 h-4" /> Mudar Data
                 </button>
               </div>

               <div ref={dateStripRef} className="flex mb-10 pb-2 overflow-x-auto scrollbar-hide gap-3 snap-x">
                 {availableDates.map((day, i) => (
                   <div key={i} data-active={day.full === selectedDate} className="flex flex-col items-center gap-3 snap-center flex-shrink-0">
                     <span className="text-[10px] font-black uppercase" style={{ color: day.full === selectedDate ? BRAND_COLOR : MEDIUM_TEXT }}>{day.isToday ? 'Hoje' : day.label}</span>
                     <button 
                        onClick={() => { setSelectedDate(day.full); setSelectedTimeRange(null); setError(null); }}
                        className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-[18px] transition-all duration-300 ${day.full === selectedDate ? 'text-white shadow-[0_0_20px_rgba(1,170,255,0.4)] scale-110' : `${LIGHT_TEXT} ${DARK_SURFACE} border ${DARK_BORDER}`}`}
                        style={{ backgroundColor: day.full === selectedDate ? BRAND_COLOR : DARK_SURFACE }}
                     >
                       {day.num}
                     </button>
                   </div>
                 ))}
               </div>

               <div className={`mb-8 p-5 ${DARK_SURFACE} rounded-[24px] flex items-center justify-between border ${DARK_BORDER} shadow-xl`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center`} style={{ backgroundColor: BRAND_COLOR + '20' }}>
                      <Clock className="w-6 h-6" style={{ color: BRAND_COLOR }} />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-bold ${MEDIUM_TEXT} uppercase`}>Agendamento</span>
                      <p className={`text-[16px] font-black ${LIGHT_TEXT}`}>
                        {selectedTimeRange?.end ? `${selectedTimeRange.start} - ${selectedTimeRange.end}` : selectedTimeRange?.start ? `${selectedTimeRange.start}...` : "Selecione o período"}
                      </p>
                    </div>
                  </div>
               </div>

               {error && (
                 <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-2xl flex items-start gap-3 text-red-200 text-sm whitespace-pre-line shadow-lg animate-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> 
                    <div className="flex-1">{error}</div>
                 </div>
               )}

               <div className="space-y-10 pb-10">
                  {Object.entries(timeSlots).map(([label, slots]) => (
                    <div key={label} className="space-y-5">
                      <div className="flex items-center gap-4">
                        <span className={`text-xs font-black ${MEDIUM_TEXT} uppercase tracking-widest`}>{label}</span>
                        <div className={`h-[1px] flex-1 bg-gradient-to-r from-[${DARK_BORDER}] to-transparent`}></div>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {slots.map(slot => {
                          const { isUnavailable } = getUnavailableInfo(slot);
                          const active = isSlotSelected(slot);
                          return (
                            <button 
                              key={slot}
                              onClick={() => handleTimeClick(slot)}
                              className={`py-4 rounded-2xl text-[15px] font-bold transition-all border ${active ? 'text-white border-transparent' : isUnavailable ? `bg-white/5 border-transparent opacity-20 cursor-not-allowed` : `${DARK_SURFACE} border-[${DARK_BORDER}] ${LIGHT_TEXT} hover:border-slate-500`}`}
                              style={{ backgroundColor: active ? BRAND_COLOR : undefined }}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
               </div>
             </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            {renderHeader('Confirmação', 'Confira os detalhes da sua reserva.', 3)}
            <div className="px-6 space-y-8">
              <div className={`${DARK_SURFACE} rounded-[32px] overflow-hidden border ${DARK_BORDER} shadow-2xl`}>
                <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-white/5">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Revisão do Pedido</span>
                   </div>
                   <MapPin className="w-4 h-4 text-slate-600" />
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-5">
                    <div className={`w-20 h-20 rounded-[22px] overflow-hidden bg-black/40 border ${DARK_BORDER} shadow-inner`}>
                      <img src={selectedRoom?.image} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-black ${LIGHT_TEXT} leading-tight mb-1`}>{selectedRoom?.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Users className="w-3.5 h-3.5" />
                        <span>Capacidade para {selectedRoom?.capacity} pessoas</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`${LIGHT_GRAY_BG} p-4 rounded-2xl border ${DARK_BORDER} flex flex-col gap-1`}>
                      <div className="flex items-center gap-2 mb-1">
                        <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                        <span className={`text-[10px] font-black ${MEDIUM_TEXT} uppercase tracking-widest`}>Data</span>
                      </div>
                      <p className={`text-[15px] font-bold ${LIGHT_TEXT}`}>
                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                    <div className={`${LIGHT_GRAY_BG} p-4 rounded-2xl border ${DARK_BORDER} flex flex-col gap-1`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span className={`text-[10px] font-black ${MEDIUM_TEXT} uppercase tracking-widest`}>Horário</span>
                      </div>
                      <p className={`text-[15px] font-bold ${LIGHT_TEXT}`}>
                        {selectedTimeRange?.start} — {selectedTimeRange?.end}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.1em] text-slate-500 ml-1">
                    <User className="w-3.5 h-3.5" /> Responsável pela Reserva
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <User className={`w-5 h-5 ${MEDIUM_TEXT} transition-colors`} />
                    </div>
                    <input 
                      type="text" 
                      value={userName} 
                      onChange={(e) => setUserName(e.target.value)} 
                      placeholder="Quem irá utilizar a sala?" 
                      className={`w-full bg-[#121212] border ${DARK_BORDER} rounded-2xl px-6 py-5 pl-14 text-[15px] font-medium focus:outline-none focus:border-[${BRAND_COLOR}] focus:ring-1 focus:ring-[${BRAND_COLOR}]/20 ${LIGHT_TEXT} placeholder:text-slate-700 shadow-xl transition-all`} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.1em] text-slate-500 ml-1">
                    <FileText className="w-3.5 h-3.5" /> Motivo da Reunião (Opcional)
                  </label>
                  <div className="relative group">
                    <div className="absolute top-5 left-5 pointer-events-none">
                      <FileText className={`w-5 h-5 ${MEDIUM_TEXT} transition-colors`} />
                    </div>
                    <textarea 
                      value={purpose} 
                      onChange={(e) => setPurpose(e.target.value)} 
                      placeholder="Ex: Alinhamento de Metas Q2" 
                      className={`w-full bg-[#121212] border ${DARK_BORDER} rounded-2xl px-6 py-5 pl-14 text-[15px] font-medium focus:outline-none focus:border-[${BRAND_COLOR}] focus:ring-1 focus:ring-[${BRAND_COLOR}]/20 ${LIGHT_TEXT} placeholder:text-slate-700 shadow-xl min-h-[140px] transition-all resize-none`} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center px-6 pt-16 animate-in zoom-in duration-500">
             <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(16,185,129,0.3)] animate-pulse">
                <CheckCircle2 className="w-12 h-12 text-white" />
             </div>
             <h2 className={`text-4xl font-black ${LIGHT_TEXT} mb-4 uppercase tracking-tighter`}>Tudo certo!</h2>
             <p className={`text-[13px] mb-12 ${MEDIUM_TEXT} text-center leading-relaxed`}>Sua reserva na <b>{selectedRoom?.name}</b> foi concluída com sucesso.</p>

             {/* Ticket de Confirmação Refinado */}
             <div className={`w-full ${DARK_SURFACE} border ${DARK_BORDER} rounded-[32px] p-7 mb-10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <CalendarIcon className="w-32 h-32 -rotate-12" />
                </div>
                <div className="flex justify-between items-center pb-6 border-b border-white/5 mb-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Data</span>
                    <span className="text-xl font-extrabold text-white">
                      {lastReservation?.data && new Date(lastReservation.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Horário</span>
                    <span className="text-xl font-extrabold text-white">
                      {lastReservation?.inicio?.substring(0, 5)} - {lastReservation?.fim?.substring(0, 5)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-slate-800/50 border border-white/5 flex items-center justify-center shadow-inner">
                      <User className="w-6 h-6 text-slate-400" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Responsável</span>
                      <span className="text-[16px] font-bold text-white tracking-tight">{lastReservation?.nome}</span>
                   </div>
                </div>
             </div>

             <div className="w-full space-y-4">
                {lastReservation?.link_agenda && (
                  <a 
                    href={lastReservation.link_agenda} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full py-5 bg-white text-black rounded-[24px] font-black text-[15px] uppercase tracking-[0.1em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] hover:bg-slate-100 shadow-[0_20px_40px_rgba(255,255,255,0.15)] group"
                  >
                    <CalendarPlus className="w-6 h-6 group-hover:scale-110 transition-transform" /> Coloque na sua agenda
                  </a>
                )}
                <button 
                  onClick={() => { setStep('rooms'); setSelectedRoom(null); setSelectedTimeRange(null); setUserName(''); setPurpose(''); }} 
                  className={`w-full py-5 ${DARK_SURFACE} border ${DARK_BORDER} ${LIGHT_TEXT} rounded-[24px] font-black text-[14px] uppercase tracking-widest shadow-xl active:scale-95 transition-all hover:bg-white/5`}
                >
                  Voltar ao Início
                </button>
             </div>
          </div>
        )}
      </div>

      {isDatePickerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <div className={`${DARK_SURFACE} w-full max-w-sm rounded-[32px] shadow-2xl p-6 border ${DARK_BORDER}`}>
             <div className="flex items-center justify-between mb-6">
               <h3 className={`font-bold ${LIGHT_TEXT}`}>Selecione a Data</h3>
               <button onClick={() => setIsDatePickerOpen(false)} className="p-2 text-slate-400 hover:text-white transition-colors"><X /></button>
             </div>
             <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => { setSelectedDate(e.target.value); setIsDatePickerOpen(false); setSelectedTimeRange(null); }} 
                className={`w-full bg-[#121212] border ${DARK_BORDER} rounded-2xl px-6 py-5 text-lg font-bold ${LIGHT_TEXT} uppercase focus:outline-none focus:border-[${BRAND_COLOR}] transition-colors`}
                style={{ colorScheme: 'dark' }}
             />
          </div>
        </div>
      )}

      {step !== 'success' && (
        <div className={`fixed bottom-0 left-0 right-0 p-6 ${DARK_BACKGROUND}/95 backdrop-blur-xl border-t ${DARK_BORDER} z-50 flex justify-center`}>
          <div className="max-w-2xl w-full">
            <button 
              onClick={() => {
                if (step === 'rooms' && selectedRoom) setStep('datetime');
                else if (step === 'datetime' && selectedTimeRange?.end) setStep('confirm');
                else if (step === 'confirm') handleFinalize();
              }}
              disabled={loading || (step === 'rooms' && !selectedRoom) || (step === 'datetime' && !selectedTimeRange?.end) || (step === 'confirm' && !userName)}
              className="w-full py-5 rounded-[24px] font-black text-[15px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.97] shadow-2xl"
              style={{ 
                backgroundColor: (loading || (step === 'rooms' && !selectedRoom) || (step === 'datetime' && !selectedTimeRange?.end) || (step === 'confirm' && !userName)) ? LIGHT_GRAY_BG : BRAND_COLOR,
                color: (loading || (step === 'rooms' && !selectedRoom) || (step === 'datetime' && !selectedTimeRange?.end) || (step === 'confirm' && !userName)) ? "#555" : 'white'
              }}
            >
              {loading ? <Loader2 className="animate-spin" /> : <>{step === 'confirm' ? 'Finalizar Reserva' : 'Continuar'} <ArrowRight className="w-5 h-5" /></>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
