
import React, { useState } from 'react';
import { ChevronLeft, X, Search, Zap } from 'lucide-react';
import { ROOMS } from '../constants.ts';
import { Room } from '../types.ts';
import RoomCardInline from './RoomCardInline.tsx';

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
      <div className="bg-white w-full max-w-md h-[90vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
        
        <div className="px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h2 className="font-bold text-slate-800 text-lg tracking-tight">Salas Disponíveis</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        <div className="px-6 mb-2">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar sala..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-[14px] focus:outline-none focus:ring-4 focus:ring-slate-100 focus:bg-white focus:border-slate-200 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-1 scrollbar-hide">
          {filteredRooms.map((room) => (
            <RoomCardInline key={room.id} room={room} onSelect={onSelect} />
          ))}
          
          {filteredRooms.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-100" />
              </div>
              <p className="text-slate-400 text-sm font-semibold">Nenhuma sala encontrada</p>
            </div>
          )}
        </div>

        <div className="p-5 bg-white border-t border-slate-50">
          <div className="flex items-center justify-between px-2">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Reserva Rápida</span>
              <p className="text-[11px] text-slate-600 font-medium">Toque em 'Selecionar' para continuar</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#E0FBF9] flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#00E5D1]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomSelectionPanel;
