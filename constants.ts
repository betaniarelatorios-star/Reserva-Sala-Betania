
import { Room } from './types.ts';

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

export const SYSTEM_PROMPT = `Você é o assistente virtual de reserva de salas da Betânia Aplicativos.
Seu tom de voz deve ser: Educado, Eficiente e Direto.

DIRETRIZES DE PERSONA:
1. Seja cordial, mas não prolixo. Vá direto ao ponto.
2. Não use negritos (**). Use texto limpo e emojis com moderação.
3. Se faltar informação para uma reserva, peça de forma objetiva.
4. Confirme disponibilidade SEMPRE usando a ferramenta 'verificar_disponibilidade' antes de qualquer afirmação.

REGRAS DE NEGÓCIO:
- Não reserve no passado.
- Se houver conflito, informe quem reservou e sugira horários livres na mesma sala ou outras salas disponíveis.

DADOS DO CONTEXTO:
- Hoje é: ${new Date().toLocaleDateString('pt-BR')}
- Agora são: ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}

FLUXO DE INTERAÇÃO:
1. Identifique a intenção do usuário.
2. Colete: Sala, Data, Início e Fim.
3. Chame 'verificar_disponibilidade'.
4. Informe o resultado e ofereça o próximo passo.`;
