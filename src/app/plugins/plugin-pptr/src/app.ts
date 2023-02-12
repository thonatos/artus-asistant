import { Server } from 'http';
import { LifecycleHookUnit, LifecycleHook } from '@artus/core';
import { ApplicationLifecycle } from '@artus/core';
import { ArtusApplication, Inject, ArtusInjectEnum } from '@artus/core';

import PPTR, { PPTRConfig } from './client';

export let server: Server;

@LifecycleHookUnit()
export default class PPTRLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication;

  @LifecycleHook()
  async willReady() {
    const pptr = this.app.container.get('ARTUS_PPTR') as PPTR;
    await pptr.init(this.app.config.pptr as PPTRConfig);
  }

  @LifecycleHook()
  beforeClose() {
    const pptr = this.app.container.get('ARTUS_PPTR') as PPTR;
    pptr.close();
  }
}
