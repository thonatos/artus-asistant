import {
  Inject,
  Injectable,
  ArtusInjectEnum,
  ArtusApplication,
} from '@artus/core';

import { Sequelize } from 'sequelize-typescript';
import { ISequelizeClient } from '../plugin';
import { SubscriberModel } from '../model/subscriber';

@Injectable()
export default class SubscriberService {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication;

  @Inject('ARTUS_SEQUELIZE')
  sequelizeClient: ISequelizeClient;

  get sequelize() {
    const sequelize: Sequelize = this.sequelizeClient.getClient();
    return sequelize;
  }

  get subscriber() {
    const subscriberRepository = this.sequelize.getRepository(SubscriberModel);
    return subscriberRepository;
  }

  async checkSubscriber(chatId: string) {
    const subscriber = await this.subscriber.findOne({
      where: {
        user_id: chatId,
      },
    });

    return subscriber;
  }
}
