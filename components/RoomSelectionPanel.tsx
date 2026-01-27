
import React, { useState } from 'react';
import { ChevronLeft, X, Search, Users } from 'lucide-react';
import { ROOMS } from '../constants';
import { Room } from '../types';

interface RoomSelectionPanelProps {
  onClose: () => void;
  onSelect: (room: Room) => void;
}

const RoomSelectionPanel: React.FC<RoomSelectionPanelProps> = ({ onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRooms = ROOMS.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    room.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300 p-4">
      <div className="bg-white w-full max-w-md h-[85vh] rounded-[24px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-1 hover:bg-slate-50 rounded-lg transition-colors">
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </button>
            <h2 className="font-bold text-slate-800 text-base">Nossas Salas</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-50 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pt-5 pb-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou características..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-[13px] focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-300 transition-all"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-hide">
          {filteredRooms.map((room) => (
            <div 
              key={room.id} 
              onClick={() => onSelect(room)}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:border-slate-300 transition-all cursor-pointer group"
            >
              <div className="flex gap-4">
                <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100">
                  <img src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-slate-800 text-[14px]">{room.name}</h3>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                        <Users className="w-3 h-3" /> {room.capacity}
                      </div>
                    </div>
                    <p className="text-[12px] text-slate-500 line-clamp-2 leading-relaxed">
                      {room.description}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {room.tags?.map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 bg-slate-50 text-slate-400 text-[9px] font-bold rounded border border-slate-100 uppercase tracking-tighter">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button className="mt-4 w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">
                Reservar esta Sala
              </button>
            </div>
          ))}
          {filteredRooms.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                <Search className="w-6 h-6 text-slate-200" />
              </div>
              <p className="text-slate-400 text-sm font-medium">Nenhuma sala encontrada</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">Toque em uma sala para iniciar o processo</p>
        </div>
      </div>
    </div>
  );
};

export default RoomSelectionPanel;
