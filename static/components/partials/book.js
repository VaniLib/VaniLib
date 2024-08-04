export default ({
    props: {
        book: {
            type: Object,
            default(raw) { return { section: '', book_id: '', image: '' } }
        }
    },
    methods: {
        show_book_detail(book) { this.$emit('show_detail', book) }
    },
    computed: {
        imagePath: function () {
            let image_url = null;
            if (this.book.image == "") {
                image_url = "static/img/no_image_found.png";
            } else {
                image_url = "static/uploaded/image/" + this.book.image;
            }
            return "height: 220px; width: 150px; background: url('" + image_url + "') center; background-size: cover;";
        }
    },
    template: `
        <div class="text-center justify-content-centre pt-3 pb-3 px-2 border" style="border-radius: 0.5rem; box-shadow: 0px 0px 5px rgba(0, 0, 0);">  
            <div class="mx-auto my-auto border border-2 border-secondary" :style='imagePath' />
            <h5 class="mt-2 mb-0 fs-regular fw-bold" style="white-space: break-spaces; min-height: 40px"> {{book.title}} </h5>
            <p class="text-muted fst-italic mb-0">{{book.author}}</p>
            <br>
            <button class="btn btn-outline-dark" @click="show_book_detail(book)">View Details</button>
        </div>
    `,
})

