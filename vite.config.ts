import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    build: {
      rollupOptions: {
        input: {
        "404": path.resolve(__dirname, '404.html'),
        about: path.resolve(__dirname, 'about.html'),
        admin: path.resolve(__dirname, 'admin/index.html'),
        "blog-post": path.resolve(__dirname, 'blog-post.html'),
        blog: path.resolve(__dirname, 'blog.html'),
        contact: path.resolve(__dirname, 'contact.html'),
        index: path.resolve(__dirname, 'index.html'),
        portfolio: path.resolve(__dirname, 'portfolio.html'),
        pricing: path.resolve(__dirname, 'pricing.html'),
        "service-branding": path.resolve(__dirname, 'service-branding.html'),
        "service-digital-marketing": path.resolve(__dirname, 'service-digital-marketing.html'),
        "service-graphic-design": path.resolve(__dirname, 'service-graphic-design.html'),
        "service-website-development": path.resolve(__dirname, 'service-website-development.html'),
        services: path.resolve(__dirname, 'services.html')
        }
      }
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
