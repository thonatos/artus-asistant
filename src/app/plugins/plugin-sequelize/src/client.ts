import { Injectable, ScopeEnum } from '@artus/core';
import { Sequelize, SequelizeOptions } from 'sequelize-typescript';

export interface SequelizeConfig extends SequelizeOptions {
  database: string;
  username: string;
  password: string;
  host: string;
}

@Injectable({
  id: 'ARTUS_SEQUELIZE',
  scope: ScopeEnum.SINGLETON,
})
export default class Client {
  private sequelize: Sequelize;

  async init(config: SequelizeConfig) {
    if (!config) {
      return;
    }

    this.sequelize = new Sequelize({
      ...config,
      // logging: console.log,
      logging: false,
      repositoryMode: true,
    });

    await this.sequelize.sync({
      // force: true,
      // alter: true,
    });
  }

  getClient(): Sequelize {
    return this.sequelize;
  }
}
