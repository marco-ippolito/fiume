import { defineConfig } from 'vitepress'
import { OramaPlugin } from '@orama/plugin-vitepress'

export default defineConfig({
  vite: {
    plugins: [OramaPlugin()]
  },
  title: "Fiume",
  description: "Fiume is a zero-dependency, simple, and flexible state machine library written in TypeScript. It is compatible with all JavaScript runtimes and is designed to manage the flow of a system through various states. This library provides a lightweight and intuitive way to define states, transitions, and hooks for state entry, exit, and transition events.",
  themeConfig: {
    // search: {
    //   provider: 'local',
    // },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/examples' }
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Slot Machine', link: '/examples' }
        ]
      },
      {
        text: 'Documentation',
        items: [
          { text: 'Introduction', link: '/documentation' },
          { text: 'Api', link: '/api' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/marco-ippolito/fiume' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/fiume'
    }
    ]
  }})
