module.exports = {
  apps: [
    {
      name: 'artus-asistant',
      script: './dist/index.js',
      watch: false,
      ignore_watch: ['node_modules', '.cache', 'src'],
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
