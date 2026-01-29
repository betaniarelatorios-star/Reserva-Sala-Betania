

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

  const BRAND_COLOR = "#01AAFF";
  const BRAND_COLOR_LIGHT_BG = BRAND_COLOR + '1A'; // 10% opacity
  const BRAND_COLOR_HIGHLIGHT = BRAND_COLOR;

  const DARK_BACKGROUND = "#1E1E1E"; // Main background
  const DARK_SURFACE = "#2C2C2C"; // For cards and containers
  const DARK_BORDER = "#3A3A3A"; // For subtle borders
  const LIGHT_TEXT = "#FAFAFA"; // Main text
  const MEDIUM_TEXT = "#A0A0A0"; // Secondary text
  const LIGHT_GRAY_BG = "#333333"; // Slightly lighter dark surface


  const filteredRooms = ROOMS.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    room.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 p-4">
      <div className={`${DARK_SURFACE} w-full max-w-md h-[90vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20`}>
        
        <div className="px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className={`p-2 hover:bg-[${LIGHT_GRAY_BG}] rounded-xl transition-colors`}>
              <ChevronLeft className={`w-5 h-5 ${MEDIUM_TEXT}`} />
            </button>
            <h2 className={`font-bold ${LIGHT_TEXT} text-lg tracking-tight`}>Salas Disponíveis</h2>
          </div>
          <button onClick={onClose} className={`p-2 hover:bg-[${LIGHT_GRAY_BG}] rounded-xl transition-colors`}>
            <X className={`w-5 h-5 ${MEDIUM_TEXT}`} />
          </button>
        </div>

        <div className="px-6 mb-2">
          <div className="relative group">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${MEDIUM_TEXT} group-focus-within:text-slate-200 transition-colors`} />
            <input 
              type="text" 
              placeholder="Buscar sala..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${DARK_BACKGROUND} border ${DARK_BORDER} rounded-2xl py-3.5 pl-11 pr-4 text-[14px] focus:outline-none focus:ring-4 focus:ring-[${DARK_BORDER}] focus:bg-[${DARK_SURFACE}] focus:border-[${LIGHT_GRAY_BG}] transition-all ${LIGHT_TEXT} placeholder:text-slate-500`}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-1 scrollbar-hide">
          {filteredRooms.map((room) => (
            <RoomCardInline key={room.id} room={room} onSelect={onSelect} />
          ))}
          
          {filteredRooms.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className={`w-16 h-16 ${DARK_BACKGROUND} rounded-full flex items-center justify-center mb-4`}>
                <Search className={`w-8 h-8 ${DARK_BORDER}`} />
              </div>
              <p className={`${MEDIUM_TEXT} text-sm font-semibold`}>Nenhuma sala encontrada</p>
            </div>
          )}
        </div>

        <div className={`p-5 ${DARK_SURFACE} border-t ${DARK_BORDER}`}>
          <div className="flex items-center justify-between px-2">
            <div className="flex flex-col">
              <span className={`text-[9px] font-black ${MEDIUM_TEXT} uppercase tracking-widest`}>Reserva Rápida</span>
              <p className={`text-[11px] ${MEDIUM_TEXT} font-medium`}>Toque em 'Selecionar' para continuar</p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center`} style={{ backgroundColor: BRAND_COLOR_LIGHT_BG }}>
              <Zap className="w-5 h-5" style={{ color: BRAND_COLOR_HIGHLIGHT }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomSelectionPanel;
