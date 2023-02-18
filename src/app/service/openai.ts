import { OpenAIApi } from 'openai';

import {
  Inject,
  Injectable,
  ArtusInjectEnum,
  ArtusApplication,
} from '@artus/core';

import {
  CONVERSATION_ROLE,
  DEFAULT_COMPLETION,
  DEFAULT_CONVERSATION_PREFIX,
  DEFAULT_CONVERSATION_SUFFIX,
} from '../constants';

import { IOpenAIClient } from '../plugin';
import { ConversationModel } from '../model/conversation';

@Injectable()
export default class OpenAIService {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication;

  @Inject('ARTUS_OPENAI')
  openaiClient: IOpenAIClient;

  get httpsAgent() {
    const httpsAgent = this.openaiClient.getHttpsAgent();
    return httpsAgent;
  }

  get openai() {
    const openai: OpenAIApi = this.openaiClient.getClient();
    return openai;
  }

  async getPrompt(conversations: Promot[]) {
    const conversation = conversations
      .concat(DEFAULT_CONVERSATION_SUFFIX)
      .reduce((acc, item) => {
        return `${acc}\n${item.role}: ${item.content}`;
      }, '');

    const prompt = [DEFAULT_CONVERSATION_PREFIX, conversation].join('\n\n');

    return prompt;
  }

  async genConversation(
    chatId: string,
    message: string,
    role: CONVERSATION_ROLE
  ): Promise<Promot> {
    return {
      role,
      chat_id: chatId,
      content: message,
    };
  }

  async sendMessage(chatId: string, input: string, conversations: Promot[]) {
    try {
      const inputConversation = await this.genConversation(
        chatId,
        input,
        CONVERSATION_ROLE.Human
      );

      const prompt = await this.getPrompt([
        ...conversations,
        inputConversation,
      ]);

      const completion = await this.openai.createCompletion(
        {
          ...DEFAULT_COMPLETION,
          prompt,
          user: chatId,
        },
        {
          httpsAgent: this.httpsAgent,
          timeout: 30 * 1000,
        }
      );

      const output = completion.data.choices[0].text || '';
      const outputConversation = await this.genConversation(
        chatId,
        output,
        CONVERSATION_ROLE.AI
      );

      return {
        output,
        conversations: [inputConversation, outputConversation],
      };
    } catch (error) {
      return {
        output: '',
        conversations: [],
      };
    }
  }
}

type Promot = Pick<ConversationModel, 'chat_id' | 'role' | 'content'>;
