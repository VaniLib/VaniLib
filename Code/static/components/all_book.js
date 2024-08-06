import Book from './partials/book.js';
import BookDetailsModal from "./partials/book_details_modal.js";

export default ({
    data: () => ({
        loading: false,
        new_book: { title: '', content: '', author: '', section: '', prologue: '', image: '' },
        book_list: [],
        sections: [],
        bootstrap_modal: {}
    }),
    methods: {
        get_all_sections() {
            fetch('/api/section', {
                method: 'GET',
                headers: { 'Authentication-Token': localStorage.getItem('auth-token') },
            }).then(res => res.json()).then((data) => { this.sections = data })
        },
        clear_content() {
            this.$refs.bookImage.value = null
            this.$refs.bookPdf.value = null
            this.new_book = { title: '', content: '', author: '', section: '', prologue: '' }
        },
        get_all_books() {
            fetch('/api/book', {
                method: 'GET',
                headers: { 'Authentication-Token': localStorage.getItem('auth-token') }
            }).then(res => res.json()).then((data) => { this.book_list = data })
        },
        add_book() {
            this.loading = true;

            const formData = new FormData();
            formData.append("image", this.$refs.bookImage.files[0]);
            formData.append("pdf", this.$refs.bookPdf.files[0]);
            formData.append('title', this.new_book.title);
            formData.append('author', this.new_book.author);
            formData.append('content', this.new_book.content);
            formData.append('section', this.new_book.section);
            formData.append('prologue', this.new_book.prologue);

            fetch('/api/book', {
                headers: { 'Authentication-Token': localStorage.getItem('auth-token') },
                method: 'POST',
                body: formData
            }).then(async (res) => {
                if (res.ok) {
                    this.get_all_books()
                    this.bootstrap_modal.hide()
                    this.clear_content()
                } else {
                    alert((await res.json()).message)
                }
            }).finally(() => {
                this.loading = false;
            })
        },
        show_book_detail(book) { this.$refs.bookModal.viewModal(book) }
    },
    mounted() {
        this.bootstrap_modal = new bootstrap.Modal(document.getElementById('add_new_book_modal'));
    },
    created() {
        this.get_all_books()
        this.get_all_sections()
    },
    computed: { role() { return localStorage.getItem('role') } },
    components: { Book, BookDetailsModal },
    template: `
    <div class="px-3 mt-3 pb-5">        
        <div class="clearfix" style="margin-top: 10px">
            <div class="float-start">
                <h3>All Books</h3>
            </div>
            <div class="float-end">
                <button type="button" v-if="role=='librarian'" class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#add_new_book_modal" style="margin-right: 20px">
                    Add New Book
                </button>
            </div>
        </div>

        <div class="row justify-content-left mt-3 px-3">
            <div class="col-lg-2 mt-3" style="border-collapse: collapse;" v-for="(book,i) in book_list" :key="i">
                <Book @show_detail="show_book_detail" :key="i" :book="book"/>            
            </div>   
        </div>
        
        <!-- Modal -->
        <div class="modal fade" id="add_new_book_modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4 class="modal-title fs-5">Add New Book</h4>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <div class="row">
                                <div class="col-lg-6">
                                    <input type="text" v-model="new_book.title" placeholder="Book title" class="form-control">
                                </div>
                                <div class="col-lg-6">
                                    <input type="text" v-model="new_book.author" placeholder="Book author" class="form-control">
                                </div>

                                <p class="mb-0 mt-2"/>

                                <div class="col-lg-6">
                                    <select v-model="new_book.section" class="form-select">
                                        <option value="" disabled selected>Select section</option>
                                        <option v-for="(section,i) in sections " :key="i" :value="section.section_id">{{section.section_name}}</option>
                                    </select>
                                </div>

                                <p class="mb-0 mt-2"/>

                                <div class="col-lg-6">
                                    <textarea class="form-control" rows="3" maxlength="1000" v-model="new_book.prologue" placeholder="Book prologue"/>
                                </div>
                                <div class="col-lg-6">
                                    <textarea class="form-control" rows="3" maxlength="1000" v-model="new_book.content" placeholder="Book content"/>
                                </div>

                                <p class="mb-0 mt-2"/>

                                <div class="col-lg-6">
                                    <label class="mb-2"> <u> Book cover image </u> </label>
                                    <input type="file" ref="bookImage" class="form-control" accept=".jpg,.jpeg,.png">
                                </div>
                                <div class="col-lg-6">
                                    <label class="mb-2"> <u> Book pdf </u> </label>
                                    <input type="file" ref="bookPdf" class="form-control" accept=".pdf">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-danger" data-bs-dismiss="modal" @click="clear_content">Close</button>
                        <button type="button" class="btn btn-outline-success" @click="add_book" :disabled="loading">
                            <span v-if="loading" class="spinner-grow spinner-grow-sm" aria-hidden="true"/>
                            Add Book
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <BookDetailsModal ref="bookModal"/>
    </div>`
});