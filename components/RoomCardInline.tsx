
import React from 'react';
import { Users, Layout } from 'lucide-react';
import { Room } from '../types';

interface RoomCardInlineProps {
  room: Room;
  onSelect: (room: Room) => void;
}

const RoomCardInline: React.FC<RoomCardInlineProps> = ({ room, onSelect }) => {
  return (
    <div 
      className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 flex gap-4 my-3 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden" 
      onClick={() => onSelect(room)}
    >
      {/* Left Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-blue-50/50" style={{ color: room.iconColor }}>
              <Users className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 text-[15px] tracking-tight">{room.name}</h3>
          </div>
          <p className="text-[12px] text-slate-400 leading-relaxed pr-2">
            {room.description}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {room.tags?.map(tag => (
            <span key={tag} className="px-2.5 py-1 bg-slate-50 text-slate-400 text-[9px] font-bold rounded-lg border border-slate-100 uppercase tracking-tight">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Right Content: Image & Action */}
      <div className="w-[100px] flex flex-shrink-0 flex-col gap-3">
        <div className="h-[80px] rounded-2xl overflow-hidden shadow-sm bg-slate-50 border border-slate-100">
          <img 
            src={room.image} 
            alt={room.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        </div>
        <button 
          className="w-full bg-[#00E5D1] hover:bg-[#00D1BD] text-slate-800 font-bold py-2 rounded-xl text-[11px] transition-all shadow-sm active:scale-95"
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
