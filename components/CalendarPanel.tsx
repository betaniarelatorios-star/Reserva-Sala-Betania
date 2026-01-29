
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, Clock, Info } from 'lucide-react';

interface CalendarPanelProps {
  onClose: () => void;
  onSelect: (date: string, time: string) => void;
}

const CalendarPanel: React.FC<CalendarPanelProps> = ({ onClose, onSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null); // Start with no day selected
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null); // Start with no slot selected

  const BRAND_COLOR = "#01AAFF";
  const BRAND_COLOR_HOVER = "#0099EE"; // Slightly darker for hover
  const BRAND_COLOR_LIGHT_BG = BRAND_COLOR + '1A'; // 10% opacity
  const BRAND_COLOR_SHADOW = BRAND_COLOR + '4D'; // 30% opacity for shadow

  const DARK_BACKGROUND = "#1E1E1E"; // Main background
  const DARK_SURFACE = "#2C2C2C"; // For cards and containers
  const DARK_BORDER = "#3A3A3A"; // For subtle borders
  const LIGHT_TEXT = "#FAFAFA"; // Main text
  const MEDIUM_TEXT = "#A0A0A0"; // Secondary text
  const LIGHT_GRAY_BG = "#333333"; // Slightly lighter dark surface

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
      const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`;
      onSelect(formattedDate, selectedSlot.split(' ')[0]); // Pass only start time
    }
  };

  // Fix: Add useMemo to React import
  const currentMonthDays = useMemo(() => {
    const totalDays = daysInMonth(currentDate.getMonth(), currentDate.getFullYear());
    const firstDay = firstDayOfMonth(currentDate.getMonth(), currentDate.getFullYear());
    const daysArray = Array(firstDay).fill(null).concat(Array.from({ length: totalDays }, (_, i) => i + 1));
    return daysArray;
  }, [currentDate]);

  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`${DARK_SURFACE} w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-500`}>
        {/* Header */}
        <div className={`px-6 py-5 flex items-center justify-between border-b ${DARK_BORDER}`}>
          <button onClick={onClose} className={`p-2 hover:bg-[${LIGHT_GRAY_BG}] rounded-full transition-colors`}>
            <X className={`w-6 h-6 ${MEDIUM_TEXT}`} />
          </button>
          <h2 className={`font-bold ${LIGHT_TEXT} text-lg`}>Reserva de Sala</h2>
          {/* Placeholder vazio para manter o alinhamento */}
          <div className="w-10 h-10"></div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          {/* Calendar Card */}
          <div className={`${DARK_BACKGROUND} border ${DARK_BORDER} rounded-3xl p-6 shadow-sm`}>
            <div className="flex items-center justify-between mb-8">
              <button onClick={goToPreviousMonth} className={`p-1 ${MEDIUM_TEXT} hover:text-slate-200`}>
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className={`font-bold ${LIGHT_TEXT}`}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button onClick={goToNextMonth} className={`p-1 ${MEDIUM_TEXT} hover:text-slate-200`}>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-y-4 text-center">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                <div key={i} className={`text-[10px] font-bold ${MEDIUM_TEXT} mb-2`}>{d}</div>
              ))}
              
              {currentMonthDays.map((day, i) => {
                const isSelected = selectedDay === day;
                const today = new Date();
                const isPastDay = day !== null && new Date(currentDate.getFullYear(), currentDate.getMonth(), day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

                return (
                  <div key={i} className="flex justify-center">
                    {day !== null ? (
                      <button 
                        onClick={() => !isPastDay && setSelectedDay(day)}
                        className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                          isSelected 
                            ? `text-white shadow-lg` 
                            : isPastDay
                              ? `${MEDIUM_TEXT} cursor-not-allowed opacity-60`
                              : `${LIGHT_TEXT} hover:bg-[${LIGHT_GRAY_BG}]`
                        }`}
                        style={{ backgroundColor: isSelected ? BRAND_COLOR : undefined, boxShadow: isSelected ? `0 4px 14px ${BRAND_COLOR_SHADOW}` : undefined }}
                        disabled={isPastDay}
                      >
                        {day}
                      </button>
                    ) : (
                      <div />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Slots List */}
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <h4 className={`font-bold ${LIGHT_TEXT} text-lg`}>Horários Disponíveis</h4>
              <p className={`${MEDIUM_TEXT} text-sm`}>
                {selectedDay ? new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Selecione uma data'}
              </p>
            </div>

            <div className="space-y-3">
              {slots.map((slot, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    slot.available ? `${DARK_BACKGROUND} ${DARK_BORDER}` : `${DARK_SURFACE} border-transparent opacity-60`
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl`} style={{ backgroundColor: slot.available ? BRAND_COLOR_LIGHT_BG : LIGHT_GRAY_BG }}>
                      <Clock className={`w-5 h-5`} style={{ color: slot.available ? BRAND_COLOR : MEDIUM_TEXT }} />
                    </div>
                    <div>
                      <div className={` ${LIGHT_TEXT} font-bold`}>{slot.time}</div>
                      <div className={`text-[12px] flex items-center gap-1`} style={{ color: slot.available ? BRAND_COLOR : '#EF4444' }}>
                        <span className={`w-1.5 h-1.5 rounded-full`} style={{ backgroundColor: slot.available ? BRAND_COLOR : '#EF4444' }}></span>
                        {slot.status}
                      </div>
                    </div>
                  </div>
                  
                  {slot.available ? (
                    <button 
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`w-12 h-6 rounded-full relative transition-colors ${selectedSlot === slot.time ? `bg-[${BRAND_COLOR}]` : `bg-[${DARK_BORDER}]`}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 ${DARK_SURFACE} rounded-full transition-all ${selectedSlot === slot.time ? 'right-1' : 'left-1'}`} />
                    </button>
                  ) : (
                    <span className={`text-[10px] font-bold ${MEDIUM_TEXT} uppercase tracking-widest`}>INDISPONÍVEL</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className={`p-6 ${DARK_SURFACE} border-t ${DARK_BORDER}`}>
          <button 
            onClick={handleConfirm}
            disabled={!selectedDay || !selectedSlot}
            className={`w-full text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg disabled:bg-[${DARK_BORDER}] disabled:shadow-none disabled:text-[${MEDIUM_TEXT}]`}
            style={{ backgroundColor: (!selectedDay || !selectedSlot) ? undefined : BRAND_COLOR, boxShadow: (!selectedDay || !selectedSlot) ? undefined : `0 4px 14px ${BRAND_COLOR_SHADOW}` }}
          >
            Confirmar Data <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarPanel;
