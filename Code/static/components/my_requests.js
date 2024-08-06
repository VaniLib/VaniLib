export default ({
    data: () => ({ my_requests: [] }),
    methods: {
        get_requests() {
            fetch('/api/my_requests', {
                headers: { 'Authentication-Token': localStorage.getItem('auth-token') }
            }).then(async (res) => {
                if (res.ok) { this.my_requests = await res.json() }
            })
        }
    },
    created() { this.get_requests() },
    template: `
    <div class="px-3 mt-3 pb-5">
        <div class="clearfix" style="margin-top: 10px">
            <div class="float-start">
                <h3>Recent Book Request</h3>
            </div>
        </div>

        <div class="row mt-3">
            <div class="col-lg-12">
                <table class="table table-bordered" style="text-align: center">
                    <thead>
                        <tr>
                            <th>Book Name</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="request,i in my_requests" :key="i">
                            <td> {{request.book.title}} </td>
                            <td>
                                <template v-if="request.is_approved && !request.is_returned && !request.is_revoked && !request.is_rejected">
                                    <p class="text-primary mb-0">Issued on {{request.issue_date}}</p>
                                    <button  class="btn btn-outline-primary">
                                        <router-link :to="'read/'+request.book.book_id">Read</router-link>
                                    </button>
                                </template>
                                <template v-if="!request.is_approved && !request.is_returned && !request.is_revoked && !request.is_rejected">
                                    <p class="text-info mb-0">Pending</p>
                                </template>
                                <template v-if="!request.is_approved && request.is_rejected">
                                    <p class="text-danger mb-0">Rejected</p>
                                </template>
                                <template v-if="request.is_approved && request.is_returned">
                                    <p class="text-success mb-0">Returned on {{request.return_date}}</p>
                                </template>
                                <template v-if="request.is_approved && request.is_revoked">
                                    <p class="text-danger mb-0">Revoked Access</p>
                                </template>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>`
})