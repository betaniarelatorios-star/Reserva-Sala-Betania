
import { SUPABASE_URL, SUPABASE_KEY, ROOMS } from "../constants.ts";
import { Reservation, Room } from "../types.ts";

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

  static async checkAvailability(roomName: string, date: string, start: string, end: string): Promise<Reservation | null> {
    const query = `reservas?sala=eq.${encodeURIComponent(roomName)}&data=eq.${date}`;
    const existing: Reservation[] = await this.fetchSupabase('GET', query);

    const conflict = existing.find(res => {
      return (start < res.fim && end > res.inicio);
    });

    return conflict || null;
  }

  static async getAvailableRooms(date: string, start: string, end: string): Promise<Room[]> {
    const query = `reservas?data=eq.${date}`;
    const allReservations: Reservation[] = await this.fetchSupabase('GET', query);

    return ROOMS.filter(room => {
      const roomReservations = allReservations.filter(res => res.sala === room.name);
      const hasOverlap = roomReservations.some(res => (start < res.fim && end > res.inicio));
      return !hasOverlap;
    });
  }

  static async createReservation(reservation: Reservation): Promise<Reservation> {
    // 1. Cria a reserva
    const created = await this.fetchSupabase('POST', 'reservas', reservation);
    const newId = created[0]?.id;

    // 2. Se tiver ID, busca novamente para garantir que pegamos campos gerados (como link_agenda)
    if (newId) {
      // Pequeno delay para garantir que triggers de banco tenham processado
      await new Promise(resolve => setTimeout(resolve, 500));
      const query = `reservas?id=eq.${newId}`;
      const freshData = await this.fetchSupabase('GET', query);
      return freshData[0] || created[0];
    }

    return created[0];
  }
}
