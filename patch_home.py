import sys

path = r'C:\xampp\htdocs\UAS_Web2_312410545_Muhammad_Arkhamullah\frontend-spa\components\Home.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update data()
data_old = '''    return {
      isLoading: true,
      recentReports: [],'''
data_new = '''    return {
      isLoading: true,
      recentReports: [],
      allReports: [],'''
content = content.replace(data_old, data_new)

# 2. Add computed
computed_str = '''  computed: {
    distribusiKategori() {
      const counts = {};
      this.allReports.forEach(report => {
        const nama = report.category?.name || 'Lainnya';
        counts[nama] = (counts[nama] || 0) + 1;
      });
      const total = this.allReports.length;
      return Object.entries(counts)
        .map(([nama, jumlah]) => ({
          nama,
          jumlah,
          persen: total > 0 ? Math.round((jumlah / total) * 100) : 0
        }))
        .sort((a, b) => b.jumlah - a.jumlah);
    }
  },'''

methods_idx = content.find('  methods: {')
content = content[:methods_idx] + computed_str + '\n' + content[methods_idx:]

# 3. Update fetchData
fetch_old = '''        const totalKategori = allCategories.length;

        this.recentReports = allReports.slice(0, 3);'''
fetch_new = '''        const totalKategori = allCategories.length;

        this.allReports = allReports;
        this.recentReports = allReports.slice(0, 3);'''
content = content.replace(fetch_old, fetch_new)

# 4. Update Navbar
nav_old = '''        <!-- Center Menu -->
        <div class="hidden md:flex items-center gap-8">
          <a href="#" @click.prevent="scrollToTop" class="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors duration-200">Beranda</a>
          <a href="#cara-kerja" @click.prevent="scrollToSection('cara-kerja')" class="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors duration-200">Cara Kerja</a>
          <a href="#laporan" @click.prevent="scrollToSection('laporan')" class="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors duration-200">Laporan</a>
          <a href="#kontak" @click.prevent="scrollToSection('kontak')" class="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors duration-200">Kontak</a>
        </div>'''
nav_new = '''        <!-- Center Menu -->
        <div class="hidden md:flex items-center gap-8">
          <a href="#hero-section" @click.prevent="scrollToTop" class="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors duration-200">Beranda</a>
          <a href="#statistik-section" @click.prevent="scrollToSection('statistik-section')" class="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors duration-200">Statistik</a>
          <a href="#cara-kerja-section" @click.prevent="scrollToSection('cara-kerja-section')" class="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors duration-200">Cara Kerja</a>
          <a href="#laporan-section" @click.prevent="scrollToSection('laporan-section')" class="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors duration-200">Laporan</a>
        </div>'''
content = content.replace(nav_old, nav_new)

# 5. Update IDs
content = content.replace('<header class="bg-white py-20 fade-in-section">', '<header id="hero-section" class="bg-white py-20 fade-in-section scroll-mt-20">')
content = content.replace('<section class="bg-slate-50 py-12 border-y border-slate-200 fade-in-section">', '<section id="statistik-section" class="bg-slate-50 py-12 border-y border-slate-200 fade-in-section scroll-mt-20">')
content = content.replace('<section id="cara-kerja" class="bg-white py-24 fade-in-section">', '<section id="cara-kerja-section" class="bg-white py-24 fade-in-section scroll-mt-20">')
content = content.replace('<section id="laporan" class="bg-slate-50 py-24 border-y border-slate-200 fade-in-section">', '<section id="laporan-section" class="bg-slate-50 py-24 border-y border-slate-200 fade-in-section scroll-mt-20">')

content = content.replace("scrollToSection('cara-kerja')", "scrollToSection('cara-kerja-section')")
content = content.replace("scrollToSection('laporan')", "scrollToSection('laporan-section')")

# 6. Add Progress Bar section after Stat cards
dist_section = '''
    <!-- DISTRIBUSI KATEGORI SECTION -->
    <section class="bg-white py-16 border-b border-slate-200 fade-in-section scroll-mt-20">
      <div class="container mx-auto px-8 max-w-[800px]">
        <h3 class="text-xl font-display font-bold text-slate-900 mb-8">Distribusi Laporan per Kategori</h3>
        
        <div v-if="isLoading" class="space-y-4">
          <div v-for="i in 3" :key="i" class="w-full h-8 bg-slate-100 rounded animate-pulse"></div>
        </div>
        <div v-else-if="distribusiKategori.length === 0" class="text-slate-500 italic">
          Belum ada data distribusi kategori
        </div>
        <div v-else class="flex flex-col gap-5">
          <div v-for="(item, index) in distribusiKategori" :key="item.nama" class="w-full">
            <div class="flex justify-between items-end mb-1.5">
              <span class="text-sm font-semibold text-slate-800">{{ item.nama }}</span>
              <span class="text-sm font-medium text-slate-500">{{ item.persen }}% ({{ item.jumlah }})</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div class="h-full rounded-full transition-all duration-1000 ease-out" 
                   :class="[
                     index % 4 === 0 ? 'bg-blue-600' : 
                     index % 4 === 1 ? 'bg-emerald-500' : 
                     index % 4 === 2 ? 'bg-amber-500' : 'bg-violet-500'
                   ]"
                   :style="{ width: item.persen + '%' }">
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
'''

process_idx = content.find('<!-- PROCESS SECTION -->')
content = content[:process_idx] + dist_section + '\n    ' + content[process_idx:]

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
