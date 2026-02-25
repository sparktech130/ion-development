const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

const config = {
  resolver: {
    extraNodeModules: {
      '@auth': path.resolve(__dirname, 'src/auth'),
      '@screens': path.resolve(__dirname, 'src/screens'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@camera': path.resolve(__dirname, 'src/camera'),
      '@context': path.resolve(__dirname, 'src/context'),
      '@navigation': path.resolve(__dirname, 'src/navigation'),
      '@theme': path.resolve(__dirname, 'src/theme'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
