// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Set this to the production domain before deploying (used for canonical URLs and the sitemap).
  site: 'https://casacraft.example',
  output: 'static',
  trailingSlash: 'ignore',
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  image: { responsiveStyles: false },
  build: { inlineStylesheets: 'auto' },
});
