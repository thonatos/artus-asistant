import { EventEmitter } from 'events';

import {
  Inject,
  ArtusInjectEnum,
  ArtusApplication,
  LifecycleHook,
  LifecycleHookUnit,
  ApplicationLifecycle,
} from '@artus/core';
import { Input } from '@artus/pipeline';
import { TelegramClient } from 'telegram';
import { NewMessage, NewMessageEvent } from 'telegram/events';

import EventTrigger from '../trigger/event';
import checkMessageType from '../middleware/checkMessageType';

import JinshiService from '../service/jinshi';
import SubscriberService from '../service/subscriber';
import ConversationService from '../service/conversation';
import AdministratorService from '../service/administrator';

import ITelegramClient from '../plugins/plugin-telegram/src/client';

export const eventEmitter = new EventEmitter();

@LifecycleHookUnit()
export default class CustomLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication;

  @Inject()
  trigger: EventTrigger;

  @Inject('ARTUS_TELEGRAM')
  telegramClient: ITelegramClient;

  get telegram() {
    return this.telegramClient.getClient() as TelegramClient;
  }

  @LifecycleHook()
  async didLoad() {
    this.trigger.use(checkMessageType);
  }

  @LifecycleHook()
  willReady() {
    eventEmitter.on('message', async (payload) => {
      const input = new Input();
      input.params.type = 'message';
      input.params.payload = payload;

      const ctx = await this.trigger.initContext(input);
      await this.trigger.startPipeline(ctx);
    });
  }

  @LifecycleHook()
  didReady() {
    const jinshiService = this.app.container.get(JinshiService);
    const subscriberService = this.app.container.get(SubscriberService);
    const conversationService = this.app.container.get(ConversationService);
    const administratorService = this.app.container.get(AdministratorService);

    this.telegram.addEventHandler(async (event: NewMessageEvent) => {
      const { message } = event;

      eventEmitter.emit('message', {
        message,
        callback: async (result: any) => {
          const { chatIdStr, messageId, messageContent } = result;
          console.log('message', chatIdStr, messageId, messageContent);

          if (messageContent === '/ping') {
            await message.reply({
              message: `pong !`,
            });
            return;
          }

          if (messageContent === '/info') {
            await message.reply({
              message: `- chatId：${chatIdStr}\n- messageId：${messageId}`,
            });
            return;
          }

          // Management
          if (messageContent === '/rili') {
            const administrator = await administratorService.checkAdministrator(
              chatIdStr
            );
            if (!administrator) {
              await message.reply({
                message: '对不起，您没有权限！',
              });
              return;
            }

            await jinshiService.fetchRili();
            return;
          }

          const subscriber = await subscriberService.checkSubscriber(chatIdStr);

          // OpenAI Asistant
          if (!subscriber) {
            await message.reply({
              message: '对不起，您还没有订阅！',
            });
            return;
          }

          if (messageContent === '/clear') {
            await conversationService.clearConversations(chatIdStr);
            return;
          }

          const reply = await conversationService.handleConversation(
            chatIdStr,
            messageContent
          );

          await message.reply({
            message: reply || '我不知道你在说什么!（/clear 清空对话）',
          });
        },
      });
    }, new NewMessage());
  }

  @LifecycleHook()
  beforeClose() {
    eventEmitter.removeAllListeners();
  }
}
