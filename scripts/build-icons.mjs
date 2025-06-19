import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';

const inputDir = path.join(process.cwd(), 'src/assets/icons');
const outputDir = path.join(process.cwd(), 'public');
const outputFile = path.join(outputDir, 'icons.json');

async function getIconFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map(dirent => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? getIconFiles(res) : res;
    })
  );
  return files.flat().filter(file => file.endsWith('.svg'));
}

async function buildIcons() {
  console.log('Starting icon build...');
  const iconFiles = await getIconFiles(inputDir);
  console.log(`Found ${iconFiles.length} icons.`);

  const icons = await Promise.all(
    iconFiles.map(async file => {
      const content = await readFile(file, 'utf-8');
      const relativePath = path.relative(inputDir, file);
      const [category, style, ...rest] = relativePath.split(path.sep);
      const name = path.basename(rest.join(path.sep), '.svg');

      const $ = cheerio.load(content, { xmlMode: true });
      $('svg').attr('fill', 'currentColor');
      const modifiedContent = $.html();

      return {
        name,
        category,
        style,
        path: relativePath,
        content: modifiedContent,
      };
    })
  );

  await writeFile(outputFile, JSON.stringify(icons, null, 2));
  console.log(`Successfully built ${icons.length} icons to ${outputFile}`);
}

buildIcons().catch(err => {
  console.error('Error building icons:', err);
  process.exit(1);
});
