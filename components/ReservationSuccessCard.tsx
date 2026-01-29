
import React from 'react';
import { CheckCircle2, MapPin, User, Calendar, Clock, CalendarClock, ExternalLink, CalendarPlus } from 'lucide-react';
import { Reservation } from '../types.ts';

interface ReservationSuccessCardProps {
  reservation: Reservation;
  onReschedule?: (reservation: Reservation) => void;
}

const ReservationSuccessCard: React.FC<ReservationSuccessCardProps> = ({ reservation, onReschedule }) => {
  const formattedDate = reservation?.data ? reservation.data.split('-').reverse().join('/') : '--/--/----';
  const formatTime = (time: string) => time ? time.split(':').slice(0, 2).join(':') : '--:--';

  const handleAddToCalendar = () => {
    if (reservation) {
      const date = reservation.data.replace(/-/g, '');
      const start = reservation.inicio.replace(/:/g, '').substring(0, 4) + '00';
      const end = reservation.fim.replace(/:/g, '').substring(0, 4) + '00';
      const title = encodeURIComponent(`Reserva ${reservation.sala}`); // 'sala' aqui é o nome no contexto do componente de sucesso
      const details = encodeURIComponent(`Responsável: ${reservation.nome}${reservation.descricao ? `\nMotivo: ${reservation.descricao}` : ''}`);
      const link = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${date}T${start}/${date}T${end}&details=${details}`;
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  const BRAND_COLOR = "#01AAFF";
  const DARK_SURFACE = "#2C2C2C"; // For cards and containers
  const DARK_BORDER = "#3A3A3A"; // For subtle borders
  const LIGHT_TEXT = "#FAFAFA"; // Main text
  const MEDIUM_TEXT = "#A0A0A0"; // Secondary text
  const LIGHT_GRAY_BG = "#333333"; // Slightly lighter dark surface

  return (
    <div className={`w-full ${DARK_SURFACE} rounded-[28px] border ${DARK_BORDER} shadow-xl overflow-hidden mt-2 animate-in zoom-in-95 duration-500`}>
      <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: BRAND_COLOR }}>
        <div className="flex items-center gap-2 text-white">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-[13px] font-bold uppercase tracking-wider">Reserva Confirmada</span>
        </div>
        <div className="text-white/60 text-[10px] font-black uppercase tracking-widest">Digital Ticket</div>
      </div>
      
      <div className="p-6 space-y-5">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl ${LIGHT_GRAY_BG} flex items-center justify-center flex-shrink-0`}>
            <MapPin className={`w-5 h-5 ${MEDIUM_TEXT}`} />
          </div>
          <div className="flex flex-col">
            <span className={`text-[10px] font-bold ${MEDIUM_TEXT} uppercase`}>Sala Selecionada</span>
            <span className={`text-[15px] font-bold ${LIGHT_TEXT}`}>{reservation?.sala || 'Sala'}</span>
          </div>
        </div>

        <div className={`h-px ${DARK_BORDER} w-full`}></div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg ${LIGHT_GRAY_BG} flex items-center justify-center`}>
              <Calendar className={`w-4 h-4 ${MEDIUM_TEXT}`} />
            </div>
            <div className="flex flex-col">
              <span className={`text-[9px] font-bold ${MEDIUM_TEXT} uppercase`}>Data</span>
              <span className={`text-[13px] font-semibold ${LIGHT_TEXT}`}>{formattedDate}</span>
            </div>
          </div>
          <div className={`flex items-start gap-3 border-l ${DARK_BORDER} pl-4`}>
            <div className={`w-8 h-8 rounded-lg ${LIGHT_GRAY_BG} flex items-center justify-center`}>
              <Clock className={`w-4 h-4 ${MEDIUM_TEXT}`} />
            </div>
            <div className="flex flex-col">
              <span className={`text-[9px] font-bold ${MEDIUM_TEXT} uppercase`}>Horário</span>
              <span className={`text-[13px] font-semibold ${LIGHT_TEXT}`}>{formatTime(reservation?.inicio)} - {formatTime(reservation?.fim)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-1">
          <div className={`w-9 h-9 rounded-full border ${DARK_BORDER} flex items-center justify-center ${LIGHT_GRAY_BG}`}>
             <User className={`w-4 h-4 ${MEDIUM_TEXT}`} />
          </div>
          <div className="flex flex-col">
            <span className={`text-[9px] font-bold ${MEDIUM_TEXT} uppercase`}>Responsável</span>
            <span className={`text-[13px] font-semibold ${LIGHT_TEXT} line-clamp-1`}>{reservation?.nome || 'Usuário'}</span>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 pt-2 flex flex-col gap-3">
        <div className={`${LIGHT_GRAY_BG} px-4 py-3 rounded-2xl flex items-center justify-center border border-dashed ${DARK_BORDER}`}>
          <div className="flex items-center gap-2 text-emerald-500">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[11px] font-black uppercase tracking-widest">RESERVA FINALIZADA</span>
          </div>
        </div>
        
        <button 
          onClick={handleAddToCalendar}
          className="w-full flex items-center justify-center gap-2.5 py-4 px-4 text-white rounded-2xl transition-all active:scale-[0.98] shadow-lg group"
          style={{ backgroundColor: BRAND_COLOR }}
        >
          <CalendarPlus className="w-4 h-4 text-white/80" />
          <span className="text-[13px] font-black uppercase tracking-tight">Gravar na minha agenda</span>
          <ExternalLink className="w-3 h-3 text-white/40" />
        </button>

        <button 
          onClick={() => onReschedule?.(reservation)}
          className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 ${DARK_SURFACE} border ${DARK_BORDER} rounded-2xl ${MEDIUM_TEXT} hover:bg-[${LIGHT_GRAY_BG}] transition-all active:scale-[0.98]`}
        >
          <CalendarClock className={`w-4 h-4 ${MEDIUM_TEXT}`} />
          <span className="text-[12px] font-bold uppercase tracking-tight">Remarcar Reserva</span>
        </button>
      </div>
    </div>
  );
};

export default ReservationSuccessCard;
