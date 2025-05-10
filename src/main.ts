import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { setupElementPlus } from './plugins/element'
import i18n from './plugins/i18n'

import 'animate.css'
import './assets/main.css'
import './assets/styles/variables.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
setupElementPlus(app)

app.mount('#app')
