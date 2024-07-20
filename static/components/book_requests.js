export default ({
    data: () => ({ requests: [] }),
    methods: {
        get_pending_approvals() {
            fetch('/api/book_requests', {
                headers: { 'Authentication-Token': localStorage.getItem('auth-token') }
            }).then(res => res.json()).then((res) => { this.requests = res })
        },
        approve_book(book_id) {
            fetch('/api/approve_request/' + book_id, {
                headers: { 'Authentication-Token': localStorage.getItem('auth-token') }
            }).then((res) => { if (res.ok) { this.get_pending_approvals() } })
        },
        reject_book(book_id) {
            fetch('/api/reject_request/' + book_id, {
                headers: { 'Authentication-Token': localStorage.getItem('auth-token') }
            }).then((res) => { if (res.ok) { this.get_pending_approvals() } })
        }
    },
    created() { this.get_pending_approvals() },
    template: `
        <div class="vh-100 px-3 mt-3 pb-5">
            <h3>Requests</h3>
            <table class="table table-bordered table-hover mt-3" style="text-align: center">
                <thead>
                    <tr>
                        <th>Book Name</th>
                        <th>User Name</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="request,i in requests.pending">
                        <td>{{request.book.title}}</td>
                        <td>{{request.user.name}}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-success" @click="approve_book(request.id)">Approve</button>
                            <button class="btn btn-sm btn-outline-danger" @click="reject_book(request.id)">Reject</button>
                        </td>
                    </tr>
                </tbody>
            </table>    
        </div>`
})