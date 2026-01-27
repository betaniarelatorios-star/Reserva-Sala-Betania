
import React, { useState } from 'react';
import { Send, AlertCircle, ArrowRight, Clock, User, Calendar, FileText } from 'lucide-react';
import { ReservationService } from '../services/reservationService.ts';
import { Room, Reservation } from '../types.ts';

interface ReservationFormProps {
  room: Room;
  onSuccess: (data: any) => void;
  onSelectAlternative?: (room: Room) => void;
}

const ReservationForm: React.FC<ReservationFormProps> = ({ room, onSuccess, onSelectAlternative }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | React.ReactNode | null>(null);
  const [alternatives, setAlternatives] = useState<Room[]>([]);
  const [today] = useState(new Date().toISOString().split('T')[0]);
  
  const [formData, setFormData] = useState({
    name: '',
    date: today,
    start: '',
    end: '',
    purpose: ''
  });

  const validateDateTime = () => {
    const now = new Date();
    const selectedDateStr = formData.date;
    const selectedDate = new Date(selectedDateStr + 'T00:00:00');
    
    const todayDate = new Date();
    todayDate.setHours(0,0,0,0);

    if (selectedDate < todayDate) return "Não é permitido reservar em datas passadas.";

    if (selectedDateStr === today) {
      if (formData.start) {
        const [h, m] = formData.start.split(':').map(Number);
        const startTime = new Date();
        startTime.setHours(h, m, 0, 0);
        
        if (startTime < new Date(now.getTime() - 60000)) {
          return "O horário de início não pode ser no passado.";
        }
      }
    }

    if (formData.start && formData.end) {
      if (formData.start >= formData.end) {
        return "O horário de término deve ser após o início.";
      }
      
      const [hStart] = formData.start.split(':').map(Number);
      const [hEnd] = formData.end.split(':').map(Number);
      if (hEnd - hStart > 12) return "Reservas não podem exceder 12 horas.";
    }

    return null;
  };

  const formatTime = (timeStr: string) => timeStr ? timeStr.split(':').slice(0, 2).join(':') : '--:--';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAlternatives([]);

    const validationError = validateDateTime();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const conflict = await ReservationService.checkAvailability(
        room.name,
        formData.date,
        formData.start,
        formData.end
      );

      if (conflict) {
        setError(
          <span className="text-[12px] leading-snug">
            A {room.name} já possui uma reserva para este período realizada por <span className="font-bold text-red-700">{conflict.nome || 'alguém'}</span> até às <span className="font-bold text-red-700">{formatTime(conflict.fim)}</span>.
          </span>
        );
        
        const altRooms = await ReservationService.getAvailableRooms(
          formData.date,
          formData.start,
          formData.end
        );
        setAlternatives(altRooms.filter(r => r.id !== room.id));
        setLoading(false);
        return;
      }

      const reservation = await ReservationService.createReservation({
        nome: formData.name,
        sala: room.name,
        data: formData.date,
        inicio: formData.start,
        fim: formData.end,
        descricao: formData.purpose
      });

      onSuccess(reservation);
    } catch (err) {
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-6 bg-slate-900 rounded-full"></div>
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Fluxo de Reserva</span>
          <h4 className="text-[13px] font-bold text-slate-800 uppercase tracking-tight">Sala {room.name.replace('Sala ', '')}</h4>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
            <User className="w-3 h-3" /> Responsável
          </label>
          <input 
            type="text"
            placeholder="Nome de quem está reservando"
            required
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-[14px] text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all placeholder:text-slate-300 shadow-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
            <Calendar className="w-3 h-3" /> Data
          </label>
          <input 
            type="date"
            min={today}
            required
            value={formData.date}
            onChange={e => setFormData({...formData, date: e.target.value})}
            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-[14px] text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all shadow-sm"
          />
        </div>

        {/* Horários com largura reduzida */}
        <div className="flex gap-4">
          <div className="flex-1 max-w-[130px] space-y-1.5">
            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
              <Clock className="w-3 h-3" /> Início
            </label>
            <input 
              type="time"
              required
              value={formData.start}
              onChange={e => setFormData({...formData, start: e.target.value})}
              className="w-full bg-white border border-slate-200 rounded-2xl px-3 py-4 text-[14px] text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all shadow-sm"
            />
          </div>
          <div className="flex-1 max-w-[130px] space-y-1.5">
            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
              <Clock className="w-3 h-3" /> Término
            </label>
            <input 
              type="time"
              required
              value={formData.end}
              onChange={e => setFormData({...formData, end: e.target.value})}
              className="w-full bg-white border border-slate-200 rounded-2xl px-3 py-4 text-[14px] text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
            <FileText className="w-3 h-3" /> Motivo da Reunião
          </label>
          <textarea 
            placeholder="Ex: Alinhamento de projeto..."
            value={formData.purpose}
            onChange={e => setFormData({...formData, purpose: e.target.value})}
            rows={2}
            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-[14px] text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all resize-none placeholder:text-slate-300 shadow-sm"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-[22px] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex gap-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-red-700 font-medium text-[12px] leading-snug">
                {error}
              </div>
            </div>
          </div>
        )}

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4.5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-slate-100 disabled:bg-slate-200 disabled:shadow-none"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span className="text-[14px] uppercase tracking-wider font-black">Concluir Reserva</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ReservationForm;
