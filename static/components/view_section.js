import Book from "./partials/book.js";
import BookDetailsModal from "./partials/book_details_modal.js";

export default ({
    data: () => ({ view_section: { books: [] } }),
    methods: {
        get_section_details() {
            fetch('/api/section/' + this.$route.params.id, {
                headers: { 'Authentication-Token': localStorage.getItem('auth-token') },
                method: 'GET',
            }).then(res => res.json()).then((data) => { this.view_section = data })
        },
        show_book_details(book) {
            book.section = this.view_section
            this.$refs.bookModal.viewModal(book)
        }
    },
    created() { this.get_section_details() },
    components: { Book, BookDetailsModal },
    template: `
        <div class="px-3 mt-3 pb-5 vh-100">
            <div class="clearfix mt-3">
                <div>
                    <h2> {{view_section.section_name}} </h2>   
                </div>
                <div>
                    <p class="my-0">Description : <b> {{view_section.section_description}} </b> </p>                          
                    <p>Date Created : <b> {{view_section.date_created}} </b> </p>   
                </div>
            </div>

            <hr>
            
            <h5> Book Under this Section: </h5>
            <div class="row">
                <div class="card text-danger border-danger mt-3 card-body" v-if="view_section.books.length==0">
                    <h5> No Books found in this section </h5>
                </div>
                <div class="col-lg-2 mt-3" style="border-collapse: collapse;" v-for="(book,i) in view_section.books" :key="i">
                    <Book @show_detail="show_book_details" :key="i" :book="book"/>            
                </div>       
            </div>
            <BookDetailsModal ref="bookModal"/>
        </div>`
})