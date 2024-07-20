export default ({
    data: () => ({
        user: { email: null, password: null },
        error: ''
    }),
    methods: {
        async login() {
            fetch('/user_login', {
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
                }
            });
        }
    },
    template: `
    <div id="login" class="d-flex align-items-center vh-100">
        <div class="row w-100 justify-content-center">
            <div class="col-lg-6 text-center custom-text-color mb-4 mb-lg-0">
                <h1 class="display-1 mb-3">
                    Vani | E-Library
                </h1>
                <p class="blockquote">
                    Books are uniquely portable magic.
                    <br>
                    <cite class="small" title="Source Title">-Stephen King</cite>
                </p>
            </div>
            <div class="col-lg-6">
                <div class="login-inner">
                    <div>
                        <header>
                            <h2 class="text-center">Welcome Reader!</h2>
                        </header>
                        <div class="form-group">
                            <br>
                            <input type="username" v-model="user.email" class="form-control" placeholder="Email ID" required/>
                            <br>
                            <input type="password" v-model="user.password" class="form-control" placeholder="Password" required/>
                            <br>

                            <div class="alert alert-danger" v-if="error!=''">
                                {{error}}
                                <br>
                            </div>

                            <button @click="login" class="btn btn-dark w-100">
                                <span>Login ...</span>
                            </button>
                        </div>
                        
                        <p class="mb-0 mt-2"/>

                        <router-link to="/register">
                            <button class="btn btn-dark w-100"> Don't have an account yet? Register ... </button>
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>`
})