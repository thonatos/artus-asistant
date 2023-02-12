import { EventEmitter } from 'events';
import { CronJob } from 'cron';
import { Browser } from 'puppeteer';
import { TelegramClient } from 'telegram';

import {
  Inject,
  ArtusInjectEnum,
  ArtusApplication,
  LifecycleHook,
  LifecycleHookUnit,
  ApplicationLifecycle,
} from '@artus/core';

import JinshiService from '../service/jinshi';

export const eventEmitter = new EventEmitter();

@LifecycleHookUnit()
export default class CustomLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication;

  @Inject('ARTUS_PPTR')
  pptrClient: any;

  @Inject('ARTUS_TELEGRAM')
  telegramClient: any;

  get pptr() {
    return this.pptr.getClient() as Browser;
  }

  get telegram() {
    return this.telegramClient.getClient() as TelegramClient;
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
