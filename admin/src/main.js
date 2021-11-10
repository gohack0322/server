import { createApp } from 'vue'
import App from './App.vue'
import store from '@/store'
import router from '@/router'
import { vfmPlugin } from 'vue-final-modal'
import 'bootstrap'

import '@/assets/scss/main.scss'

if (process.env.NODE_ENV !== 'production') {
    window.vuex = store
}

const app = createApp(App)

app.use(store)
    .use(router)
    .use(vfmPlugin({
        key: '$vfm',
        componentName: 'VueFinalModal',
        dynamicContainerName: 'ModalsContainer'
    }))

app.mount('#app')
