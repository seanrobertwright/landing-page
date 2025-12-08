import { FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';
import { initSchema } from '@/lib/db/schema';

/**
 * Playwright Global Setup
 *
 * This runs once before all E2E tests.
 * It creates and seeds a test database so tests have consistent data.
 */
async function globalSetup(config: FullConfig) {
  console.log('🔧 Setting up test database...');

  // Use test database path
  const testDbPath = path.join(process.cwd(), 'data', 'links.test.db');

  // Ensure data directory exists
  const dataDir = path.dirname(testDbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Delete existing test database if it exists
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
    console.log('   Removed existing test database');
  }

  // Create new test database
  const db = new Database(testDbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Initialize schema
  initSchema(db);
  console.log('   Initialized database schema');

  // Seed test data
  const webDevFolderId = crypto.randomUUID();
  const designFolderId = crypto.randomUUID();
  const toolsFolderId = crypto.randomUUID();

  // Create folders
  db.prepare('INSERT INTO folders (id, name, parent_id, sort_order) VALUES (?, ?, ?, ?)').run(
    webDevFolderId,
    'Web Development',
    null,
    100
  );

  db.prepare('INSERT INTO folders (id, name, parent_id, sort_order) VALUES (?, ?, ?, ?)').run(
    designFolderId,
    'Design Resources',
    null,
    200
  );

  db.prepare('INSERT INTO folders (id, name, parent_id, sort_order) VALUES (?, ?, ?, ?)').run(
    toolsFolderId,
    'Developer Tools',
    webDevFolderId, // Child of Web Development
    100
  );

  // Create links
  const links = [
    { title: 'GitHub', url: 'https://github.com', folder_id: webDevFolderId, sort_order: 100 },
    { title: 'MDN Web Docs', url: 'https://developer.mozilla.org', folder_id: webDevFolderId, sort_order: 200 },
    { title: 'Stack Overflow', url: 'https://stackoverflow.com', folder_id: webDevFolderId, sort_order: 300 },
    { title: 'Figma', url: 'https://figma.com', folder_id: designFolderId, sort_order: 100 },
    { title: 'Dribbble', url: 'https://dribbble.com', folder_id: designFolderId, sort_order: 200 },
    { title: 'VS Code', url: 'https://code.visualstudio.com', folder_id: toolsFolderId, sort_order: 100 },
    { title: 'Postman', url: 'https://www.postman.com', folder_id: toolsFolderId, sort_order: 200 },
  ];

  for (const link of links) {
    const linkId = crypto.randomUUID();
    db.prepare('INSERT INTO links (id, title, url, favicon_url, folder_id, sort_order) VALUES (?, ?, ?, ?, ?, ?)').run(
      linkId,
      link.title,
      link.url,
      null,
      link.folder_id,
      link.sort_order
    );
  }

  console.log('   Seeded test data:');
  console.log('     - 3 folders (Web Development, Design Resources, Developer Tools)');
  console.log('     - 7 links');

  // Close database
  db.close();

  console.log('✅ Test database ready at:', testDbPath);
  console.log('');
}

export default globalSetup;
