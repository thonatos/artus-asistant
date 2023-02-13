import {
  Inject,
  Injectable,
  ArtusInjectEnum,
  ArtusApplication,
} from '@artus/core';
import dayjs from 'dayjs';

import PPTRService from './pptr';
import TelegramService from './telegram';

import IRedisClient from '../plugins/plugin-redis/src/client';

@Injectable()
export default class JinshiService {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication;

  @Inject(ArtusInjectEnum.Config)
  config: any;

  @Inject('ARTUS_REDIS')
  redisClient: IRedisClient;

  @Inject(PPTRService)
  pptrService: PPTRService;

  @Inject(TelegramService)
  telegramService: TelegramService;

  get redis() {
    return this.redisClient.getClient();
  }

  get channel() {
    return this.config.telegram.channel;
  }

  async fetchRili() {
    const targetChannel = this.channel;

    const rili = await this.pptrService.fetchRili();

    console.log('fetchRili:news', rili?.url);

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
    console.log('fetchNews:news', news.length);

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
          console.log('schedule:error', error);
        }
      })
    );

    await this.pptrService.clearPages();
  }
}
