
import React from 'react';
import { CheckCircle2, MapPin, User, Calendar, Clock } from 'lucide-react';
import { Reservation } from '../types.ts';

interface ReservationSuccessCardProps {
  reservation: Reservation;
}

const ReservationSuccessCard: React.FC<ReservationSuccessCardProps> = ({ reservation }) => {
  const formattedDate = reservation.data.split('-').reverse().join('/');
  const formatTime = (time: string) => time.split(':').slice(0, 2).join(':');

  return (
    <div className="w-full bg-white rounded-[28px] border border-slate-100 shadow-xl overflow-hidden mt-2 animate-in zoom-in-95 duration-500">
      <div className="bg-emerald-500 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-[13px] font-bold uppercase tracking-wider">Reserva Confirmada</span>
        </div>
        <div className="text-white/60 text-[10px] font-black uppercase tracking-widest">Digital Ticket</div>
      </div>
      
      <div className="p-6 space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Sala Selecionada</span>
            <span className="text-[15px] font-bold text-slate-800">{reservation.sala}</span>
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
              <span className="text-[13px] font-semibold text-slate-700">{formatTime(reservation.inicio)} - {formatTime(reservation.fim)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <div className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center overflow-hidden bg-slate-50">
             <User className="w-5 h-5 text-slate-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Responsável</span>
            <span className="text-[13px] font-semibold text-slate-800">{reservation.nome}</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 px-6 py-4 flex items-center justify-center border-t border-dashed border-slate-200">
        <div className="flex items-center gap-2 text-emerald-600">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-[11px] font-black uppercase tracking-widest">RESERVA FINALIZADA</span>
        </div>
      </div>
    </div>
  );
};

export default ReservationSuccessCard;
