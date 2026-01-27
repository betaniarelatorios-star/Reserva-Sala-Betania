
import React from 'react';
import { Users } from 'lucide-react';
import { Room } from '../types.ts';

interface RoomCardInlineProps {
  room: Room;
  onSelect: (room: Room) => void;
}

const RoomCardInline: React.FC<RoomCardInlineProps> = ({ room, onSelect }) => {
  return (
    <div 
      className="bg-white rounded-2xl p-3 shadow-sm border border-slate-50 flex gap-3 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden active:scale-[0.99]" 
      onClick={() => onSelect(room)}
    >
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-slate-50" style={{ color: room.iconColor }}>
              <Users className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-bold text-slate-800 text-[14px] tracking-tight truncate">{room.name}</h3>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug line-clamp-2 pr-1">
            {room.description}
          </p>
        </div>
      </div>

      <div className="w-[80px] flex flex-shrink-0 flex-col gap-2">
        <div className="h-[64px] rounded-xl overflow-hidden shadow-sm bg-slate-50 border border-slate-100">
          <img 
            src={room.image} 
            alt={room.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        </div>
        <button 
          className="w-full bg-[#00E5D1] hover:bg-[#00D1BD] text-slate-800 font-bold py-1.5 rounded-lg text-[10px] transition-all shadow-sm active:scale-95"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(room);
          }}
        >
          Selecionar
        </button>
      </div>
    </div>
  );
};

export default RoomCardInline;
