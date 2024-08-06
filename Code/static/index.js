import router from './router.js'
import NavBar from './components/nav_bar.js'


new Vue({
  el: '#app',
  router,
  components: { NavBar },
  data: { has_changed: true },
  watch: {
    $route(to, from) {
      this.has_changed = !this.has_changed
    },
  },
  template: `
    <div>
        <NavBar :key='has_changed'/>
        <router-view/>
      </div>
    </div>`
})