import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// Use different storage paths for mobile vs web
const NOTES_FILE = Platform.select({
  web: () => {
    // On web, use localStorage instead of FileSystem
    return 'localStorage';
  },
  default: () => {
    // On mobile (iOS/Android), use the document directory
    return FileSystem.Paths.document.uri + 'notes.json';
  },
})();

export { NOTES_FILE };
