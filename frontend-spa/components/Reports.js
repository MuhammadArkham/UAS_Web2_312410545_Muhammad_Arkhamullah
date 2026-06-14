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
      newStatus: '',
      filterStatus: '',
      showEditModal: false,
      editForm: {
        id: null,
        title: '',
        category_id: null,
        location: '',
        description: '',
        status: 'pending'
      }
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
    },
    visiblePages() {
      const current = this.currentPage;
      const total = this.totalPages;
      if (total <= 5) {
        return Array.from({ length: total }, (_, i) => i + 1);
      }
      if (current <= 3) {
        return [1, 2, 3, 4, '...', total];
      }
      if (current >= total - 2) {
        return [1, '...', total - 3, total - 2, total - 1, total];
      }
      return [1, '...', current - 1, current, current + 1, '...', total];
    }
  },
  watch: {
    filterCategory() {
      this.fetchReports();
      this.currentPage = 1;
    },
    searchQuery() {
      this.currentPage = 1;
    },
    filterStatus() {
      this.fetchReports();
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
        if (this.filterStatus) {
          url += (url.includes('?') ? '&' : '?') + 'status=' + this.filterStatus;
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
    },
    openEditModal(report) {
      this.editForm = {
        id: report.id,
        title: report.title,
        category_id: report.category_id,
        location: report.location,
        description: report.description,
        status: report.status
      };
      this.showEditModal = true;
    },
    async submitEdit() {
      try {
        await window.api.put('/reports/' + this.editForm.id, {
          title: this.editForm.title,
          category_id: this.editForm.category_id,
          location: this.editForm.location,
          description: this.editForm.description,
          status: this.editForm.status
        });
        this.showEditModal = false;
        this.fetchReports();
      } catch (e) {
        console.error('Gagal update laporan:', e);
        alert('Gagal menyimpan perubahan');
      }
    },
    exportPDF() {
      // Temporarily show the print area
      const printArea = document.getElementById('print-area');
      printArea.style.display = 'block';
      
      const opt = {
        margin:       1,
        filename:     'Laporan-SiLapor.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
      };

      // Generate PDF
      html2pdf().set(opt).from(printArea).save().then(() => {
        // Hide print area again
        printArea.style.display = 'none';
      });
    }
  },
  mounted() {
    this.fetchReports();
    this.fetchCategories();
  },
  template: `
  <AdminLayout title="Semua Laporan" subtitle="Daftar seluruh laporan masyarakat beserta status penanganannya.">
    <!-- Filter Section -->
    <div class="bg-white rounded-t-2xl border border-[#E2E8F0] shadow-sm px-6 py-5 flex flex-col md:flex-row gap-4 justify-between border-b-0">
       <div class="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div class="relative min-w-[280px]">
             <i class="ti ti-search absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] text-lg"></i>
             <input v-model="searchQuery" type="text" placeholder="Cari judul laporan, lokasi, atau pelapor..." class="w-full pl-11 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-[#0F172A] placeholder-[#64748B]" />
          </div>
          <div class="relative min-w-[200px]">
            <select v-model="filterCategory" class="w-full pl-4 pr-10 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-[#0F172A] font-medium appearance-none">
              <option value="">Semua Kategori</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
            <i class="ti ti-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"></i>
          </div>
          <div class="relative min-w-[160px]">
            <select v-model="filterStatus" class="w-full pl-4 pr-10 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-[#0F172A] font-medium appearance-none">
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="diproses">Diproses</option>
              <option value="selesai">Selesai</option>
              <option value="ditolak">Ditolak</option>
            </select>
            <i class="ti ti-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"></i>
          </div>
       </div>
       <div class="flex items-center gap-3">
         <button @click="exportPDF" class="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm">
            <i class="ti ti-printer text-lg"></i>
            Cetak PDF
         </button>
         <router-link to="/create" class="inline-flex items-center justify-center gap-2 bg-[#2563EB] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1D4ED8] transition-colors shadow-sm">
            <i class="ti ti-plus text-lg"></i>
            Tambah Laporan
         </router-link>
       </div>
    </div>

    <!-- Hidden Print Area -->
    <div id="print-area" style="display: none; padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="text-align: center; margin-bottom: 5px;">Data Rekapitulasi Pengaduan Masyarakat</h2>
      <p style="text-align: center; margin-bottom: 20px; color: #555;">Sistem Pengelolaan Aspirasi Warga (SiLapor)</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="border: 1px solid #ddd; padding: 8px;">No</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Judul Laporan</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Kategori</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Lokasi</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Status</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Tanggal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, index) in filteredReports" :key="r.id">
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">{{ index + 1 }}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">{{ r.title }}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">{{ r.category ? r.category.name : '-' }}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">{{ r.location }}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-transform: uppercase;">{{ r.status }}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">{{ formatDate(r.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-b-2xl border border-[#E2E8F0] shadow-sm overflow-hidden mb-8">
      <div class="overflow-x-auto min-h-[400px]">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#F8FAFC] text-[#64748B] text-[12px] uppercase tracking-wide font-semibold border-b border-[#E2E8F0] whitespace-nowrap">
              <th class="px-6 py-4">ID Laporan</th>
              <th class="px-6 py-4">Judul Laporan</th>
              <th class="px-6 py-4">Kategori</th>
              <th class="px-6 py-4">Lokasi</th>
              <th class="px-6 py-4 text-center">Status</th>
              <th class="px-6 py-4">Tanggal</th>
              <th class="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#E2E8F0]">
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
              <tr v-for="(r, index) in paginatedReports" :key="r.id" class="hover:bg-[#F8FAFC] transition-colors group">
              <td class="px-6 py-4 align-middle">
                 <span class="text-[14px] font-medium text-[#64748B]">#LP-{{ String(r.id).padStart(4, '0') }}</span>
              </td>
              <td class="px-6 py-4 align-middle max-w-xs">
                 <span class="text-[14px] font-medium text-[#0F172A] block truncate" :title="r.title">{{ r.title }}</span>
              </td>
              <td class="px-6 py-4 align-middle">
                 <span class="inline-flex text-[12px] font-medium text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-md">
                   {{ r.category?.name || 'Lainnya' }}
                 </span>
              </td>
              <td class="px-6 py-4 align-middle">
                 <span class="text-[14px] font-medium text-[#64748B] whitespace-normal line-clamp-2 min-w-[200px] leading-relaxed" :title="r.location">{{ r.location }}</span>
              </td>
              <td class="px-6 py-4 align-middle text-center">
                 <div v-if="editingStatusId === r.id" class="flex items-center gap-1 justify-center">
                    <select v-model="newStatus" class="px-1 py-1 border border-slate-300 rounded text-xs">
                      <option value="pending">Pending</option>
                      <option value="diproses">Diproses</option>
                      <option value="selesai">Selesai</option>
                    </select>
                    <button @click="saveStatus(r.id)" class="text-green-600 p-1 bg-green-50 rounded"><i class="ti ti-check text-xs"></i></button>
                 </div>
                 <div v-else class="cursor-pointer" @click="startEditStatus(r)" title="Klik untuk ubah status">
                   <span class="inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-md capitalize" :class="statusBadge(r.status)">
                     <i :class="r.status === 'selesai' ? 'ti ti-circle-check text-xs' : (r.status === 'diproses' ? 'ti ti-refresh text-xs' : 'ti ti-clock text-xs')"></i>
                     {{ r.status }}
                   </span>
                 </div>
              </td>
              <td class="px-6 py-4 align-middle whitespace-nowrap">
                 <span class="text-[14px] font-medium text-[#64748B]" v-html="formatDate(r.created_at)"></span>
              </td>
              <td class="px-6 py-4 align-middle text-center">
                 <div class="flex items-center justify-center gap-2">
                   <router-link :to="'/reports/' + r.id" title="Lihat Detail" class="w-10 h-10 rounded-lg text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 flex items-center justify-center transition-colors border border-transparent hover:border-blue-200">
                     <i class="ti ti-eye text-lg"></i>
                   </router-link>
                   <button @click="openEditModal(r)" title="Edit Laporan" class="w-10 h-10 rounded-lg text-[#64748B] hover:text-amber-600 hover:bg-amber-50 flex items-center justify-center transition-colors border border-transparent hover:border-amber-200">
                     <i class="ti ti-pencil text-lg"></i>
                   </button>
                   <button @click="deleteReport(r.id)" title="Hapus Laporan" class="w-10 h-10 rounded-lg text-[#64748B] hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors border border-transparent hover:border-red-200">
                     <i class="ti ti-trash text-lg"></i>
                   </button>
                 </div>
              </td>
            </tr>
            <tr v-if="!isLoading && filteredReports.length === 0">
               <td colspan="7" class="px-6 py-20 text-center">
                  <div class="flex flex-col items-center justify-center">
                     <i class="ti ti-inbox text-[64px] text-gray-300 mb-4"></i>
                     <h3 class="text-xl font-bold text-[#0F172A] mb-2">Belum ada laporan tersedia</h3>
                     <p class="text-[#64748B] font-medium text-sm">Tambahkan laporan baru untuk mulai mengelola pengaduan masyarakat.</p>
                  </div>
               </td>
            </tr>
            </template>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination / Footer Table -->
      <div v-if="filteredReports.length > 0" class="px-6 py-4 border-t border-[#E2E8F0] flex flex-col md:flex-row gap-4 items-center justify-between text-sm text-[#64748B] bg-white">
         <div class="text-slate-500">Menampilkan <span class="font-semibold text-slate-700">{{ startIndex }}</span> hingga <span class="font-semibold text-slate-700">{{ endIndex }}</span> dari total <span class="font-semibold text-slate-700">{{ filteredReports.length }}</span> data</div>
         <div class="flex items-center gap-2">
            <button @click="prevPage" :disabled="currentPage === 1" class="px-3 h-8 rounded-lg border border-[#E2E8F0] bg-white flex items-center gap-1.5 justify-center hover:bg-slate-50 disabled:opacity-50 transition-colors text-xs font-semibold text-[#64748B]"><i class="ti ti-chevron-left text-sm"></i> <span class="hidden sm:inline">Sebelumnya</span></button>
            
            <template v-for="(page, index) in visiblePages" :key="index">
              <button v-if="page !== '...'" 
                      @click="goToPage(page)" 
                      class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors"
                      :class="page === currentPage ? 'bg-[#2563EB] text-white shadow-sm border-transparent' : 'border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A]'">
                {{ page }}
              </button>
              <span v-else class="px-1 text-[#64748B] text-xs font-bold tracking-widest">...</span>
            </template>

            <button @click="nextPage" :disabled="currentPage === totalPages" class="px-3 h-8 rounded-lg border border-[#E2E8F0] bg-white flex items-center gap-1.5 justify-center hover:bg-slate-50 disabled:opacity-50 transition-colors text-xs font-semibold text-[#64748B]"><span class="hidden sm:inline">Selanjutnya</span> <i class="ti ti-chevron-right text-sm"></i></button>
         </div>
      </div>
    </div>

    <!-- Edit Laporan Modal -->
    <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" v-if="showEditModal">
      <div class="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-lg font-bold text-slate-900">Edit Laporan</h3>
          <button @click="showEditModal = false" class="text-slate-400 hover:text-slate-600 transition-colors">
            <i class="ti ti-x text-xl"></i>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto space-y-4">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">Judul Laporan</label>
            <input v-model="editForm.title" type="text" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm">
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">Kategori</label>
              <select v-model="editForm.category_id" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm bg-white">
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
              <select v-model="editForm.status" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm bg-white">
                <option value="pending">Pending</option>
                <option value="diproses">Diproses</option>
                <option value="selesai">Selesai</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">Lokasi Kejadian</label>
            <input v-model="editForm.location" type="text" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm">
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">Deskripsi Laporan</label>
            <textarea v-model="editForm.description" rows="5" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm resize-y"></textarea>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 mt-auto">
          <button @click="showEditModal = false" class="px-5 py-2.5 text-sm font-semibold border border-slate-300 rounded-xl text-slate-700 hover:bg-white transition-colors shadow-sm">
            Batal
          </button>
          <button @click="submitEdit" class="px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
            <i class="ti ti-device-floppy"></i>
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
  `
});
