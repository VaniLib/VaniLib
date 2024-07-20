import Book from "./partials/book.js";
import BookDetailsModal from "./partials/book_details_modal.js";

export default ({
    data: () => ({ books: [] }),
    methods: {
        get_all_books() {
            fetch('/api/book', {
                headers: { 'Authentication-Token': localStorage.getItem('auth-token') },
                method: 'GET',
            }).then(res => res.json()).then((data) => {
                const condition = (book) => book.is_approved_for_me;
                this.books = data.filter(condition)
            })
        },
        show_book_details(book) { this.$refs.bookModal.viewModal(book) }
    },
    created() { this.get_all_books() },
    components: { Book, BookDetailsModal },
    template: `
        <div class="px-3 mt-3 pb-5 vh-100">
            <div class="clearfix" style="margin-top: 10px">
                <div class="float-start">
                    <h3>Approved books</h3>
                </div>
            </div>

            <div class="row">
                <div class="card text-danger border-danger mt-3 card-body" v-if="books.length==0">
                    <h5> No books yet has been approved for reading!! </h5>
                </div>
                <div class="col-lg-2 mt-3" style="border-collapse: collapse;" v-for="(book,i) in books" :key="i">
                    <Book @show_detail="show_book_details" :key="i" :book="book"/>            
                </div>       
            </div>
            <BookDetailsModal ref="bookModal"/>
        </div>`
})