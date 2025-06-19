import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import pLimit from 'p-limit';

const inputDir = path.join(process.cwd(), 'src/assets/icons');
const outputDir = path.join(process.cwd(), 'public', 'icons');
const manifestFile = path.join(outputDir, 'manifest.json');

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
  await mkdir(outputDir, { recursive: true });

  const iconFiles = await getIconFiles(inputDir);
  console.log(`Found ${iconFiles.length} icons.`);

  const limit = pLimit(100);

  const allIcons = await Promise.all(
    iconFiles.map(file =>
      limit(async () => {
        const content = await readFile(file, 'utf-8');
        const relativePath = path.relative(inputDir, file);

        const parts = relativePath.split(path.sep);
        const collection = parts.shift();
        const filename = parts.pop();
        const name = path.basename(filename, '.svg');

        let style, category;

        // General logic for parsing styles and categories
        switch (collection) {
          case 'font-awesome':
            // Structure: font-awesome/{style}/{...category}/{icon}.svg
            style = parts.shift() || 'default';
            category = parts.join(path.sep) || 'general';
            break;
          case 'panda':
            // Structure: panda/{style}/{icon}.svg
            style = parts.shift() || 'default';
            category = 'general';
            break;
          case 'huge':
          default:
            // Structure: huge/{category}/{style}/{icon}.svg
            category = parts.shift() || 'general';
            style = parts.shift() || 'default';
            break;
        }

        return {
          name,
          collection,
          category,
          style,
          path: relativePath,
          content,
        };
      })
    )
  );

  const iconsByCollection = allIcons.reduce((acc, icon) => {
    if (!acc[icon.collection]) {
      acc[icon.collection] = [];
    }
    acc[icon.collection].push(icon);
    return acc;
  }, {});

  for (const collectionName in iconsByCollection) {
    const filePath = path.join(outputDir, `${collectionName}.json`);
    await writeFile(
      filePath,
      JSON.stringify(iconsByCollection[collectionName], null, 2)
    );
    console.log(
      `Successfully built ${iconsByCollection[collectionName].length} icons to ${filePath}`
    );
  }

  const manifest = {
    collections: Object.keys(iconsByCollection).sort(),
  };
  await writeFile(manifestFile, JSON.stringify(manifest, null, 2));
  console.log('Successfully created manifest file.');
}

buildIcons().catch(err => {
  console.error('Error building icons:', err);
  process.exit(1);
});
