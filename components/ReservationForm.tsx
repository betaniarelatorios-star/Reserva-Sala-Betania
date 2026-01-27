
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
    <div className="w-full bg-white rounded-3xl border border-slate-200 overflow-hidden mt-4 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header com Indicador de Progresso */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Procedimento</span>
          <h4 className="text-[14px] font-bold text-slate-800">Verificação e Reserva</h4>
        </div>
        <div className="flex gap-1.5 items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-white">
        {/* Campo Responsável */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
            <User className="w-3 h-3" /> Responsável
          </label>
          <input 
            type="text"
            placeholder="Quem está reservando?"
            required
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-3 text-[14px] text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 transition-all placeholder:text-slate-300"
          />
        </div>

        {/* Campo Data */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
            <Calendar className="w-3 h-3" /> Data da Reserva
          </label>
          <input 
            type="date"
            min={today}
            required
            value={formData.date}
            onChange={e => setFormData({...formData, date: e.target.value})}
            className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-3 text-[14px] text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 transition-all"
          />
        </div>

        {/* Grid de Horários */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
              <Clock className="w-3 h-3" /> Início
            </label>
            <input 
              type="time"
              required
              value={formData.start}
              onChange={e => setFormData({...formData, start: e.target.value})}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-3 text-[14px] text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
              <Clock className="w-3 h-3" /> Término
            </label>
            <input 
              type="time"
              required
              value={formData.end}
              onChange={e => setFormData({...formData, end: e.target.value})}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-3 text-[14px] text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 transition-all"
            />
          </div>
        </div>

        {/* Campo Descrição */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
            <FileText className="w-3 h-3" /> Descrição / Motivo
          </label>
          <textarea 
            placeholder="Descreva brevemente o objetivo da reunião..."
            value={formData.purpose}
            onChange={e => setFormData({...formData, purpose: e.target.value})}
            rows={3}
            className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-3 text-[14px] text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 transition-all resize-none placeholder:text-slate-300"
          />
        </div>

        {/* Seção de Erro e Alternativas */}
        {error && (
          <div className="p-5 bg-red-50/60 border border-red-100 rounded-[28px] space-y-4 shadow-sm animate-in shake-200 duration-300">
            <div className="flex gap-3">
              <div className="p-1.5 h-fit bg-red-500 rounded-full flex-shrink-0 shadow-md shadow-red-200">
                <AlertCircle className="w-3 h-3 text-white" />
              </div>
              <div className="text-red-700 font-medium text-[13px] leading-tight">
                {error}
              </div>
            </div>
            
            {alternatives.length > 0 && (
              <div className="pt-4 border-t border-red-200/40 space-y-3">
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Salas Livres no Horário</p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {alternatives.map(alt => (
                    <button
                      key={alt.id}
                      type="button"
                      onClick={() => onSelectAlternative?.(alt)}
                      className="flex items-center justify-between p-4 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-2xl transition-all group shadow-sm active:scale-[0.98]"
                    >
                      <div className="flex flex-col items-start">
                        <span className="text-[13px] font-bold text-slate-800">Sala {alt.name.replace('Sala ', '')}</span>
                        <span className="text-[10px] text-slate-400">Capacidade: {alt.capacity} pessoas</span>
                      </div>
                      <div className="p-2 bg-slate-50 group-hover:bg-white rounded-xl transition-colors">
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-all" />
                      </div>
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
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4.5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-slate-200 disabled:bg-slate-300 disabled:shadow-none mt-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span className="text-[15px]">Verificar e Reservar</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ReservationForm;
