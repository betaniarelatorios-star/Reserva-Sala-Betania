
import React from 'react';
import { Users, ChevronRight } from 'lucide-react';
import { Room } from '../types';

interface RoomCardInlineProps {
  room: Room;
  onSelect: (room: Room) => void;
}

const RoomCardInline: React.FC<RoomCardInlineProps> = ({ room, onSelect }) => {
  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-200 flex gap-3 my-1 hover:border-slate-300 transition-all cursor-pointer group" onClick={() => onSelect(room)}>
      <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100">
        <img src={room.image} alt={room.name} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all" />
      </div>

      <div className="flex-1 flex flex-col justify-between py-0.5">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-[13px] leading-tight">{room.name}</h3>
            <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
              <Users className="w-3 h-3" /> {room.capacity}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {room.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-1">
            {room.tags?.slice(0, 2).map(tag => (
              <span key={tag} className="px-1.5 py-0.5 bg-slate-50 text-slate-400 text-[8px] font-bold rounded border border-slate-100 uppercase tracking-tighter">
                {tag}
              </span>
            ))}
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default RoomCardInline;
