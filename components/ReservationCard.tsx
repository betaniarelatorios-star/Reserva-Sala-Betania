
import React from 'react';
import { Calendar, User, Building2, Clock, LogOut } from 'lucide-react';
import { ReservationData } from '../types';

interface ReservationCardProps {
  data: ReservationData;
  onConfirm?: () => void;
  onEdit?: () => void;
  isConfirmed?: boolean;
}

const ReservationCard: React.FC<ReservationCardProps> = ({ data, onConfirm, onEdit, isConfirmed }) => {
  return (
    <div className="w-full bg-white rounded-[24px] shadow-lg border border-slate-100 overflow-hidden mt-2">
      <div className="px-6 pt-6 pb-2 flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Calendar className="w-4 h-4 text-blue-500" />
        </div>
        <h3 className="text-blue-500 font-bold uppercase tracking-wider text-[10px]">Resumo do Agendamento</h3>
      </div>
      
      <div className="px-6 py-4 space-y-4">
        <div className="flex items-center gap-3">
          <User className="w-4 h-4 text-slate-300" />
          <div className="flex-1 flex justify-between border-b border-slate-50 pb-1">
            <span className="text-slate-400 text-[12px]">Responsável</span>
            <span className="text-slate-700 font-semibold text-[13px]">{data.userName}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Building2 className="w-4 h-4 text-slate-300" />
          <div className="flex-1 flex justify-between border-b border-slate-50 pb-1">
            <span className="text-slate-400 text-[12px]">Sala</span>
            <span className="text-slate-700 font-semibold text-[13px]">{data.roomName}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-1">
          <div className="space-y-1">
            <span className="text-slate-400 uppercase text-[9px] font-bold">Início</span>
            <div className="text-slate-800 font-bold text-lg">{data.startTime}</div>
          </div>
          <div className="space-y-1 border-l border-slate-100 pl-4">
            <span className="text-slate-400 uppercase text-[9px] font-bold">Término</span>
            <div className="text-slate-800 font-bold text-lg">{data.endTime}</div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 pt-2">
        {!isConfirmed && (
          <div className="flex flex-col gap-2">
            <button 
              onClick={onConfirm}
              className="w-full bg-[#00BCD4] hover:bg-[#00ACC1] text-white font-bold py-3 rounded-xl transition-all text-sm"
            >
              Confirmar Reserva
            </button>
            <button 
              onClick={onEdit}
              className="w-full text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-slate-600 transition-colors py-1"
            >
              Alterar Dados
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationCard;
