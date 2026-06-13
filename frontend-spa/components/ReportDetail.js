const ReportDetail = Vue.defineComponent({
  data() {
    return {
      report: null,
      comments: [],
      newComment: '',
      loading: true,
      user: null
    }
  },
  computed: {
    imageBaseUrl() {
      return window.APP_CONFIG.IMAGE_BASE_URL;
    }
  },
  methods: {
    async fetchReport() {
      try {
        const res = await window.api.get('/reports/' + this.$route.params.id);
        this.report = res.data.data;
        this.fetchComments();
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    async fetchComments() {
        if (!this.report) return;
        this.comments = this.report.comments || [];
    },
    async addComment() {
      if (!this.newComment.trim()) return;
      try {
        await window.api.post('/reports/' + this.report.id + '/comments', {
          body: this.newComment
        });
        this.newComment = '';
        this.fetchReport(); // Reload to get new comments
      } catch(e) {
        alert('Gagal menambahkan komentar');
      }
    },
    async deleteComment(id) {
        if(confirm('Yakin hapus komentar ini?')) {
            try {
                await window.api.delete('/comments/' + id);
                this.fetchReport();
            } catch(e) {
                alert('Gagal hapus komentar');
            }
        }
    },
        statusBadge(status) {
      if(!status) return 'bg-gray-100 text-gray-600';
      const s = status.toLowerCase();
      return (window.APP_CONFIG.statusBadgeClass[s] || 'bg-gray-100 text-gray-600') + ' border-0 px-2.5 py-1 rounded-md text-xs font-semibold';
    },
  },
  mounted() {
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
    this.fetchReport();
  },
  template: `
  <AdminLayout title="Detail Laporan" subtitle="Lihat informasi lengkap pengaduan masyarakat beserta tanggapannya.">
    <div class="max-w-4xl" v-if="!loading && report">
      <!-- Breadcrumb -->
      <div class="text-[13px] text-slate-500 mb-6 flex items-center gap-2 font-medium">
        <router-link to="/dashboard" class="hover:text-blue-600 transition-colors">Dashboard</router-link>
        <span class="text-slate-300">/</span>
        <router-link to="/reports" class="hover:text-blue-600 transition-colors">Laporan</router-link>
        <span class="text-slate-300">/</span>
        <span class="text-slate-900 font-bold">#LP-{{ String(report.id).padStart(4, '0') }}</span>
      </div>

      <!-- Main Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        
        <!-- Image Area -->
        <div class="h-64 md:h-80 overflow-hidden bg-slate-100 relative border-b border-slate-200">
             <img v-if="report.image" :src="imageBaseUrl + report.image" class="w-full h-full object-cover">
             <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <svg class="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <span class="font-medium">Tanpa Lampiran Foto</span>
             </div>
             <!-- Status Badge Top Right -->
             <div class="absolute top-6 right-6">
               <span class="px-4 py-2 text-xs font-bold rounded-xl shadow-lg uppercase tracking-wider backdrop-blur-md bg-white/90 border border-white/20" :class="statusBadge(report.status).replace('bg-', 'text-')">
                 {{ report.status }}
               </span>
             </div>
        </div>
        
        <!-- Content Area -->
        <div class="p-8">
            <div class="inline-flex text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg mb-4 uppercase tracking-wider">
               {{ report.category?.name || 'Infrastruktur' }}
            </div>
            
            <h1 class="text-3xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">{{ report.title }}</h1>
            
            <!-- Metadata Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 py-6 border-y border-slate-100 text-sm">
                <div>
                    <span class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pelapor</span>
                    <div class="flex items-center gap-2 font-semibold text-slate-800">
                        <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        {{ report.user?.name || 'Anonim' }}
                    </div>
                </div>
                <div>
                    <span class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lokasi Kejadian</span>
                    <div class="flex items-center gap-2 font-semibold text-slate-800">
                        <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        {{ report.location }}
                    </div>
                </div>
                <div>
                    <span class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Waktu Pelaporan</span>
                    <div class="flex items-center gap-2 font-semibold text-slate-800">
                        <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {{ new Date(report.created_at).toLocaleString('id-ID') }}
                    </div>
                </div>
            </div>

            <div class="text-slate-700 leading-relaxed whitespace-pre-wrap text-base">{{ report.description }}</div>
        </div>
      </div>

      <!-- Comments Section -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-12">
        <div class="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
               Tanggapan Resmi 
               <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs">{{ comments.length }}</span>
            </h3>
        </div>

        <div class="p-8">
            <div v-for="c in comments" :key="c.id" class="flex gap-4 mb-8 last:mb-0">
                <div class="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold shrink-0 border border-slate-200">
                    {{ c.admin?.name ? c.admin.name.charAt(0).toUpperCase() : 'A' }}
                </div>
                <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                        <span class="font-bold text-slate-900">{{ c.admin?.name || 'Administrator' }}</span>
                        <div class="flex items-center gap-4">
                            <span class="text-xs font-semibold text-slate-400">{{ new Date(c.created_at).toLocaleString('id-ID') }}</span>
                            <button @click="deleteComment(c.id)" class="text-slate-400 hover:text-rose-500 transition-colors" title="Hapus Tanggapan">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        </div>
                    </div>
                    <div class="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none p-5 text-slate-700 whitespace-pre-wrap text-[15px] leading-relaxed mt-2">
                        {{ c.body }}
                    </div>
                </div>
            </div>

            <div v-if="comments.length === 0" class="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                <p class="text-slate-500 font-medium">Belum ada tanggapan dari instansi terkait.</p>
            </div>

            <div class="mt-8 pt-8 border-t border-slate-100">
                <form @submit.prevent="addComment" class="flex gap-4 items-start">
                    <div class="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                        {{ user?.name ? user.name.charAt(0).toUpperCase() : 'A' }}
                    </div>
                    <div class="flex-1">
                        <textarea v-model="newComment" required rows="3" class="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-[15px] bg-slate-50 focus:bg-white transition-all placeholder:text-slate-400 resize-y mb-3" placeholder="Tulis tanggapan atau instruksi tindak lanjut..."></textarea>
                        <div class="flex justify-end">
                            <button type="submit" class="bg-primary hover:bg-primaryHover text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                                Kirim Tanggapan
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
      </div>
    </div>
    <div v-if="loading" class="flex items-center justify-center h-[60vh]">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  </AdminLayout>
  `
});
