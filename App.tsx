
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ChevronLeft, 
  Info,
  Calendar as CalendarIcon,
  Clock,
  ArrowRight,
  CheckCircle2,
  CalendarPlus,
  MapPin,
  Users,
  Loader2,
  AlertCircle,
  X
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
  const [unavailableReservations, setUnavailableReservations] = useState<Reservation[]>([]);


  // Busca inicial das salas
  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      setError(null);
      const data = await ReservationService.getRooms();
      setRooms(data);
    } catch (e: any) {
      setError("Não foi possível carregar as salas. Verifique sua conexão.");
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Datas para o seletor horizontal (Gera um período maior para melhor navegação)
  const availableDates = useMemo(() => {
    const days = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    // Se a data selecionada for muito no futuro (via seletor manual), garantimos que ela apareça na lista
    const selected = new Date(selectedDate + 'T00:00:00');
    let loopDate = new Date(start);
    
    // Se selecionou uma data fora dos próximos 30 dias, começamos a lista um pouco antes dela
    if (selected.getTime() > start.getTime() + (30 * 24 * 60 * 60 * 1000)) {
      loopDate = new Date(selected);
      loopDate.setDate(selected.getDate() - 3);
    }

    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 0; i < 30; i++) {
      const d = new Date(loopDate);
      d.setDate(loopDate.getDate() + i);
      
      if (d < start) continue; // Não mostra datas passadas

      days.push({
        label: d.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase().replace('.', ''),
        num: d.getDate(),
        full: d.toISOString().split('T')[0],
        isToday: d.toISOString().split('T')[0] === todayStr
      });
    }
    return days;
  }, [selectedDate]);

  // Efeito para rolar automaticamente para a data selecionada na faixa horizontal
  useEffect(() => {
    if (step === 'datetime' && dateStripRef.current) {
      const activeEl = dateStripRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [step, selectedDate]);

  // Efeito para buscar as reservas da sala e data selecionadas
  useEffect(() => {
    const fetchUnavailable = async () => {
      if (selectedRoom && selectedDate) {
        console.log(`[App] Buscando reservas para Sala: ${selectedRoom.name}, Data: ${selectedDate}`);
        try {
          // Limpa o erro anterior antes de uma nova busca
          setError(null); 
          const reservations = await ReservationService.getReservationsByRoomAndDate(selectedRoom.name, selectedDate);
          setUnavailableReservations(reservations);
          console.log(`[App] Reservas indisponíveis carregadas (${selectedRoom.name}, ${selectedDate}):`, reservations);
        } catch (err) {
          console.error("[App] Falha ao buscar horários indisponíveis:", err);
          setError("Não foi possível verificar a disponibilidade. Verifique sua conexão com a internet ou tente novamente mais tarde.");
          setUnavailableReservations([]);
        }
      } else {
        setUnavailableReservations([]);
        // Limpa erros relacionados à disponibilidade se a sala ou data não estiverem selecionadas
        setError(null); 
        console.log("[App] selectedRoom ou selectedDate não definidos. Limpando reservas indisponíveis.");
      }
    };
    fetchUnavailable();
  }, [selectedRoom, selectedDate]);


  const timeSlots = {
    manha: ['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'],
    tarde: ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'],
    noite: ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30', '00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00']
  };

  const allSlotsSorted = useMemo(() => {
    return [...timeSlots.manha, ...timeSlots.tarde, ...timeSlots.noite];
  }, []);

  const getUnavailableInfo = (slot: string) => {
    if (!selectedRoom || !selectedDate || !unavailableReservations.length) return { isUnavailable: false, reservedBy: null, reservationEnd: null };

    const slotStart = new Date(`${selectedDate}T${slot}:00`);
    const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000); // Assuming 30-minute slot duration

    for (const res of unavailableReservations) {
      const resStart = new Date(`${selectedDate}T${res.inicio}:00`);
      const resEnd = new Date(`${selectedDate}T${res.fim}:00`);

      // Check for overlap: [resStart, resEnd) vs [slotStart, slotEnd)
      // An overlap means that the slot is part of an existing reservation.
      if (slotStart.getTime() < resEnd.getTime() && slotEnd.getTime() > resStart.getTime()) {
        // console.log(`[getUnavailableInfo] Slot ${slot} conflita com reserva de ${res.nome} (${res.inicio}-${res.fim})`);
        return { isUnavailable: true, reservedBy: res.nome, reservationEnd: res.fim };
      }
    }
    return { isUnavailable: false, reservedBy: null, reservationEnd: null };
  };

  const handleTimeClick = (slot: string) => {
    setError(null); // Always clear previous errors when a new slot is clicked
    const { isUnavailable, reservedBy, reservationEnd } = getUnavailableInfo(slot);
    if (isUnavailable) {
      setError(`Este horário (${slot}) já está reservado por ${reservedBy || 'alguém'} até ${reservationEnd || ''}. Por favor, escolha outro.`);
      return; 
    }

    if (!selectedTimeRange || (selectedTimeRange.start && selectedTimeRange.end)) {
      setSelectedTimeRange({ start: slot, end: null });
    } else {
      const startTime = selectedTimeRange.start;
      const startIdx = allSlotsSorted.indexOf(startTime);
      const endIdx = allSlotsSorted.indexOf(slot);

      if (endIdx > startIdx) {
        setSelectedTimeRange({ start: startTime, end: slot });
      } else if (endIdx === startIdx) {
        const nextIdx = startIdx + 1;
        if (nextIdx < allSlotsSorted.length) {
          // If the user clicks the same slot twice, assume a 30-min booking.
          setSelectedTimeRange({ start: startTime, end: allSlotsSorted[nextIdx] });
        } else {
          // If it's the very last slot, cannot define a 30 min range, reset.
          setSelectedTimeRange({ start: slot, end: null });
        }
      } else {
        // Clicou num horário anterior ao início, redefine o início
        setSelectedTimeRange({ start: slot, end: null });
      }
    }
  };

  const isSlotSelected = (slot: string) => {
    if (!selectedTimeRange) return false;
    // Check if the slot is the start or end of the current selection
    if (selectedTimeRange.start === slot) return true;
    if (selectedTimeRange.end === slot) return true;
    
    // Check if the slot is within the selected range
    if (selectedTimeRange.start && selectedTimeRange.end) {
      const startIdx = allSlotsSorted.indexOf(selectedTimeRange.start);
      const endIdx = allSlotsSorted.indexOf(selectedTimeRange.end);
      const currentIdx = allSlotsSorted.indexOf(slot);
      return currentIdx > startIdx && currentIdx < endIdx;
    }
    return false;
  };

  // Check if the currently selected range (start to end) overlaps with any existing reservations
  const isSelectedRangeUnavailable = useMemo(() => {
    // If no room, date, or end time selected, or no existing reservations, it's not unavailable.
    if (!selectedTimeRange || !selectedTimeRange.end || !selectedRoom || !selectedDate || !unavailableReservations.length) {
      return false;
    }

    const userStart = new Date(`${selectedDate}T${selectedTimeRange.start}:00`);
    const userEnd = new Date(`${selectedDate}T${selectedTimeRange.end}:00`);

    for (const res of unavailableReservations) {
      const resStart = new Date(`${selectedDate}T${res.inicio}:00`);
      const resEnd = new Date(`${selectedDate}T${res.fim}:00`);
      // Overlap condition: (StartA < EndB) && (EndA > StartB)
      if (userStart.getTime() < resEnd.getTime() && userEnd.getTime() > resStart.getTime()) {
        console.log(`[isSelectedRangeUnavailable] Conflito detectado entre seleção (${selectedTimeRange.start}-${selectedTimeRange.end}) e reserva existente (${res.nome} ${res.inicio}-${res.fim})`);
        return true;
      }
    }
    return false;
  }, [selectedTimeRange, selectedRoom, selectedDate, unavailableReservations]);


  const handleFinalize = async () => {
    // Basic validation
    if (!selectedRoom || !selectedTimeRange || !selectedTimeRange.end || !userName) {
      setError("Por favor, preencha todos os campos obrigatórios (sala, horário e seu nome).");
      return;
    }
    
    setLoading(true);
    setError(null);

    // Re-check for availability right before finalizing to catch any last-minute conflicts
    if (isSelectedRangeUnavailable) {
      setError("O período selecionado se sobrepõe a uma reserva existente. Por favor, ajuste o horário.");
      setLoading(false);
      return;
    }

    try {
      // Final check with service for any exact overlaps that might have been missed or changed
      const conflict = await ReservationService.checkAvailability(
        selectedRoom.name,
        selectedDate,
        selectedTimeRange.start,
        selectedTimeRange.end
      );

      if (conflict) {
        setError(`Esta sala já foi reservada por ${conflict.nome} neste horário (${selectedTimeRange.start} - ${selectedTimeRange.end}).`);
        setStep('datetime'); // Send user back to datetime selection if conflict found
        setLoading(false);
        return;
      }

      const res = await ReservationService.createReservation({
        nome: userName,
        sala: selectedRoom.name,
        data: selectedDate,
        inicio: selectedTimeRange.start,
        fim: selectedTimeRange.end,
        descricao: purpose
      });
      
      setLastReservation(res);
      setStep('success');
    } catch (e) {
      setError("Erro ao salvar reserva. Tente novamente.");
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
          className={`w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 border border-slate-100 ${step === 'rooms' ? 'invisible' : ''}`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Passo {stepNum} de 3</span>
           <div className="flex gap-1.5">
             <div className={`h-1 rounded-full transition-all duration-300 ${stepNum >= 1 ? 'w-8 bg-[#00AEEF]' : 'w-8 bg-slate-200'}`}></div>
             <div className={`h-1 rounded-full transition-all duration-300 ${stepNum >= 2 ? 'w-8 bg-[#00AEEF]' : 'w-8 bg-slate-200'}`}></div>
             <div className={`h-1 rounded-full transition-all duration-300 ${stepNum >= 3 ? 'w-8 bg-[#00AEEF]' : 'w-8 bg-slate-200'}`}></div>
           </div>
        </div>
        <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 border border-slate-100">
          <Info className="w-5 h-5" />
        </button>
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{title}</h1>
      <p className="text-slate-500 text-sm leading-relaxed">{subtitle}</p>
    </div>
  );

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-[#F8FAFC] text-slate-900 overflow-hidden select-none">
      
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-32">
        
        {/* PASSO 1: SALAS */}
        {step === 'rooms' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderHeader('Escolha sua Sala', 'Selecione o ambiente ideal para o seu atendimento ou reunião.', 1)}
            <div className="px-6 space-y-4 mt-2">
              {loadingRooms ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <Loader2 className="w-10 h-10 text-[#00AEEF] animate-spin" />
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Buscando salas...</p>
                </div>
              ) : (
                rooms.map((room) => (
                  <div 
                    key={room.id}
                    onClick={() => {
                      setSelectedRoom(room);
                      console.log(`[App] Sala selecionada: ID=${room.id}, Nome=${room.name}`);
                      // Clear time selection and error when room changes
                      setSelectedTimeRange(null);
                      setError(null);
                    }}
                    className={`group relative flex bg-white rounded-[28px] p-4 gap-4 border-2 transition-all cursor-pointer shadow-sm hover:shadow-md ${selectedRoom?.id === room.id ? 'border-[#00AEEF]' : 'border-transparent'}`}
                  >
                    <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-50">
                      <img src={room.image} className="w-full h-full object-cover" alt={room.name} />
                    </div>
                    <div className="flex-1 py-1">
                      <h3 className="text-[17px] font-bold text-slate-800 mb-1">{room.name}</h3>
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-3 font-medium">
                        <Users className="w-3.5 h-3.5" />
                        <span>{room.capacity > 0 ? `Até ${room.capacity} pessoas` : 'Capacidade individual'}</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {room.tags?.map(tag => (
                          <span key={tag} className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 uppercase tracking-tight">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PASSO 2: DATA E HORA */}
        {step === 'datetime' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
             {renderHeader('Data e Horário', 'Escolha quando você deseja utilizar o ambiente.', 2)}
             
             <div className="px-6">
               <div className="flex items-center justify-between mb-8">
                 <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                 </h2>
                 <button 
                  onClick={() => setIsDatePickerOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-xl shadow-sm text-[11px] font-black text-[#00AEEF] uppercase tracking-wider hover:bg-slate-50 transition-all active:scale-95"
                 >
                   <CalendarIcon className="w-4 h-4" /> Alterar Data
                 </button>
               </div>

               <div 
                ref={dateStripRef}
                className="flex items-center mb-10 pb-2 overflow-x-auto scrollbar-hide gap-3 snap-x touch-pan-x"
               >
                 {availableDates.map((day, i) => (
                   <div 
                    key={i} 
                    data-active={day.full === selectedDate}
                    className="flex flex-col items-center gap-3 snap-center flex-shrink-0"
                   >
                     <span className={`text-[10px] font-black uppercase tracking-widest ${day.full === selectedDate ? 'text-[#00AEEF]' : 'text-slate-400'}`}>
                        {day.isToday ? 'Hoje' : day.label}
                     </span>
                     <button 
                        onClick={() => {
                          setSelectedDate(day.full);
                          setSelectedTimeRange(null); // Clear time selection when date changes
                          setError(null); // Clear any existing errors
                        }}
                        className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-[18px] transition-all duration-300 relative ${day.full === selectedDate ? 'bg-[#00AEEF] text-white shadow-xl shadow-[#00AEEF]/25 scale-110' : 'text-slate-600 bg-white shadow-sm border border-slate-100 hover:border-[#00AEEF]/30'}`}
                     >
                       {day.num}
                       {day.isToday && day.full !== selectedDate && (
                         <div className="absolute -bottom-1 w-1.5 h-1.5 bg-[#00AEEF] rounded-full"></div>
                       )}
                     </button>
                   </div>
                 ))}
               </div>

               <div className="mb-8 p-5 bg-white rounded-[24px] flex items-center justify-between border border-slate-100 shadow-sm animate-in fade-in zoom-in-95 duration-500">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#00AEEF]/10 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-[#00AEEF]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Período Selecionado</span>
                      <p className="text-[16px] font-black text-slate-800">
                        {selectedTimeRange ? (
                          selectedTimeRange.end ? `${selectedTimeRange.start} às ${selectedTimeRange.end}` : `${selectedTimeRange.start} até...`
                        ) : "Toque em 2 horários"}
                      </p>
                    </div>
                  </div>
                  {selectedTimeRange && (
                    <button 
                      onClick={() => setSelectedTimeRange(null)}
                      className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
               </div>

               {error && (
                 <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium animate-in zoom-in-95">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                 </div>
               )}

               <div className="space-y-10 pb-10">
                  {Object.entries(timeSlots).map(([label, slots]) => (
                    <div key={label} className="space-y-5">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 to-transparent"></div>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {slots.map(slot => {
                          const { isUnavailable, reservedBy, reservationEnd } = getUnavailableInfo(slot);
                          return (
                            <button 
                              key={slot}
                              onClick={() => handleTimeClick(slot)}
                              disabled={isUnavailable}
                              title={isUnavailable ? `Reservado por ${reservedBy || 'alguém'} até ${reservationEnd || ''}` : undefined}
                              className={`
                                py-4 rounded-2xl text-[15px] font-bold transition-all duration-200 border 
                                ${isSlotSelected(slot) ? 'bg-[#00AEEF] border-[#00AEEF] text-white shadow-lg shadow-[#00AEEF]/20 translate-y-[-2px]' : 
                                  isUnavailable ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed opacity-70' : 
                                  'bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}
                              `}
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

        {/* PASSO 3: CONFIRMAÇÃO */}
        {step === 'confirm' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            {renderHeader('Confirmação', 'Confira os dados e identifique o responsável pela reserva.', 3)}
            
            <div className="px-6 space-y-6 mt-2">
              <div className="bg-white rounded-[32px] p-6 space-y-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-50">
                    <img src={selectedRoom?.image} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{selectedRoom?.name}</h3>
                    <p className="text-slate-500 text-xs">{selectedRoom?.description}</p>
                  </div>
                </div>

                <div className="h-[1px] bg-slate-100"></div>

                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/5 flex items-center justify-center">
                      <CalendarIcon className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Data Selecionada</p>
                      <p className="text-[15px] font-bold text-slate-800">{new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric'})}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/5 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Horário</p>
                      <p className="text-[15px] font-bold text-slate-800">{selectedTimeRange?.start} às {selectedTimeRange?.end}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 ml-1">Quem é o responsável?</label>
                  <input 
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#00AEEF]/5 transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 ml-1">Qual o assunto? (Opcional)</label>
                  <textarea 
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Ex: Reunião de equipe"
                    className="w-full bg-white border border-slate-200 rounded-3xl p-6 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#00AEEF]/5 transition-all resize-none shadow-sm"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASSO FINAL: SUCESSO */}
        {step === 'success' && (
          <div className="flex flex-col items-center justify-center px-8 text-center pt-20 animate-in zoom-in duration-500">
             <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-100">
                <CheckCircle2 className="w-10 h-10 text-white" />
             </div>
             <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Reserva Confirmada!</h2>
             <p className="text-slate-500 text-sm mb-12">Tudo pronto. Seu horário já está garantido na {selectedRoom?.name}.</p>

             <div className="w-full bg-white rounded-[32px] p-6 text-left space-y-4 border border-slate-100 shadow-md mb-8">
                <div className="flex justify-between items-center">
                   <span className="text-xs font-bold text-slate-400 uppercase">Resumo Digital</span>
                   <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-1 rounded-md font-black">VALIDADO</span>
                </div>
                <div>
                   <h4 className="font-bold text-lg text-slate-900">{selectedRoom?.name}</h4>
                   <p className="text-sm text-slate-500">{selectedDate.split('-').reverse().join('/')} • {selectedTimeRange?.start} - {selectedTimeRange?.end}</p>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-slate-50 text-slate-400 text-xs">
                   <Users className="w-3.5 h-3.5" />
                   <span>Responsável: {userName}</span>
                </div>
             </div>

             <div className="w-full space-y-3">
                {lastReservation?.link_agenda && (
                  <button 
                    onClick={() => window.open(lastReservation.link_agenda, '_blank')}
                    className="w-full py-4.5 bg-[#00AEEF] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#00AEEF]/20 active:scale-95 transition-all"
                  >
                    <CalendarPlus className="w-5 h-5" /> Adicionar à Agenda
                  </button>
                )}
                <button 
                  onClick={() => { setStep('rooms'); setSelectedRoom(null); setSelectedTimeRange(null); setPurpose(''); setUserName(''); }}
                  className="w-full py-4.5 bg-slate-100 text-slate-500 rounded-2xl font-bold active:scale-95 transition-all"
                >
                  Fazer outra Reserva
                </button>
             </div>
          </div>
        )}
      </div>

      {/* MODAL SELETOR DE DATA ANUAL */}
      {isDatePickerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300 p-6">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
             <div className="px-6 py-6 border-b border-slate-50 flex items-center justify-between">
               <h3 className="font-bold text-slate-800">Escolher Data</h3>
               <button onClick={() => setIsDatePickerOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                 <X className="w-5 h-5 text-slate-300" />
               </button>
             </div>
             <div className="p-6">
                <input 
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setIsDatePickerOpen(false);
                    setSelectedTimeRange(null); // Clear time selection on date change
                    setError(null); // Clear errors on date change
                  }}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-lg font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#00AEEF]/10 transition-all"
                />
                <p className="mt-4 text-xs text-slate-400 font-medium text-center italic">Selecione uma data futura para verificar horários.</p>
             </div>
             <div className="p-6 bg-slate-50">
                <button 
                  onClick={() => setIsDatePickerOpen(false)}
                  className="w-full py-4 bg-[#00AEEF] text-white rounded-2xl font-bold shadow-lg shadow-[#00AEEF]/10 active:scale-95 transition-all"
                >
                  Confirmar Data
                </button>
             </div>
          </div>
        </div>
      )}

      {/* RODAPÉ FIXO DE AÇÃO */}
      {step !== 'success' && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 z-50 flex justify-center">
          <div className="max-w-2xl w-full">
            <button 
              onClick={() => {
                if (step === 'rooms' && selectedRoom) setStep('datetime');
                else if (step === 'datetime' && selectedTimeRange && selectedTimeRange.end) setStep('confirm');
                else if (step === 'confirm') handleFinalize();
              }}
              disabled={
                loading || 
                isSelectedRangeUnavailable || 
                (selectedTimeRange && selectedTimeRange.start && getUnavailableInfo(selectedTimeRange.start).isUnavailable) || // Disable if start slot is unavailable
                (step === 'rooms' && !selectedRoom) || 
                (step === 'datetime' && (!selectedTimeRange || !selectedTimeRange.end)) || 
                (step === 'confirm' && !userName)
              }
              className={`w-full py-5 rounded-[24px] font-bold text-[16px] flex items-center justify-center gap-3 transition-all active:scale-[0.97] shadow-lg ${
                loading || 
                isSelectedRangeUnavailable ||
                (selectedTimeRange && selectedTimeRange.start && getUnavailableInfo(selectedTimeRange.start).isUnavailable) || // Also disable if start slot is unavailable
                (step === 'rooms' && !selectedRoom) || 
                (step === 'datetime' && (!selectedTimeRange || !selectedTimeRange.end)) || 
                (step === 'confirm' && !userName) 
                ? 'bg-slate-200 text-slate-400' : 'bg-[#00AEEF] text-white shadow-[#00AEEF]/20'
              }`}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {step === 'confirm' ? 'Finalizar Reserva' : 'Próximo Passo'} 
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;