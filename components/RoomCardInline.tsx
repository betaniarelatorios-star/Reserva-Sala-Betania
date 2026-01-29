
import React from 'react';
import { Users } from 'lucide-react';
import { Room } from '../types.ts';

interface RoomCardInlineProps {
  room: Room;
  onSelect: (room: Room) => void;
}

const RoomCardInline: React.FC<RoomCardInlineProps> = ({ room, onSelect }) => {
  const BRAND_COLOR = "#01AAFF";
  const DARK_SURFACE = "#2A2A2A"; 
  const DARK_BORDER = "#404040"; 
  const LIGHT_TEXT = "#FFFFFF"; 
  const MEDIUM_TEXT = "#B0B0B0"; 
  const LIGHT_GRAY_BG = "#333333"; 
  
  return (
    <div 
      className={`${DARK_SURFACE} rounded-2xl p-3 shadow-xl border ${DARK_BORDER} flex gap-3 hover:border-[${BRAND_COLOR}] transition-all cursor-pointer active:scale-[0.99]`} 
      onClick={() => onSelect(room)}
    >
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded-md ${LIGHT_GRAY_BG}`} style={{ color: room.iconColor }}>
              <Users className="w-3.5 h-3.5" />
            </div>
            <h3 className={`font-bold ${LIGHT_TEXT} text-[14px] truncate`}>{room.name}</h3>
          </div>
          <p className={`${MEDIUM_TEXT} text-[11px] leading-snug line-clamp-2`}>
            {room.description}
          </p>
        </div>
      </div>

      <div className="w-[80px] flex flex-shrink-0 flex-col gap-2">
        <div className={`h-[60px] rounded-xl overflow-hidden bg-black/20 border ${DARK_BORDER}`}>
          <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
        </div>
        <button 
          className="w-full text-white font-black py-1.5 rounded-lg text-[9px] uppercase tracking-tighter"
          style={{ backgroundColor: BRAND_COLOR }}
        >
          Reserva
        </button>
      </div>
    </div>
  );
};

export default RoomCardInline;
