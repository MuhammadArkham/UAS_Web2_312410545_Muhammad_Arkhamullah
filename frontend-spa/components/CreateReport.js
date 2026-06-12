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
  <AdminLayout title="Buat Laporan Baru">
    <div class="max-w-3xl">
      <div class="text-xs text-gray-500 mb-6 flex items-center gap-2 font-medium">
        <router-link to="/dashboard" class="hover:text-primary text-primary">Dashboard</router-link>
        <span>&rsaquo;</span>
        <router-link to="/reports" class="hover:text-primary text-primary">Laporan</router-link>
        <span>&rsaquo;</span>
        <span class="text-gray-900">Buat Laporan Baru</span>
      </div>

      <div class="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100">
        <div class="mb-8 border-b border-gray-100 pb-6">
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Form Pengaduan</h1>
          <p class="text-gray-500 text-sm">Sampaikan laporan dengan detail yang jelas dan akurat.</p>
        </div>

        <div v-if="success" class="mb-8 p-6 rounded-xl bg-green-50 border border-green-200 text-center">
          <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h3 class="text-lg font-bold text-green-800 mb-2">Laporan Berhasil Disimpan!</h3>
          <p class="text-green-600 text-sm mb-6">Data laporan berhasil dimasukkan ke sistem.</p>
          <router-link to="/reports" class="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm">Lihat Semua Laporan</router-link>
        </div>

        <form v-else @submit.prevent="submitForm" class="space-y-6">
          <div v-if="error" class="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{{ error }}</div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Judul Laporan</label>
              <input v-model="form.title" type="text" required class="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm" placeholder="Contoh: Jalan berlubang di Jl. Merdeka">
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Kategori</label>
              <select v-model="form.category_id" required class="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm text-gray-700">
                <option value="" disabled>Pilih Kategori</option>
                <option v-for="c in categories" :value="c.id" :key="c.id">{{ c.name }}</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Lokasi Kejadian</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <input v-model="form.location" type="text" required class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm" placeholder="Ketik lokasi spesifik...">
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Detail Pengaduan</label>
            <textarea v-model="form.description" required rows="5" class="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm" placeholder="Jelaskan kronologi atau kondisi secara lengkap..."></textarea>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Unggah Foto Bukti (Opsional)</label>
            <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-primary hover:bg-blue-50/50 transition-colors" :class="{'hidden': imagePreview}">
              <div class="space-y-1 text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <div class="flex text-sm text-gray-600 justify-center">
                  <label class="relative cursor-pointer bg-transparent rounded-md font-medium text-primary hover:text-primaryHover focus-within:outline-none">
                    <span>Pilih file gambar</span>
                    <input ref="fileInput" @change="handleFileChange" type="file" class="sr-only" accept="image/*">
                  </label>
                  <p class="pl-1">atau drag and drop</p>
                </div>
                <p class="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
              </div>
            </div>
            
            <div v-if="imagePreview" class="relative mt-2 rounded-xl overflow-hidden border border-gray-200 shadow-sm w-full md:w-1/2">
               <img :src="imagePreview" class="w-full h-auto object-cover">
               <button type="button" @click="removeImage" class="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-md transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
               </button>
            </div>
          </div>

          <div class="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
             <router-link to="/reports" class="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Batal</router-link>
             <button type="submit" :disabled="loading" class="bg-primary hover:bg-primaryHover text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md shadow-primary/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                <svg v-if="loading" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>{{ loading ? 'Menyimpan...' : 'Simpan Laporan' }}</span>
             </button>
          </div>
        </form>
      </div>
    </div>
  </AdminLayout>
  `
});
