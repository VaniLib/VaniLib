export default ({
    data: () => ({
        edit_book: { title: '', content: '', author: '', image: '', section_id: '', prologue: '' },
        sections: []
    }),
    methods: {
        get_all_sections() {
            fetch('/api/section', {
                method: 'GET',
                headers: { 'Authentication-Token': localStorage.getItem('auth-token') },
            }).then(res => res.json()).then((data) => { this.sections = data })
        },
        get_book_details() {
            fetch('/api/book/' + this.$route.params.id, {
                headers: { 'Authentication-Token': localStorage.getItem('auth-token') },
                method: 'GET',
            }).then(async (res) => { if (res.ok) { this.edit_book = await res.json() } })
        },
        update_book() {
            this.loading = true;

            const formData = new FormData();
            formData.append("image", this.$refs.bookImage.files[0]);
            formData.append('title', this.edit_book.title);
            formData.append('author', this.edit_book.author);
            formData.append('content', this.edit_book.content);
            formData.append('section', this.edit_book.section_id);
            formData.append('prologue', this.edit_book.prologue);

            fetch('/api/book/' + this.$route.params.id, {
                headers: { 'Authentication-Token': localStorage.getItem('auth-token') },
                method: 'PUT',
                body: formData
            }).then(async (res) => {
                if (res.ok) {
                    this.get_book_details()
                    alert("Updated Book Information Successfully")
                    this.edit_book = { title: '', content: '', author: '', image: '', section_id: '', prologue: '' }
                    this.$router.push({ path: "/books" })
                } else {
                    alert((await res.json()).message)
                }
            }).finally(() => {
                this.loading = false;
            })
        },
    },
    created() {
        this.get_book_details()
        this.get_all_sections()
    },
    template: `
    <div class="vh-100">
        <div class="px-3 mt-3 pb-5">
            <h3>Edit Book Info</h3>
            <hr>
            <div class="row">
                <div class="col-lg-6">
                    <div class="form-group">
                        <label class="form-label">Book title</label>
                        <input type="text" v-model="edit_book.title" class="form-control">
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="form-group">
                        <label class="form-label">Book author</label>
                        <input type="text" v-model="edit_book.author" class="form-control">
                    </div>
                </div>

                <p class="mb-0 mt-3"/>

                <div class="col-lg-6">
                    <div class="form-group">
                        <label class="form-label">Book cover</label>
                        <input type="file" ref="bookImage" class="form-control">
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="form-group">
                        <label class="form-label">Select section</label>
                        <select v-model="edit_book.section_id" class="form-select">
                            <option v-for="(section,i) in sections " :key="i" :value="section.section_id">{{section.section_name}}</option>
                        </select>
                    </div>
                </div>

                <p class="mb-0 mt-3"/>

                <div class="col-lg-6">
                    <div class="form-group">
                        <label class="form-label">Book prologue</label>
                        <textarea class="form-control" rows="3" maxlength="1000" v-model="edit_book.prologue"/>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="form-group">
                        <label class="form-label">Book content</label>
                        <textarea class="form-control" rows="3" maxlength="1000" v-model="edit_book.content"/>
                    </div>
                </div>
            </div>
            
            <div class="text-end mt-3">
                <button class="btn btn-outline-success" @click="update_book">Update book</button>
            </div>
        </div>
    </div>`
})