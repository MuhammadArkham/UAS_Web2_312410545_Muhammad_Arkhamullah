const Categories = Vue.defineComponent({
  data() {
    return {
      isLoading: true,
      categories: [],
      showModal: false,
      form: { name: '', description: '' },
      editId: null
    }
  },
  methods: {
    async fetchCategories() {
      this.isLoading = true;
      try {
        const res = await window.api.get('/categories');
        this.categories = res.data.data;
      } catch (e) {
        console.error(e);
      } finally {
        this.isLoading = false;
      }
    },
    openModal(cat = null) {
      if (cat) {
        this.editId = cat.id;
        this.form.name = cat.name;
        this.form.description = cat.description;
      } else {
        this.editId = null;
        this.form.name = '';
        this.form.description = '';
      }
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.editId = null;
      this.form = { name: '', description: '' };
    },
    async saveCategory() {
      try {
        if (this.editId) {
          await window.api.put('/categories/' + this.editId, this.form);
        } else {
          await window.api.post('/categories', this.form);
        }
        this.closeModal();
        this.fetchCategories();
      } catch (e) {
        alert(e.response?.data?.message || 'Terjadi kesalahan');
      }
    },
    async deleteCategory(id) {
      if(confirm('Yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan.')) {
        try {
          await window.api.delete('/categories/' + id);
          this.fetchCategories();
        } catch(e) {
          alert('Gagal menghapus kategori.');
        }
      }
    }
  },
  mounted() {
    this.fetchCategories();
  },
  template: `
  <AdminLayout title="Kategori Laporan" subtitle="Kelola daftar kategori yang dapat digunakan oleh masyarakat untuk melaporkan aduan.">
    <!-- Header Section -->
    <div class="flex justify-end mb-8">
       <button @click="openModal()" class="inline-flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primaryHover transition-colors shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg>
          Tambah Kategori
       </button>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      <div class="overflow-x-auto min-h-[300px]">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
              <th class="px-6 py-4 w-16 text-center">ID</th>
              <th class="px-6 py-4">Nama Kategori</th>
              <th class="px-6 py-4">Deskripsi</th>
              <th class="px-6 py-4 text-center w-32">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <template v-if="isLoading">
              <tr v-for="i in 3" :key="i">
                <td class="px-6 py-4"><div class="animate-pulse bg-gray-100 h-4 rounded w-8 mx-auto"></div></td>
                <td class="px-6 py-4"><div class="animate-pulse bg-gray-100 h-4 rounded w-32"></div></td>
                <td class="px-6 py-4"><div class="animate-pulse bg-gray-100 h-4 rounded w-64"></div></td>
                <td class="px-6 py-4"><div class="animate-pulse bg-gray-100 h-6 rounded w-16 mx-auto"></div></td>
              </tr>
            </template>
            <template v-else>
              <tr v-for="(cat, index) in categories" :key="cat.id" class="hover:bg-slate-50/50 transition-colors group">
                <td class="px-6 py-4 align-middle text-center">
                   <span class="text-xs font-bold text-slate-600">{{ cat.id }}</span>
                </td>
                <td class="px-6 py-4 align-middle">
                   <span class="text-sm font-semibold text-slate-900 block">{{ cat.name }}</span>
                </td>
                <td class="px-6 py-4 align-middle">
                   <span class="text-sm text-slate-600 truncate max-w-sm inline-block" :title="cat.description">{{ cat.description || '-' }}</span>
                </td>
                <td class="px-6 py-4 align-middle text-center">
                   <div class="flex items-center justify-center gap-2">
                     <button @click="openModal(cat)" title="Edit Kategori" class="w-8 h-8 rounded border border-slate-200 bg-white text-blue-500 hover:bg-blue-50 hover:border-blue-200 flex items-center justify-center transition-colors">
                       <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                     </button>
                     <button @click="deleteCategory(cat.id)" title="Hapus Kategori" class="w-8 h-8 rounded border border-slate-200 bg-white text-rose-500 hover:bg-rose-50 hover:border-rose-200 flex items-center justify-center transition-colors">
                       <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                     </button>
                   </div>
                </td>
              </tr>
              <tr v-if="categories.length === 0">
                 <td colspan="4" class="px-6 py-16 text-center">
                    <div class="flex flex-col items-center justify-center">
                       <svg class="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                       <span class="text-slate-500 font-medium text-sm">Belum ada kategori yang ditambahkan.</span>
                    </div>
                 </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-lg font-bold text-slate-900">{{ editId ? 'Edit Kategori' : 'Kategori Baru' }}</h3>
          <button @click="closeModal" class="text-slate-400 hover:text-slate-600 transition-colors">
             <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <form @submit.prevent="saveCategory" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">Nama Kategori</label>
            <input type="text" v-model="form.name" required class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" placeholder="Contoh: Infrastruktur" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">Deskripsi</label>
            <textarea v-model="form.description" rows="3" class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" placeholder="Penjelasan kategori..."></textarea>
          </div>
          <div class="pt-4 flex justify-end gap-3">
            <button type="button" @click="closeModal" class="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors">Batal</button>
            <button type="submit" class="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primaryHover transition-colors shadow-sm">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  </AdminLayout>
  `
});
