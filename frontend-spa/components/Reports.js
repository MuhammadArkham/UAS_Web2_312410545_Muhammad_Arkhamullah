const Reports = Vue.defineComponent({
  data() {
    return {
      isLoading: true,
      reports: [],
      categories: [],
      filterCategory: '',
      searchQuery: '',
      currentPage: 1,
      itemsPerPage: 10,
      editingStatusId: null,
      newStatus: ''
    }
  },
  computed: {
    filteredReports() {
      let result = this.reports;
      if (this.searchQuery) {
        result = result.filter(r => r.title.toLowerCase().includes(this.searchQuery.toLowerCase()));
      }
      return result;
    },
    totalPages() {
      return Math.ceil(this.filteredReports.length / this.itemsPerPage) || 1;
    },
    paginatedReports() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredReports.slice(start, end);
    },
    startIndex() {
      return this.filteredReports.length === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
    },
    endIndex() {
      const end = this.currentPage * this.itemsPerPage;
      return end > this.filteredReports.length ? this.filteredReports.length : end;
    }
  },
  watch: {
    filterCategory() {
      this.fetchReports();
      this.currentPage = 1;
    },
    searchQuery() {
      this.currentPage = 1;
    }
  },
  methods: {
    async fetchReports() {
      this.isLoading = true;
      try {
        let url = '/reports';
        if (this.filterCategory) {
          url += '?category_id=' + this.filterCategory;
        }
        const res = await window.api.get(url);
        this.reports = res.data.data;
      } catch (e) {
        console.error(e);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchCategories() {
      try {
        const res = await window.api.get('/categories');
        this.categories = res.data.data;
      } catch (e) {
        console.error(e);
      }
    },
    async deleteReport(id) {
      if(confirm('Yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan.')) {
        try {
          await window.api.delete('/reports/' + id);
          this.fetchReports();
        } catch(e) {
          alert('Gagal menghapus laporan.');
        }
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      const d = date.getDate().toString().padStart(2, '0');
      const m = date.toLocaleString('id-ID', { month: 'short' });
      const y = date.getFullYear();
      const h = date.getHours().toString().padStart(2, '0');
      const min = date.getMinutes().toString().padStart(2, '0');
      return d + ' ' + m + ' ' + y + '<br><span class="text-xs text-slate-400 font-normal">' + h + ':' + min + '</span>';
    },
        statusBadge(status) {
      if(!status) return 'bg-gray-100 text-gray-600';
      const s = status.toLowerCase();
      return (window.APP_CONFIG.statusBadgeClass[s] || 'bg-gray-100 text-gray-600') + ' border-0 px-2.5 py-1 rounded-md text-xs font-semibold';
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    goToPage(page) {
      this.currentPage = page;
    },
    startEditStatus(report) {
      this.editingStatusId = report.id;
      this.newStatus = report.status;
    },
    async saveStatus(id) {
      try {
        await window.api.put('/reports/' + id, { status: this.newStatus });
        this.editingStatusId = null;
        this.fetchReports();
      } catch(e) {
        alert('Gagal mengupdate status');
      }
    }
  },
  mounted() {
    this.fetchReports();
    this.fetchCategories();
  },
  template: `
  <AdminLayout title="Semua Laporan" subtitle="Daftar seluruh laporan masyarakat beserta status penanganannya.">
    <!-- Filter Section -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-8 flex flex-col md:flex-row gap-4 justify-between">
       <div class="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div class="relative min-w-[250px]">
             <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
             <input v-model="searchQuery" type="text" placeholder="Cari laporan berdasarkan judul..." class="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 focus:bg-white" />
          </div>
          <select v-model="filterCategory" class="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 focus:bg-white min-w-[200px] text-slate-600 font-medium">
            <option value="">Semua Kategori</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
       </div>
       <router-link to="/create" class="inline-flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primaryHover transition-colors shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg>
          Buat Laporan
       </router-link>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      <div class="overflow-x-auto min-h-[400px]">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
              <th class="px-6 py-4">ID</th>
              <th class="px-6 py-4">Judul</th>
              <th class="px-6 py-4">Kategori</th>
              <th class="px-6 py-4">Lokasi</th>
              <th class="px-6 py-4 text-center">Status</th>
              <th class="px-6 py-4">Tanggal Masuk</th>
              <th class="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <template v-if="isLoading">
              <tr v-for="i in 3" :key="i">
                <td class="px-6 py-4"><div class="animate-pulse bg-gray-100 h-4 rounded w-16"></div></td>
                <td class="px-6 py-4"><div class="animate-pulse bg-gray-100 h-4 rounded w-48"></div></td>
                <td class="px-6 py-4"><div class="animate-pulse bg-gray-100 h-4 rounded w-24"></div></td>
                <td class="px-6 py-4"><div class="animate-pulse bg-gray-100 h-4 rounded w-32"></div></td>
                <td class="px-6 py-4"><div class="animate-pulse bg-gray-100 h-4 rounded w-20 mx-auto"></div></td>
                <td class="px-6 py-4"><div class="animate-pulse bg-gray-100 h-4 rounded w-24"></div></td>
                <td class="px-6 py-4"><div class="animate-pulse bg-gray-100 h-6 w-16 rounded mx-auto"></div></td>
              </tr>
            </template>
            <template v-else>
              <tr v-for="(r, index) in paginatedReports" :key="r.id" class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-6 py-4 align-middle">
                 <span class="text-xs font-bold text-slate-600">#LP-{{ String(r.id).padStart(4, '0') }}</span>
              </td>
              <td class="px-6 py-4 align-middle max-w-xs">
                 <span class="text-sm font-semibold text-slate-900 block truncate" :title="r.title">{{ r.title }}</span>
              </td>
              <td class="px-6 py-4 align-middle">
                 <span class="inline-flex text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md">
                   {{ r.category?.name || 'Lainnya' }}
                 </span>
              </td>
              <td class="px-6 py-4 align-middle">
                 <span class="text-sm text-slate-600 truncate max-w-[150px] inline-block" :title="r.location">{{ r.location }}</span>
              </td>
              <td class="px-6 py-4 align-middle text-center">
                 <div v-if="editingStatusId === r.id" class="flex items-center gap-1 justify-center">
                    <select v-model="newStatus" class="px-1 py-1 border border-slate-300 rounded text-xs">
                      <option value="pending">Pending</option>
                      <option value="diproses">Diproses</option>
                      <option value="selesai">Selesai</option>
                    </select>
                    <button @click="saveStatus(r.id)" class="text-emerald-600 p-1 bg-emerald-50 rounded"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg></button>
                 </div>
                 <div v-else class="cursor-pointer" @click="startEditStatus(r)" title="Klik untuk ubah status">
                   <span class="inline-flex text-[11px] font-bold px-2.5 py-1 rounded-md capitalize" :class="statusBadge(r.status)">
                     {{ r.status }}
                   </span>
                 </div>
              </td>
              <td class="px-6 py-4 align-middle">
                 <span class="text-sm font-semibold text-slate-700" v-html="formatDate(r.created_at)"></span>
              </td>
              <td class="px-6 py-4 align-middle text-center">
                 <div class="flex items-center justify-center gap-2">
                   <router-link :to="'/reports/' + r.id" title="Lihat Detail" class="w-8 h-8 rounded border border-slate-200 bg-white text-blue-500 hover:bg-blue-50 hover:border-blue-200 flex items-center justify-center transition-colors">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                   </router-link>
                   <button @click="deleteReport(r.id)" title="Hapus Laporan" class="w-8 h-8 rounded border border-slate-200 bg-white text-rose-500 hover:bg-rose-50 hover:border-rose-200 flex items-center justify-center transition-colors">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                   </button>
                 </div>
              </td>
            </tr>
            <tr v-if="!isLoading && filteredReports.length === 0">
               <td colspan="7" class="px-6 py-16 text-center">
                  <div class="flex flex-col items-center justify-center">
                     <svg class="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                     <span class="text-slate-500 font-medium text-sm">Tidak ada laporan yang sesuai dengan kriteria pencarian Anda.</span>
                  </div>
               </td>
            </tr>
            </template>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination / Footer Table -->
      <div v-if="filteredReports.length > 0" class="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50">
         <div>Menampilkan <span class="font-bold text-slate-800">{{ startIndex }}</span> - <span class="font-bold text-slate-800">{{ endIndex }}</span> dari <span class="font-bold text-slate-800">{{ filteredReports.length }}</span> laporan</div>
         <div class="flex items-center gap-1">
            <button @click="prevPage" :disabled="currentPage === 1" class="w-8 h-8 rounded border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 disabled:opacity-50 transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg></button>
            
            <template v-for="page in totalPages" :key="page">
              <button v-if="page === currentPage || page === currentPage - 1 || page === currentPage + 1 || page === 1 || page === totalPages" 
                      @click="goToPage(page)" 
                      class="w-8 h-8 rounded border flex items-center justify-center font-bold text-xs transition-colors"
                      :class="page === currentPage ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'">
                {{ page }}
              </button>
              <span v-else-if="page === currentPage - 2 || page === currentPage + 2" class="px-1 text-slate-400">...</span>
            </template>

            <button @click="nextPage" :disabled="currentPage === totalPages" class="w-8 h-8 rounded border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 disabled:opacity-50 transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg></button>
         </div>
      </div>
    </div>
  </AdminLayout>
  `
});
