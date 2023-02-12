import { Server } from 'http';
import { LifecycleHookUnit, LifecycleHook } from '@artus/core';
import { ApplicationLifecycle } from '@artus/core';
import { ArtusApplication, Inject, ArtusInjectEnum } from '@artus/core';

import OpenAI, { OpenAIConfig } from './client';

export let server: Server;

@LifecycleHookUnit()
export default class OpenAILifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication;

  @LifecycleHook()
  async willReady() {
    const pptr = this.app.container.get('ARTUS_OPENAI') as OpenAI;
    await pptr.init(this.app.config.openai as OpenAIConfig);
  }
}
