import * as fs from 'node:fs';
import * as path from 'node:path';
import syncDirectory from 'sync-directory';
import FastGlob from 'fast-glob';
import * as chokidar from 'chokidar';
import { src, dist, allowedFiletypes } from './config.js';

/** Format dist path for printing */
function normalize(p: string) {
  return p.replace(/\\/g, '/');
}

/**
 * Sync static files.
 * Include init and watch phase.
 */
export async function syncStatic() {
  return syncDirectory(path.resolve(src), path.resolve(dist), {
    exclude: [(filePath: string) => {
      const { ext } = path.parse(filePath);
      return ext && !allowedFiletypes.includes(ext);
    }],
    async afterEachSync(event: { eventType: string; nodeType: string; relativePath: string, srcPath: string; targetPath: string }) {
      let eventType = event.eventType;
      if (eventType === 'add' || eventType === 'init:copy') {
        eventType = 'changed';
      } else if (eventType === 'unlink') {
        eventType = 'deleted';
      }
      if (eventType) {
        let relative = event.relativePath;
        if (relative[0] === '\\') {
          relative = relative.substring(1);
        }
        console.log(`${normalize(relative)} ${eventType}`);
      }
    },
    watch: true,
    deleteOrphaned: true,
  });
}

/**
 * Sync ts script files.
 * Init phase only.
 */
async function initTypeScript() {
  const distFiles = await FastGlob(`${dist}/**/*.js`, { ignore: [`${dist}/tmp/*`] });
  for (const distFile of distFiles) {
    // search existing *.js file in dist
    const relative = path.relative(dist, distFile);
    const srcFile = path.resolve(src, relative);
    // if srcFile does not exist, delete distFile
    if (
      !fs.existsSync(srcFile) &&
      !fs.existsSync(srcFile.replace(/\.js$/, '.ts'))
    ) {
      await fs.promises.unlink(distFile);
      console.log(`${normalize(relative)} deleted`);
    }
  }
}

/**
 * Sync ts script files.
 * Watch phase only.
 */
async function watchTypeScript() {
  chokidar.watch(`${src}/**/*.ts`).on('unlink', async (p) => {
    // called on *.ts file get deleted
    const relative = path.relative(src, p).replace(/\.ts$/, '.js');
    const distFile = path.resolve(dist, relative);
    // if distFile exists, delete it
    if (fs.existsSync(distFile)) {
      await fs.promises.unlink(distFile);
      console.log(`${normalize(relative)} deleted`);
    }
  });
}

/**
 * Sync ts script files.
 * Include init and watch phase.
 */
export async function syncTypeScript() {
  await initTypeScript();
  return watchTypeScript();
}
