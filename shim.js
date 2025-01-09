// Import random values polyfill first to ensure crypto.getRandomValues works
import 'react-native-get-random-values';

// Polyfill global Node.js modules
import { polyfillGlobal } from 'react-native';
import crypto from 'react-native-crypto';
import stream from 'react-native-stream';
import randomBytes from 'react-native-randombytes';

// Apply polyfills for required Node.js modules
polyfillGlobal('crypto', () => crypto);
polyfillGlobal('stream', () => stream);
polyfillGlobal('randomBytes', () => randomBytes);
