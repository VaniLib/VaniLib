export default ({
    data: () => ({
        loading: false,
        new_section: {
            section_name: '',
            section_description: '',
        },
        sections: [],
        edit_section_data: {},

        bootstrap_modal: {},
        edit_bootstrap_modal: {},
    }),
    methods: {
        get_all_sections() {
            fetch('/api/section', {
                method: 'GET',
                headers: { 'Authentication-Token': localStorage.getItem('auth-token') },
            }).then(res => res.json()).then((data) => { this.sections = data })
        },
        clear_content() {
            this.new_section = { section_name: '', section_description: '' }
        },
        edit_section(section_id) {
            this.edit_bootstrap_modal.show();
            fetch('/api/section/' + section_id, {
                method: 'GET',
                headers: { 'Authentication-Token': localStorage.getItem('auth-token') },
            }).then(res => res.json()).then((data) => { this.edit_section_data = data })
        },
        update_section() {
            this.loading = true;
            fetch('/api/section/' + this.edit_section_data.section_id, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    'Authentication-Token': localStorage.getItem('auth-token')
                },
                body: JSON.stringify(this.edit_section_data)
            }).then(async (res) => {
                if (res.ok) {
                    this.get_all_sections()
                    this.edit_bootstrap_modal.hide()
                    this.clear_content()
                } else {
                    alert((await res.json()).message)
                }
            }).finally(() => {
                this.loading = false;
            })
        },
        add_section() {
            this.loading = true;
            fetch('/api/section', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    'Authentication-Token': localStorage.getItem('auth-token')
                },
                body: JSON.stringify(this.new_section)
            }).then(async (res) => {
                if (res.ok) {
                    this.get_all_sections()
                    this.bootstrap_modal.hide()
                    this.clear_content()
                } else {
                    alert((await res.json()).message)
                }
            }).finally(() => {
                this.loading = false;
            })
        },
        delete_section(section_id) {
            if (!confirm("Sure you want to delete this section ?")) { return }
            fetch('/api/section/' + section_id, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    'Authentication-Token': localStorage.getItem('auth-token')
                }
            }).then(async (res) => {
                if (res.ok) {
                    this.get_all_sections()
                } else {
                    let response = await res.json()
                    alert(response.message + "\nBook Names\n" + response.book_names.map(value => `-> ${value}`).join('\n'))
                }
            })
        }
    },
    mounted() {
        this.bootstrap_modal = new bootstrap.Modal(document.getElementById('add_new_book_modal'));
        this.edit_bootstrap_modal = new bootstrap.Modal(document.getElementById('edit_book_modal'));
    },
    created() { this.get_all_sections() },
    computed: { role() { return localStorage.getItem('role') } },
    template: `
        <div class="px-3 mt-3 pb-5">
            <div class="clearfix" style="margin-top: 10px">
                <div class="float-start">
                    <h3>All Sections</h3>
                </div>
                <div class="float-end">
                    <button type="button" v-if="role=='librarian'" class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#add_new_book_modal" style="margin-right: 20px">
                        Add New Section
                    </button>
                </div>
            </div>
      
            <div class="row justify-content-left mt-3 px-3">
                <div class="col-lg-3" v-for="(section,i) in sections" :key="i">
                    <div class="card">
                        <div class="card-header">
                            <div class="clearfix">
                                <div class="float-start">
                                    <h5> <i> {{section.section_name}} </i> </h5> 
                                </div>
                                <div class="float-end">
                                    <button class="btn btn-outline-success btn-sm" v-if="role=='librarian'" @click="edit_section(section.section_id)">Edit</button>
                                    <button class="btn btn-outline-danger btn-sm" v-if="role=='librarian'" @click="delete_section(section.section_id)">Delete</button>
                                    <button class="btn btn-outline-primary btn-sm">
                                        <router-link class="text-green" :to="'/section/'+section.section_id">View</router-link>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="card-body fs-regular" style="text-align: center;">
                            <b> About : </b> {{section.section_description}}
                        </div>
                    </div>         
                </div>   
            </div>
        
            <div class="modal fade" id="add_new_book_modal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4 class="modal-title fs-5">Add New Section</h4>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-lg-6">
                                    <div class="form-group">
                                        <input type="text" v-model="new_section.section_name" class="form-control" placeholder="Section Name">
                                    </div>
                                </div>
                                <div class="col-lg-6">
                                    <div class="form-group">
                                        <textarea class="form-control" v-model="new_section.section_description" rows="1" maxlength="1000" placeholder="Section Description"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline-danger" data-bs-dismiss="modal" @click="clear_content">Close</button>
                            <button type="button" class="btn btn-outline-success" @click="add_section" :disabled="loading">
                                <span v-if="loading" class="spinner-grow spinner-grow-sm" aria-hidden="true"/>
                                Add Section
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        
            <div class="modal fade" id="edit_book_modal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4 class="modal-title fs-5">Edit Section</h4>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-lg-6">
                                    <div class="form-group">
                                        <input type="text" v-model="edit_section_data.section_name" class="form-control" placeholder="Section Name">
                                    </div>
                                </div>
                                <div class="col-lg-6">
                                    <div class="form-group">
                                        <textarea class="form-control" v-model="edit_section_data.section_description" rows="1" maxlength="1000" placeholder="Section Description"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline-danger" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-outline-success" @click="update_section" :disabled="loading">
                                <span v-if="loading" class="spinner-grow spinner-grow-sm" aria-hidden="true"/>
                                Save Section
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`
});