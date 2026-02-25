import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import eslint from 'vite-plugin-eslint'
import { url_path_city } from './src/constants/common'
import path from 'path';
import svgr from 'vite-plugin-svgr'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), eslint(), svgr()],
  base: url_path_city+'/',
  assetsInclude: ["**/*.glb", "**/*.gltf"],
  define: {
    'process.env': process.env,
  },
  resolve: {
    alias: {
        crypto: 'crypto-browserify',
        '@icons': path.resolve(__dirname, 'src/assets/icons'),
        '@images': path.resolve(__dirname, 'src/assets/images'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@api': path.resolve(__dirname, 'src/api'),
        '@context': path.resolve(__dirname, 'src/context'),
        '@styles': path.resolve(__dirname, 'src/styles'),
        '@constants': path.resolve(__dirname, 'src/constants'),
        '@utils': path.resolve(__dirname, 'src/utils'),

    },
  }
})
