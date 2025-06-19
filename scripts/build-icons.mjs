import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import pLimit from 'p-limit';

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

  const limit = pLimit(100); // Limit to 100 concurrent file reads

  const icons = await Promise.all(
    iconFiles.map(file =>
      limit(async () => {
        const content = await readFile(file, 'utf-8');
        const relativePath = path.relative(inputDir, file);

        const [collection, part1, part2, ...rest] = relativePath.split(
          path.sep
        );
        // This will handle cases where icons are directly in the collection folder
        const name = part2
          ? path.basename(rest.join(path.sep), '.svg')
          : path.basename(part1, '.svg');

        // Heuristic to determine if the structure is collection/style/category or collection/category/style
        const isStyleFirst = [
          'solid',
          'regular',
          'light',
          'thin',
          'duotone',
          'brands',
          'sharp-solid',
          'sharp-regular',
          'sharp-light',
          'sharp-thin',
        ].includes(part1);

        const style = isStyleFirst ? part1 : part2;
        const category = isStyleFirst ? part2 : part1;

        return {
          name,
          collection,
          category: category || 'general', // Assign a default category if none is found
          style: style || 'default', // Assign a default style if none is found
          path: relativePath,
          content,
        };
      })
    )
  );

  await writeFile(outputFile, JSON.stringify(icons, null, 2));
  console.log(`Successfully built ${icons.length} icons to ${outputFile}`);
}

buildIcons().catch(err => {
  console.error('Error building icons:', err);
  process.exit(1);
});
