import DefaultTheme from 'vitepress/theme'
import LandingPage from './LandingPage.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('LandingPage', LandingPage)
  },
}
