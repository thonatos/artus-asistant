import dayjs from 'dayjs';

import {
  Inject,
  Injectable,
  ArtusInjectEnum,
  ArtusApplication,
  Logger,
} from '@artus/core';

import { IRedisClient } from '../plugin';
import PPTRService from './pptr';
import TelegramService from './telegram';

@Injectable()
export default class JinshiService {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication;

  @Inject(ArtusInjectEnum.Config)
  config: any;

  @Inject()
  private logger!: Logger;

  @Inject(TelegramService)
  telegramService: TelegramService;

  @Inject('ARTUS_REDIS')
  redisClient: IRedisClient;

  @Inject(PPTRService)
  pptrService: PPTRService;

  get redis() {
    return this.redisClient.getClient();
  }

  get channel() {
    return this.config.telegram.channel;
  }

  async fetchRili() {
    const targetChannel = this.channel;

    const rili = await this.pptrService.fetchRili();

    this.logger.info('jinshiService:fetchRili:news', rili?.url);

    if (!rili?.riliThumb) {
      return;
    }

    const message = `${dayjs().format('YYYY-MM-DD')} 财经日历 —— <a href="${
      rili.url
    }">点击查看</a)}`;

    await this.telegramService.notify(targetChannel, {
      message,
      thumb: rili.riliThumb,
    });
  }

  async fetchNews() {
    const targetChannel = this.channel;

    const news = (await this.pptrService.fetchNews()) || [];
    this.logger.info('jinshiService:fetchNews:news', news.length);

    await Promise.all(
      news.map(async (item) => {
        const cached = await this.redis.get(item.id);

        if (cached) {
          return;
        }

        const current = dayjs();
        const created = dayjs(item.dateTime);
        const diff = current.diff(created, 'second');

        if (item.isVip || item.isArticle || diff > 60) {
          await this.redis.set(item.id, item.id, 'EX', 120);
          return;
        }

        try {
          const detail = await this.pptrService.fetchNewsDetail(item.id);

          this.redis.set(item.id, item.id, 'EX', 120);

          if (!detail) {
            return;
          }

          // rili
          if (item.isRili) {
            if (!item.content || !detail.thumb) {
              return;
            }

            await this.telegramService.notify(targetChannel, {
              message: item.content,
              thumb: detail.thumb,
            });

            return;
          }

          if (!detail.title) {
            return;
          }

          let message = detail.title;

          if (detail.flashRemarkUrl) {
            message += ` —— <a href="${detail.flashRemarkUrl}">相关链接</a>`;
          }

          await this.telegramService.notify(targetChannel, {
            message,
            thumb: detail.thumb,
          });
        } catch (error) {
          this.logger.info('jinshiService:fetchNews:error', error);
        }
      })
    );

    await this.pptrService.clearPages();
  }
}
