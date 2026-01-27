
import { SUPABASE_URL, SUPABASE_KEY, ROOMS } from "../constants";
import { Reservation, Room } from "../types";

export class ReservationService {
  private static async fetchSupabase(method: string, endpoint: string, body?: any) {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': method === 'POST' ? 'return=representation' : ''
    };
    
    const response = await fetch(url, { 
      method, 
      headers: headers as any, 
      body: body ? JSON.stringify(body) : undefined 
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Supabase Error:", errorText);
      throw new Error("Falha na comunicação com o banco de dados.");
    }
    
    const text = await response.text();
    return text ? JSON.parse(text) : [];
  }

  static async checkAvailability(roomName: string, date: string, start: string, end: string): Promise<boolean> {
    const query = `reservas?sala=eq.${encodeURIComponent(roomName)}&data=eq.${date}`;
    const existing: Reservation[] = await this.fetchSupabase('GET', query);

    const isOverlapping = existing.some(res => {
      return (start < res.fim && end > res.inicio);
    });

    return !isOverlapping;
  }

  static async getAvailableRooms(date: string, start: string, end: string): Promise<Room[]> {
    // Busca todas as reservas do dia
    const query = `reservas?data=eq.${date}`;
    const allReservations: Reservation[] = await this.fetchSupabase('GET', query);

    // Filtra as salas que NÃO têm sobreposição no horário solicitado
    return ROOMS.filter(room => {
      const roomReservations = allReservations.filter(res => res.sala === room.name);
      const hasOverlap = roomReservations.some(res => (start < res.fim && end > res.inicio));
      return !hasOverlap;
    });
  }

  static async createReservation(reservation: Reservation): Promise<Reservation> {
    const result = await this.fetchSupabase('POST', 'reservas', reservation);
    return result[0];
  }
}
