import BookDetailsModal from "./partials/book_details_modal.js";

export default ({
    data: () => ({ search_result: {} }),
    methods: {
        search() {
            fetch('/api/search', {
                method: 'POST',
                body: JSON.stringify({ 'search': this.$route.query.search_value }),
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json'
                }
            }).then((res) => res.json()).then((data) => { this.search_result = data })
        },
        showBookDetail(book) { this.$refs.bookModal.viewModal(book) }
    },
    watch: { '$route.params': { handler(newParams, oldParams) { this.search() } } },
    created() { this.search() },
    components: { BookDetailsModal },
    template: `
        <div class="vh-100 px-3 mt-3 pb-5">
            <div class="clearfix" style="margin-top: 10px">
                <div class="float-start">
                    <h3>Result in Books :</h3>
                </div>
            </div>
            <table class="table table-bordered mt-3" style="text-align: center">
                <thead>
                    <tr>
                        <th>Book Title</th>
                        <th>Book Author</th>
                        <th>Action</th>
                    </tr>    
                </thead> 
                <tbody>
                    <tr v-for="(book,i) in search_result.books">
                        <td>{{book.title}}</td>
                        <td>{{book.author}}</td>
                        <td><button class="btn btn-outline-primary" @click="showBookDetail(book)">View Book</button></td>
                    </tr>
                </tbody>
            </table>

            <div class="clearfix mt-10">
                <div class="float-start">
                    <h3>Result in Section :</h3>
                </div>
            </div>

            <table class="table table-bordered mt-3" style="text-align: center">
                <thead>
                    <tr>
                        <th>Section Name</th>
                        <th>Description</th>
                        <th>Action</th>
                    </tr>    
                </thead> 
                <tbody>
                    <tr v-for="(section,i) in search_result.sections">
                        <td>{{section.section_name}}</td>
                        <td>{{section.section_description}}</td>
                        <td>
                            <button class="btn btn-outline-primary">
                                <router-link :to="'/section/'+section.section_id">View Section</router-link>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        <BookDetailsModal ref="bookModal"/>
        </div>`
})