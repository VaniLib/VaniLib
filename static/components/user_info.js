import Book from './partials/book.js';
import BookDetailsModal from "./partials/book_details_modal.js";

export default ({
    data: () => ({
        books_response: {},
        bootstrap_modal: {}
    }),
    methods: {
        get_user_info() {
            fetch('/api/users/' + this.$route.params.id, {
                method: 'GET',
                headers: { 'Authentication-Token': localStorage.getItem('auth-token') },
            }).then(res => res.json()).then((data) => { this.books_response = data })
        },
        show_book_detail(book) { this.$refs.bookModal.viewModal(book) }
    },
    created() {
        this.get_user_info()
    },
    components: { Book, BookDetailsModal },
    template: `
    <div class="px-3 mt-3 pb-5">        
        <div class="clearfix" style="margin-top: 10px">
            <div class="float-start">
                <h3>Completed Books</h3>
            </div>
        </div>
        
        <div class="card text-danger border-danger mt-3 card-body" v-if="books_response.completed.length==0">
            <h5> No books have been completed yet!! </h5>
        </div>
        <div v-else class="card-group card-group-scroll mt-3 px-3 mb-5">
            <div class="col-lg-2 px-2 mt-3 mb-3" style="border-collapse: collapse;" v-for="(book,i) in books_response.completed" :key="i">
                <Book @show_detail="show_book_detail" :key="i" :book="book"/>            
            </div>
        </div>

        <div class="clearfix mt-3">
            <div class="float-start">
                <h3>Approved Books</h3>
            </div>
        </div>

        <div class="card text-danger border-danger mt-3 card-body" v-if="books_response.approved.length==0">
            <h5> No books have been approved yet!! </h5>
        </div>
        <div v-else class="card-group card-group-scroll mt-3 px-3 mb-5">
            <div class="col-lg-2 px-2 mt-3 mb-3" style="border-collapse: collapse;" v-for="(book,i) in books_response.approved" :key="i">
                <Book @show_detail="show_book_detail" :key="i" :book="book"/>            
            </div>
        </div>
        
        <div class="clearfix mt-3">
            <div class="float-start">
                <h3>Requested Books</h3>
            </div>
        </div>

        <div class="card text-danger border-danger mt-3 card-body" v-if="books_response.requested.length==0">
            <h5> No books have been requested yet!! </h5>
        </div>
        <div v-else class="card-group card-group-scroll mt-3 px-3 mb-5">
            <div class="col-lg-2 px-2 mt-3 mb-3" style="border-collapse: collapse;" v-for="(book,i) in books_response.requested" :key="i">
                <Book @show_detail="show_book_detail" :key="i" :book="book"/>            
            </div>
        </div>

        <BookDetailsModal ref="bookModal"/>
    </div>`
});