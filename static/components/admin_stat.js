export default ({
    data() {
        return { plot_data_section: null, plot_data_book: null, plot_data_visit: null }
    },
    mounted() { this.fetch_graph_data() },
    methods: {
        fetch_graph_data() {
            fetch('/api/lib/report').then(response => response.json()).then(data => {
                this.plot_data_section = data.plot_data_section;
                this.plot_data_book = data.plot_data_book;
                this.plot_data_visit = data.plot_data_visit
                this.render_graph();
            }).catch(error => {
                console.error('Error fetching graph data:', error);
            });
        },
        render_graph() {
            const img = new Image();
            img.style.width = '100%'
            img.src = 'data:image/png;base64,' + this.plot_data_book;
            this.$refs.plot_container_book.appendChild(img);

            const img2 = new Image();
            img2.style.width = '100%'
            img2.src = 'data:image/png;base64,' + this.plot_data_section;
            this.$refs.plot_container_section.appendChild(img2);

            const img3 = new Image();
            img3.style.width = '100%'
            img3.src = 'data:image/png;base64,' + this.plot_data_visit;
            this.$refs.plot_container_visit.appendChild(img3);
        },
        async generate_pdf() {
            const response = await fetch('/api/lib/report/1');

            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(await response.blob());
            link.setAttribute('download', 'report.csv');
            document.body.appendChild(link);

            link.click();

            link.parentNode.removeChild(link);
        }
    },
    template: `
    <div class="px-3 mt-3 pb-5">
        <div class="clearfix" style="margin-top: 10px">
            <div class="float-start">
                <h3>Stats</h3>
            </div>
            <div class="float-end">
                <button type="button" @click="generate_pdf" class="btn btn-outline-primary" style="margin-right: 20px">
                    Generate Report
                </button>
            </div>
        </div>

        <template>
            <div class="mt-5">
                <div class="row">
                    <div class="col-lg-6" ref="plot_container_book">
                        <h5>Book Issued</h5>
                    </div>
                    <div class="col-lg-6" ref="plot_container_section">
                        <h5>Total Sections</h5>
                    </div>
                </div>

                <div class="mt-5 row">
                    <div class="col-lg-6" ref="plot_container_visit">
                        <h5>User Visits</h5>
                    </div>
                </div>
            </div>
        </template>
    </div>`
})