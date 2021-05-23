import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'

import App from '@/App'
import routes from '@/routes'
import buildStore from "@/store"
import '@/assets/css/main.css'

Vue.config.productionTip = false
Vue.use(VueRouter)
Vue.use(Vuex)

const router = new VueRouter({ routes })
const store = buildStore()

new Vue({
    router: router,
    store: store,
    render: h => h(App),
}).$mount('#app')
