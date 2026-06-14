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

      <!-- TICKET MAIN CARD -->
      <div class="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden mb-8">
        <div class="p-6 md:p-8">
            <!-- Header Section -->
            <div class="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div>
                    <div class="flex items-center gap-3 mb-3">
                        <span class="inline-flex text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md uppercase tracking-wider">
                           {{ report.category?.name || 'Infrastruktur' }}
                        </span>
                        <span class="px-2.5 py-1 text-[11px] font-bold rounded-md uppercase tracking-wider" :class="statusBadge(report.status)">
                           {{ report.status }}
                        </span>
                    </div>
                    <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">{{ report.title }}</h1>
                </div>
            </div>
            
            <!-- Metadata Row -->
            <div class="flex flex-wrap items-center gap-x-6 gap-y-3 py-4 border-y border-slate-100 mb-6">
                <div class="flex items-center gap-2 text-sm text-slate-600">
                    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    <span class="font-semibold text-slate-800">{{ report.user?.name || 'Anonim' }}</span>
                    <span>melaporkan</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-slate-600">
                    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>{{ new Date(report.created_at).toLocaleString('id-ID') }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-slate-600">
                    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span class="font-medium text-slate-800">{{ report.location }}</span>
                </div>
            </div>

            <!-- Description Body -->
            <div class="text-slate-700 leading-relaxed whitespace-pre-wrap text-[15px] md:text-base mb-8">{{ report.description }}</div>
            
            <!-- Attachment -->
            <div v-if="report.image" class="mt-6">
                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                    Lampiran Bukti Foto
                </h4>
                <div class="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 inline-block">
                    <img :src="imageBaseUrl + report.image" class="max-w-full md:max-w-xl h-auto object-contain cursor-pointer hover:opacity-90 transition-opacity">
                </div>
            </div>
            <div v-else class="mt-6 flex items-center gap-2 text-slate-400 text-sm italic bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                Pelapor tidak melampirkan foto bukti.
            </div>
        </div>
      </div>

      <!-- TIMELINE HEADER -->
      <div class="flex items-center gap-3 mb-6">
          <h3 class="text-lg font-bold text-slate-900">Tanggapan Resmi</h3>
          <span class="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">{{ comments.length }}</span>
      </div>

      <!-- EMPTY STATE -->
      <div v-if="comments.length === 0" class="text-center py-10 bg-white border border-slate-200 rounded-2xl mb-8 shadow-sm">
          <svg class="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
          <p class="text-slate-500 font-medium">Belum ada tanggapan atau instruksi tindak lanjut.</p>
      </div>

      <!-- TIMELINE LIST -->
      <div class="space-y-6 mb-8">
          <div v-for="c in comments" :key="c.id" class="flex gap-4">
              <div class="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold shrink-0 shadow-sm border-2 border-white ring-1 ring-slate-200 z-10">
                  {{ c.admin?.name ? c.admin.name.charAt(0).toUpperCase() : 'A' }}
              </div>
              <div class="flex-1 bg-white border border-slate-200 rounded-2xl rounded-tl-none p-5 shadow-sm relative group">
                  <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-2">
                          <span class="font-bold text-slate-900">{{ c.admin?.name || 'Administrator' }}</span>
                          <span class="text-xs font-medium text-slate-400">&bull; {{ new Date(c.created_at).toLocaleString('id-ID') }}</span>
                      </div>
                      <button @click="deleteComment(c.id)" class="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-1" title="Hapus Tanggapan">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                  </div>
                  <div class="text-slate-700 whitespace-pre-wrap text-[15px] leading-relaxed">
                      {{ c.body }}
                  </div>
              </div>
          </div>
      </div>

      <!-- DETACHED REPLY FORM -->
      <form @submit.prevent="addComment" class="flex gap-4 items-start relative pb-12">
          <!-- Connector Line (Visual cue for timeline) -->
          <div class="absolute left-5 top-[-30px] bottom-16 w-0.5 bg-slate-200 -z-10" v-if="comments.length > 0"></div>
          
          <div class="w-10 h-10 mt-1 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold shrink-0 shadow-sm border-2 border-white ring-1 ring-slate-200 z-10">
              {{ user?.name ? user.name.charAt(0).toUpperCase() : 'A' }}
          </div>
          
          <div class="flex-1 flex flex-col bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden focus-within:border-[#2563EB] focus-within:ring-1 focus-within:ring-[#2563EB] transition-all shadow-sm">
              <textarea v-model="newComment" required rows="3" class="w-full px-5 py-4 border-0 focus:ring-0 text-[15px] bg-transparent placeholder-[#94A3B8] resize-y outline-none" placeholder="Tinggalkan komentar atau instruksi tindak lanjut..."></textarea>
              
              <div class="px-4 py-3 border-t border-[#F1F5F9] flex items-center justify-between bg-[#F8FAFC]">
                  <div class="flex items-center gap-1">
                     <button type="button" title="Format Teks" class="w-8 h-8 flex items-center justify-center rounded text-[#64748B] hover:bg-slate-200/50 hover:text-[#0F172A] transition-colors"><i class="ti ti-bold text-lg"></i></button>
                     <button type="button" title="Sisipkan Link" class="w-8 h-8 flex items-center justify-center rounded text-[#64748B] hover:bg-slate-200/50 hover:text-[#0F172A] transition-colors"><i class="ti ti-link text-lg"></i></button>
                     <button type="button" title="Lampirkan File" class="w-8 h-8 flex items-center justify-center rounded text-[#64748B] hover:bg-slate-200/50 hover:text-[#0F172A] transition-colors"><i class="ti ti-paperclip text-lg"></i></button>
                  </div>
                  
                  <button type="submit" class="h-9 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2">
                      <i class="ti ti-send text-base"></i>
                      Kirim
                  </button>
              </div>
          </div>
      </form>

    </div>
    <div v-if="loading" class="flex items-center justify-center h-[60vh]">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB]"></div>
    </div>
  </AdminLayout>
  `
});
