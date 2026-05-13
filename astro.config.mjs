import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://astrobiologia.com.br',
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [
    vue(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pt-br', 'es', 'ja', 'nl', 'zh'],
    routing: {
      prefixDefaultLocale: false
    }
  }
});
