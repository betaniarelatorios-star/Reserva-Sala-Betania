

import React from 'react';
import { Calendar, User, Building2, Clock } from 'lucide-react';
import { ReservationData } from '../types.ts';

interface ReservationCardProps {
  data: ReservationData;
  onConfirm?: () => void;
  onEdit?: () => void;
  isConfirmed?: boolean;
}

const ReservationCard: React.FC<ReservationCardProps> = ({ data, onConfirm, onEdit, isConfirmed }) => {
  const BRAND_COLOR = "#01AAFF";
  const BRAND_COLOR_HOVER = "#0099EE"; // Slightly darker for hover
  const BRAND_COLOR_LIGHT_BG = BRAND_COLOR + '1A'; // 10% opacity
  const DARK_SURFACE = "#2C2C2C"; // For cards and containers
  const DARK_BORDER = "#3A3A3A"; // For subtle borders
  const LIGHT_TEXT = "#FAFAFA"; // Main text
  const MEDIUM_TEXT = "#A0A0A0"; // Secondary text
  const LIGHT_GRAY_BG = "#333333"; // Slightly lighter dark surface

  return (
    <div className={`w-full ${DARK_SURFACE} rounded-[24px] shadow-lg border ${DARK_BORDER} overflow-hidden mt-2`}>
      <div className="px-6 pt-6 pb-2 flex items-center gap-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: BRAND_COLOR_LIGHT_BG }}>
          <Calendar className="w-4 h-4" style={{ color: BRAND_COLOR }} />
        </div>
        <h3 className={`font-bold uppercase tracking-wider text-[10px]`} style={{ color: BRAND_COLOR }}>Resumo do Agendamento</h3>
      </div>
      
      <div className="px-6 py-4 space-y-4">
        <div className="flex items-center gap-3">
          <User className={`w-4 h-4 ${MEDIUM_TEXT}`} />
          <div className={`flex-1 flex justify-between border-b ${DARK_BORDER} pb-1`}>
            <span className={`${MEDIUM_TEXT} text-[12px]`}>Responsável</span>
            <span className={`${LIGHT_TEXT} font-semibold text-[13px]`}>{data.userName}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Building2 className={`w-4 h-4 ${MEDIUM_TEXT}`} />
          <div className={`flex-1 flex justify-between border-b ${DARK_BORDER} pb-1`}>
            <span className={`${MEDIUM_TEXT} text-[12px]`}>Sala</span>
            <span className={`${LIGHT_TEXT} font-semibold text-[13px]`}>{data.roomName}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-1">
          <div className="space-y-1">
            <span className={`${MEDIUM_TEXT} uppercase text-[9px] font-bold`}>Início</span>
            <div className={`${LIGHT_TEXT} font-bold text-lg`}>{data.startTime}</div>
          </div>
          <div className={`space-y-1 border-l ${DARK_BORDER} pl-4`}>
            <span className={`${MEDIUM_TEXT} uppercase text-[9px] font-bold`}>Término</span>
            <div className={`${LIGHT_TEXT} font-bold text-lg`}>{data.endTime}</div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 pt-2">
        {!isConfirmed && (
          <div className="flex flex-col gap-2">
            {/* Fix: Removed invalid inline hover style. Hover effects should be handled by CSS classes or external stylesheets. */}
            <button 
              onClick={onConfirm}
              className="w-full text-white font-bold py-3 rounded-xl transition-all text-sm"
              style={{ backgroundColor: BRAND_COLOR }}
            >
              Confirmar Reserva
            </button>
            <button 
              onClick={onEdit}
              className={`w-full ${MEDIUM_TEXT} text-[10px] font-bold uppercase tracking-widest hover:text-slate-200 transition-colors py-1`}
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