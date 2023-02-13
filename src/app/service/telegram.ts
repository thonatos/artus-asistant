import fs from 'fs-extra';
import path from 'path';
import { createHash } from 'node:crypto';

import {
  Inject,
  Injectable,
  ArtusInjectEnum,
  ArtusApplication,
} from '@artus/core';

import ITelegramClient from '../plugins/plugin-telegram/src/client';

@Injectable()
export default class JinshiService {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication;

  @Inject(ArtusInjectEnum.Config)
  config: any;

  @Inject('ARTUS_TELEGRAM')
  telegramClient: ITelegramClient;

  get telegram() {
    return this.telegramClient.getClient();
  }

  async notify(to: string, data?: any, clear?: boolean) {
    const { cacheDir } = this.config;

    if (!data) {
      return;
    }

    let thumb;

    if (data.thumb) {
      const buf = Buffer.from(data.thumb, 'base64');
      const hash = createHash('sha256');
      const digest = hash.update(buf).digest('hex');
      thumb = path.join(cacheDir, `${digest}.jpg`);
      fs.writeFileSync(thumb, buf);
    }

    const message = await this.telegram.sendMessage(to, {
      thumb,
      file: thumb,
      message: data.message,
      parseMode: 'html',
      silent: true,
    });

    if (thumb) {
      fs.rmSync(thumb, { force: true });
    }

    if (!clear) {
      return;
    }

    setTimeout(() => {
      message.delete({
        revoke: true,
      });
    }, 5 * 1000);
  }
}
