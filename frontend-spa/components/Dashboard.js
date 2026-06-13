const Dashboard = Vue.defineComponent({
  data() {
    return {
      isLoading: true,
      stats: { total: 0, pending: 0, diproses: 0, selesai: 0 },
      allReports: [],
      currentPage: 1,
      itemsPerPage: 5,
      currentTime: '',
      currentDate: '',
      timer: null
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
    },
    updateTime() {
      const now = new Date();
      const optionsDate = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      this.currentDate = now.toLocaleDateString('id-ID', optionsDate);
      this.currentTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }
  },
  mounted() {
    this.fetchDashboardData();
    this.updateTime();
    this.timer = setInterval(this.updateTime, 1000);
  },
  beforeUnmount() {
    if (this.timer) clearInterval(this.timer);
  },
  template: `
  <AdminLayout title="Dashboard" subtitle="Kelola pengaduan masyarakat secara cepat, transparan, dan akuntabel.">
    
    <!-- Welcome Section -->
    <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between">
      <div>
        <h2 class="text-[20px] font-bold text-[#0F172A] mb-1">Selamat datang, Administrator</h2>
        <p class="text-sm text-[#64748B]">Pantau dan tindak lanjuti laporan masyarakat secara efisien.</p>
      </div>
      <div class="hidden md:flex items-center gap-3 bg-white border border-[#E2E8F0] px-4 py-2.5 rounded-xl shadow-sm">
         <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB]">
           <i class="ti ti-calendar text-xl" style="-webkit-text-stroke: 0.5px;"></i>
         </div>
         <div class="flex flex-col">
           <span class="text-[13px] font-bold text-[#0F172A] leading-tight">{{ currentDate }}</span>
           <span class="text-[11px] font-bold text-[#2563EB] leading-tight mt-0.5">{{ currentTime }}</span>
         </div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      
      <!-- Total Laporan -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] flex flex-col hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
           <div class="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
             <i class="ti ti-file-text text-[32px]" style="-webkit-text-stroke: 1px;"></i>
           </div>
        </div>
        <p class="text-sm font-medium text-[#64748B] mb-1">Total Laporan</p>
        <div v-if="isLoading" class="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
        <h3 v-else class="text-[36px] font-bold text-[#0F172A] leading-none mb-2">{{ stats.total }}</h3>
        <p class="text-xs text-[#64748B]">Semua laporan masuk</p>
      </div>

      <!-- Pending -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] flex flex-col hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
           <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
             <i class="ti ti-clock text-[32px]" style="-webkit-text-stroke: 1px;"></i>
           </div>
        </div>
        <p class="text-sm font-medium text-[#64748B] mb-1">Pending</p>
        <div v-if="isLoading" class="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
        <h3 v-else class="text-[36px] font-bold text-[#0F172A] leading-none mb-2">{{ stats.pending }}</h3>
        <p class="text-xs text-[#64748B]">Menunggu tindak lanjut</p>
      </div>

      <!-- Diproses -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] flex flex-col hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
           <div class="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
             <i class="ti ti-refresh text-[32px]" style="-webkit-text-stroke: 1px;"></i>
           </div>
        </div>
        <p class="text-sm font-medium text-[#64748B] mb-1">Diproses</p>
        <div v-if="isLoading" class="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
        <h3 v-else class="text-[36px] font-bold text-[#0F172A] leading-none mb-2">{{ stats.diproses }}</h3>
        <p class="text-xs text-[#64748B]">Sedang dalam penanganan</p>
      </div>

      <!-- Selesai -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] flex flex-col hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
           <div class="w-12 h-12 rounded-xl bg-green-50 text-emerald-500 flex items-center justify-center">
             <i class="ti ti-circle-check text-[32px]" style="-webkit-text-stroke: 1px;"></i>
           </div>
        </div>
        <p class="text-sm font-medium text-[#64748B] mb-1">Selesai</p>
        <div v-if="isLoading" class="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
        <h3 v-else class="text-[36px] font-bold text-[#0F172A] leading-none mb-2">{{ stats.selesai }}</h3>
        <p class="text-xs text-[#64748B]">Laporan selesai ditangani</p>
      </div>

    </div>

    <!-- REPORT TABLE SECTION -->
    <div class="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden mb-8">
      <!-- Section Header -->
      <div class="flex flex-col md:flex-row items-center justify-between px-6 py-5 border-b border-[#E2E8F0] gap-4">
         <div>
           <h3 class="text-lg font-semibold text-[#0F172A]">Daftar Laporan Terbaru</h3>
           <p class="text-sm text-[#64748B]">Laporan yang baru saja masuk</p>
         </div>
         <router-link to="/reports" class="inline-flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1D4ED8] transition-colors shadow-sm">
            Lihat Semua Laporan
         </router-link>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto min-h-[300px]">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#F8FAFC] text-[#64748B] text-[12px] uppercase tracking-wide font-semibold border-b border-[#E2E8F0]">
              <th class="px-6 py-4">ID</th>
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
                <td class="px-6 py-4"><div class="animate-pulse bg-gray-100 h-6 w-8 rounded mx-auto"></div></td>
              </tr>
            </template>
            <template v-else>
              <tr v-for="(r, index) in paginatedReports" :key="r.id" class="hover:bg-[#F8FAFC] transition-colors group">
              <td class="px-6 py-4 align-middle">
                 <span class="text-[14px] font-medium text-[#64748B]">#LP-{{ String(r.id).padStart(4, '0') }}</span>
              </td>
              <td class="px-6 py-4 align-middle">
                 <span class="text-[14px] font-medium text-[#0F172A]">{{ r.title }}</span>
              </td>
              <td class="px-6 py-4 align-middle">
                 <span class="inline-flex text-[12px] font-medium text-[#64748B] bg-slate-100 px-2.5 py-1 rounded-md">
                   {{ r.category?.name || 'Infrastruktur' }}
                 </span>
              </td>
              <td class="px-6 py-4 align-middle">
                 <span class="text-[14px] font-medium text-[#64748B] truncate max-w-[150px] inline-block" :title="r.location">{{ r.location }}</span>
              </td>
              <td class="px-6 py-4 align-middle text-center">
                 <span class="inline-flex text-[12px] font-semibold px-2.5 py-1 rounded-md capitalize" :class="statusBadge(r.status)">
                   {{ r.status }}
                 </span>
              </td>
              <td class="px-6 py-4 align-middle">
                 <span class="text-[14px] font-medium text-[#64748B]" v-html="formatDate(r.created_at)"></span>
              </td>
              <td class="px-6 py-4 align-middle text-center">
                 <div class="flex items-center justify-center gap-2">
                   <router-link :to="'/reports/' + r.id" title="Lihat Detail" class="w-10 h-10 rounded-lg text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 flex items-center justify-center transition-colors border border-transparent hover:border-blue-200">
                     <i class="ti ti-eye text-xl" style="-webkit-text-stroke: 0.5px;"></i>
                   </router-link>
                   <button class="w-10 h-10 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 flex items-center justify-center transition-colors">
                     <i class="ti ti-dots-vertical text-xl" style="-webkit-text-stroke: 0.5px;"></i>
                   </button>
                 </div>
              </td>
            </tr>
            <tr v-if="!isLoading && paginatedReports.length === 0">
               <td colspan="7" class="px-6 py-16 text-center">
                  <div class="flex flex-col items-center justify-center">
                     <i class="ti ti-inbox text-5xl text-gray-300 mb-4"></i>
                     <h3 class="text-lg font-semibold text-slate-900 mb-1">Belum ada laporan tersedia</h3>
                     <p class="text-slate-500 font-medium text-sm">Tambahkan laporan baru untuk mulai mengelola pengaduan masyarakat.</p>
                  </div>
               </td>
            </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </AdminLayout>
  `
});
