import 'reflect-metadata';
import fs from 'fs-extra';
import { ArtusApplication, Scanner } from '@artus/core';

export async function start(options: any = {}) {
  const scanner = new Scanner({
    needWriteFile: false,
    configDir: 'config',
    extensions: ['.ts'],
    framework: options.framework || { path: __dirname },
    exclude: options.exclude || ['bin', 'test', 'coverage'],
  });

  const baseDir = options.baseDir || process.cwd();
  const manifest = await scanner.scan(baseDir);

  // start app
  const artusEnv = options.artusEnv || 'default';
  const app = new ArtusApplication();
  await app.load(manifest[artusEnv], baseDir);

  // ensure cache dir
  const cacheDir = app.config.cacheDir;
  fs.ensureDirSync(cacheDir);

  await app.run();
  return app;
}
