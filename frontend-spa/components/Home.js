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
        this.allCategories = allCategories;
        
        this.isLoading = false;

        // Animate stat counters
        this.animateCounter(this.stats, 'total', total);
        this.animateCounter(this.stats, 'diproses', diproses);
        this.animateCounter(this.stats, 'selesai', selesai);
        this.animateCounter(this.stats, 'totalKategori', totalKategori);

        this.$nextTick(() => {
          this.renderChart();
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
    renderChart() {
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }
      const ctx = document.getElementById('kategoriChart');
      if (!ctx) return;

      const labels = this.distribusiKategori.map(item => item.nama);
      const data = this.distribusiKategori.map(item => item.jumlah);
      
      const backgroundColors = [
        '#1e40af', // blue-800
        '#2563eb', // blue-600
        '#3b82f6', // blue-500
        '#60a5fa', // blue-400
        '#93c5fd', // blue-300
        '#bfdbfe'  // blue-200
      ];

      this.chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: backgroundColors,
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: '#0f172a',
              padding: 12,
              titleFont: { family: "'Inter', sans-serif", size: 13 },
              bodyFont: { family: "'Inter', sans-serif", size: 13 },
              cornerRadius: 8,
              displayColors: true,
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = context.dataset.data.reduce((acc, curr) => acc + curr, 0);
                  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                  return ` ${label}: ${value} Laporan (${percentage}%)`;
                }
              }
            }
          },
          cutout: '75%'
        }
      });
    },
    getChartColor(index) {
      const colors = ['#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];
      return colors[index % colors.length];
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
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
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
              <button @click="scrollToSection('laporan-section')" class="bg-white text-[#0B3EA8] px-8 py-3.5 rounded-xl font-bold text-base hover:bg-slate-50 shadow-lg transition-colors">
                Lihat Laporan
              </button>
              <button @click="scrollToSection('cara-kerja-section')" class="bg-transparent text-white border border-white/30 px-8 py-3.5 rounded-xl font-bold text-base hover:bg-white/10 transition-colors">
                Cara Kerja
              </button>
            </div>
          </div>

          <!-- Right: 55% -->
          <div class="w-full lg:w-[55%] flex justify-end" data-aos="fade-left" data-aos-duration="1200" data-aos-delay="200">
            <img src="assets/gambar%20desain.png?v=5" alt="Hero Illustration" loading="eager" decoding="async" class="w-full max-w-xl h-auto object-contain">
          </div>
        </div>
      </div>
    </header>

    <!-- STATISTICS & DISTRIBUTION SECTION -->
    <section id="statistik-section" class="bg-gray-50 py-12 md:py-16 fade-in-section scroll-mt-20">
      <div class="max-w-5xl mx-auto px-4 lg:px-8 space-y-6 md:space-y-8">
        
        <!-- Enterprise Dashboard Card -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden" data-aos="fade-up" data-aos-delay="100">
          
          <!-- Header -->
          <div class="px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div>
               <h3 class="text-xl font-bold text-gray-900">Tinjauan Data Pengaduan</h3>
               <p class="text-sm text-gray-500 mt-1">Status dan distribusi laporan masyarakat terkini</p>
             </div>
             <div class="flex items-center gap-2.5 px-4 py-2 bg-blue-50/50 border border-blue-100 rounded-full cursor-help group transition-all duration-300 hover:bg-blue-50" title="Data disinkronisasi secara real-time dengan server">
                <span class="relative flex h-2.5 w-2.5">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span class="text-xs font-semibold text-blue-800 tracking-wide">
                  Live Sync <span class="text-blue-400 mx-1">•</span> {{ new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) }}
                </span>
             </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
             
             <!-- Left Column: Key Metrics -->
             <div class="lg:col-span-4 p-6 flex flex-col justify-center space-y-8 bg-gray-50/30">
                <div data-aos="fade-right" data-aos-delay="150">
                   <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                     <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Total Laporan Masuk
                   </p>
                   <div class="flex items-end gap-3 pl-3.5">
                     <p v-if="isLoading" class="h-10 w-24 bg-gray-200 rounded animate-pulse"></p>
                     <p v-else class="text-5xl font-extrabold text-gray-900 tracking-tight">{{ stats.total }}</p>
                   </div>
                </div>
                <div data-aos="fade-right" data-aos-delay="200">
                   <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                     <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Sedang Diproses
                   </p>
                   <div class="flex items-end gap-3 pl-3.5">
                     <p v-if="isLoading" class="h-10 w-24 bg-gray-200 rounded animate-pulse"></p>
                     <p v-else class="text-5xl font-extrabold text-gray-900 tracking-tight">{{ stats.diproses }}</p>
                   </div>
                </div>
                <div data-aos="fade-right" data-aos-delay="250">
                   <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                     <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Telah Selesai
                   </p>
                   <div class="flex items-end gap-3 pl-3.5">
                     <p v-if="isLoading" class="h-10 w-24 bg-gray-200 rounded animate-pulse"></p>
                     <p v-else class="text-5xl font-extrabold text-gray-900 tracking-tight">{{ stats.selesai }}</p>
                     <span class="text-sm font-bold text-emerald-600 mb-1.5 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                        {{ resolutionRate }}% <span class="hidden sm:inline">Penyelesaian</span>
                     </span>
                   </div>
                </div>
             </div>

             <!-- Right Column: Chart & Categories -->
             <div class="lg:col-span-8 p-6 lg:p-8">
                <p class="text-sm font-medium text-gray-900 mb-6">Distribusi Kategori Laporan</p>
                
                <div class="flex flex-col md:flex-row items-center gap-8">
                   <!-- Doughnut Chart -->
                   <div class="relative w-48 h-48 flex-shrink-0">
                      <div v-if="isLoading" class="w-full h-full rounded-full border-8 border-gray-100 animate-pulse"></div>
                      <canvas v-else id="kategoriChart"></canvas>
                      
                      <!-- Inner Text -->
                      <div v-if="!isLoading" class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                         <span class="text-3xl font-bold text-gray-900">{{ stats.totalKategori }}</span>
                         <span class="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Kategori</span>
                      </div>
                   </div>

                   <!-- Custom Legend / Category List -->
                   <div class="flex-1 w-full">
                      <div v-if="isLoading" class="space-y-3">
                         <div v-for="i in 4" :key="i" class="h-8 w-full bg-gray-100 rounded animate-pulse"></div>
                      </div>
                      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                         <div v-for="(cat, index) in distribusiKategori" :key="index" class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                            <div class="flex items-center gap-3">
                               <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: getChartColor(index) }"></span>
                               <span class="text-sm text-gray-600 font-medium">{{ cat.nama }}</span>
                            </div>
                            <span class="text-sm font-semibold text-gray-900">{{ cat.jumlah }}</span>
                         </div>
                      </div>
                   </div>
                </div>
                
                <!-- Filter Info -->
                <div class="mt-8 pt-6 border-t border-gray-100">
                   <div class="flex flex-wrap gap-2">
                     <button v-for="(cat, index) in allCategories" :key="cat.id" @click.prevent="scrollToSection('laporan-section')" class="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm">
                       {{ cat.name }}
                     </button>
                   </div>
                   <p class="text-xs text-gray-400 mt-4 flex items-center gap-1.5">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                     Klik pada badge kategori di atas untuk memfilter tabel laporan terbaru.
                   </p>
                </div>
             </div>
          </div>
        </div>

      </div>
    </section>

    <!-- PROCESS SECTION -->
    <section id="cara-kerja-section" class="bg-white py-24 fade-in-section scroll-mt-20">
      <div class="container mx-auto px-8 max-w-[1200px]">
        <div class="text-center mb-16" data-aos="fade-down">
          <h2 class="text-3xl lg:text-4xl font-display font-bold text-slate-900">Alur Penyelesaian Laporan</h2>
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
              <p class="text-sm text-slate-500 leading-relaxed max-w-[240px] mx-auto">Masalah telah tuntas tertangani dan warga dapat melihat bukti penyelesaiannya.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- LAPORAN TERBARU SECTION -->
    <section id="laporan-section" class="bg-slate-50 py-24 border-y border-slate-200 fade-in-section scroll-mt-20">
      <div class="container mx-auto px-8 max-w-[1200px]">
        <div class="mb-12 text-center md:text-left" data-aos="fade-right">
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
          <div v-for="(report, index) in recentReports" :key="report.id" class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-shadow hover:shadow-md group flex flex-col" :data-aos="'fade-up'" :data-aos-delay="index * 150">
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
        <div class="bg-slate-900 rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10" data-aos="zoom-in">
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
    <section id="tentang-section" class="bg-white pt-16 pb-24 md:pt-24 md:pb-32 fade-in-section scroll-mt-20">
      <div class="max-w-5xl mx-auto px-6">
        
        <!-- Header -->
        <div class="text-center mb-10 md:mb-12" data-aos="fade-down">
          <h2 class="font-display font-bold text-3xl md:text-4xl text-slate-900 mb-4 tracking-tight">
            Tentang SiLapor
          </h2>
          <div class="w-16 h-1.5 bg-blue-600 rounded-full mx-auto mb-6"></div>
          <p class="text-slate-500 font-semibold text-sm md:text-base tracking-widest uppercase">
            Platform Digital Pengaduan Terpadu
          </p>
        </div>

        <!-- Narrative -->
        <div class="max-w-3xl mx-auto text-center mb-12 md:mb-16 space-y-5" data-aos="fade-up" data-aos-delay="100">
          <p class="text-base md:text-lg text-slate-700 leading-relaxed md:leading-[1.8]">
            SiLapor adalah sistem pengaduan masyarakat yang memudahkan warga memantau status penanganan laporan terkait <span class="text-blue-600 font-semibold">infrastruktur</span>, <span class="text-blue-600 font-semibold">lingkungan</span>, <span class="text-blue-600 font-semibold">keamanan</span>, dan pelayanan publik lainnya secara <span class="text-blue-600 font-semibold">transparan</span>.
          </p>
          <p class="text-base md:text-lg text-slate-700 leading-relaxed md:leading-[1.8]">
            Setiap laporan yang masuk akan diverifikasi, ditindaklanjuti, dan dipantau hingga selesai oleh petugas yang berwenang, dengan status yang dapat dilihat secara real-time oleh masyarakat.
          </p>
        </div>

        <!-- 3 Values -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 text-center">
          
          <!-- Item 1 -->
          <div class="flex flex-col items-center" data-aos="flip-left" data-aos-delay="100">
            <div class="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4 transition-transform hover:-translate-y-1 duration-300">
              <i class="ti ti-eye text-blue-600 text-[28px] leading-none"></i>
            </div>
            <h3 class="font-display font-bold text-lg text-slate-900 mb-2">
              Transparan
            </h3>
            <p class="text-sm md:text-base text-slate-600 leading-relaxed max-w-[240px] mx-auto">
              Status setiap laporan dapat dipantau secara terbuka oleh masyarakat.
            </p>
          </div>

          <!-- Item 2 -->
          <div class="flex flex-col items-center" data-aos="flip-left" data-aos-delay="200">
            <div class="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4 transition-transform hover:-translate-y-1 duration-300">
              <i class="ti ti-bolt text-blue-600 text-[28px] leading-none"></i>
            </div>
            <h3 class="font-display font-bold text-lg text-slate-900 mb-2">
              Responsif
            </h3>
            <p class="text-sm md:text-base text-slate-600 leading-relaxed max-w-[240px] mx-auto">
              Laporan ditindaklanjuti secara cepat oleh petugas berwenang terkait.
            </p>
          </div>

          <!-- Item 3 -->
          <div class="flex flex-col items-center" data-aos="flip-left" data-aos-delay="300">
            <div class="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4 transition-transform hover:-translate-y-1 duration-300">
              <i class="ti ti-clipboard-check text-blue-600 text-[28px] leading-none"></i>
            </div>
            <h3 class="font-display font-bold text-lg text-slate-900 mb-2">
              Akuntabel
            </h3>
            <p class="text-sm md:text-base text-slate-600 leading-relaxed max-w-[240px] mx-auto">
              Setiap tahapan proses tercatat dan dapat dipertanggungjawabkan.
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
