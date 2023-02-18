import { CronJob } from 'cron';
import { EventEmitter } from 'events';

import {
  Inject,
  ArtusInjectEnum,
  ArtusApplication,
  LifecycleHook,
  LifecycleHookUnit,
  ApplicationLifecycle,
  Logger,
} from '@artus/core';

import { IPPTRClient, ITelegramClient } from '../plugin';
import JinshiService from '../service/jinshi';

export const eventEmitter = new EventEmitter();

@LifecycleHookUnit()
export default class ScheduleLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication;

  @Inject()
  private logger!: Logger;

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

  get jinshiService(): JinshiService {
    return this.app.container.get(JinshiService);
  }

  @LifecycleHook()
  didReady() {
    const cronTimeNews = '*/30 * * * * *';
    this.logger.info('schedule:cronTimeNews', cronTimeNews);

    const scheduleNews = new CronJob(
      cronTimeNews,
      async () => {
        this.jinshiService.fetchNews();
      },
      null,
      true,
      'Asia/Shanghai'
    );
    scheduleNews.start();

    const cronTimeRili = '0 9 * * *';
    this.logger.info('schedule:cronTimeRili', cronTimeRili);

    const scheduleRili = new CronJob(
      cronTimeRili,
      async () => {
        this.jinshiService.fetchRili();
      },

      null,
      true,
      'Asia/Shanghai'
    );
    scheduleRili.start();
  }
}
