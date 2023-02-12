import { Injectable, ScopeEnum } from '@artus/core';

import puppeteer from 'puppeteer';
import type { Browser, PuppeteerLaunchOptions } from 'puppeteer';

export interface PPTRConfig extends PuppeteerLaunchOptions {}

@Injectable({
  id: 'ARTUS_PPTR',
  scope: ScopeEnum.SINGLETON,
})
export default class Client {
  private pptr: Browser;

  async init(config: PPTRConfig) {
    const browser = await puppeteer.launch(config);
    this.pptr = browser;
  }

  getClient(): Browser {
    return this.pptr;
  }

  async close() {
    await this.pptr.close();
  }
}
