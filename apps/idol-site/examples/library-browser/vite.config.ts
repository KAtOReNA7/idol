import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({publicDir:false,plugins:[react()],server:{host:'0.0.0.0',port:5190,strictPort:true},build:{outDir:'handoff/library-browser/browser-build',emptyOutDir:true,rollupOptions:{input:'examples/library-browser/index.html'}}});
