export enum CONVERSATION_ROLE {
  Human = 'Human',
  AI = 'AI',
}

export const DEFAULT_CONVERSATION_PREFIX =
  'The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.';

export const DEFAULT_CONVERSATION_SUFFIX = {
  role: CONVERSATION_ROLE.AI,
  content: '',
  chat_id: '',
};

export const DEFAULT_COMPLETION = {
  model: 'text-davinci-003',
  prompt: '',
  temperature: 0.9,
  max_tokens: 150,
  top_p: 1,
  frequency_penalty: 0.0,
  presence_penalty: 0.6,
  stop: [' Human:', ' AI:'],
};
