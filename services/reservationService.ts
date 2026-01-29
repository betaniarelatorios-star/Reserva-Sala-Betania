
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
    
    console.log(`[Supabase Service] ${method} ${url}`);

    const response = await fetch(url, { 
      method, 
      headers: headers as any, 
      body: body ? JSON.stringify(body) : undefined 
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Supabase Service] Erro:`, errorText);
      throw new Error(`Erro no banco: ${errorText}`);
    }
    
    const text = await response.text();
    return text ? JSON.parse(text) : [];
  }

  static async getRooms(): Promise<Room[]> {
    return ROOMS;
  }

  static async getAvailableRooms(date: string, start: string, end: string): Promise<Room[]> {
    const allRooms = await this.getRooms();
    const availableRooms: Room[] = [];
    
    for (const room of allRooms) {
      const conflict = await this.checkAvailability(room.id, date, start, end);
      if (!conflict) {
        availableRooms.push(room);
      }
    }
    
    return availableRooms;
  }

  static async getReservationById(id: string | number): Promise<Reservation | null> {
    const query = `reservas?id=eq.${id}&select=*`;
    const result: Reservation[] = await this.fetchSupabase('GET', query);
    return result.length > 0 ? result[0] : null;
  }

  static async getReservationsByRoomAndDate(roomId: string, date: string): Promise<Reservation[]> {
    const query = `reservas?sala=eq.${encodeURIComponent(roomId)}&data=eq.${date}`;
    const reservations: Reservation[] = await this.fetchSupabase('GET', query);
    return reservations;
  }

  static async checkAvailability(roomId: string, date: string, start: string, end: string): Promise<Reservation | null> {
    const query = `reservas?sala=eq.${encodeURIComponent(roomId)}&data=eq.${date}`;
    const existing: Reservation[] = await this.fetchSupabase('GET', query);

    const conflict = existing.find(res => {
      const resStart = new Date(`2000-01-01T${res.inicio}`);
      const resEnd = new Date(`2000-01-01T${res.fim}`);
      const checkStart = new Date(`2000-01-01T${start}:00`);
      const checkEnd = new Date(`2000-01-01T${end}:00`);
      return checkStart.getTime() <= resEnd.getTime() && checkEnd.getTime() > resStart.getTime();
    });

    return conflict || null;
  }

  static async createReservation(reservation: Reservation): Promise<Reservation> {
    const created = await this.fetchSupabase('POST', 'reservas', reservation);
    return created[0];
  }
}
