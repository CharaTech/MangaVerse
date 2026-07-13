import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Configure the Vite development and production pipeline for the web client.
export default defineConfig({
  plugins: [react()],
});
