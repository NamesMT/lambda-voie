import { defineConfig } from 'vitepress'

export default defineConfig({
  head: [['link', { rel: 'icon', href: '/lambda-voie.svg' }]],
  title: 'lambda-voie',
  description: 'The "way" to AWS Lambda API',
  themeConfig: {
    logo: '/lambda-voie.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Start', link: '/getting-started' },
    ],

    sidebar: [
      {
        items: [
          { text: 'Getting Started', link: '/getting-started' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/namesmt/lambda-voie' },
    ],
  },
})
