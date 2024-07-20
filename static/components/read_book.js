export default ({
    data: () => ({
        bookInfo: { feedbacks: [] },
        bootstrap_modal: {},
        new_review: '',
        allowed_to_read: false,
    }),
    computed: { role() { return localStorage.getItem('role') } },
    methods: {
        get_book_details() {
            this.allowed_to_read = false;
            fetch("/api/book/" + this.$route.params.id, {
                method: "GET",
                headers: { 'Authentication-Token': localStorage.getItem('auth-token') }
            }).then((res) => res.json()).then((res) => {
                this.bookInfo = res;
                console.log(this.bookInfo.image)
                if (this.bookInfo.is_approved_for_me) {
                    this.allowed_to_read = true;
                }
            })
        },
        return_book(book_id) {
            fetch('/api/return_request/' + book_id, {
                headers: { 'Authentication-Token': localStorage.getItem('auth-token') }
            }).then((res) => { if (res.ok) { this.get_book_details() } })
        },
        submit_review() {
            fetch("/api/review/" + this.bookInfo.book_id, {
                method: "POST",
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ review: this.new_review })
            }).then(() => {
                this.bootstrap_modal.hide()
                this.clear_review()
                this.get_book_details()
            })
        },
        delete_book() {
            if (!confirm("Are you sure to delete the book?")) {
                return;
            }
            fetch("/api/book/" + this.bookInfo.book_id, {
                method: "DELETE",
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json',
                }
            }).then((res) => {
                if (res.ok) { this.$router.push({ name: "AllBooks" }) }
            })
        },
        clear_review() { this.new_review = '' }
    },
    mounted() {
        this.get_book_details()
        this.bootstrap_modal = new bootstrap.Modal(document.getElementById('book_review_modal'));
    },
    template: `
        <div class="px-3 mt-3 pb-5 vh-100">
            <div class="clearfix mt-3">
                <div class="float-start">
                    <h2 class="mb-4"> {{bookInfo.title}} </h2>

                    <template v-if="role=='member'">
                        <button class="btn btn-outline-danger" v-if="bookInfo.is_approved_for_me" @click="return_book(bookInfo.request_id)">Return Book</button>
                    </template>

                    <template v-else>
                        <button class="btn btn-outline-danger" @click="delete_book()">Delete The Book</button>
                    </template>
                    
                    <button class="btn btn-outline-info"  v-if="!bookInfo.wrote_review" data-bs-toggle="modal" data-bs-target="#book_review_modal">Write a Review</button>
                </div>

                <div class="float-end">
                    <img height="200" :src="'static/uploaded/'+bookInfo.image" alt="Book Image" />
                </div>
            </div>

            <hr>

            <div v-if="allowed_to_read||role=='librarian'">
                <h5>Author : </h5>
                <p class="fs-regular text-break fw-light px-5 mt-3">{{bookInfo.author}}</p>
                <h5>Content : </h5>
                <p class="fs-regular text-break fw-light px-5 mt-3">{{bookInfo.content}}</p>
                <h5>Prolouge : </h5>
                <p class="fs-regular text-break fw-light px-5 mt-3">{{bookInfo.prologue}}</p>
            </div>
            <div class="alert alert-danger px-5 mt-3" v-else>You Don't access to read this book.</div>
            
            <hr>

            <h5>Reviews : </h5>
            <div class="row px-5 mt-3">
                <div class="col-lg-4" v-for="(feedback,i) in  bookInfo.feedbacks" :key="i">
                    <div class="card">
                        <div class="card-header"> <b> {{feedback.user.name}} </b> </div>
                        <div class="card-body">{{feedback.feedback}}</div>
                    </div>
                </div>
            </div>
            
            <div class="modal fade" id="book_review_modal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Review for {{bookInfo.title}}</h5>
                        </div>
                        
                        <div class="modal-body">
                            <div class="form-group">
                                <textarea v-model="new_review" class="form-control" rows="5" placeholder="Write Review"/>
                            </div>
                        </div>

                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline-danger" data-bs-dismiss="modal" @click="clear_review">Close</button>
                            <button type="button" class="btn btn-outline-success" @click="submit_review">Submit</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`
})




