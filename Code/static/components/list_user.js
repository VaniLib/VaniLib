export default ({
    data: () => ({ users: [] }),
    methods: {
        get_all_users() {
            fetch('/api/users', {
                headers: { 'Authentication-Token': localStorage.getItem('auth-token') }
            }).then(res => res.json()).then((res) => { this.users = res })
        }
    },
    created() { this.get_all_users() },
    template: `
        <div class="px-3 mt-3 pb-5">
            <h3>List Of Users</h3>
            <table class="table table-bordered table-hover mt-3" style="text-align: center">
                <thead>
                    <tr>
                        <th>User Name</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user,i in users">
                        <td>{{user.name}}</td>
                        <td>
                            <button class="btn btn-outline-success">
                                <router-link :to="'/users_info/'+user.id">View information</router-link>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>    
        </div>`
})