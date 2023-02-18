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
import { NewMessage, NewMessageEvent } from 'telegram/events';

import MessageHandler from '../handler/message';
import checkMessageType from '../middleware/checkMessageType';
import { ITelegramClient } from '../plugin';
import EventTrigger, { EventMessagePayload } from '../trigger/event';

export const eventEmitter = new EventEmitter();

@LifecycleHookUnit()
export default class TelegramLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication;

  @Inject()
  trigger: EventTrigger;

  @Inject('ARTUS_TELEGRAM')
  telegramClient: ITelegramClient;

  get telegram() {
    return this.telegramClient.getClient();
  }

  get messageHandler(): MessageHandler {
    return this.app.container.get(MessageHandler);
  }

  @LifecycleHook()
  async didLoad() {
    this.trigger.use(checkMessageType);
  }

  @LifecycleHook()
  willReady() {
    eventEmitter.on('message', async (payload: EventMessagePayload) => {
      const input = new Input();
      input.params.type = 'message';
      input.params.payload = payload;

      const ctx = await this.trigger.initContext(input);
      await this.trigger.startPipeline(ctx);
    });
  }

  @LifecycleHook()
  didReady() {
    this.telegram.addEventHandler(async (event: NewMessageEvent) => {
      eventEmitter.emit('message', {
        event,
        callback: async (result: any) => {
          this.messageHandler.handle(result, event);
        },
      });
    }, new NewMessage());
  }

  @LifecycleHook()
  beforeClose() {
    eventEmitter.removeAllListeners();
  }
}
