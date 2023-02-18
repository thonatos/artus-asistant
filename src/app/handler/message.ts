import {
  Inject,
  Injectable,
  ArtusInjectEnum,
  ArtusApplication,
  Logger,
} from '@artus/core';

import { NewMessageEvent } from 'telegram/events';

import JinshiService from '../service/jinshi';
import SubscriberService from '../service/subscriber';
import ConversationService from '../service/conversation';
import AdministratorService from '../service/administrator';

@Injectable()
export default class MessageHandler {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication;

  @Inject()
  private logger!: Logger;

  @Inject(JinshiService)
  jinshiService: JinshiService;

  @Inject(SubscriberService)
  subscriberService: SubscriberService;

  @Inject(ConversationService)
  conversationService: ConversationService;

  @Inject(AdministratorService)
  administratorService: AdministratorService;

  async handle(result: any, event: NewMessageEvent) {
    const { message } = event;
    const { chatIdStr, messageId, messageContent } = result;
    this.logger.info('messageHandler:handle:result', result);

    if (messageContent === '/ping') {
      await message.respond({
        message: `pong !`,
      });
      return;
    }

    if (messageContent === '/info') {
      await message.respond({
        message: `- chatId：${chatIdStr}\n- messageId：${messageId}`,
      });
      return;
    }

    // Management
    if (messageContent === '/rili') {
      const administrator = await this.administratorService.checkAdministrator(
        chatIdStr
      );
      if (!administrator) {
        await message.respond({
          message: '对不起，您没有权限！',
        });
        return;
      }

      await this.jinshiService.fetchRili();
      await message.respond({
        message: 'rili 已更新！',
      });
      return;
    }

    const subscriber = await this.subscriberService.checkSubscriber(chatIdStr);

    // OpenAI Asistant
    if (!subscriber) {
      await message.respond({
        message: '对不起，您还没有订阅！',
      });
      return;
    }

    if (messageContent === '/clear') {
      await this.conversationService.clearConversations(chatIdStr);
      return;
    }

    const reply = await this.conversationService.handleConversation(
      chatIdStr,
      messageContent
    );

    await message.respond({
      message: reply || '我不知道你在说什么!（/clear 清空对话）',
    });
  }
}
