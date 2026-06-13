const CreateReport = Vue.defineComponent({
  data() {
    return {
      categories: [],
      form: {
        title: '',
        category_id: '',
        location: '',
        description: '',
      },
      imageFile: null,
      imagePreview: null,
      loading: false,
      success: false,
      error: ''
    }
  },
  methods: {
    async fetchCategories() {
      try {
        const res = await window.api.get('/categories');
        this.categories = res.data.data;
      } catch(e) {
        console.error(e);
      }
    },
    handleFileChange(e) {
      const file = e.target.files[0];
      if (file) {
        this.imageFile = file;
        this.imagePreview = URL.createObjectURL(file);
      }
    },
    removeImage() {
      this.imageFile = null;
      this.imagePreview = null;
      this.$refs.fileInput.value = '';
    },
    async submitForm() {
      this.loading = true;
      this.error = '';
      try {
        const formData = new FormData();
        formData.append('title', this.form.title);
        formData.append('category_id', this.form.category_id);
        formData.append('location', this.form.location);
        formData.append('description', this.form.description);
        if (this.imageFile) {
          formData.append('image', this.imageFile);
        }

        await window.api.post('/reports', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        this.success = true;
        this.form = { title: '', category_id: '', location: '', description: '' };
        this.removeImage();
      } catch (e) {
        this.error = 'Gagal mengirim laporan. Pastikan semua field terisi.';
        console.error(e);
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    this.fetchCategories();
  },
  template: `
  <AdminLayout title="Buat Laporan Baru" subtitle="Sampaikan laporan pengaduan dengan detail yang jelas dan akurat.">
    <div class="max-w-4xl">
      <div class="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#E2E8F0] mb-8">
        
        <div v-if="success" class="mb-8 p-8 rounded-2xl bg-green-50 border border-green-200 text-center flex flex-col items-center">
          <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <i class="ti ti-circle-check text-4xl" style="-webkit-text-stroke: 1px;"></i>
          </div>
          <h3 class="text-xl font-bold text-[#0F172A] mb-2">Laporan Berhasil Disimpan!</h3>
          <p class="text-[#64748B] text-sm mb-6">Data laporan Anda telah berhasil masuk ke dalam sistem dan akan segera ditindaklanjuti.</p>
          <router-link to="/reports" class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm">
            <i class="ti ti-list text-lg"></i>
            Lihat Semua Laporan
          </router-link>
        </div>

        <form v-else @submit.prevent="submitForm" class="space-y-6">
          <div v-if="error" class="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium flex items-center gap-3">
             <i class="ti ti-alert-circle text-xl"></i>
             {{ error }}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-bold text-[#0F172A] mb-2">Judul Laporan</label>
              <input v-model="form.title" type="text" required class="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all text-sm text-[#0F172A] placeholder-[#94A3B8] shadow-sm" placeholder="Contoh: Jalan berlubang di Jl. Merdeka">
            </div>
            <div>
              <label class="block text-sm font-bold text-[#0F172A] mb-2">Kategori</label>
              <div class="relative">
                 <select v-model="form.category_id" required class="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all text-sm text-[#0F172A] shadow-sm appearance-none cursor-pointer">
                   <option value="" disabled>Pilih Kategori</option>
                   <option v-for="c in categories" :value="c.id" :key="c.id">{{ c.name }}</option>
                 </select>
                 <i class="ti ti-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none text-lg"></i>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-bold text-[#0F172A] mb-2">Lokasi Kejadian</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#64748B]">
                <i class="ti ti-map-pin text-lg"></i>
              </div>
              <input v-model="form.location" type="text" required class="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E2E8F0] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all text-sm text-[#0F172A] placeholder-[#94A3B8] shadow-sm" placeholder="Ketik lokasi spesifik...">
            </div>
          </div>

          <div>
            <label class="block text-sm font-bold text-[#0F172A] mb-2">Detail Pengaduan</label>
            <textarea v-model="form.description" required rows="5" class="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all text-sm text-[#0F172A] placeholder-[#94A3B8] shadow-sm resize-y" placeholder="Jelaskan kronologi atau kondisi secara lengkap..."></textarea>
          </div>

          <div>
            <label class="block text-sm font-bold text-[#0F172A] mb-2">Unggah Foto Bukti (Opsional)</label>
            <div class="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-[#E2E8F0] border-dashed rounded-xl hover:border-[#2563EB] hover:bg-blue-50/50 transition-colors bg-[#F8FAFC]" :class="{'hidden': imagePreview}">
              <div class="space-y-2 text-center">
                <i class="ti ti-cloud-upload text-[40px] text-[#64748B] mb-2 block" style="-webkit-text-stroke: 1px;"></i>
                <div class="flex text-sm text-[#64748B] justify-center gap-1">
                  <label class="relative cursor-pointer bg-transparent rounded-md font-bold text-[#2563EB] hover:text-[#1D4ED8] focus-within:outline-none">
                    <span>Pilih file gambar</span>
                    <input ref="fileInput" @change="handleFileChange" type="file" class="sr-only" accept="image/*">
                  </label>
                  <p>atau tarik ke sini</p>
                </div>
                <p class="text-xs text-[#94A3B8] font-medium">PNG, JPG, GIF maksimal 2MB</p>
              </div>
            </div>
            
            <div v-if="imagePreview" class="relative mt-2 rounded-xl overflow-hidden border border-[#E2E8F0] shadow-sm w-full md:w-1/2 group">
               <img :src="imagePreview" class="w-full h-auto object-cover">
               <div class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button type="button" @click="removeImage" class="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 shadow-md transition-colors flex items-center gap-2">
                      <i class="ti ti-trash text-lg"></i> Hapus Foto
                   </button>
               </div>
            </div>
          </div>

          <div class="pt-6 border-t border-[#E2E8F0] flex items-center justify-end gap-3 mt-8">
             <router-link to="/reports" class="px-6 py-2.5 text-sm font-bold text-[#64748B] bg-white border border-[#E2E8F0] hover:bg-slate-50 hover:text-[#0F172A] rounded-xl transition-colors shadow-sm">Batal</router-link>
             <button type="submit" :disabled="loading" class="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                <i v-if="loading" class="ti ti-loader animate-spin text-lg"></i>
                <i v-else class="ti ti-send text-lg"></i>
                <span>{{ loading ? 'Menyimpan...' : 'Kirim Laporan' }}</span>
             </button>
          </div>
        </form>
      </div>
    </div>
  </AdminLayout>
  `
});
