import {
  Inject,
  Injectable,
  ArtusInjectEnum,
  ArtusApplication,
} from '@artus/core';

import { KnownDevices } from 'puppeteer';
import { Browser } from 'puppeteer';
const iPhone13Pro = KnownDevices['iPhone 13 Pro Max'];

@Injectable()
export default class PPTRService {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication;

  @Inject('ARTUS_PPTR')
  pptrClient: any;

  get pptr() {
    const pptr: Browser = this.pptrClient.getClient();
    return pptr;
  }

  async dispose() {
    const browser = this.pptr;
    await browser?.close();
  }

  async clearPages() {
    const browser = this.pptr;

    if (!browser) {
      return;
    }

    const pages = await browser.pages();

    await Promise.all(
      pages.map(async (page) => {
        const url = page.url();

        if (url === 'about:blank' || url === 'https://rili.jin10.com/') {
          return;
        }

        if (page.isClosed()) {
          return;
        }

        await page.close();
      })
    );
  }

  async fetchNews() {
    const browser = this.pptr;

    if (!browser) {
      return;
    }

    const page = await browser.newPage();
    await page.emulate(iPhone13Pro);
    await page.goto('https://www.jin10.com', { waitUntil: 'networkidle0' });
    const list = await page.$$('.jin-flash-item-container');

    const listContent: Array<{
      id: string;
      time: string;
      content: string;
      dateTime: string;

      isVip: boolean;
      isRili: boolean;
      isFlash: boolean;
      isArticle: boolean;
    }> = [];

    await Promise.all(
      list.map(async (item) => {
        if (!item) {
          return;
        }

        const itemEvaluate = await page.evaluateHandle((item) => {
          const id = item.id;
          const itemTime = item.querySelector('.item-time');
          const itemRight = item.querySelector('.item-right');

          const time = itemTime?.textContent?.trim() || '';
          const dateString = id.replaceAll('flash', '').substring(0, 8);

          const year = dateString.substring(0, 4);
          const month = dateString.substring(4, 6);
          const day = dateString.substring(6, 8);

          const dateTime = `${year}-${month}-${day} ${time}`;

          return {
            id,
            time,
            dateTime,
            content: itemRight?.textContent?.trim() || '',

            isVip: !!item?.querySelector('.is-vip'),
            isRili: !!item?.querySelector('.jin-flash-item.rili'),
            isFlash: !!item?.querySelector('.jin-flash-item.flash'),
            isArticle: !!item?.querySelector('.jin-flash-item.article'),
          };
        }, item);

        const itemData = await itemEvaluate.jsonValue();

        listContent.push(itemData);
      })
    );

    await page.close();

    return listContent;
  }

  async fetchNewsDetail(id: string) {
    const browser = this.pptr;

    if (!browser) {
      return;
    }

    const detailId = id.replaceAll('flash', '');
    const targetUrl = `https://flash.jin10.com/detail/${detailId}`;

    const page = await browser.newPage();
    await page.emulate(iPhone13Pro);
    await page.goto(targetUrl, { waitUntil: 'networkidle0' });

    const detailHandler = await page.$('.detail-content');

    const detailEvaluate = await page.evaluateHandle((detailHandler) => {
      const contentTime = detailHandler?.querySelector('.content-time');
      const contentTitle = detailHandler?.querySelector('.content-title');
      const riliContent = detailHandler?.querySelector('.rili-content');
      const flashRemark = detailHandler?.querySelector('.flash-remark');

      // remove flash remark
      flashRemark?.remove();

      // get flash remark url
      const flashRemarkUrl = flashRemark
        ?.querySelector('a.remark-item')
        ?.getAttribute('href');

      return {
        title: contentTitle?.textContent?.trim() || '',
        riliContent: riliContent?.textContent?.trim() || '',
        dateTimeString: contentTime?.textContent?.trim() || '',
        flashRemarkUrl: flashRemarkUrl || '',
      };
    }, detailHandler);

    const thumb = (await detailHandler?.screenshot({
      omitBackground: false,
      encoding: 'binary',
      type: 'jpeg',
      quality: 100,
    })) as Buffer | undefined;

    const detailObject = await detailEvaluate.jsonValue();

    await page.close();

    return {
      id,
      url: targetUrl,
      thumb: thumb?.toString('base64'),
      title: detailObject.title,
      dateTimeString: detailObject.dateTimeString,
      flashRemarkUrl: detailObject.flashRemarkUrl,
    };
  }

  async fetchRili() {
    const browser = this.pptr;

    if (!browser) {
      return;
    }

    const targetUrl = 'https://rili.jin10.com/';

    const page = await browser.newPage();
    await page.emulate({
      viewport: {
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
      },
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    });
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    const jinLayout = await page.$('.jin-layout');

    await page.evaluateHandle((jinLayout) => {
      jinLayout?.querySelector('.jin-header')?.remove();

      jinLayout
        ?.querySelector('.jin-layout-content > .media-wrap > .top-tips')
        ?.remove();

      jinLayout
        ?.querySelector(
          '.jin-layout-content > .media-wrap > .jin-layout-content__left > .index-page > .index-page-header__wrap'
        )
        ?.remove();

      jinLayout?.querySelector('.table-header__right')?.remove();
    }, jinLayout);

    const riliHandler = await page.$(
      '.jin-layout > .jin-layout-content > .media-wrap > .jin-layout-content__left'
    );

    const boundingBox = await riliHandler?.boundingBox();

    const riliThumb = (await page?.screenshot({
      omitBackground: false,
      encoding: 'binary',
      type: 'jpeg',
      quality: 100,
      fullPage: false,
      clip: {
        x: boundingBox?.x || 0,
        y: boundingBox?.y || 0,
        width: boundingBox?.width || 0,
        height: boundingBox?.height || 0,
      },
    })) as Buffer | undefined;

    await page.close();

    return {
      url: targetUrl,
      riliThumb: riliThumb?.toString('base64'),
    };
  }
}
