
export interface Room {
  id: string;
  name: string;
  capacity: number;
  description: string;
  longDescription?: string;
  image?: string;
  tags?: string[];
  iconColor?: string;
}

export interface Reservation {
  id?: string;
  nome: string;      // antigo user_name
  sala: string;      // antigo room_name
  data: string;      // YYYY-MM-DD
  inicio: string;    // HH:mm
  fim: string;       // HH:mm
  descricao: string; // antigo purpose
}

export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  status?: 'sending' | 'error' | 'success';
  type?: 'text' | 'summary' | 'status' | 'reservation_form';
  payload?: any;
}

export interface ReservationData {
  userName: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose?: string;
}
