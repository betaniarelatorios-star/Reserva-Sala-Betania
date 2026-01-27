
import { Room } from './types';

export const SUPABASE_URL = 'https://hywkalfphfxjbhdhgvyj.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_74-K2ysRZypEcc9eX9Pbcw_feDvGtaN';

export const ROOMS: Room[] = [
  { 
    id: 'reunioes', 
    name: 'Sala de Reuniões', 
    capacity: 10, 
    description: 'Ideal para 10 pessoas. Equipamento de vídeo completo e quadro branco.',
    tags: ['AC', 'TV'],
    iconColor: '#3B82F6',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=300&q=80'
  },
  { 
    id: 'aconselhamento', 
    name: 'Sala Aconselhamento', 
    capacity: 3, 
    description: 'Espaço reservado e confortável para até 3 pessoas. Silencioso.',
    tags: ['PRIVADO'],
    iconColor: '#A855F7',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=300&q=80'
  },
  { 
    id: 'aconselhamento1', 
    name: 'Sala Aconselhamento 1', 
    capacity: 3, 
    description: 'Ambiente climatizado com poltronas ergonômicas e iluminação dimerizável.',
    tags: ['PREMIUM'],
    iconColor: '#14B8A6',
    image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=300&q=80'
  },
  { 
    id: 'semib', 
    name: 'Sala Semib', 
    capacity: 6, 
    description: 'Espaço versátil para pequenos grupos e workshops rápidos (até 6 pessoas).',
    tags: ['FLEX'],
    iconColor: '#F97316',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=300&q=80'
  },
  { 
    id: 'betageen', 
    name: 'Sala Betageen', 
    capacity: 8, 
    description: 'Ideal para brainstormings e dinâmicas criativas com mobiliário modular.',
    tags: ['CRIATIVO'],
    iconColor: '#22C55E',
    image: 'https://images.unsplash.com/photo-1557425955-df376b5903c8?auto=format&fit=crop&w=300&q=80'
  },
];

export const SYSTEM_PROMPT = `Você é o assistente virtual oficial de reserva de salas da empresa.
Seu objetivo é ser educado, eficiente e direto.

REGRAS OBRIGATÓRIAS:
1. CONSULTA AO BANCO: Você JAMAIS deve confirmar uma reserva ou afirmar que uma sala está livre sem antes usar a ferramenta 'verificar_disponibilidade'.
2. DATAS PASSADAS: Proibido realizar ou sugerir reservas em datas ou horários que já passaram.
3. CONFLITOS: Se a ferramenta indicar que a sala está ocupada, você deve informar o usuário e sugerir:
   - Outro horário próximo na mesma sala.
   - Outra sala que esteja disponível no mesmo horário.
4. ESTILO: Sem markdown de negrito (**). Use apenas texto simples e emojis discretos.
5. CONCISÃO: Responda apenas o necessário para avançar com o processo.

DADOS ATUAIS:
- Data de hoje: ${new Date().toLocaleDateString('pt-BR')}
- Hora atual: ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}

FLUXO:
- Se o usuário pedir para reservar, peça Sala, Data, Início e Fim.
- Chame 'verificar_disponibilidade' imediatamente após ter esses dados.
- Só confirme após o retorno positivo da ferramenta.`;
