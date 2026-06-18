// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2026-06-16',
  future: {
    compatibilityVersion: 4,
  },
  css: [
    '~/assets/styles/main.css'
  ],
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    head: {
      title: 'Vibes',
      meta: [
        { name: 'theme-color', content: '#0c0f18' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover' }
      ],
      link: [
        { rel: 'manifest', href: '/manifest.json' }
      ]
    }
  },
  modules: [],
  devtools: { enabled: false }
})
