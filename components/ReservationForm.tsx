
import React, { useState } from 'react';
import { Send, AlertCircle, ArrowRight, Clock } from 'lucide-react';
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

  const formatTime = (timeStr: string) => timeStr.split(':').slice(0, 2).join(':');

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
            A {room.name} já possui uma reserva para este período realizada por <span className="font-bold text-red-700">{conflict.nome}</span> até às <span className="font-bold text-red-700">{formatTime(conflict.fim)}</span>.
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
    <div className="w-full bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden mt-3 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white px-5 py-3 border-b border-slate-200 flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Verificação e Reserva</span>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Responsável</label>
          <input 
            type="text"
            placeholder="Quem está reservando?"
            required
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Data</label>
          <input 
            type="date"
            min={today}
            required
            value={formData.date}
            onChange={e => setFormData({...formData, date: e.target.value})}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Início</label>
            <input 
              type="time"
              required
              value={formData.start}
              onChange={e => setFormData({...formData, start: e.target.value})}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Término</label>
            <input 
              type="time"
              required
              value={formData.end}
              onChange={e => setFormData({...formData, end: e.target.value})}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Descrição / Motivo</label>
          <textarea 
            placeholder="Descreva brevemente o objetivo da reunião..."
            value={formData.purpose}
            onChange={e => setFormData({...formData, purpose: e.target.value})}
            rows={2}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all resize-none"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50/80 border border-red-100 rounded-[24px] space-y-3 shadow-sm">
            <div className="flex gap-3">
              <div className="p-1.5 h-fit bg-red-500 rounded-full flex-shrink-0">
                <AlertCircle className="w-3 h-3 text-white" />
              </div>
              <div className="text-red-600 font-medium">
                {error}
              </div>
            </div>
            
            {alternatives.length > 0 && (
              <div className="pt-3 border-t border-red-100/50 space-y-2.5">
                <div className="bg-blue-50 px-3 py-1.5 rounded-xl inline-block">
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Salas Disponíveis neste horário</p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {alternatives.map(alt => (
                    <button
                      key={alt.id}
                      type="button"
                      onClick={() => onSelectAlternative?.(alt)}
                      className="flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl transition-all group shadow-sm active:scale-[0.98]"
                    >
                      <span className="text-[12px] font-bold text-slate-700">Sala {alt.name.replace('Sala ', '')}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-[#1e293b] hover:bg-slate-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg disabled:bg-slate-300 disabled:shadow-none mt-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>Verificar e Reservar <Send className="w-3.5 h-3.5" /></>
          )}
        </button>
      </form>
    </div>
  );
};

export default ReservationForm;
