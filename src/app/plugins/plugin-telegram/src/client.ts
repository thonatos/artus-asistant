import { Injectable, ScopeEnum } from '@artus/core';

import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { LogLevel } from 'telegram/extensions/Logger';

export interface TelegramConfig {
  api_id: number;
  api_hash: string;
  app_title: string;

  session_string: string;

  proxy?: {
    ip: string;
    port: number;
    socksType: number;
    proxyString: string;
  };
}

@Injectable({
  id: 'ARTUS_TELEGRAM',
  scope: ScopeEnum.SINGLETON,
})
export default class Client {
  private me: Api.User;
  private telegram: TelegramClient;

  async init(config: TelegramConfig) {
    if (!config) {
      return;
    }

    const { api_id, api_hash, proxy, session_string } = config;
    const stringSession = new StringSession(session_string);

    const _proxy = proxy && {
      ip: proxy.ip,
      port: proxy.port,
      socksType: proxy.socksType,
    };

    // init telegram client
    this.telegram = new TelegramClient(stringSession, api_id, api_hash, {
      // @ts-ignore
      proxy: _proxy,
      connectionRetries: 5,
      useWSS: false,
    });

    this.telegram.setLogLevel(LogLevel.INFO);

    // connect to telegram
    await this.telegram.connect();
    this.me = (await this.telegram.getMe()) as Api.User;
  }

  getMe(): Api.User {
    return this.me;
  }

  getClient(): TelegramClient {
    return this.telegram;
  }
}
