export enum CONVERSATION_ROLE {
  AI = 'AI',
  HUMAN = 'Human',
  SYSTEM = 'System',
}

export enum CHAT_ROLE {
  USER = 'user',
  SYSTEM = 'system',
  ASSISTANT = 'assistant',
}

export const ROLE_MAP = {
  [CONVERSATION_ROLE.AI]: CHAT_ROLE.ASSISTANT,
  [CONVERSATION_ROLE.HUMAN]: CHAT_ROLE.USER,
  [CONVERSATION_ROLE.SYSTEM]: CHAT_ROLE.SYSTEM,
};

export const DEFAULT_CHAT_PREFIX = {
  role: CONVERSATION_ROLE.SYSTEM,
  content: 'You are a helpful assistant.',
  chat_id: '',
};
