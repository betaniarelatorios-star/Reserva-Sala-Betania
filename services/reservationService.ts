
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
    
    console.log(`[Supabase Service] Requisição: ${method} ${url}`);
    if (body) {
      console.log("[Supabase Service] Body:", body);
    }

    const response = await fetch(url, { 
      method, 
      headers: headers as any, 
      body: body ? JSON.stringify(body) : undefined 
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Supabase Service] Erro na Resposta (${response.status} ${response.statusText}):`, errorText);
      throw new Error(`Falha na comunicação com o banco de dados: ${errorText || response.statusText}`);
    }
    
    const text = await response.text();
    const data = text ? JSON.parse(text) : [];
    console.log(`[Supabase Service] Resposta Sucesso (${response.status}):`, data);
    return data;
  }

  // Fix: Added getRooms static method to return the list of rooms
  static async getRooms(): Promise<Room[]> {
    return ROOMS;
  }

  static async getReservationsByRoomAndDate(roomName: string, date: string): Promise<Reservation[]> {
    const query = `reservas?sala=eq.${encodeURIComponent(roomName)}&data=eq.${date}`;
    const reservations: Reservation[] = await this.fetchSupabase('GET', query);
    return reservations;
  }

  static async checkAvailability(roomName: string, date: string, start: string, end: string): Promise<Reservation | null> {
    const query = `reservas?sala=eq.${encodeURIComponent(roomName)}&data=eq.${date}`;
    const existing: Reservation[] = await this.fetchSupabase('GET', query);

    const conflict = existing.find(res => {
      // Convert times to Date objects for easier comparison (ignoring date part, only time matters here)
      const resStart = new Date(`2000-01-01T${res.inicio}:00`);
      const resEnd = new Date(`2000-01-01T${res.fim}:00`);
      const checkStart = new Date(`2000-01-01T${start}:00`);
      const checkEnd = new Date(`2000-01-01T${end}:00`);

      // Check for overlap: [resStart, resEnd) vs [checkStart, checkEnd)
      // Overlap exists if (checkStart < resEnd && checkEnd > resStart)
      return checkStart.getTime() < resEnd.getTime() && checkEnd.getTime() > resStart.getTime();
    });

    return conflict || null;
  }

  static async getAvailableRooms(date: string, start: string, end: string): Promise<Room[]> {
    const query = `reservas?data=eq.${date}`;
    const allReservations: Reservation[] = await this.fetchSupabase('GET', query);

    return ROOMS.filter(room => {
      const roomReservations = allReservations.filter(res => res.sala === room.name);
      
      const hasOverlap = roomReservations.some(res => {
        const resStart = new Date(`2000-01-01T${res.inicio}:00`);
        const resEnd = new Date(`2000-01-01T${res.fim}:00`);
        const checkStart = new Date(`2000-01-01T${start}:00`);
        const checkEnd = new Date(`2000-01-01T${end}:00`);
        return checkStart.getTime() < resEnd.getTime() && checkEnd.getTime() > resStart.getTime();
      });
      return !hasOverlap;
    });
  }

  static async createReservation(reservation: Reservation): Promise<Reservation> {
    // 1. Cria a reserva no banco
    const created = await this.fetchSupabase('POST', 'reservas', reservation);
    const newId = created[0]?.id;

    // 2. Busca novamente com um delay maior para capturar o link_agenda gerado por triggers
    if (newId) {
      // Aumentado para 1.5 segundos para garantir que o processo de backend termine
      await new Promise(resolve => setTimeout(resolve, 1500));
      const query = `reservas?id=eq.${newId}`;
      const freshData = await this.fetchSupabase('GET', query);
      
      console.log("Dados atualizados da reserva:", freshData[0]); // Para depuração no console
      return freshData[0] || created[0];
    }

    return created[0];
  }
}