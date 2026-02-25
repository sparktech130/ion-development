module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        alias: {
          '@': './src',
          '@auth': './src/auth',
          '@screens': './src/screens',
          '@components': './src/components',
          '@camera': './src/camera',
          '@context': './src/context',
          '@navigation': './src/navigation',
          '@theme': './src/theme',
          '@utils': './src/utils',
          '@types': './src/types'
        },
      },
    ],
    'react-native-worklets-core/plugin',
  ],
};
