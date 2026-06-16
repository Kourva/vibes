// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2026-06-16',
  future: {
    compatibilityVersion: 4,
  },
  css: [
    '~/assets/styles/main.css'
  ],
  modules: [],
  devtools: { enabled: false }
})
