/**
 * @format
 */

import 'react-native';
import 'jest-react-native';

// Mock React Native modules
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('react-native-vision-camera', () => ({
  Camera: {
    requestCameraPermission: jest.fn(),
  },
}));

// Silence console errors and warnings during tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  // Keep other methods as-is
  log: console.log,
  info: console.info,
  debug: console.debug,
};
