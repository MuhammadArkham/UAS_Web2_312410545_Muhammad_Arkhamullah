const Home = Vue.defineComponent({
  data() {
    return {
      isLoading: true,
      recentReports: [],
      allReports: [],
      stats: {
        total: 0,
        diproses: 0,
        selesai: 0,
        totalKategori: 0
      },
      isScrolled: false,
      activeSection: 'hero',
      mobileMenuOpen: false
    }
  },
  computed: {
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
    },
    resolutionRate() {
      const total = this.allReports.length;
      if (total === 0) return 0;
      const selesai = this.allReports.filter(r => r.status === 'selesai').length;
      return Math.round((selesai / total) * 100);
    }
  },
  methods: {
    getBadgeClass(status) {
      if (!status) return 'bg-gray-100 text-gray-600';
      const s = status.toLowerCase();
      return window.APP_CONFIG.statusBadgeClass[s] + ' text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm uppercase tracking-wider' || 'bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm uppercase tracking-wider';
    },
    warnaProgress(index) {
      const shades = ['bg-blue-600', 'bg-blue-500', 'bg-blue-400', 'bg-blue-300', 'bg-blue-200', 'bg-blue-100'];
      return shades[index] || 'bg-blue-100';
    },
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
    async fetchData() {
      this.isLoading = true;
      try {
        const reportsRes = await window.api.get('/reports').catch(err => {
          return { data: { data: [] } };
        });
        const allReports = reportsRes.data.data || [];

        const catRes = await window.api.get('/categories').catch(err => {
          return { data: { data: [] } };
        });
        const allCategories = catRes.data.data || [];

        // Hitung stats manual dari raw data
        const total = allReports.length;
        const diproses = allReports.filter(r => r.status === 'diproses').length;
        const selesai = allReports.filter(r => r.status === 'selesai').length;
        const totalKategori = allCategories.length;

        this.allReports = allReports;
        this.recentReports = allReports.slice(0, 3);
        
        this.isLoading = false;

        // Animate stat counters
        this.animateCounter(this.stats, 'total', total);
        this.animateCounter(this.stats, 'diproses', diproses);
        this.animateCounter(this.stats, 'selesai', selesai);
        this.animateCounter(this.stats, 'totalKategori', totalKategori);

      } catch (error) {
        console.error("Error fetching data:", error);
        this.isLoading = false;
      }
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    },
    handleScroll() {
      this.isScrolled = window.scrollY > 10;
    },
    scrollToSection(id) {
      this.mobileMenuOpen = false;
      const el = document.getElementById(id);
      if(el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        this.$router.push(`/#${id}`);
      }
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    getImageUrl(path) {
      if (!path) return '';
      if (path.startsWith('http')) return path;
      return window.APP_CONFIG.IMAGE_BASE_URL + path;
    }
  },
  mounted() {
    this.fetchData();
    if (window.observeFadeSections) {
      window.observeFadeSections();
    }
    window.addEventListener('scroll', this.handleScroll);
    this.navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.activeSection = entry.target.id.replace('-section', '');
        }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('section[id], header[id]').forEach(el => {
      this.navObserver.observe(el);
    });
  },
  unmounted() {
    window.removeEventListener('scroll', this.handleScroll);
    if (this.navObserver) this.navObserver.disconnect();
  },
  template: `
  <div class="min-h-screen bg-white font-sans text-slate-900">
    
    <!-- NAVBAR -->
    <nav class="sticky top-0 z-50 bg-white transition-shadow duration-300"
         :class="{ 'shadow-md': isScrolled, 'border-b border-gray-200': !isScrolled }">
      <div class="container mx-auto px-4 md:px-8 h-20 max-w-[1200px] flex items-center justify-between">
        
        <!-- Logo -->
        <div class="flex items-center gap-2 cursor-pointer transition-transform duration-200 hover:scale-105" 
             @click="scrollToSection('hero-section')">
          <img src="assets/logo_uas.png" alt="Logo SiLapor" class="w-10 h-10 object-contain drop-shadow-sm" />
          <span class="font-bold text-xl text-gray-900 tracking-tight">SiLapor</span>
        </div>

        <!-- Center Menu -->
        <div class="hidden md:flex items-center gap-8">
          <a href="#hero-section" 
             class="relative text-sm text-gray-600 font-medium transition-colors duration-200 hover:text-blue-600 after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-blue-600 after:transition-all after:duration-300 after:w-0 hover:after:w-full"
             :class="{ 'text-blue-600 after:w-full': activeSection === 'hero' }"
             @click.prevent="scrollToSection('hero-section')">
            Beranda
          </a>
          <a href="#statistik-section" 
             class="relative text-sm text-gray-600 font-medium transition-colors duration-200 hover:text-blue-600 after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-blue-600 after:transition-all after:duration-300 after:w-0 hover:after:w-full"
             :class="{ 'text-blue-600 after:w-full': activeSection === 'statistik' }"
             @click.prevent="scrollToSection('statistik-section')">
            Statistik
          </a>
          <a href="#cara-kerja-section" 
             class="relative text-sm text-gray-600 font-medium transition-colors duration-200 hover:text-blue-600 after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-blue-600 after:transition-all after:duration-300 after:w-0 hover:after:w-full"
             :class="{ 'text-blue-600 after:w-full': activeSection === 'cara-kerja' }"
             @click.prevent="scrollToSection('cara-kerja-section')">
            Cara Kerja
          </a>
          <a href="#laporan-section" 
             class="relative text-sm text-gray-600 font-medium transition-colors duration-200 hover:text-blue-600 after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-blue-600 after:transition-all after:duration-300 after:w-0 hover:after:w-full"
             :class="{ 'text-blue-600 after:w-full': activeSection === 'laporan' }"
             @click.prevent="scrollToSection('laporan-section')">
            Laporan
          </a>
          <a href="#tentang-section" 
             class="relative text-sm text-gray-600 font-medium transition-colors duration-200 hover:text-blue-600 after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-blue-600 after:transition-all after:duration-300 after:w-0 hover:after:w-full"
             :class="{ 'text-blue-600 after:w-full': activeSection === 'tentang' }"
             @click.prevent="scrollToSection('tentang-section')">
            Tentang
          </a>
        </div>

        <!-- Right Button & Mobile Menu Toggle -->
        <div class="flex items-center gap-3">
          <router-link to="/login" class="text-blue-600 font-semibold border border-gray-200 px-4 md:px-5 py-2 md:py-2.5 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-md animate-[pulse_2s_ease-in-out_1]">
            <svg class="w-4 h-4 hidden sm:block" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            Masuk Petugas
          </router-link>
          
          <!-- Mobile Hamburger -->
          <button class="md:hidden p-2 text-gray-600 hover:text-blue-600 focus:outline-none" @click="mobileMenuOpen = !mobileMenuOpen">
            <svg v-if="!mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      </div>

      <!-- Mobile Dropdown -->
      <div v-show="mobileMenuOpen" class="md:hidden absolute top-full left-0 right-0 bg-white shadow-md flex flex-col p-4 gap-2 border-t border-gray-100">
        <a href="#hero-section" @click.prevent="scrollToSection('hero-section')" class="text-sm font-medium p-3 rounded-lg transition-colors" :class="activeSection === 'hero' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'">Beranda</a>
        <a href="#statistik-section" @click.prevent="scrollToSection('statistik-section')" class="text-sm font-medium p-3 rounded-lg transition-colors" :class="activeSection === 'statistik' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'">Statistik</a>
        <a href="#cara-kerja-section" @click.prevent="scrollToSection('cara-kerja-section')" class="text-sm font-medium p-3 rounded-lg transition-colors" :class="activeSection === 'cara-kerja' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'">Cara Kerja</a>
        <a href="#laporan-section" @click.prevent="scrollToSection('laporan-section')" class="text-sm font-medium p-3 rounded-lg transition-colors" :class="activeSection === 'laporan' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'">Laporan</a>
        <a href="#tentang-section" @click.prevent="scrollToSection('tentang-section')" class="text-sm font-medium p-3 rounded-lg transition-colors" :class="activeSection === 'tentang' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'">Tentang</a>
      </div>
    </nav>

    <!-- HERO SECTION -->
    <header id="hero-section" class="bg-[#0B3EA8] py-20 fade-in-section scroll-mt-20">
      <div class="container mx-auto px-8 max-w-[1200px]">
        <div class="flex flex-col lg:flex-row items-center gap-12">
          <!-- Left: 45% -->
          <div class="w-full lg:w-[45%]">
            <div class="inline-flex items-center gap-2 text-blue-100 font-bold text-sm mb-6 bg-white/10 border border-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              <span>Portal Layanan Terpadu</span>
            </div>
            
            <h1 class="text-4xl lg:text-5xl font-display font-extrabold text-white leading-tight mb-6">
              Layanan Pengaduan Masyarakat
            </h1>
            
            <p class="text-blue-100 text-lg leading-relaxed mb-10 max-w-lg">
              Sampaikan aspirasi dan keluhan Anda secara langsung. Platform ini menjamin transparansi penyelesaian masalah di lingkungan Anda.
            </p>
            
            <div class="flex flex-wrap gap-4">
              <button @click="scrollToSection('laporan-section')" class="bg-white text-[#0B3EA8] px-8 py-3.5 rounded-xl font-bold text-base hover:bg-slate-50 shadow-lg transition-colors">
                Lihat Laporan
              </button>
              <button @click="scrollToSection('cara-kerja-section')" class="bg-transparent text-white border border-white/30 px-8 py-3.5 rounded-xl font-bold text-base hover:bg-white/10 transition-colors">
                Cara Kerja
              </button>
            </div>
          </div>

          <!-- Right: 55% -->
          <div class="w-full lg:w-[55%] flex justify-end">
            <img src="assets/gambar-desain.png?v=2" alt="Hero Illustration" loading="eager" decoding="async" class="w-full max-w-xl h-auto object-contain mix-blend-multiply">
          </div>
        </div>
      </div>
    </header>

    <!-- STATISTICS & DISTRIBUTION SECTION -->
    <section id="statistik-section" class="bg-gray-50 py-12 md:py-16 fade-in-section scroll-mt-20">
      <div class="max-w-5xl mx-auto px-4 lg:px-8 space-y-6 md:space-y-8">
        
        <!-- STATISTIC SUMMARY CARD -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <div class="grid grid-cols-2 md:grid-cols-5 divide-x divide-y md:divide-y-0 divide-gray-100 gap-y-4 md:gap-y-0">
            
            <!-- Total Laporan -->
            <div class="flex items-center gap-3 px-2 md:px-4 py-3 md:py-0">
              <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <div>
                <p v-if="isLoading" class="h-6 w-12 bg-gray-100 rounded animate-pulse mb-1"></p>
                <p v-else class="text-2xl lg:text-3xl font-display font-bold text-gray-900">{{ stats.total }}</p>
                <p class="text-xs lg:text-sm text-gray-500 font-medium">Total Laporan</p>
              </div>
            </div>

            <!-- Sedang Diproses -->
            <div class="flex items-center gap-3 px-2 md:px-4 py-3 md:py-0">
              <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 text-amber-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <p v-if="isLoading" class="h-6 w-12 bg-gray-100 rounded animate-pulse mb-1"></p>
                <p v-else class="text-2xl lg:text-3xl font-display font-bold text-gray-900">{{ stats.diproses }}</p>
                <p class="text-xs lg:text-sm text-gray-500 font-medium">Sedang Diproses</p>
              </div>
            </div>

            <!-- Telah Selesai -->
            <div class="flex items-center gap-3 px-2 md:px-4 py-3 md:py-0">
              <div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <p v-if="isLoading" class="h-6 w-12 bg-gray-100 rounded animate-pulse mb-1"></p>
                <p v-else class="text-2xl lg:text-3xl font-display font-bold text-gray-900">{{ stats.selesai }}</p>
                <p class="text-xs lg:text-sm text-gray-500 font-medium">Telah Selesai</p>
              </div>
            </div>

            <!-- Kategori Tersedia -->
            <div class="flex items-center gap-3 px-2 md:px-4 py-3 md:py-0">
              <div class="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0 text-violet-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
              </div>
              <div>
                <p v-if="isLoading" class="h-6 w-12 bg-gray-100 rounded animate-pulse mb-1"></p>
                <p v-else class="text-2xl lg:text-3xl font-display font-bold text-gray-900">{{ stats.totalKategori }}</p>
                <p class="text-xs lg:text-sm text-gray-500 font-medium">Kategori Tersedia</p>
              </div>
            </div>

            <!-- Resolution Rate -->
            <div class="flex items-center gap-3 px-2 md:px-4 py-3 md:py-0 col-span-2 md:col-span-1">
              <div class="relative w-10 h-10 flex-shrink-0">
                <div class="w-10 h-10 rounded-full transition-all duration-700" 
                     :style="{ background: 'conic-gradient(#1a56c4 0% ' + resolutionRate + '%, #e5e7eb ' + resolutionRate + '% 100%)' }">
                </div>
                <div class="absolute inset-1 bg-white rounded-full flex items-center justify-center">
                  <span class="text-[10px] font-bold text-gray-900">
                    <span v-if="isLoading" class="inline-block w-4 h-3 bg-gray-100 animate-pulse rounded"></span>
                    <span v-else>{{ resolutionRate }}%</span>
                  </span>
                </div>
              </div>
              <div>
                <p class="text-[11px] sm:text-xs font-semibold text-gray-900 leading-tight">Tingkat Penyelesaian</p>
                <p class="text-[10px] sm:text-[11px] text-gray-500">dari total laporan</p>
              </div>
            </div>

          </div>
        </div>

        <!-- DISTRIBUSI KATEGORI CARD -->
        <div class="max-w-xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
          <h3 class="font-display font-semibold text-base text-gray-900 mb-4">
            Distribusi Laporan per Kategori
          </h3>
          
          <div v-if="isLoading" class="space-y-3">
            <div v-for="i in 3" :key="i" class="w-full h-8 bg-gray-100 rounded animate-pulse"></div>
          </div>
          <p v-else-if="distribusiKategori.length === 0" class="text-sm text-gray-600 text-center py-2">
            Belum ada data distribusi kategori
          </p>
          <div v-else class="space-y-3">
            <div v-for="(item, index) in distribusiKategori" :key="item.nama">
              <div class="flex justify-between items-center mb-1.5">
                <span class="text-sm font-medium text-gray-700">
                  {{ item.nama }}
                </span>
                <span class="text-sm font-medium text-gray-500">
                  {{ item.persen }}% ({{ item.jumlah }})
                </span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-2">
                <div class="h-2 rounded-full transition-all duration-700"
                     :class="warnaProgress(index)"
                     :style="{ width: item.persen + '%' }">
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- PROCESS SECTION -->
    <section id="cara-kerja-section" class="bg-white py-24 fade-in-section scroll-mt-20">
      <div class="container mx-auto px-8 max-w-[1200px]">
        <div class="text-center mb-16">
          <h2 class="text-3xl lg:text-4xl font-display font-bold text-slate-900">Alur Penyelesaian Laporan</h2>
        </div>
        
        <div class="relative max-w-4xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <!-- Step 1 -->
            <div class="relative flex flex-col items-center text-center w-full">
              <div class="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-200 border border-transparent text-blue-600 relative z-10 group">
                 <svg class="w-10 h-10 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M10.42 12.61a2.1 2.1 0 1 1 2.97 2.97L7.95 21 4 22l.99-3.95 5.43-5.44Z"/></svg>
              </div>
              <div class="hidden md:flex absolute top-[40px] -translate-y-1/2 left-[calc(50%+40px)] w-[calc(100%-80px)] items-center z-0 px-3">
                <div class="flex-grow h-[2px] bg-slate-300"></div>
                <div class="w-0 h-0 border-y-[4px] border-y-transparent border-l-[6px] border-l-slate-300 ml-[-1px]"></div>
              </div>
              
              <h3 class="font-display font-semibold text-base mb-1 text-slate-900">1. Pencatatan</h3>
              <p class="text-sm text-slate-500 leading-relaxed max-w-[240px] mx-auto">Warga melaporkan masalah atau usulan di lingkungan sekitar melalui sistem.</p>
            </div>
            <!-- Step 2 -->
            <div class="relative flex flex-col items-center text-center w-full">
              <div class="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-200 border border-transparent text-blue-600 relative z-10 group">
                 <svg class="w-10 h-10 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="m8 11 2 2 4-4"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <div class="hidden md:flex absolute top-[40px] -translate-y-1/2 left-[calc(50%+40px)] w-[calc(100%-80px)] items-center z-0 px-3">
                <div class="flex-grow h-[2px] bg-slate-300"></div>
                <div class="w-0 h-0 border-y-[4px] border-y-transparent border-l-[6px] border-l-slate-300 ml-[-1px]"></div>
              </div>
              
              <h3 class="font-display font-semibold text-base mb-1 text-slate-900">2. Verifikasi</h3>
              <p class="text-sm text-slate-500 leading-relaxed max-w-[240px] mx-auto">Petugas mengecek kejelasan informasi dan lokasi pasti dari laporan yang masuk.</p>
            </div>
            <!-- Step 3 -->
            <div class="relative flex flex-col items-center text-center w-full">
              <div class="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-200 border border-transparent text-blue-600 relative z-10 group">
                 <svg class="w-10 h-10 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
              </div>
              <div class="hidden md:flex absolute top-[40px] -translate-y-1/2 left-[calc(50%+40px)] w-[calc(100%-80px)] items-center z-0 px-3">
                <div class="flex-grow h-[2px] bg-slate-300"></div>
                <div class="w-0 h-0 border-y-[4px] border-y-transparent border-l-[6px] border-l-slate-300 ml-[-1px]"></div>
              </div>
              
              <h3 class="font-display font-semibold text-base mb-1 text-slate-900">3. Tindak Lanjut</h3>
              <p class="text-sm text-slate-500 leading-relaxed max-w-[240px] mx-auto">Laporan diteruskan ke dinas atau petugas lapangan agar segera dibereskan.</p>
            </div>
            <!-- Step 4 -->
            <div class="relative flex flex-col items-center text-center w-full">
              <div class="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-200 border border-transparent text-blue-600 relative z-10 group">
                 <svg class="w-10 h-10 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <!-- No dashed line for the last step -->
              <h3 class="font-display font-semibold text-base mb-1 text-slate-900">4. Selesai</h3>
              <p class="text-sm text-slate-500 leading-relaxed max-w-[240px] mx-auto">Masalah telah tuntas tertangani dan warga dapat melihat bukti penyelesaiannya.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- LAPORAN TERBARU SECTION -->
    <section id="laporan-section" class="bg-slate-50 py-24 border-y border-slate-200 fade-in-section scroll-mt-20">
      <div class="container mx-auto px-8 max-w-[1200px]">
        <div class="mb-12 text-center md:text-left">
          <h2 class="text-3xl lg:text-4xl font-display font-bold text-slate-900 mb-4">Laporan Publik</h2>
          <p class="text-slate-600 text-lg">Pantau laporan terkini dari masyarakat.</p>
        </div>

        <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-3 gap-8">
           <!-- Skeletons -->
           <div v-for="i in 3" :key="i" class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-[380px]">
             <div class="h-40 w-full bg-slate-200 animate-pulse"></div>
             <div class="p-6 flex-1 flex flex-col gap-4">
               <div class="h-6 bg-slate-200 rounded animate-pulse w-3/4"></div>
               <div class="mt-auto space-y-3">
                 <div class="h-4 bg-slate-100 rounded animate-pulse w-1/2"></div>
                 <div class="h-4 bg-slate-100 rounded animate-pulse w-1/3"></div>
               </div>
             </div>
           </div>
        </div>
        <div v-else-if="recentReports.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="report in recentReports" :key="report.id" class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-shadow hover:shadow-md group flex flex-col">
            <!-- Image Area -->
            <div class="h-40 w-full relative bg-slate-100 overflow-hidden border-b border-slate-100">
               <img v-if="report.image" :src="getImageUrl(report.image)" loading="lazy" decoding="async" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Lampiran Laporan">
               <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-400">
                 <svg class="w-10 h-10 mb-2 opacity-30" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
               </div>
               
               <!-- Status Badge -->
               <div class="absolute top-4 right-4">
                 <span v-if="report.status === 'selesai'" class="bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm uppercase tracking-wider">SELESAI</span>
                 <span v-else-if="report.status === 'diproses'" class="bg-blue-50 text-blue-600 border border-blue-100 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm uppercase tracking-wider">DIPROSES</span>
                 <span v-else class="bg-slate-50 text-slate-600 border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm uppercase tracking-wider">PENDING</span>
               </div>
            </div>

            <!-- Content Area -->
            <div class="p-6 flex-1 flex flex-col">
              <div class="inline-flex text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md mb-4 uppercase tracking-wider max-w-max">
                 {{ report.category?.name || 'Umum' }}
              </div>
              <h3 class="text-lg font-bold text-slate-900 mb-4 leading-snug line-clamp-2">
                {{ report.title }}
              </h3>
              
              <div class="mt-auto space-y-2">
                <div class="flex items-center gap-2 text-sm text-slate-500">
                   <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                   <span class="line-clamp-1 truncate">{{ report.location }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-slate-500">
                   <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                   <span>{{ formatDate(report.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p class="text-slate-500 text-lg">Belum ada laporan publik yang terdaftar.</p>
        </div>
      </div>
    </section>

    <!-- CONTACT / HELPDESK SECTION -->
    <section class="bg-white py-20 fade-in-section">
      <div class="container mx-auto px-8 max-w-[1200px]">
        <div class="bg-slate-900 rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10">
          <div class="md:w-2/3 text-left">
            <h2 class="text-3xl font-display font-bold text-white mb-4">Pusat Layanan & Bantuan</h2>
            <p class="text-slate-400 text-lg leading-relaxed max-w-xl">
              Butuh panduan teknis atau ingin menanyakan perkembangan laporan yang bersifat rahasia? Silakan hubungi Call Center resmi kami.
            </p>
          </div>
          <div class="md:w-1/3 flex justify-end w-full">
            <a href="mailto:support@silapor.go.id" class="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 w-full md:w-auto">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              Hubungi Tim Kami
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- TENTANG KAMI SECTION -->
    <section id="tentang-section" class="bg-white py-12 md:py-16 fade-in-section scroll-mt-20">
      <div class="max-w-5xl mx-auto px-4">
        <div class="text-center mb-10">
          <h2 class="font-display font-bold text-2xl md:text-3xl text-gray-900 mb-2">
            Tentang SiLapor
          </h2>
          <div class="w-12 h-1 bg-blue-600 rounded-full mx-auto mb-4"></div>
          <p class="text-gray-600 text-sm md:text-base">
            Platform digital untuk pelaporan dan pemantauan pengaduan masyarakat
          </p>
        </div>

        <div class="max-w-2xl mx-auto text-center mb-10 space-y-3">
          <p class="text-base text-gray-600 leading-relaxed">
            SiLapor adalah sistem pengaduan masyarakat yang memudahkan warga memantau status penanganan laporan terkait infrastruktur, lingkungan, keamanan, dan pelayanan publik lainnya secara transparan.
          </p>
          <p class="text-base text-gray-600 leading-relaxed">
            Setiap laporan yang masuk akan diverifikasi, ditindaklanjuti, dan dipantau hingga selesai oleh petugas yang berwenang, dengan status yang dapat dilihat secara real-time oleh masyarakat.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 text-center mt-10 md:mt-12">
          
          <div class="flex flex-col items-center">
            <div class="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-3 transition-transform hover:scale-110 duration-200">
              <i class="ti ti-eye text-blue-600" style="font-size: 24px;"></i>
            </div>
            <h3 class="font-display font-semibold text-base text-gray-900 mb-1">
              Transparan
            </h3>
            <p class="text-sm text-gray-600 leading-relaxed max-w-[200px] mx-auto">
              Status setiap laporan dapat dipantau secara terbuka oleh masyarakat
            </p>
          </div>

          <div class="flex flex-col items-center">
            <div class="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-3 transition-transform hover:scale-110 duration-200">
              <i class="ti ti-bolt text-blue-600" style="font-size: 24px;"></i>
            </div>
            <h3 class="font-display font-semibold text-base text-gray-900 mb-1">
              Responsif
            </h3>
            <p class="text-sm text-gray-600 leading-relaxed max-w-[200px] mx-auto">
              Laporan ditindaklanjuti secara cepat oleh petugas terkait
            </p>
          </div>

          <div class="flex flex-col items-center">
            <div class="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-3 transition-transform hover:scale-110 duration-200">
              <i class="ti ti-clipboard-check text-blue-600" style="font-size: 24px;"></i>
            </div>
            <h3 class="font-display font-semibold text-base text-gray-900 mb-1">
              Akuntabel
            </h3>
            <p class="text-sm text-gray-600 leading-relaxed max-w-[200px] mx-auto">
              Setiap proses tercatat dan dapat dipertanggungjawabkan
            </p>
          </div>

        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer id="kontak" class="bg-slate-50 border-t border-slate-200 py-16">
      <div class="container mx-auto px-8 max-w-[1200px]">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div class="md:col-span-1">
            <div class="flex items-center gap-3 mb-6">
               <img src="assets/logo_uas.png" alt="Logo SiLapor" class="w-10 h-10 object-contain drop-shadow-sm" />
               <h2 class="text-xl font-bold text-slate-900 tracking-tight">SiLapor</h2>
            </div>
            <p class="text-slate-500 text-sm leading-relaxed">SiLapor: Platform pelaporan digital untuk menjembatani aspirasi masyarakat dengan instansi pemerintah.</p>
          </div>
          
          <div>
            <h4 class="font-bold text-slate-900 text-sm mb-6 uppercase tracking-wider">Tautan</h4>
            <ul class="space-y-4 text-sm font-medium">
              <li><a href="#hero-section" @click.prevent="scrollToSection('hero-section')" class="text-gray-500 hover:text-blue-600 transition-colors">Beranda</a></li>
              <li><a href="#cara-kerja-section" @click.prevent="scrollToSection('cara-kerja-section')" class="text-gray-500 hover:text-blue-600 transition-colors">Cara Kerja</a></li>
              <li><a href="#laporan-section" @click.prevent="scrollToSection('laporan-section')" class="text-gray-500 hover:text-blue-600 transition-colors">Laporan Publik</a></li>
              <li><a href="#tentang-section" @click.prevent="scrollToSection('tentang-section')" class="text-gray-500 hover:text-blue-600 transition-colors">Tentang Kami</a></li>
            </ul>
          </div>
          
          <div>
            <h4 class="font-bold text-slate-900 text-sm mb-6 uppercase tracking-wider">Informasi</h4>
            <ul class="space-y-4 text-sm font-medium">
              <li><a href="#" class="text-slate-500 hover:text-blue-600 transition-colors">Kebijakan Privasi</a></li>
              <li><a href="#" class="text-slate-500 hover:text-blue-600 transition-colors">Syarat Ketentuan</a></li>
              <li><a href="#" class="text-slate-500 hover:text-blue-600 transition-colors">Bantuan FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold text-slate-900 text-sm mb-6 uppercase tracking-wider">Kontak</h4>
            <ul class="space-y-4 text-sm font-medium text-slate-500">
              <li class="flex items-start gap-3">
                 <svg class="w-5 h-5 shrink-0 mt-0.5 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                 <span>Kantor Layanan Publik<br>Jl. Sudirman 123, Jakarta</span>
              </li>
              <li class="flex items-center gap-3">
                 <svg class="w-5 h-5 shrink-0 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                 <span>+62 21 555 1234</span>
              </li>
              <li class="flex items-center gap-3">
                 <svg class="w-5 h-5 shrink-0 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                 <a href="mailto:support@silapor.go.id" class="hover:text-blue-600 transition-colors">support@silapor.go.id</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 font-medium">
          <div>&copy; 2026 SiLapor &mdash; Sistem Pengaduan Masyarakat.</div>
          <div class="flex gap-6">
            <span>Otoritas</span>
            <span>Transparansi</span>
            <span>Integritas</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
  `

});
