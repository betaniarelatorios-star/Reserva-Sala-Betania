
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants.ts";
import { ReservationService } from "./reservationService.ts";

export class ChatService {
  private ai: GoogleGenAI;

  constructor() {
    // Fix: Using correct named parameter for initialization with process.env.API_KEY
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  private checkAvailabilityTool: FunctionDeclaration = {
    name: "verificar_disponibilidade",
    parameters: {
      type: Type.OBJECT,
      description: "Verifica se uma sala específica está disponível em uma data e horário consultando o banco de dados.",
      properties: {
        sala: { type: Type.STRING, description: "Nome exato da sala" },
        data: { type: Type.STRING, description: "Data no formato YYYY-MM-DD" },
        inicio: { type: Type.STRING, description: "Horário de início HH:mm" },
        fim: { type: Type.STRING, description: "Horário de término HH:mm" },
      },
      required: ["sala", "data", "inicio", "fim"],
    },
  };

  async sendMessage(message: string): Promise<any> {
    try {
      // Fix: Using gemini-3-pro-preview for complex reasoning and function calling
      const response = await this.ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: message,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          tools: [{ functionDeclarations: [this.checkAvailabilityTool] }],
        },
      });

      if (response.functionCalls && response.functionCalls.length > 0) {
        const fc = response.functionCalls[0];
        if (fc.name === "verificar_disponibilidade") {
          const { sala, data, inicio, fim } = fc.args as any;
          
          const conflict = await ReservationService.checkAvailability(sala, data, inicio, fim);
          const isAvailable = conflict === null;
          
          const secondResponse = await this.ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: [
              { role: "user", parts: [{ text: message }] },
              { role: "model", parts: [
                { functionCall: { name: fc.name, args: fc.args, id: fc.id } }
              ]},
              { role: "user", parts: [
                { 
                  functionResponse: { 
                    name: fc.name, 
                    id: fc.id, 
                    response: { 
                      disponivel: isAvailable,
                      reservado_por: conflict ? conflict.nome : null,
                      mensagem_sistema: isAvailable ? "Sala disponível." : `Sala ocupada por ${conflict?.nome} até ${conflict?.fim}.`
                    } 
                  } 
                }
              ]}
            ],
            config: { systemInstruction: SYSTEM_PROMPT }
          });
          return { text: secondResponse.text };
        }
      }

      return { text: response.text };
    } catch (error) {
      console.error("Erro na IA:", error);
      return { text: "Desculpe, tive um problema ao processar sua mensagem. Você pode tentar novamente ou usar o botão de Salas acima." };
    }
  }
}
