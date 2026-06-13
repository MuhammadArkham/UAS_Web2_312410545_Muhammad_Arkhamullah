const Dashboard = Vue.defineComponent({
  data() {
    return {
      isLoading: true,
      stats: { total: 0, pending: 0, diproses: 0, selesai: 0 },
      allReports: [],
      currentPage: 1,
      itemsPerPage: 5
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.allReports.length / this.itemsPerPage) || 1;
    },
    paginatedReports() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.allReports.slice(start, end);
    },
    startIndex() {
      return this.allReports.length === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
    },
    endIndex() {
      const end = this.currentPage * this.itemsPerPage;
      return end > this.allReports.length ? this.allReports.length : end;
    }
  },
  methods: {
    animateCounter(targetObj, key, finalValue, duration = 800) {
      if (finalValue === 0) {
        targetObj[key] = 0;
        return;
      }
      const steps = 30;
      const increment = finalValue / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= finalValue) {
          targetObj[key] = finalValue;
          clearInterval(interval);
        } else {
          targetObj[key] = Math.floor(current);
        }
      }, Math.max(10, Math.floor(duration / steps)));
    },
    async fetchDashboardData() {
      this.isLoading = true;
      try {
        const res = await window.api.get('/reports');
        const reports = res.data.data;
        
        const total = reports.length;
        const pending = reports.filter(r => r.status === 'pending').length;
        const diproses = reports.filter(r => r.status === 'diproses').length;
        const selesai = reports.filter(r => r.status === 'selesai').length;
        
        this.allReports = reports;
        this.isLoading = false;

        this.animateCounter(this.stats, 'total', total);
        this.animateCounter(this.stats, 'pending', pending);
        this.animateCounter(this.stats, 'diproses', diproses);
        this.animateCounter(this.stats, 'selesai', selesai);

      } catch (e) {
        console.error(e);
        this.isLoading = false;
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
    }
  },
  mounted() {
    this.fetchDashboardData();
  },
  template: `
  <AdminLayout title="Dashboard" subtitle="Kelola pengaduan masyarakat secara cepat dan transparan.">
    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      
      <!-- Total Laporan -->
      <div class="bg-white rounded-[20px] p-6 shadow-sm border border-slate-100 border-b-4 border-b-blue-600 flex flex-col justify-between hover:shadow-md transition-shadow">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <div>
            <p class="text-[13px] font-semibold text-slate-600 mb-0.5">Total Laporan</p>
            <div v-if="isLoading" class="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
            <h3 v-else class="text-4xl font-extrabold text-slate-900 tracking-tight">{{ stats.total }}</h3>
          </div>
        </div>
        <p class="text-[11px] text-slate-400 mt-4 font-medium">Semua laporan masuk</p>
      </div>

      <!-- Pending -->
      <div class="bg-white rounded-[20px] p-6 shadow-sm border border-slate-100 border-b-4 border-b-amber-500 flex flex-col justify-between hover:shadow-md transition-shadow">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 mt-1 transition-all duration-200 hover:scale-[1.02]">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <p class="text-[13px] font-semibold text-slate-600 mb-0.5">Pending</p>
            <div v-if="isLoading" class="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
            <h3 v-else class="text-4xl font-extrabold text-slate-900 tracking-tight">{{ stats.pending }}</h3>
          </div>
        </div>
        <p class="text-[11px] text-slate-400 mt-4 font-medium">Menunggu ditindaklanjuti</p>
      </div>

      <!-- Diproses -->
      <div class="bg-white rounded-[20px] p-6 shadow-sm border border-slate-100 border-b-4 border-b-blue-500 flex flex-col justify-between hover:shadow-md transition-shadow">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 mt-1 transition-all duration-200 hover:scale-[1.02]">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <p class="text-[13px] font-semibold text-slate-600 mb-0.5">Diproses</p>
            <div v-if="isLoading" class="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
            <h3 v-else class="text-4xl font-extrabold text-slate-900 tracking-tight">{{ stats.diproses }}</h3>
          </div>
        </div>
        <p class="text-[11px] text-slate-400 mt-4 font-medium">Sedang dalam penanganan</p>
      </div>

      <!-- Selesai -->
      <div class="bg-white rounded-[20px] p-6 shadow-sm border border-slate-100 border-b-4 border-b-emerald-500 flex flex-col justify-between hover:shadow-md transition-shadow">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 mt-1 transition-all duration-200 hover:scale-[1.02]">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <p class="text-[13px] font-semibold text-slate-600 mb-0.5">Selesai</p>
            <div v-if="isLoading" class="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
            <h3 v-else class="text-4xl font-extrabold text-slate-900 tracking-tight">{{ stats.selesai }}</h3>
          </div>
        </div>
        <p class="text-[11px] text-slate-400 mt-4 font-medium">Selesai ditindaklanjuti</p>
      </div>

    </div>

    <!-- REPORT TABLE SECTION -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      <!-- Section Header -->
      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">
         <h3 class="text-lg font-bold text-slate-900">Semua Laporan</h3>
         <router-link to="/create" class="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primaryHover transition-colors shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg>
            Tambah Laporan
         </router-link>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto min-h-[300px]">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
              <th class="px-6 py-4">ID</th>
              <th class="px-6 py-4">Judul</th>
              <th class="px-6 py-4">Kategori</th>
              <th class="px-6 py-4">Lokasi</th>
              <th class="px-6 py-4 text-center">Status</th>
              <th class="px-6 py-4">Tanggal</th>
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
                <td class="px-6 py-4"><div class="animate-pulse bg-gray-100 h-6 w-8 rounded mx-auto"></div></td>
              </tr>
            </template>
            <template v-else>
              <tr v-for="(r, index) in paginatedReports" :key="r.id" class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-6 py-4 align-middle">
                 <span class="text-xs font-bold text-slate-600">#LP-{{ String(r.id).padStart(4, '0') }}</span>
              </td>
              <td class="px-6 py-4 align-middle">
                 <span class="text-sm font-semibold text-slate-900">{{ r.title }}</span>
              </td>
              <td class="px-6 py-4 align-middle">
                 <span class="inline-flex text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md">
                   {{ r.category?.name || 'Infrastruktur' }}
                 </span>
              </td>
              <td class="px-6 py-4 align-middle">
                 <span class="text-sm text-slate-600 truncate max-w-[150px] inline-block" :title="r.location">{{ r.location }}</span>
              </td>
              <td class="px-6 py-4 align-middle text-center">
                 <span class="inline-flex text-[11px] font-bold px-2.5 py-1 rounded-md capitalize" :class="statusBadge(r.status)">
                   {{ r.status }}
                 </span>
              </td>
              <td class="px-6 py-4 align-middle">
                 <span class="text-sm font-semibold text-slate-700" v-html="formatDate(r.created_at)"></span>
              </td>
              <td class="px-6 py-4 align-middle text-center">
                 <div class="flex items-center justify-center gap-2">
                   <router-link :to="'/reports/' + r.id" title="Lihat Detail" class="w-8 h-8 rounded border border-slate-200 bg-white text-slate-400 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center transition-colors">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                   </router-link>
                 </div>
              </td>
            </tr>
            <tr v-if="!isLoading && paginatedReports.length === 0">
               <td colspan="7" class="px-6 py-12 text-center text-slate-500 font-medium">Belum ada laporan yang terdaftar.</td>
            </tr>
            </template>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination / Footer Table -->
      <div v-if="allReports.length > 0" class="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50">
         <div>Menampilkan <span class="font-bold text-slate-800">{{ startIndex }}</span> - <span class="font-bold text-slate-800">{{ endIndex }}</span> dari <span class="font-bold text-slate-800">{{ stats.total }}</span> laporan</div>
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
