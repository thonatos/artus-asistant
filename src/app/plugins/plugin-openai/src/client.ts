import { Injectable, ScopeEnum } from '@artus/core';

import { SocksProxyAgent } from 'socks-proxy-agent';
import { Configuration, OpenAIApi } from 'openai';

export interface OpenAIConfig {
  key: string;
  proxyString: string;
}

@Injectable({
  id: 'ARTUS_OPENAI',
  scope: ScopeEnum.SINGLETON,
})
export default class Client {
  private openai: OpenAIApi;
  private httpsAgent: SocksProxyAgent;

  async init(config: OpenAIConfig) {
    if (config.proxyString) {
      this.httpsAgent = new SocksProxyAgent(config.proxyString);
    }

    const configuration = new Configuration({
      apiKey: config.key,
    });

    this.openai = new OpenAIApi(configuration);
  }

  getClient(): OpenAIApi {
    return this.openai;
  }

  getHttpsAgent(): SocksProxyAgent {
    return this.httpsAgent;
  }
}
