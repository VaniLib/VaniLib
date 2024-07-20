import Book from './partials/book.js';
import BookDetailsModal from "./partials/book_details_modal.js";

export default ({
    data: () => ({ book_list: [] }),
    methods: {
        get_all_books() {
            fetch('/api/book', {
                method: 'GET',
                headers: { 'Authentication-Token': localStorage.getItem('auth-token') }
            }).then(res => res.json()).then((data) => { this.book_list = data })
        },
        show_book_detail(book) { this.$refs.bookModal.viewModal(book) },
    },
    computed: { username() { return localStorage.getItem('username') } },
    created() { this.get_all_books() },
    components: { Book, BookDetailsModal },
    template: `
    <div class="px-3 mt-3 pb-5 vh-100">
        <div class="wall--bg" style="background: url('static/img/wall-paper2.jpg') center center; min-height:300px; text-align: center"">
            <h1 class="wall--heading">
                <span class="bg-white">Welcome Home {{username}}!!</span>
            </h1>
        </div>

        <h3 class="mb-0 mt-4">All Latest Books</h3>

        <div class="row justify-content-left">
            <div class="col-lg-2 mt-3" style="border-collapse: collapse;" v-for="(book,i) in book_list" :key="i">
                <Book @show_detail="show_book_detail" :key="i" :book="book"/>            
            </div>   
            <BookDetailsModal ref="bookModal"/>
        </div>
    </div>`
})