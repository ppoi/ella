'use strict';

import path from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from "vite";

export default defineConfig({
  plugins:[
    svelte({})
  ],
  resolve: {
    alias: {
      '~': path.resolve(__dirname)
    },
  },
  server: {
    strictPort: true
  }
});