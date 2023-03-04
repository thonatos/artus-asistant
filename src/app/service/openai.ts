import { OpenAIApi } from 'openai';

import {
  Inject,
  Injectable,
  ArtusInjectEnum,
  ArtusApplication,
  Logger,
} from '@artus/core';

import {
  ROLE_MAP,
  CHAT_ROLE,
  CONVERSATION_ROLE,
  DEFAULT_CHAT_PREFIX,
} from '../constants';

import { IOpenAIClient } from '../plugin';
import { ConversationModel } from '../model/conversation';

@Injectable()
export default class OpenAIService {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication;

  @Inject()
  private logger!: Logger;

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

  async formatMessage(
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

  async getChat(conversations: Promot[]) {
    const messages = conversations.map((item) => {
      const role: CHAT_ROLE = ROLE_MAP[item.role];

      return {
        role,
        content: item.content,
      };
    });
    return messages;
  }

  async sendChat(chatId: string, input: string, conversations: Promot[]) {
    try {
      const inputMessage = await this.formatMessage(
        chatId,
        input,
        CONVERSATION_ROLE.HUMAN
      );

      const messages = await this.getChat([
        DEFAULT_CHAT_PREFIX,
        ...conversations,
        inputMessage,
      ]);

      const completion = await this.openai.createChatCompletion(
        {
          model: 'gpt-3.5-turbo',
          messages,
        },
        {
          httpsAgent: this.httpsAgent,
          timeout: 30 * 1000,
        }
      );

      const output = completion.data.choices[0].message?.content || '';
      const outputMessage = await this.formatMessage(
        chatId,
        output,
        CONVERSATION_ROLE.AI
      );

      return {
        output,
        conversations: [inputMessage, outputMessage],
      };
    } catch (error) {
      this.logger.error(error);
      return {
        output: '',
        conversations: [],
      };
    }
  }
}

type Promot = Pick<ConversationModel, 'chat_id' | 'role' | 'content'>;
