import { getDb, closeDb } from '../lib/db/index';
import { createFolder, getAllFolders } from '../lib/db/folders';
import { createLink, getAllLinks } from '../lib/db/links';

console.log('Checking database...');

const db = getDb();

const folders = getAllFolders();
const links = getAllLinks();

console.log(`Found ${folders.length} folders and ${links.length} links`);

if (links.length === 0) {
  console.log('Database is empty. Adding sample data...');

  // We'll create our own folders, no need to check for Bookmarks

  // Create some sample folders
  const webDevFolder = createFolder({ name: 'Web Development', parent_id: null });
  const designFolder = createFolder({ name: 'Design Resources', parent_id: null });
  const toolsFolder = createFolder({ name: 'Developer Tools', parent_id: webDevFolder.id });

  // Create sample links
  createLink({
    title: 'GitHub',
    url: 'https://github.com',
    favicon_url: 'https://github.com/favicon.ico',
    folder_id: webDevFolder.id,
  });

  createLink({
    title: 'MDN Web Docs',
    url: 'https://developer.mozilla.org',
    favicon_url: 'https://developer.mozilla.org/favicon.ico',
    folder_id: webDevFolder.id,
  });

  createLink({
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com',
    favicon_url: 'https://stackoverflow.com/favicon.ico',
    folder_id: webDevFolder.id,
  });

  createLink({
    title: 'Figma',
    url: 'https://figma.com',
    favicon_url: 'https://figma.com/favicon.ico',
    folder_id: designFolder.id,
  });

  createLink({
    title: 'Dribbble',
    url: 'https://dribbble.com',
    favicon_url: 'https://dribbble.com/favicon.ico',
    folder_id: designFolder.id,
  });

  createLink({
    title: 'VS Code',
    url: 'https://code.visualstudio.com',
    favicon_url: 'https://code.visualstudio.com/favicon.ico',
    folder_id: toolsFolder.id,
  });

  createLink({
    title: 'Postman',
    url: 'https://www.postman.com',
    favicon_url: 'https://www.postman.com/favicon.ico',
    folder_id: toolsFolder.id,
  });

  console.log('Sample data created successfully!');

  const updatedFolders = getAllFolders();
  const updatedLinks = getAllLinks();
  console.log(`Now have ${updatedFolders.length} folders and ${updatedLinks.length} links`);
} else {
  console.log('Database already has data. Skipping seed.');
}

closeDb();
console.log('Done!');
