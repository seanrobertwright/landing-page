# Bookmark Import/Export Documentation

## Overview

The bookmark import/export feature allows users to migrate bookmarks from their browsers and create backups of their bookmark collection.

## Supported Browsers

The import feature supports the standard Netscape HTML bookmark format exported by:
- **Chrome** (Bookmarks > Bookmark Manager > Export bookmarks)
- **Firefox** (Bookmarks > Show All Bookmarks > Import and Backup > Export Bookmarks to HTML)
- **Edge** (Favorites > ... > Export favorites)
- **Safari** (File > Export Bookmarks)

## How to Export Bookmarks from Your Browser

### Chrome
1. Open Chrome and press `Ctrl+Shift+O` (or `Cmd+Option+B` on Mac)
2. Click the three dots menu (⋮) in the top right
3. Select "Export bookmarks"
4. Save the HTML file

### Firefox
1. Open Firefox and press `Ctrl+Shift+B` (or `Cmd+Shift+B` on Mac)
2. Click "Import and Backup" in the toolbar
3. Select "Export Bookmarks to HTML..."
4. Save the HTML file

### Edge
1. Open Edge and press `Ctrl+Shift+O`
2. Click the three dots menu (···) in the top right
3. Select "Export favorites"
4. Save the HTML file

### Safari
1. Open Safari and select "File" > "Export Bookmarks..."
2. Choose a location and save the file

## Importing Bookmarks

1. Click the **Import** button in the application header
2. Click "Choose File" and select your browser's bookmark export file (.html)
3. Choose a duplicate handling strategy:
   - **Skip duplicates**: Bookmarks with existing URLs will be skipped
   - **Update existing**: Existing bookmarks will be updated with new title and folder
4. Click **Import**
5. Wait for the import to complete
6. Review the import summary showing:
   - Folders added
   - Bookmarks added
   - Bookmarks updated (if using update strategy)
   - Bookmarks skipped (if using skip strategy)

## Exporting Bookmarks

1. Click the **Export** button in the application header
2. The browser will download a JSON file named `bookmarks-YYYY-MM-DD.json`
3. Save the file to a safe location for backup

## Export File Format

The export creates a JSON file with the following structure:

```json
{
  "version": "1.0",
  "exported_at": "2025-01-15T10:30:00Z",
  "folder_count": 10,
  "link_count": 150,
  "folders": [
    {
      "id": "uuid",
      "name": "Folder Name",
      "parent_id": "parent-uuid-or-null",
      "sort_order": 100
    }
  ],
  "links": [
    {
      "id": "uuid",
      "title": "Link Title",
      "url": "https://example.com",
      "folder_id": "folder-uuid",
      "sort_order": 100
    }
  ]
}
```

## Re-importing JSON Exports

While the application primarily imports HTML bookmark files, the JSON export format is designed to be re-importable in future versions for backup restoration and data portability.

## Limitations

- **File Size**: Maximum import file size is 50MB
- **URL Length**: URLs longer than 2048 characters are skipped
- **Folder Names**: Limited to 255 characters (automatically truncated)
- **Performance**: Large imports (5000+ bookmarks) may take 30-60 seconds

## Troubleshooting

### "Invalid bookmark file format"
- Ensure you're uploading an HTML file exported from a supported browser
- Check that the file isn't corrupted or empty

### "File too large. Maximum size is 50MB"
- Your bookmark file exceeds the size limit
- Consider splitting bookmarks into smaller groups

### Some bookmarks weren't imported
- Check the import summary for details
- Invalid URLs or unsupported formats are automatically skipped
- Duplicate URLs are handled according to your selected strategy

### Import is taking a long time
- Large bookmark collections (1000+) can take several seconds to process
- Wait for the import to complete - do not close the dialog

## Data Safety

- **Transactions**: All imports use database transactions, ensuring atomicity
- **Rollback**: If an error occurs during import, all changes are automatically rolled back
- **No Data Loss**: Your existing bookmarks are never modified during failed imports
- **Backups**: Regular exports provide backup functionality

## Privacy

- All import/export operations happen locally on your device
- No bookmark data is sent to external servers
- Your bookmarks remain private and secure

## UI Overview

### Import Dialog
The import dialog includes:
- **File Input**: Click to select an HTML bookmark file (.html extension)
- **File Info**: Shows selected filename and size
- **Duplicate Handling**: Radio buttons to choose "Skip duplicates" or "Update existing"
- **Progress Bar**: Animated progress indicator during import
- **Import Summary**: Displays folders added, bookmarks added/updated/skipped after completion
- **Buttons**: Import (starts the process) and Cancel

### Export Button
- Located in the application header next to the Import button
- Click to immediately download bookmarks as JSON
- Shows "Exporting..." state while generating the file
- Success notification appears after download starts

### Keyboard Shortcuts
- **Ctrl/Cmd + I**: Open import dialog
- **Ctrl/Cmd + E**: Trigger export download

The keyboard shortcuts are displayed as visual hints on the Import and Export buttons for easy discovery.
