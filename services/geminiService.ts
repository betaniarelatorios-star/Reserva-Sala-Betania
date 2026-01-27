
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { ReservationService } from "./reservationService";

export class ChatService {
  private ai: GoogleGenAI;

  constructor() {
    // Usando a chave injetada via environment conforme diretrizes
    this.ai = new GoogleGenAI({ apiKey: (process.env.API_KEY as string) });
  }

  private checkAvailabilityTool: FunctionDeclaration = {
    name: "verificar_disponibilidade",
    parameters: {
      type: Type.OBJECT,
      description: "Verifica se uma sala específica está disponível em uma data e horário.",
      properties: {
        sala: { type: Type.STRING, description: "Nome da sala" },
        data: { type: Type.STRING, description: "Data no formato YYYY-MM-DD" },
        inicio: { type: Type.STRING, description: "Horário de início HH:mm" },
        fim: { type: Type.STRING, description: "Horário de término HH:mm" },
      },
      required: ["sala", "data", "inicio", "fim"],
    },
  };

  async sendMessage(message: string): Promise<any> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: message }] }],
        config: {
          systemInstruction: SYSTEM_PROMPT,
          tools: [{ functionDeclarations: [this.checkAvailabilityTool] }],
        },
      });

      // Se o modelo quiser chamar uma função para consultar o banco
      if (response.functionCalls) {
        for (const fc of response.functionCalls) {
          if (fc.name === "verificar_disponibilidade") {
            const { sala, data, inicio, fim } = fc.args as any;
            const isAvailable = await ReservationService.checkAvailability(sala, data, inicio, fim);
            
            // Retorna o resultado para o modelo processar a resposta final
            const secondResponse = await this.ai.models.generateContent({
              model: "gemini-3-flash-preview",
              contents: [
                { role: "user", parts: [{ text: message }] },
                { role: "model", parts: [
                  { functionCall: { name: fc.name, args: fc.args, id: fc.id } }
                ]},
                { role: "user", parts: [
                  { functionResponse: { name: fc.name, id: fc.id, response: { disponivel: isAvailable } } }
                ]}
              ],
              config: { systemInstruction: SYSTEM_PROMPT }
            });
            return { text: secondResponse.text };
          }
        }
      }

      return { text: response.text };
    } catch (error) {
      console.error("Erro na IA:", error);
      return { text: "Desculpe, tive um problema ao processar sua solicitação. Pode repetir?" };
    }
  }
}
