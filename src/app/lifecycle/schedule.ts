import { EventEmitter } from 'events';
import { CronJob } from 'cron';

import {
  Inject,
  ArtusInjectEnum,
  ArtusApplication,
  LifecycleHook,
  LifecycleHookUnit,
  ApplicationLifecycle,
} from '@artus/core';

import JinshiService from '../service/jinshi';

import IPPTRClient from '../plugins/plugin-pptr/src/client';
import ITelegramClient from '../plugins/plugin-telegram/src/client';

export const eventEmitter = new EventEmitter();

@LifecycleHookUnit()
export default class CustomLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication;

  @Inject('ARTUS_PPTR')
  pptrClient: IPPTRClient;

  @Inject('ARTUS_TELEGRAM')
  telegramClient: ITelegramClient;

  get pptr() {
    return this.pptrClient.getClient();
  }

  get telegram() {
    return this.telegramClient.getClient();
  }

  @LifecycleHook()
  didReady() {
    const jinshiService = this.app.container.get(JinshiService);

    const cronTimeNews = '*/30 * * * * *';
    console.log('schedule:cronTimeNews', cronTimeNews);

    const scheduleNews = new CronJob(
      cronTimeNews,
      async () => {
        jinshiService.fetchNews();
      },
      null,
      true,
      'Asia/Shanghai'
    );
    scheduleNews.start();

    const cronTimeRili = '0 9 * * *';
    console.log('schedule:cronTimeRili', cronTimeRili);

    const scheduleRili = new CronJob(
      cronTimeRili,
      async () => {
        jinshiService.fetchRili();
      },

      null,
      true,
      'Asia/Shanghai'
    );
    scheduleRili.start();
  }
}
