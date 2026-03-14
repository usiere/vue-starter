import { config } from '@vue/test-utils'
import { createVuetify } from 'vuetify'

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light'
  }
})

config.global.plugins = [vuetify]