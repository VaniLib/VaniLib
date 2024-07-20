export default ({
    data: () => ({
        bootstrap_modal: {},
        book_id: '',
        book_info: { section: {}, requests: [] },
    }),
    methods: {
        viewModal(book) {
            this.book_info = book
            this.book_id = book.book_id
            this.get_book_details(book.book_id)
            this.bootstrap_modal.show()
        },
        get_book_details(book_id) {
            fetch('/api/book/' + book_id, {
                headers: { 'Authentication-Token': localStorage.getItem('auth-token') },
                method: 'GET',
            }).then((res) => { if (res.ok) { this.book_info = res.json() } })
        },
        refresh_page() {
            this.$router.go(0)
        },
        approve_book(request_id) {
            fetch('/api/approve_request/' + request_id, {
                headers: { 'Authentication-Token': localStorage.getItem('auth-token') }
            }).then((res) => {
                if (res.ok) {
                    this.get_book_details(this.book_info.book_id)
                    this.refresh_page()
                }
            })
        },
        revoke_book(request_id) {
            fetch('/api/revoke_request/' + request_id, {
                headers: { 'Authentication-Token': localStorage.getItem('auth-token') }
            }).then((res) => {
                if (res.ok) {
                    this.get_book_details(this.book_info.book_id)
                    this.refresh_page()
                }
            })
        },
        reject_book(request_id) {
            fetch('/api/reject_request/' + request_id, {
                headers: { 'Authentication-Token': localStorage.getItem('auth-token') }
            }).then((res) => {
                if (res.ok) {
                    this.get_book_details(request_id)
                    this.refresh_page()
                }
            })
        },
        request_book() {
            fetch(`/api/request_book/${this.book_id}`, {
                headers: { 'Authentication-Token': localStorage.getItem('auth-token') }
            }).then((res) => {
                if (res.ok) {
                    this.get_book_details(this.book_id)
                    this.bootstrap_modal.hide()
                    this.refresh_page()
                }
            })
        }
    },
    mounted() {
        this.bootstrap_modal = new bootstrap.Modal(document.getElementById('view_book_detail_modal'));
    },
    computed: {
        role() { return localStorage.getItem('role') },
        image_display_fn: function () {
            let image_path = ""
            if (this.book_info.hasOwnProperty('image')) {
                image_path = "static/img/no_image_found.png"
                if (this.book_info.image != "") {
                    image_path = "static/uploaded/" + this.book_info.image
                }
            }
            return image_path
        }
    },
    template: `
        <div>
            <div class="modal fade" id="view_book_detail_modal" tabindex=-1 aria-hidden="true">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content" style="background-color: #faf8f5">
                        <div class="modal-header">
                            <h4 class="modal-title"> Book Details </h4>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-lg-5 text-center mx-auto">
                                    <div class="mx-auto">
                                        <img class="mx-auto" :alt="book_info.title" style="max-width: 100%; height: 500px" :src="image_display_fn"/>
                                    </div>
                                </div>

                                <div class="col-lg-7">
                                    <div class="clearfix">
                                        <div class="float-start">
                                            <h2> <i> {{ book_info.title }} </i> </h2>
                                        </div>
                                        <div class="float-end" v-if="role=='librarian'">
                                            <router-link class="text-white" :to="'/edit_book/'+book_info.book_id">
                                                <button class="btn btn-outline-primary" data-bs-dismiss="modal" >
                                                    Edit Info
                                                </button>
                                            </router-link>
                                        </div>
                                        
                                        <div class="float-end px-3">
                                            <router-link class="text-white" :to="'/read/'+book_info.book_id">
                                                <button class="btn btn-outline-primary" data-bs-dismiss="modal">
                                                    <p class="mb-0" v-if="role=='librarian'"> View / Manage Book </p>
                                                    <p class="mb-0" v-if="role=='member'"> View Book </p>
                                                </button>
                                            </router-link>
                                        </div>

                                    </div>
                                    <br>
                                    <ul class="nav nav-tabs" role="tablist">
                                        <li class="nav-item">
                                            <button class="nav-link active" id="home-tab" data-bs-toggle="tab"
                                                    data-bs-target="#home" type="button" role="tab" aria-controls="home"
                                                    aria-selected="true">About Book</button>
                                        </li>
                                        <li class="nav-item" v-if="role=='librarian'">
                                            <button class="nav-link" id="profile-tab" data-bs-toggle="tab"
                                                    data-bs-target="#profile" type="button" role="tab" aria-controls="profile"
                                                    aria-selected="false">Issued to</button>
                                        </li>
                                    </ul>
                                    <div class="tab-content mt-2">
                                        <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                                            <div class="fs-regular">
                                                <p class="mb-2"> <b> Author </b> : {{ book_info.author }} </p>
                                                <p class="mb-2"> <b> Section </b> : {{ book_info.section.section_name }} </p>
                                                <p class="mb-2"> <b> Prologue </b> : {{ book_info.prologue }} </p>
                                                <p class="mb-0"> <b> Content </b> : {{ book_info.content }} </p>
                                            </div>

                                            <template v-if="role!='librarian'">
                                                <br>
                                                <button v-if="book_info.is_approved_for_me" class="btn btn-outline-primary" data-bs-dismiss="modal">
                                                    <router-link :to="'read/'+book_info.book_id">Read</router-link>
                                                </button>
                                                <button v-else-if="book_info.is_pending_for_me" type="button" class="btn btn-danger" disabled>
                                                    <template>Approval pending for this book</template>
                                                </button>
                                                <template v-else-if="book_info.num_of_book_pending_for_me >= 5">
                                                    <div class="alert alert-danger">You can only request/read maximum of 5 books at a time</div>
                                                </template>
                                                <button v-else-if="!book_info.is_pending_for_me && !book_info.is_approved_for_me" type="button" class="btn btn-outline-primary" @click="request_book()">
                                                    Request this book
                                                </button>
                                            </template>
                                        </div>

                                        <div class="tab-pane fade" v-if="role=='librarian'" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                                            <table class="table table-bordered" style="text-align: center">
                                                <thead>
                                                <tr>
                                                    <th>User Name</th>
                                                    <th>Issued at</th>
                                                    <th>Status</th>
                                                </tr>
                                                </thead>

                                                <tbody>
                                                    <tr v-for="request,i in book_info.requests" :key="i" v-if="!request.is_approved && !request.is_rejected">
                                                        <td>{{request.user.name}}</td>
                                                        <td>Pending</td>
                                                        <td>
                                                            <button class="btn btn-sm btn-outline-success" @click="approve_book(request.id)">Approve</button>
                                                            <button class="btn btn-sm btn-outline-danger" @click="reject_book(request.id)">Reject</button>
                                                        </td>
                                                    </tr>
                                                    
                                                    <tr v-for="request,i in book_info.requests" :key="i" v-if="request.is_approved && !request.is_rejected && !request.is_returned && !request.is_revoked">
                                                        <td>{{request.user.name}}</td>
                                                        <td>{{request.issue_date}}</td>
                                                        <td>
                                                            <button class="btn btn-sm btn-outline-danger" @click="revoke_book(request.id)">Revoke Access</button>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline-danger" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`
})