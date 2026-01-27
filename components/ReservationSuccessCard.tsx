
import React from 'react';
import { CheckCircle2, MapPin, User, Calendar, Clock, CalendarClock, ExternalLink } from 'lucide-react';
import { Reservation } from '../types.ts';

interface ReservationSuccessCardProps {
  reservation: Reservation;
  onReschedule?: (reservation: Reservation) => void;
}

const ReservationSuccessCard: React.FC<ReservationSuccessCardProps> = ({ reservation, onReschedule }) => {
  const formattedDate = reservation?.data ? reservation.data.split('-').reverse().join('/') : '--/--/----';
  const formatTime = (time: string) => time ? time.split(':').slice(0, 2).join(':') : '--:--';

  const handleAddToCalendar = () => {
    if (reservation?.link_agenda) {
      window.open(reservation.link_agenda, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="w-full bg-white rounded-[28px] border border-slate-100 shadow-xl overflow-hidden mt-2 animate-in zoom-in-95 duration-500">
      {/* Header do Ticket */}
      <div className="bg-emerald-500 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-[13px] font-bold uppercase tracking-wider">Reserva Confirmada</span>
        </div>
        <div className="text-white/60 text-[10px] font-black uppercase tracking-widest">Digital Ticket</div>
      </div>
      
      {/* Detalhes da Reserva */}
      <div className="p-6 space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Sala Selecionada</span>
            <span className="text-[15px] font-bold text-slate-800">{reservation?.sala || 'Sala'}</span>
          </div>
        </div>

        <div className="h-px bg-slate-100 w-full"></div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Data</span>
              <span className="text-[13px] font-semibold text-slate-700">{formattedDate}</span>
            </div>
          </div>
          <div className="flex items-start gap-3 border-l border-slate-100 pl-4">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Horário</span>
              <span className="text-[13px] font-semibold text-slate-700">{formatTime(reservation?.inicio)} - {formatTime(reservation?.fim)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <div className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center overflow-hidden bg-slate-50">
             <User className="w-5 h-5 text-slate-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Responsável</span>
            <span className="text-[13px] font-semibold text-slate-800">{reservation?.nome || 'Usuário'}</span>
          </div>
        </div>
      </div>

      {/* Ações do Card */}
      <div className="px-6 pb-6 pt-2 flex flex-col gap-3">
        <div className="bg-slate-50 px-4 py-3 rounded-2xl flex items-center justify-center border border-dashed border-slate-200">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[11px] font-black uppercase tracking-widest">RESERVA FINALIZADA</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-2.5">
          {/* Botão de Agenda - Destaque em Azul */}
          {reservation?.link_agenda && (
            <button 
              onClick={handleAddToCalendar}
              className="w-full flex items-center justify-center gap-2.5 py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all active:scale-[0.98] shadow-md shadow-blue-100 group"
            >
              <ExternalLink className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
              <span className="text-[13px] font-black uppercase tracking-tight">Gravar na minha agenda</span>
            </button>
          )}

          {/* Botão de Remarcar - Secundário */}
          <button 
            onClick={() => onReschedule?.(reservation)}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all active:scale-[0.98] group"
          >
            <CalendarClock className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            <span className="text-[12px] font-bold uppercase tracking-tight">Remarcar Reserva</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationSuccessCard;
