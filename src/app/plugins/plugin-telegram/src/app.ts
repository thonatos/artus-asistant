import { Server } from 'http';
import { LifecycleHookUnit, LifecycleHook } from '@artus/core';
import { ApplicationLifecycle } from '@artus/core';
import { ArtusApplication, Inject, ArtusInjectEnum } from '@artus/core';

import Telegram, { TelegramConfig } from './client';

export let server: Server;

@LifecycleHookUnit()
export default class TelegramLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication;

  @LifecycleHook()
  async willReady() {
    const telegram = this.app.container.get('ARTUS_TELEGRAM') as Telegram;
    await telegram.init(this.app.config.telegram as TelegramConfig);
  }
}
