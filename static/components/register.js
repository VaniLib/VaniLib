export default ({
    data: () => ({
        user: { email: null, name: null, password: null },
        error: ''
    }),
    methods: {
        async register() {
            fetch('/user_register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.user)
            }).then(async (res) => {
                const data = await res.json();
                if (res.ok) {
                    localStorage.setItem('auth-token', data.token)
                    localStorage.setItem('role', data.role)
                    localStorage.setItem('username', data.username)
                    this.$router.push({ path: '/' })
                } else {
                    this.error = data.message
                    setTimeout(() => {
                        this.error = '';
                    }, 3000);

                    this.user.email = null
                    this.user.password = null
                    this.user.name = null
                }
            });
        }
    },
    template: `
    <div id="login" class="d-flex align-items-center vh-100">
        <div class="row w-100 justify-content-center">
            <div class="col-lg-6 login-inner">
                <div>
                    <header>
                        <h2 class="text-center">Join Our Community!!</h2>
                    </header>
                    <div class="form-group">
                        <br>
                        <input type="text"  v-model="user.name" class="form-control" placeholder="Full name" required/>
                        <br>
                        <input type="username" v-model="user.email"  class="form-control" placeholder="Email ID" required/>
                        <br>
                        <input type="password"  v-model="user.password" class="form-control" placeholder="Password" required/>
                        <br>

                        <div class="alert alert-danger" v-if="error!=''">
                            {{error}}
                        </div>

                        <button @click="register" class="btn btn-dark w-100">
                            <span>Register ...</span>
                        </button>
                    </div>

                    <p class="mb-0 mt-2"/>

                    <router-link to="/login">
                        <button class="btn btn-dark w-100"> Already a member? Login ... </button>
                    </router-link>
                </div>
            </div>
        </div>
    </div>`
})