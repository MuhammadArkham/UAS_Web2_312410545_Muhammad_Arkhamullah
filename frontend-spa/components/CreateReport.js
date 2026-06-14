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
    <div class="max-w-4xl mx-auto">
      <div v-if="success" class="mb-8 p-8 rounded-2xl bg-green-50 border border-green-200 text-center flex flex-col items-center shadow-sm">
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
        <div v-if="error" class="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium flex items-center gap-3 shadow-sm">
           <i class="ti ti-alert-circle text-xl"></i>
           {{ error }}
        </div>

        <!-- Single Unified Form Card -->
        <div class="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden p-6 md:p-8">
          <div class="space-y-8">
            
            <!-- Title & Category Row -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="md:col-span-2">
                <label class="block text-sm font-bold text-[#0F172A] mb-2">Judul Laporan</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#64748B]">
                    <i class="ti ti-text-caption text-lg"></i>
                  </div>
                  <input v-model="form.title" type="text" required class="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all text-sm text-[#0F172A] placeholder-[#94A3B8]" placeholder="Contoh: Jalan berlubang di Jl. Merdeka">
                </div>
              </div>
              <div class="md:col-span-1">
                <label class="block text-sm font-bold text-[#0F172A] mb-2">Kategori</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#64748B]">
                    <i class="ti ti-category text-lg"></i>
                  </div>
                  <select v-model="form.category_id" required class="w-full pl-11 pr-10 py-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all text-sm text-[#0F172A] appearance-none cursor-pointer">
                    <option value="" disabled>Pilih Kategori</option>
                    <option v-for="c in categories" :value="c.id" :key="c.id">{{ c.name }}</option>
                  </select>
                  <i class="ti ti-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none text-lg"></i>
                </div>
              </div>
            </div>

            <!-- Location -->
            <div>
              <label class="block text-sm font-bold text-[#0F172A] mb-2">Lokasi Kejadian</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#64748B]">
                  <i class="ti ti-map-pin text-lg"></i>
                </div>
                <input v-model="form.location" type="text" required class="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all text-sm text-[#0F172A] placeholder-[#94A3B8]" placeholder="Ketik lokasi spesifik (Cth: Depan minimarket Indomaret Sudirman)...">
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-bold text-[#0F172A] mb-2">Deskripsi Lengkap</label>
              <div class="relative">
                <div class="absolute top-3 left-0 pl-4 flex items-start pointer-events-none text-[#64748B]">
                  <i class="ti ti-file-description text-lg"></i>
                </div>
                <textarea v-model="form.description" required rows="5" class="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all text-sm text-[#0F172A] placeholder-[#94A3B8] resize-y" placeholder="Jelaskan kronologi, waktu kejadian, atau kondisi secara lengkap..."></textarea>
              </div>
            </div>

            <!-- Image Upload -->
            <div>
              <label class="block text-sm font-bold text-[#0F172A] mb-2">Unggah Foto Bukti (Opsional)</label>
              <div class="relative w-full overflow-hidden border-2 border-[#E2E8F0] border-dashed rounded-xl transition-all" 
                   :class="imagePreview ? 'border-transparent shadow-md' : 'hover:border-[#2563EB] hover:bg-blue-50/30 bg-[#F8FAFC]'">
                   
                <!-- Kondisi Kosong (Dropzone) -->
                <div v-if="!imagePreview" class="flex flex-col items-center justify-center py-10 px-6">
                  <div class="w-16 h-16 bg-blue-100/50 rounded-full flex items-center justify-center mb-4">
                     <i class="ti ti-cloud-upload text-3xl text-blue-600"></i>
                  </div>
                  <div class="flex text-sm text-[#64748B] justify-center gap-1 mb-1">
                    <label class="relative cursor-pointer bg-transparent rounded-md font-bold text-[#2563EB] hover:text-[#1D4ED8] focus-within:outline-none">
                      <span>Pilih file gambar</span>
                      <input ref="fileInput" @change="handleFileChange" type="file" class="sr-only" accept="image/*">
                    </label>
                    <p>atau seret dan lepas di sini</p>
                  </div>
                  <p class="text-xs text-[#94A3B8] font-medium">Mendukung format PNG, JPG, JPEG (Maks. 2MB)</p>
                </div>

                <!-- Kondisi Terisi (Preview) -->
                <div v-if="imagePreview" class="relative w-full h-[300px] group bg-slate-900">
                  <img :src="imagePreview" class="w-full h-full object-contain">
                  <div class="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                     <p class="text-white font-medium text-sm">Gambar berhasil dilampirkan</p>
                     <button type="button" @click="removeImage" class="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg transition-transform hover:scale-105 flex items-center gap-2">
                        <i class="ti ti-trash text-lg"></i> Hapus & Ganti Foto
                     </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-end gap-3 pt-2">
           <router-link to="/reports" class="px-6 py-3 text-sm font-bold text-[#64748B] bg-white border border-[#E2E8F0] hover:bg-slate-50 hover:text-[#0F172A] rounded-xl transition-colors shadow-sm">Batal</router-link>
           <button type="submit" :disabled="loading" class="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
              <i v-if="loading" class="ti ti-loader animate-spin text-lg"></i>
              <i v-else class="ti ti-send text-lg"></i>
              <span>{{ loading ? 'Memproses Laporan...' : 'Kirim Laporan Sekarang' }}</span>
           </button>
        </div>
      </form>
    </div>
  </AdminLayout>
  `
});
