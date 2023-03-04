import {
  Inject,
  Injectable,
  ArtusInjectEnum,
  ArtusApplication,
} from '@artus/core';
import { Sequelize } from 'sequelize-typescript';

import { ISequelizeClient } from '../plugin';
import { ConversationModel } from '../model/conversation';
import OpenAIService from './openai';

@Injectable()
export default class ConversationService {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication;

  @Inject(OpenAIService)
  openaiService: OpenAIService;

  @Inject('ARTUS_SEQUELIZE')
  sequelizeClient: ISequelizeClient;

  get sequelize() {
    const sequelize: Sequelize = this.sequelizeClient.getClient();
    return sequelize;
  }

  get conversation() {
    const conversationRepository =
      this.sequelize.getRepository(ConversationModel);
    return conversationRepository;
  }

  async clearConversations(chatId: string) {
    await this.conversation.destroy({
      where: {
        chat_id: chatId,
      },
    });
  }

  async queryConversations(chatId: string) {
    const data = await this.conversation.findAll({
      where: {
        chat_id: chatId,
      },
      limit: 50,
      order: [['created_at', 'ASC']],
    });

    return data;
  }

  async saveConversation(conversations: ConversationModel[]) {
    const items = conversations.map((item) => {
      return {
        chat_id: item.chat_id,
        role: item.role,
        content: item.content,
      };
    });

    await this.conversation.bulkCreate(items);
  }

  async handleConversation(chatId: string, message: string) {
    const _conversations = await this.queryConversations(chatId);
    const { output, conversations } = await this.openaiService.sendChat(
      chatId,
      message,
      _conversations
    );

    await this.saveConversation(conversations as ConversationModel[]);

    return output;
  }
}
