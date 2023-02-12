import { Injectable, ScopeEnum, Trigger } from '@artus/core';
import { Context, Next } from '@artus/pipeline';

@Injectable({ scope: ScopeEnum.SINGLETON })
export default class EventTrigger extends Trigger {
  constructor() {
    super();

    this.use(async (ctx: Context, next: Next) => {
      await next();
      await this.respond(ctx);
    });
  }

  async respond(ctx: Context) {
    const {
      output: {
        data: { type, payload, result },
      },
    } = ctx;

    if (!type || !result) {
      return;
    }

    payload?.callback && payload?.callback(result, type, payload);
  }
}
