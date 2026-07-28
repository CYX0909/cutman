import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { zipSync } from 'fflate';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const sourceDirectory = path.join(scriptDirectory, 'demo-package');
const outputPath = path.join(scriptDirectory, 'CutMan-CapCut-Demo.zip');
const entries = {};

async function collectFiles(directory, relativeDirectory = '') {
  const directoryEntries = await readdir(directory, { withFileTypes: true });
  await Promise.all(directoryEntries.map(async (entry) => {
    if (entry.name === '.DS_Store') return;
    const absolutePath = path.join(directory, entry.name);
    const relativePath = path.posix.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(absolutePath, relativePath);
      return;
    }
    entries[relativePath] = new Uint8Array(await readFile(absolutePath));
  }));
}

await collectFiles(sourceDirectory);
await writeFile(outputPath, zipSync(entries, { level: 1 }));
console.log(`CapCut 相容套件已建立：${outputPath}`);
console.log(`套件檔案數：${Object.keys(entries).length}`);
