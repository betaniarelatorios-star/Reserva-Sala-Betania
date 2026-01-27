
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Clock, Info } from 'lucide-react';

interface CalendarPanelProps {
  onClose: () => void;
  onSelect: (date: string, time: string) => void;
}

const CalendarPanel: React.FC<CalendarPanelProps> = ({ onClose, onSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(5);
  const [selectedSlot, setSelectedSlot] = useState<string | null>("09:00 - 10:00");

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  
  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const slots = [
    { time: "09:00 - 10:00", status: "Livre", available: true },
    { time: "10:00 - 11:00", status: "Livre", available: true },
    { time: "11:00 - 12:00", status: "Ocupado", available: false },
    { time: "14:00 - 15:00", status: "Livre", available: true },
  ];

  const handleConfirm = () => {
    if (selectedDay && selectedSlot) {
      const formattedDate = `${selectedDay}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
      onSelect(formattedDate, selectedSlot);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-50">
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
          <h2 className="font-bold text-slate-800 text-lg">Reserva de Sala</h2>
          <button className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <Info className="w-5 h-5 text-slate-800" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          {/* Calendar Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <button className="p-1 text-slate-400 hover:text-slate-600">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="font-bold text-slate-800">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button className="p-1 text-slate-400 hover:text-slate-600">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-y-4 text-center">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                <div key={i} className="text-[10px] font-bold text-[#20B2AA] mb-2">{d}</div>
              ))}
              
              {/* Fill empty spaces before first day */}
              {Array.from({ length: firstDayOfMonth(currentDate.getMonth(), currentDate.getFullYear()) }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {Array.from({ length: daysInMonth(currentDate.getMonth(), currentDate.getFullYear()) }).map((_, i) => {
                const day = i + 1;
                const isSelected = selectedDay === day;
                return (
                  <div key={day} className="flex justify-center">
                    <button 
                      onClick={() => setSelectedDay(day)}
                      className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                        isSelected 
                          ? 'bg-[#00E5D1] text-white shadow-lg shadow-[#00E5D1]/30' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {day}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Slots List */}
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <h4 className="font-bold text-slate-800 text-lg">Horários Disponíveis</h4>
              <p className="text-slate-400 text-sm">Quinta-feira, {selectedDay} de Outubro</p>
            </div>

            <div className="space-y-3">
              {slots.map((slot, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    slot.available ? 'bg-white border-slate-100' : 'bg-slate-50 border-transparent opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl ${slot.available ? 'bg-[#E0FBF9]' : 'bg-slate-100'}`}>
                      <Clock className={`w-5 h-5 ${slot.available ? 'text-[#00BCD4]' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <div className="text-slate-800 font-bold">{slot.time}</div>
                      <div className={`text-[12px] flex items-center gap-1 ${slot.available ? 'text-[#00BCD4]' : 'text-red-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${slot.available ? 'bg-[#00BCD4]' : 'bg-red-400'}`}></span>
                        {slot.status}
                      </div>
                    </div>
                  </div>
                  
                  {slot.available ? (
                    <button 
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`w-12 h-6 rounded-full relative transition-colors ${selectedSlot === slot.time ? 'bg-[#00E5D1]' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${selectedSlot === slot.time ? 'right-1' : 'left-1'}`} />
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">INDISPONÍVEL</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-6 bg-white border-t border-slate-50">
          <button 
            onClick={handleConfirm}
            className="w-full bg-[#00E5D1] hover:bg-[#00CDBB] text-slate-800 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-[#00E5D1]/20"
          >
            Confirmar Data <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarPanel;
