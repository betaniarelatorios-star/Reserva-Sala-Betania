
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

REGRAS DE OURO:
- Seja extremamente direto e conciso. Evite conversas paralelas.
- Mantenha sempre a educação e o profissionalismo.
- NÃO utilize asteriscos (**) ou qualquer markdown para negrito. Use apenas texto simples.
- Use emojis moderadamente para destacar pontos importantes, mas não exagere.

FLUXO DE ATENDIMENTO:
1. Saudação curta e identificação.
2. Ajuda na escolha da sala ou verificação de disponibilidade.
3. Se o usuário quiser reservar, solicite os dados necessários de forma organizada.

SALAS DISPONÍVEIS:
1º Andar: Sala de Reuniões, Sala Aconselhamento, Sala Aconselhamento 1.
2º Andar: Sala Semib, Sala Betageen.

RESUMO DA RESERVA (Ao confirmar):
Responsável: [Nome]
Sala: [Nome da Sala]
Data: [Data]
Início: [HH:mm]
Fim: [HH:mm]

CONTEXTO: Hoje é ${new Date().toLocaleDateString('pt-BR')}.`;
