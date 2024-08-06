export default ({
    data: () => ({ search_value: '' }),
    methods: {
        search() {
            this.$router.push({ name: 'SearchResult', query: { search_value: this.search_value } })
        },
        log_out() {
            if (!confirm("Do you want to log out?")) {
                return
            }
            localStorage.removeItem('auth-token')
            localStorage.removeItem('role')
            localStorage.removeItem('username')
            this.$router.push({ name: "Login" })
        }
    },
    created() { this.search_value = this.$route.query.search_value },
    computed: {
        role() { return localStorage.getItem('role') },
        is_logged_in() { return localStorage.getItem('auth-token') }
    },
    template:
        `<div>
            <nav class="navbar navbar-expand-lg border-bottom">
                <div class="container-fluid">
                    <a class="navbar-brand"> <h2> Vani | E-Library </h2> </a>
                    <div class="collapse navbar-collapse">
                        <ul class="navbar-nav">
                            <template v-if="is_logged_in">
                                <li class="nav-item">
                                    <router-link to="/" tag="a" class="nav-link">Home</router-link>
                                </li>

                                <li class="nav-item">
                                    <router-link to="/books" tag="a" class="nav-link">All Books</router-link>
                                </li>

                                <li class="nav-item">
                                    <router-link to="/sections" tag="a" class="nav-link">Sections</router-link>
                                </li>

                                <li class="nav-item" v-if="role=='member'">
                                    <router-link to="/my_requests" tag="a" class="nav-link">My Requests</router-link>
                                </li>

                                <li class="nav-item" v-if="role=='member'">
                                    <router-link to="/approved_books" tag="a" class="nav-link">Approved Books</router-link>
                                </li>

                                <li class="nav-item" v-if="role=='member'">
                                    <router-link to="/completed_books" tag="a" class="nav-link">Completed Books</router-link>
                                </li>

                                <li class="nav-item" v-if="role=='librarian'">
                                    <router-link to="/requests" tag="a" class="nav-link">User Requests</router-link>
                                </li>

                                <li class="nav-item" v-if="role=='librarian'">
                                    <router-link to="/list_users" tag="a" class="nav-link">List Of Users</router-link>
                                </li>
                                
                                <li class="nav-item" v-if="role=='librarian'">
                                    <router-link to="/admin_stat" tag="a" class="nav-link">Admin Stats</router-link>
                                </li>
                            </template>
                        </ul>
                    </div>

                    <form class="d-flex" role="search" v-if="is_logged_in">
                        <input class="form-control me-2" type="search" placeholder="Search" v-model="search_value" aria-label="Search">
                        <button type="button" class="btn btn-outline-success" @click="search">Search</button>
                    </form>
                    
                    <button class="btn btn-outline-danger" style="margin-left: 20px; margin-right: 10px;" @click="log_out()" v-if="is_logged_in">Log Out</button>

                </div>
            </nav>
        </div>`
})