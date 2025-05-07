import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

async function importAllRoutes() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const routesDir = path.join(__dirname, '..', 'routes');

  try {
    const files = await fs.readdir(routesDir);
    const modules = [];

   for await (const file of files) {
      if (file.endsWith('.js') && (await fs.stat(path.join(routesDir, file))).isFile()) {
        const routeModule = await import(`../routes/${file}`);
        modules.push(routeModule);
      }
    }

    return modules;
  } catch (error) {
    console.error('Error reading routes directory:', error);
    return {};
  }

}

export default importAllRoutes;