import {
  Inject,
  Injectable,
  ArtusInjectEnum,
  ArtusApplication,
} from '@artus/core';
import { Sequelize } from 'sequelize-typescript';
import { Administrator } from '../model/administrator';

import ISequelizeClient from '../plugins/plugin-sequelize/src/client';

@Injectable()
export default class AdministratorService {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication;

  @Inject('ARTUS_SEQUELIZE')
  sequelizeClient: ISequelizeClient;

  get sequelize() {
    const sequelize: Sequelize = this.sequelizeClient.getClient();
    return sequelize;
  }

  get administrator() {
    const administratorRepository = this.sequelize.getRepository(Administrator);
    return administratorRepository;
  }

  async checkAdministrator(chatId: string) {
    const administrator = await this.administrator.findOne({
      where: {
        user_id: chatId,
      },
    });

    return administrator;
  }
}
