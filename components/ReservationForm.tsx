
import React, { useState } from 'react';
import { Calendar, Clock, Send, AlertCircle, CheckCircle2, Search, ArrowRight } from 'lucide-react';
import { ReservationService } from '../services/reservationService';
import { Room } from '../types';

interface ReservationFormProps {
  room: Room;
  onSuccess: (data: any) => void;
  onSelectAlternative?: (room: Room) => void;
}

const ReservationForm: React.FC<ReservationFormProps> = ({ room, onSuccess, onSelectAlternative }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    const selectedDate = new Date(formData.date + 'T00:00:00');
    const todayDate = new Date(today + 'T00:00:00');

    if (selectedDate < todayDate) return "Datas passadas não são permitidas.";

    if (formData.date === today) {
      const [h, m] = formData.start.split(':').map(Number);
      const startTime = new Date();
      startTime.setHours(h, m, 0, 0);
      if (startTime < now) return "O horário de início já passou.";
    }

    if (formData.start && formData.end && formData.start >= formData.end) {
      return "O término deve ser após o início.";
    }

    return null;
  };

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
      const isAvailable = await ReservationService.checkAvailability(
        room.name,
        formData.date,
        formData.start,
        formData.end
      );

      if (!isAvailable) {
        setError(`A ${room.name} está ocupada. Verificando alternativas...`);
        const altRooms = await ReservationService.getAvailableRooms(
          formData.date,
          formData.start,
          formData.end
        );
        setAlternatives(altRooms);
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
      setError('Falha na comunicação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden mt-3 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white px-5 py-3 border-b border-slate-200 flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Formulário de Reserva</span>
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
            placeholder="Nome completo"
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

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
              <p className="text-[11px] text-red-600 font-bold uppercase">{error}</p>
            </div>
            
            {alternatives.length > 0 && (
              <div className="pt-2 border-t border-red-100 space-y-1.5">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Salas Livres:</p>
                <div className="flex flex-col gap-1.5">
                  {alternatives.map(alt => (
                    <button
                      key={alt.id}
                      type="button"
                      onClick={() => onSelectAlternative?.(alt)}
                      className="flex items-center justify-between p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors group"
                    >
                      <span className="text-[11px] font-bold text-slate-700">{alt.name}</span>
                      <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
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
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg disabled:bg-slate-300 disabled:shadow-none"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>Confirmar Reserva <Send className="w-3.5 h-3.5" /></>
          )}
        </button>
      </form>
    </div>
  );
};

export default ReservationForm;
