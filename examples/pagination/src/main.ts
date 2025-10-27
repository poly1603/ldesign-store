import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'reflect-metadata'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')

