const Home = Vue.defineComponent({
  data() {
    return {
      isLoading: true,
      chartInstance: null,
      recentReports: [],
      allReports: [],
      allCategories: [],
      stats: {
        total: 0,
        diproses: 0,
        selesai: 0,
        totalKategori: 0
      },
      lastUpdated: null,
      isScrolled: false,
      activeSection: 'hero',
      mobileMenuOpen: false,
      filterKategori: '',
      debouncedFilterKategori: '',
      searchQuery: '',
      debouncedSearchQuery: '',
      filterStatus: '',
      debouncedFilterStatus: '',
      searchTimer: null,
      statusBadgeClass: {
        pending: 'bg-red-50 text-red-700',
        diproses: 'bg-amber-50 text-amber-700',
        selesai: 'bg-emerald-50 text-emerald-700',
        ditolak: 'bg-gray-100 text-gray-600'
      }
    }
  },
  computed: {
    jamSekarang() {
      if (!this.lastUpdated) return '--:--';
      return this.lastUpdated.toLocaleTimeString('id-ID', {
        hour: '2-digit', minute: '2-digit'
      });
    },
    totalLaporan() { return this.stats.total; },
    totalDiproses() { return this.stats.diproses; },
    totalSelesai() { return this.stats.selesai; },
    totalKategori() { return this.stats.totalKategori; },
    listKategori() { return this.allCategories; },
    laporanFiltered() {
      return this.allReports.filter(l => {
        const matchSearch = !this.debouncedSearchQuery || 
          l.title.toLowerCase().includes(this.debouncedSearchQuery.toLowerCase()) ||
          (l.location && l.location.toLowerCase().includes(this.debouncedSearchQuery.toLowerCase()));
        const matchKategori = !this.debouncedFilterKategori || l.category_id == this.debouncedFilterKategori;
        const matchStatus = !this.debouncedFilterStatus || l.status === this.debouncedFilterStatus;
        return matchSearch && matchKategori && matchStatus;
      });
    }
  },
  watch: {
    searchQuery() { this.applyDebounce(); },
    filterKategori() { this.applyDebounce(); },
    filterStatus() { this.applyDebounce(); }
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
        this.allCategories = allCategories;
        
        this.isLoading = false;

        // Animate stat counters
        this.animateCounter(this.stats, 'total', total);
        this.animateCounter(this.stats, 'diproses', diproses);
        this.animateCounter(this.stats, 'selesai', selesai);
        this.animateCounter(this.stats, 'totalKategori', totalKategori);

        this.$nextTick(() => {
          this.lastUpdated = new Date();
          if (typeof AOS !== 'undefined') {
            AOS.refreshHard();
          }
        });

      } catch (error) {
        console.error("Error fetching data:", error);
        this.isLoading = false;
      }
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    },
    formatTanggal(dateStr) {
      return new Date(dateStr).toLocaleDateString('id-ID', { 
        day: 'numeric', month: 'short', year: 'numeric' 
      });
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
    },
    iconKategori(catName) {
      const lower = catName.toLowerCase();
      if (lower.includes('infrastruktur') || lower.includes('jalan')) return 'ti ti-road';
      if (lower.includes('lingkungan') || lower.includes('sampah')) return 'ti ti-leaf';
      if (lower.includes('keamanan') || lower.includes('kriminal')) return 'ti ti-shield';
      if (lower.includes('kesehatan')) return 'ti ti-heartbeat';
      if (lower.includes('pendidikan')) return 'ti ti-school';
      if (lower.includes('sosial')) return 'ti ti-users';
      return 'ti ti-tag';
    },
    warnaKategoriIcon(catName) {
      const lower = catName.toLowerCase();
      if (lower.includes('infrastruktur') || lower.includes('jalan')) return '#2563eb'; // blue-600
      if (lower.includes('lingkungan') || lower.includes('sampah')) return '#16a34a'; // green-600
      if (lower.includes('keamanan') || lower.includes('kriminal')) return '#4f46e5'; // indigo-600
      if (lower.includes('kesehatan')) return '#ef4444'; // red-500
      if (lower.includes('pendidikan')) return '#f97316'; // orange-500
      if (lower.includes('sosial')) return '#9333ea'; // purple-600
      return '#64748b'; // slate-500
    },
    applyDebounce() {
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        this.debouncedSearchQuery = this.searchQuery;
        this.debouncedFilterKategori = this.filterKategori;
        this.debouncedFilterStatus = this.filterStatus;
        
        // Reset scroll position of slider when filter changes
        if (this.$refs.reportsSlider) {
          this.$refs.reportsSlider.scrollTo({ left: 0, behavior: 'smooth' });
        }
      }, 500);
    },
    resetFilter() {
      this.searchQuery = '';
      this.filterKategori = '';
      this.filterStatus = '';
    },
    filterByCategory(kategori) {
      this.filterKategori = kategori.id;
      this.scrollToSection('laporan-section');
    },
    scrollSlider(direction) {
      const container = this.$refs.reportsSlider;
      if (!container) return;
      const scrollAmount = 350 + 32; // card width + gap
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  },
  mounted() {
    this.fetchData();
    if (window.observeFadeSections) {
      window.observeFadeSections();
    }
    
    // Re-initialize AOS on mount because SPA routing unmounts elements
    setTimeout(() => {
      if (typeof AOS !== 'undefined') {
        AOS.init({
            once: true,
            duration: 800,
            easing: 'ease-out-cubic',
            offset: 50,
        });
        AOS.refreshHard();
      }
    }, 100);

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
          <a href="#tentang-section" 
             class="relative text-sm text-gray-600 font-medium transition-colors duration-200 hover:text-blue-600 after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-blue-600 after:transition-all after:duration-300 after:w-0 hover:after:w-full"
             :class="{ 'text-blue-600 after:w-full': activeSection === 'tentang' }"
             @click.prevent="scrollToSection('tentang-section')">
            Tentang
          </a>
          <a href="#cara-kerja-section" 
             class="relative text-sm text-gray-600 font-medium transition-colors duration-200 hover:text-blue-600 after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-blue-600 after:transition-all after:duration-300 after:w-0 hover:after:w-full"
             :class="{ 'text-blue-600 after:w-full': activeSection === 'cara-kerja' }"
             @click.prevent="scrollToSection('cara-kerja-section')">
            Cara Kerja
          </a>
          <a href="#statistik-section" 
             class="relative text-sm text-gray-600 font-medium transition-colors duration-200 hover:text-blue-600 after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-blue-600 after:transition-all after:duration-300 after:w-0 hover:after:w-full"
             :class="{ 'text-blue-600 after:w-full': activeSection === 'statistik' }"
             @click.prevent="scrollToSection('statistik-section')">
            Statistik
          </a>
          <a href="#laporan-section" 
             class="relative text-sm text-gray-600 font-medium transition-colors duration-200 hover:text-blue-600 after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-blue-600 after:transition-all after:duration-300 after:w-0 hover:after:w-full"
             :class="{ 'text-blue-600 after:w-full': activeSection === 'laporan' }"
             @click.prevent="scrollToSection('laporan-section')">
            Laporan
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
        <a href="#tentang-section" @click.prevent="scrollToSection('tentang-section')" class="text-sm font-medium p-3 rounded-lg transition-colors" :class="activeSection === 'tentang' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'">Tentang</a>
        <a href="#cara-kerja-section" @click.prevent="scrollToSection('cara-kerja-section')" class="text-sm font-medium p-3 rounded-lg transition-colors" :class="activeSection === 'cara-kerja' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'">Cara Kerja</a>
        <a href="#statistik-section" @click.prevent="scrollToSection('statistik-section')" class="text-sm font-medium p-3 rounded-lg transition-colors" :class="activeSection === 'statistik' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'">Statistik</a>
        <a href="#laporan-section" @click.prevent="scrollToSection('laporan-section')" class="text-sm font-medium p-3 rounded-lg transition-colors" :class="activeSection === 'laporan' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'">Laporan</a>
      </div>
    </nav>

    <!-- HERO SECTION -->
    <header id="hero-section" class="bg-[#0B3EA8] py-20 relative fade-in-section scroll-mt-20">
      <div class="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div class="flex flex-col lg:flex-row items-center gap-12">
          <!-- Left: 45% -->
          <div class="w-full lg:w-[45%]" data-aos="fade-right" data-aos-duration="1000">
            <div class="inline-flex items-center gap-2 text-blue-100 font-bold text-sm mb-6 bg-white/10 border border-white/20 px-4 py-2 rounded-full backdrop-blur-sm" data-aos="fade-down" data-aos-delay="200">
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
              <button @click="scrollToSection('laporan-section')" class="bg-white text-[#0B3EA8] px-8 py-3.5 rounded-xl font-bold text-base hover:bg-slate-50 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center">
                Lihat Laporan
              </button>
              <button @click="scrollToSection('cara-kerja-section')" class="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-3.5 rounded-xl font-bold text-base hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center">
                Cara Kerja
              </button>
            </div>
          </div>

          <!-- Right: 55% -->
          <div class="w-full lg:w-[55%] flex justify-end items-center" data-aos="fade-left" data-aos-duration="1200" data-aos-delay="200">
            <img src="assets/gambar_desain.png?v=11" alt="Hero Illustration" class="w-full max-w-[550px] h-auto object-cover bg-white p-1 rounded-[2rem] shadow-2xl transform hover:-translate-y-2 transition-transform duration-500">
          </div>
        </div>
      </div>
    </header>

    <!-- TENTANG KAMI SECTION -->
    <section id="tentang-section" class="bg-white py-12 md:py-16 fade-in-section scroll-mt-20">
      <div class="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        
        <!-- SECTION HEADING (Centered) -->
        <div class="text-center mb-12 md:mb-16" data-aos="fade-down">
          <h2 class="font-display font-bold text-2xl md:text-3xl text-gray-900 leading-tight mb-2">
            Tentang Aplikasi SiLapor
          </h2>
          <div class="w-12 h-1 bg-blue-600 rounded-full mx-auto mb-3"></div>
          <p class="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Platform pengaduan digital inovatif untuk menyalurkan aspirasi dan memudahkan warga memantau status penanganan laporan secara transparan.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 items-start">
          
          <!-- Left Content -->
          <div class="lg:col-span-5" data-aos="fade-right">
            <h3 class="font-display font-bold text-xl md:text-2xl text-gray-900 leading-tight mb-6">
              Solusi Tepat untuk Aspirasi Masyarakat
            </h3>
            
            <p class="text-slate-600 text-lg leading-relaxed mb-6">
              <strong class="text-slate-900">SiLapor</strong> hadir sebagai ruang aman dan terpercaya bagi masyarakat untuk dengan mudah menyuarakan aspirasi, kritik, serta melaporkan masalah di sekitar seperti kerusakan infrastruktur, isu lingkungan, hingga gangguan keamanan.
            </p>
            
            <p class="text-slate-600 text-lg leading-relaxed mb-8">
              Tidak perlu lagi bingung ke mana harus melapor. Cukup tuliskan keluhan Anda, lampirkan bukti pendukung, dan pantau terus perkembangan penyelesaiannya secara <span class="italic font-medium">real-time</span> langsung dari perangkat genggaman Anda.
            </p>

            <ul class="space-y-4">
               <li class="flex items-center gap-3">
                 <div class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <i class="ti ti-check text-sm"></i>
                 </div>
                 <span class="text-slate-700 font-medium">Akses pelaporan yang mudah, cepat, dan transparan</span>
               </li>
               <li class="flex items-center gap-3">
                 <div class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <i class="ti ti-check text-sm"></i>
                 </div>
                 <span class="text-slate-700 font-medium">Privasi dan keamanan identitas pelapor terjamin</span>
               </li>
            </ul>
          </div>

          <!-- Right Content: Cards -->
          <div class="lg:col-span-7 relative" data-aos="fade-left">
            <!-- Background Decoration -->
            <div class="absolute -top-10 -right-10 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 z-0"></div>
            
            <div class="flex flex-col gap-6 relative z-10 bg-white border border-slate-100 rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              
              <!-- Item 1: Transparan -->
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <i class="ti ti-eye text-blue-600" style="font-size: 22px;"></i>
                </div>
                <div>
                  <h4 class="font-display font-semibold text-gray-900 mb-1">
                    Transparan
                  </h4>
                  <p class="text-sm text-gray-600 leading-relaxed">
                    Semua proses penanganan dapat dipantau secara terbuka oleh seluruh masyarakat.
                  </p>
                </div>
              </div>

              <!-- Item 2: Responsif -->
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <i class="ti ti-bolt text-blue-600" style="font-size: 22px;"></i>
                </div>
                <div>
                  <h4 class="font-display font-semibold text-gray-900 mb-1">
                    Responsif
                  </h4>
                  <p class="text-sm text-gray-600 leading-relaxed">
                    Setiap aduan diarahkan ke instansi terkait untuk penyelesaian sesingkat-singkatnya.
                  </p>
                </div>
              </div>

              <!-- Item 3: Akuntabel -->
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <i class="ti ti-clipboard-check text-emerald-600" style="font-size: 22px;"></i>
                </div>
                <div>
                  <h4 class="font-display font-semibold text-gray-900 mb-1">
                    Akuntabel
                  </h4>
                  <p class="text-sm text-gray-600 leading-relaxed">
                    Seluruh laporan tercatat secara digital dengan jejak audit yang jelas dan valid.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- PROCESS SECTION -->
    <section id="cara-kerja-section" class="bg-slate-50 border-y border-slate-200 py-12 md:py-16 fade-in-section scroll-mt-20">
      <div class="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div class="text-center mb-8 md:mb-10" data-aos="fade-down">
          <h2 class="font-display font-bold text-2xl md:text-3xl text-gray-900 leading-tight mb-2">
            Alur Penyelesaian Laporan
          </h2>
          <div class="w-12 h-1 bg-blue-600 rounded-full mx-auto mb-3"></div>
          <p class="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
            Setiap laporan yang masuk ditangani melalui proses yang terstruktur dan dapat dipantau
          </p>
        </div>
        
        <div class="relative max-w-4xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <!-- Step 1 -->
            <div class="relative flex flex-col items-center text-center w-full" data-aos="fade-up" data-aos-delay="100">
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
            <div class="relative flex flex-col items-center text-center w-full" data-aos="fade-up" data-aos-delay="200">
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
            <div class="relative flex flex-col items-center text-center w-full" data-aos="fade-up" data-aos-delay="300">
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
            <div class="relative flex flex-col items-center text-center w-full" data-aos="fade-up" data-aos-delay="400">
              <div class="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-200 border border-transparent text-blue-600 relative z-10 group">
                 <svg class="w-10 h-10 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <!-- No dashed line for the last step -->
              <h3 class="font-display font-semibold text-base mb-1 text-slate-900">4. Selesai</h3>
              <p class="text-sm text-slate-500 leading-relaxed max-w-[240px] mx-auto">Laporan ditandai selesai dan status dapat dipantau langsung oleh masyarakat.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- STATISTICS & DISTRIBUTION SECTION -->
    <section id="statistik-section" class="bg-white py-16 md:py-24 fade-in-section scroll-mt-20">
      <div class="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">

        <!-- HEADER SECTION -->
        <div class="text-center mb-16" data-aos="fade-down">
          <h2 class="font-display font-bold text-3xl md:text-4xl text-gray-900 leading-tight mb-4">
            Transparansi Data Pengaduan
          </h2>
          <div class="w-16 h-1 bg-blue-600 rounded-full mx-auto mb-4"></div>
          <p class="text-base text-gray-500 max-w-2xl mx-auto">
            Pantau status penanganan laporan masyarakat secara langsung
          </p>
        </div>

        <div class="bg-white rounded-2xl border border-gray-200 p-8 md:p-10 relative shadow-sm">
          
          <!-- STATISTIK UTAMA -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <!-- Total Laporan -->
            <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-center h-full">
              <div class="flex items-center gap-3 mb-3">
                <i class="ti ti-file-text text-blue-600 text-xl"></i>
                <p class="text-sm text-gray-500 font-medium">Total Laporan</p>
              </div>
              <p class="text-4xl font-display font-bold text-gray-900">{{ totalLaporan }}</p>
            </div>
            <!-- Sedang Diproses -->
            <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-center h-full">
              <div class="flex items-center gap-3 mb-3">
                <i class="ti ti-clock text-amber-500 text-xl"></i>
                <p class="text-sm text-gray-500 font-medium">Sedang Diproses</p>
              </div>
              <p class="text-4xl font-display font-bold text-gray-900">{{ totalDiproses }}</p>
            </div>
            <!-- Telah Selesai -->
            <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-center h-full">
              <div class="flex items-center gap-3 mb-3">
                <i class="ti ti-circle-check text-emerald-600 text-xl"></i>
                <p class="text-sm text-gray-500 font-medium">Telah Selesai</p>
              </div>
              <p class="text-4xl font-display font-bold text-gray-900">{{ totalSelesai }}</p>
            </div>
            <!-- Kategori -->
            <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-center h-full">
              <div class="flex items-center gap-3 mb-3">
                <i class="ti ti-tag text-purple-600 text-xl"></i>
                <p class="text-sm text-gray-500 font-medium">Kategori Layanan</p>
              </div>
              <p class="text-4xl font-display font-bold text-gray-900">{{ totalKategori }}</p>
            </div>
          </div>

          <!-- TRANSPARANSI PENYELESAIAN -->
          <div class="mb-12">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Tingkat Penyelesaian Aduan</h3>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-semibold text-gray-700">{{ totalLaporan > 0 ? Math.round((totalSelesai / totalLaporan) * 100) : 0 }}% Laporan Selesai</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-3 mb-3">
              <div class="bg-emerald-500 h-3 rounded-full transition-all duration-1000" :style="{ width: (totalLaporan > 0 ? Math.round((totalSelesai / totalLaporan) * 100) : 0) + '%' }"></div>
            </div>
            <p class="text-sm text-gray-600">
              <strong class="text-gray-900">{{ totalSelesai }}</strong> dari <strong class="text-gray-900">{{ totalLaporan }}</strong> laporan masyarakat yang masuk telah diselesaikan.
            </p>
          </div>

          <!-- KATEGORI LAYANAN -->
          <div>
            <h3 class="text-lg font-bold text-gray-900 mb-6">Distribusi Kategori Laporan</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button v-for="kategori in listKategori" :key="kategori.id"
                      @click="filterByCategory(kategori)"
                      class="flex items-center justify-between px-5 py-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors text-left group">
                <div class="flex items-center gap-3">
                  <i :class="iconKategori(kategori.name)" :style="{ color: warnaKategoriIcon(kategori.name) }" class="text-xl"></i>
                  <span class="text-sm font-semibold text-gray-800">{{ kategori.name }}</span>
                </div>
                <span class="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
                  {{ allReports.filter(r => r.category_id == kategori.id).length }} laporan
                </span>
              </button>
            </div>
          </div>

          <!-- INFORMASI UPDATE -->
          <div class="mt-12 text-right border-t border-gray-100 pt-6">
            <p class="text-xs text-gray-400">Terakhir diperbarui {{ formatDate(new Date()) }} • {{ jamSekarang }} WIB</p>
          </div>

        </div>
      </div>
    </section>

    <!-- LAPORAN TERBARU SECTION -->
    <section id="laporan-section" class="bg-slate-50 py-12 md:py-16 border-y border-slate-200 fade-in-section scroll-mt-20">
      <div class="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div class="mb-12 text-left" data-aos="fade-right">
          <div class="mb-8 md:mb-10">
            <h2 class="font-display font-bold text-2xl md:text-3xl text-gray-900 leading-tight mb-2">
              Laporan Publik
            </h2>
            <div class="w-12 h-1 bg-blue-600 rounded-full mb-3"></div>
            <p class="text-sm text-gray-500 leading-relaxed">
              Pantau laporan terkini dari masyarakat di berbagai wilayah
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 mb-6">
            
            <!-- Search -->
            <div class="relative flex-1">
              <i class="ti ti-search absolute left-3 
                        top-1/2 -translate-y-1/2 
                        text-gray-400" 
                 style="font-size: 16px;"></i>
              <input v-model="searchQuery"
                     type="text"
                     placeholder="Cari judul laporan..."
                     class="w-full pl-9 pr-4 py-2 text-sm 
                            border border-gray-200 rounded-xl 
                            bg-white text-gray-700 
                            focus:outline-none 
                            focus:border-blue-400 
                            focus:ring-1 focus:ring-blue-100 
                            transition-colors duration-150">
            </div>

            <!-- Filter Kategori -->
            <select v-model="filterKategori"
                    class="text-sm border border-gray-200 
                           rounded-xl px-3 py-2 bg-white 
                           text-gray-700 focus:outline-none 
                           focus:border-blue-400 
                           transition-colors duration-150 
                           min-w-[160px]">
              <option value="">Semua Kategori</option>
              <option v-for="kat in listKategori" 
                      :key="kat.id" :value="kat.id">
                {{ kat.name }}
              </option>
            </select>

            <!-- Filter Status -->
            <select v-model="filterStatus"
                    class="text-sm border border-gray-200 
                           rounded-xl px-3 py-2 bg-white 
                           text-gray-700 focus:outline-none 
                           focus:border-blue-400 
                           transition-colors duration-150 
                           min-w-[140px]">
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="diproses">Diproses</option>
              <option value="selesai">Selesai</option>
              <option value="ditolak">Ditolak</option>
            </select>

          </div>

          <p class="text-xs text-gray-400 mb-4">
            Menampilkan {{ laporanFiltered.length }} laporan yang sesuai
          </p>
        </div>

        <div v-if="isLoading" class="flex gap-8 overflow-hidden">
           <!-- Skeletons -->
           <div v-for="i in 3" :key="i" class="shrink-0 w-[85vw] sm:w-[350px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-[480px]">
             <div class="h-[280px] w-full bg-slate-200 animate-pulse"></div>
             <div class="p-6 flex-1 flex flex-col gap-4">
               <div class="h-6 bg-slate-200 rounded animate-pulse w-3/4"></div>
               <div class="mt-auto space-y-3">
                 <div class="h-4 bg-slate-100 rounded animate-pulse w-1/2"></div>
                 <div class="h-4 bg-slate-100 rounded animate-pulse w-1/3"></div>
               </div>
             </div>
           </div>
        </div>
        <div v-else-if="laporanFiltered.length > 0" class="relative group">
          <!-- Left Arrow -->
          <button @click="scrollSlider('left')" class="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 hidden md:flex">
            <i class="ti ti-chevron-left text-2xl"></i>
          </button>

          <!-- Horizontal Scroll Container -->
          <div ref="reportsSlider" class="flex overflow-x-auto gap-8 pb-8 pt-4 snap-x snap-mandatory hide-scrollbar" style="scroll-behavior: smooth;">
            <div v-for="(laporan, index) in laporanFiltered" :key="laporan.id" class="snap-start shrink-0 w-[85vw] sm:w-[350px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-shadow hover:shadow-md flex flex-col animate-[fade-in_0.5s_ease-out]">
              <!-- Image Area -->
              <div class="h-[260px] sm:h-[280px] w-full relative bg-slate-900 overflow-hidden border-b border-slate-100 flex items-center justify-center">
                 <img v-if="laporan.image" :src="getImageUrl(laporan.image)" loading="lazy" decoding="async" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105 opacity-90" alt="Lampiran Laporan">
                 <div v-if="laporan.image" class="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none"></div>
                 <div v-else class="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                   <svg class="w-10 h-10 mb-2 opacity-30" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                 </div>
                 
                 <!-- Status Badge -->
                 <div class="absolute top-4 right-4 z-10">
                   <span v-if="laporan.status === 'selesai'" class="bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm uppercase tracking-wider">SELESAI</span>
                   <span v-else-if="laporan.status === 'diproses'" class="bg-blue-50 text-blue-600 border border-blue-100 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm uppercase tracking-wider">DIPROSES</span>
                   <span v-else class="bg-slate-50 text-slate-600 border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm uppercase tracking-wider">PENDING</span>
                 </div>
              </div>

              <!-- Content Area -->
              <div class="p-6 flex-1 flex flex-col">
                <div class="inline-flex text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md mb-4 uppercase tracking-wider max-w-max">
                   {{ laporan.category?.name || 'Umum' }}
                </div>
                <h3 class="text-lg font-bold text-slate-900 mb-4 leading-snug line-clamp-2" :title="laporan.title">
                  {{ laporan.title }}
                </h3>
                
                <div class="mt-auto space-y-2">
                  <div class="flex items-center gap-2 text-sm text-slate-500">
                     <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                     <span class="line-clamp-1 truncate" :title="laporan.location">{{ laporan.location }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm text-slate-500">
                     <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                     <span>{{ formatDate(laporan.created_at) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Right Arrow -->
          <button @click="scrollSlider('right')" class="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 hidden md:flex">
            <i class="ti ti-chevron-right text-2xl"></i>
          </button>
        </div>
        
        <div v-else-if="!isLoading && laporanFiltered.length === 0" class="text-center py-16">
          <i class="ti ti-search-off block mx-auto mb-3 
                    text-gray-300" 
             style="font-size: 40px;"></i>
          <p class="text-sm font-medium text-gray-500">
            Tidak ada laporan ditemukan
          </p>
          <p class="text-xs text-gray-400 mt-1">
            Coba ubah filter atau kata kunci pencarian
          </p>
          <button @click="resetFilter"
                  class="mt-4 text-xs text-blue-600 
                         hover:underline">
            Reset filter
          </button>
        </div>

      </div>
    </section>



    <!-- FOOTER -->
    <footer id="kontak" class="bg-slate-50 border-t border-slate-200 py-16">
      <div class="container mx-auto px-8 max-w-[1200px]">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div class="md:col-span-1">
            <div class="flex items-center gap-3 mb-6">
               <img src="assets/logo_uas.png" alt="Logo SiLapor" class="w-10 h-10 object-contain drop-shadow-sm" />
               <h2 class="text-xl font-bold text-slate-900 tracking-tight">SiLapor</h2>
            </div>
            <p class="text-slate-500 text-sm leading-relaxed">SiLapor: Platform pelaporan digital untuk menjembatani aspirasi masyarakat dengan instansi pemerintah.</p>
          </div>
          
          <div>
            <h4 class="font-bold text-slate-900 text-sm mb-6 uppercase tracking-wider">Tech Stack</h4>
            <ul class="space-y-4 text-sm font-medium">
              <li class="flex items-center gap-2 text-slate-500"><i class="ti ti-brand-vue text-blue-600 text-lg"></i> Vue.js (Frontend SPA)</li>
              <li class="flex items-center gap-2 text-slate-500"><i class="ti ti-brand-tailwind text-blue-600 text-lg"></i> Tailwind CSS (Styling)</li>
              <li class="flex items-center gap-2 text-slate-500"><i class="ti ti-brand-php text-blue-600 text-lg"></i> PHP (Backend API)</li>
              <li class="flex items-center gap-2 text-slate-500"><i class="ti ti-database text-blue-600 text-lg"></i> MySQL (Database)</li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold text-slate-900 text-sm mb-6 uppercase tracking-wider">Pengembang</h4>
            <ul class="space-y-4 text-sm font-medium text-slate-500">
              <li class="flex items-start gap-3">
                 <i class="ti ti-user text-blue-600 text-xl mt-0.5"></i>
                 <span>Muhammad Arkhamullah<br>NIM: 312410545<br>Kelas: I241E</span>
              </li>
              <li class="flex items-center gap-3">
                 <i class="ti ti-brand-github text-blue-600 text-xl"></i>
                 <a href="https://github.com/MuhammadArkham" target="_blank" class="hover:text-blue-600 transition-colors">MuhammadArkham</a>
              </li>
              <li class="flex items-center gap-3">
                 <i class="ti ti-brand-linkedin text-blue-600 text-xl"></i>
                 <a href="https://www.linkedin.com/in/muhammad-arkhamullah-rifai-asshidiq" target="_blank" class="hover:text-blue-600 transition-colors">Muhammad Arkhamullah Rifai Asshidiq</a>
              </li>
              <li class="flex items-center gap-3">
                 <i class="ti ti-mail text-blue-600 text-xl"></i>
                 <a href="mailto:arkhammulloh123@gmail.com" class="hover:text-blue-600 transition-colors">arkhammulloh123@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 font-medium">
          <div>&copy; 2026 Muhammad Arkhamullah (312410545). All rights reserved.</div>
          <div class="flex gap-6">
            <span>UAS Web 2</span>
            <span>Teknik Informatika</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
  `

});
