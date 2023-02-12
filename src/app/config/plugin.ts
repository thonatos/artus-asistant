import path from 'path';

export default {
  pptr: {
    enable: true,
    path: path.resolve(__dirname, '../plugins/plugin-pptr'),
  },

  openai: {
    enable: true,
    path: path.resolve(__dirname, '../plugins/plugin-openai'),
  },

  telegram: {
    enable: true,
    path: path.resolve(__dirname, '../plugins/plugin-telegram'),
  },

  redis: {
    enable: true,
    path: path.resolve(__dirname, '../plugins/plugin-redis'),
  },

  sequelize: {
    enable: true,
    path: path.resolve(__dirname, '../plugins/plugin-sequelize'),
  },
};
