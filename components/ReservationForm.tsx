
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
    <div className="w-full mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Separador Visual Leve */}
      <div className="flex items-center gap-3 py-2 border-b border-slate-100">
        <div className="flex-1 h-px bg-slate-100"></div>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Procedimento</span>
          <h4 className="text-[12px] font-bold text-slate-500">Verificação e Reserva</h4>
        </div>
        <div className="flex-1 h-px bg-slate-100"></div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Campo Responsável */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
            <User className="w-3 h-3" /> Responsável
          </label>
          <input 
            type="text"
            placeholder="Quem está reservando?"
            required
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-[14px] text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-100 focus:bg-white focus:border-slate-200 transition-all placeholder:text-slate-300 shadow-sm"
          />
        </div>

        {/* Campo Data */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
            <Calendar className="w-3 h-3" /> Data da Reserva
          </label>
          <input 
            type="date"
            min={today}
            required
            value={formData.date}
            onChange={e => setFormData({...formData, date: e.target.value})}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-[14px] text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-100 focus:bg-white focus:border-slate-200 transition-all shadow-sm"
          />
        </div>

        {/* Grid de Horários - Mais espaçado e sem sobreposição visual */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
              <Clock className="w-3 h-3" /> Início
            </label>
            <input 
              type="time"
              required
              value={formData.start}
              onChange={e => setFormData({...formData, start: e.target.value})}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-[14px] text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-100 focus:bg-white focus:border-slate-200 transition-all shadow-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
              <Clock className="w-3 h-3" /> Término
            </label>
            <input 
              type="time"
              required
              value={formData.end}
              onChange={e => setFormData({...formData, end: e.target.value})}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-[14px] text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-100 focus:bg-white focus:border-slate-200 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Campo Descrição */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
            <FileText className="w-3 h-3" /> Descrição / Motivo
          </label>
          <textarea 
            placeholder="Descreva brevemente o objetivo..."
            value={formData.purpose}
            onChange={e => setFormData({...formData, purpose: e.target.value})}
            rows={2}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-[14px] text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-100 focus:bg-white focus:border-slate-200 transition-all resize-none placeholder:text-slate-300 shadow-sm"
          />
        </div>

        {/* Seção de Erro e Alternativas */}
        {error && (
          <div className="p-5 bg-red-50 border border-red-100 rounded-[24px] space-y-4 animate-in shake-200 duration-300">
            <div className="flex gap-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-red-700 font-medium text-[13px] leading-snug">
                {error}
              </div>
            </div>
            
            {alternatives.length > 0 && (
              <div className="pt-4 border-t border-red-200/30 space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Sugestões Disponíveis</p>
                <div className="grid grid-cols-1 gap-2">
                  {alternatives.map(alt => (
                    <button
                      key={alt.id}
                      type="button"
                      onClick={() => onSelectAlternative?.(alt)}
                      className="flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl transition-all group active:scale-[0.98]"
                    >
                      <span className="text-[13px] font-bold text-slate-700">{alt.name}</span>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botão Submit */}
        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-slate-100 disabled:bg-slate-200 disabled:shadow-none"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span className="text-[14px] uppercase tracking-wider">Verificar e Reservar</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ReservationForm;
