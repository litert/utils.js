import { defineConfig } from 'vitepress'
import typedocSidebar from '../typedoc-sidebar.json';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "@litert/utils",
  description: "The utility functions/classes/constants for JavaScript/TypeScript.",
  base: '/projects/utils.js/',
  sitemap: {
    hostname: 'https://litert.org/projects/utils.js/' // Replace with your actual domain
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'API Reference', link: '/en/api/' },
    ],

    sidebar: [
      {
        text: 'API Reference',
        items: typedocSidebar,
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/litert/utils.js' }
    ]
  }
});
