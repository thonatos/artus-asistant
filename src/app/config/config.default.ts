import path from 'path';
import dotenv from 'dotenv';
import { getApiId, getProxy } from '../util';

dotenv.config();

export default {
  cacheDir: path.join(process.cwd(), '.cache'),

  redis: {
    host: 'localhost',
    port: 6379,
    username: '',
    password: '',
    db: 0,
  },

  sequelize: {
    database: process.env.MYSQL_DATABASE || 'mysql',
    username: process.env.MYSQL_USERNAME || 'root',
    password: process.env.MYSQL_PASSWORD || 'root',
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    dialect: 'mysql',
    models: [path.join(__dirname, '../model')],
  },

  openai: {
    key: process.env.OPENAI_KEY || '',
    proxyString: process.env.OPENAI_PROXY || '',
  },

  pptr: {
    headless: false,
    args: ['--window-size=1440,810'],
    defaultViewport: {
      width: 1440,
      height: 810,
      deviceScaleFactor: 1,
    },

    timeout: 30 * 1000,
    // args: ['--no-sandbox --proxy-server=127.0.0.1:1024'],
  },

  telegram: {
    api_id: getApiId() || 0,
    api_hash: process.env.API_HASH || '',
    app_title: process.env.APP_TITLE || '',

    session_string: process.env.SESSION_STRING || '',
    bot_auth_token: process.env.BOT_AUTH_TOKEN || '',

    proxy: getProxy(),

    channel: process.env.TELEGRAM_CHANNEL || '',
  },
};
