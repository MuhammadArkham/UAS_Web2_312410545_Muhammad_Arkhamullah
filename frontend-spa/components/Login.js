const Login = Vue.defineComponent({
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      error: ''
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.error = '';
      try {
        const res = await window.api.post('/auth/login', {
          email: this.email,
          password: this.password
        });
        const data = res.data;
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isLoggedIn', 'true');
        
        this.$router.push('/dashboard');
      } catch (err) {
        this.error = err.response?.data?.message || 'Email atau kata sandi yang Anda masukkan salah. Silakan coba lagi.';
      } finally {
        this.loading = false;
      }
    }
  },
  template: `
  <div class="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
    <!-- Left Section: Branding -->
    <div class="hidden md:flex md:w-5/12 bg-[#0B3EA8] p-12 flex-col justify-between relative overflow-hidden">
      <!-- Background Accents -->
      <div class="absolute inset-0 bg-gradient-to-br from-[#0B3EA8] to-[#072b7a] opacity-90"></div>
      <div class="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#2563EB] rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#1D4ED8] rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>

      <div class="relative z-10">
        <div class="flex items-center gap-3 mb-16">
          <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-700 shadow-lg p-0.5">
            <img src="assets/logo_uas.png" alt="Logo SiLapor" class="w-full h-full object-contain" />
          </div>
          <span class="font-bold text-2xl text-white tracking-tight">SiLapor</span>
        </div>
        
        <h1 class="text-4xl lg:text-5xl font-display font-bold text-white leading-tight mb-6">
          Sistem Pengelolaan<br>Aspirasi Warga
        </h1>
        <p class="text-blue-100 text-lg leading-relaxed max-w-md">
          Portal khusus bagi perangkat desa, kelurahan, dan admin daerah untuk menindaklanjuti laporan masyarakat dengan cepat dan transparan.
        </p>
      </div>
      
      <div class="relative z-10 text-blue-200 text-sm font-medium flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z"></path></svg>
        &copy; 2026 SiLapor. Dilindungi oleh Enkripsi 256-bit.
      </div>
    </div>

    <!-- Right Section: Login Form -->
    <div class="w-full md:w-7/12 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-white relative">
      
      <div class="absolute top-8 right-8 hidden sm:block">
        <router-link to="/" class="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors bg-slate-50 hover:bg-blue-50 px-4 py-2 rounded-lg">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Beranda
        </router-link>
      </div>

      <div class="max-w-md w-full mx-auto mt-12 md:mt-0">
        <!-- Mobile Logo -->
        <div class="md:hidden flex items-center gap-3 mb-10">
          <div class="w-10 h-10 bg-transparent rounded-xl flex items-center justify-center text-white">
            <img src="assets/logo_uas.png" alt="Logo SiLapor" class="w-10 h-10 object-contain drop-shadow-sm" />
          </div>
          <span class="font-bold text-xl text-slate-900 tracking-tight">SiLapor</span>
        </div>

        <div class="mb-10">
          <h2 class="text-3xl font-display font-extrabold text-slate-900 tracking-tight mb-2">Masuk Petugas</h2>
          <p class="text-slate-500 text-base">Silakan masukkan email dan kata sandi Anda untuk mulai mengelola laporan.</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="space-y-6">
          
          <div v-if="error" class="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-100 flex items-start gap-3 animate-pulse">
             <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             <span>{{ error }}</span>
          </div>

          <div>
            <label for="email" class="block text-sm font-bold text-slate-700 mb-2">Alamat Email</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input id="email" type="email" v-model="email" required placeholder="admin@silapor.com" class="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm font-medium text-slate-900 bg-slate-50 focus:bg-white transition-all">
            </div>
          </div>

          <div>
            <div class="flex justify-between items-center mb-2">
              <label for="password" class="block text-sm font-bold text-slate-700">Kata Sandi</label>
            </div>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input id="password" type="password" v-model="password" required placeholder="********" class="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm font-medium text-slate-900 bg-slate-50 focus:bg-white transition-all">
            </div>
          </div>

          <div class="pt-4">
            <button type="submit" :disabled="loading" class="w-full flex justify-center py-4 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed group">
              <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>{{ loading ? 'Memverifikasi...' : 'Akses Sistem' }}</span>
              <svg v-if="!loading" class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </div>
          
        </form>

        <div class="mt-8 text-center sm:hidden">
          <router-link to="/" class="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
            &larr; Kembali ke Beranda
          </router-link>
        </div>

        <div class="mt-12 text-center md:hidden">
          <p class="text-xs text-slate-400 flex items-center justify-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z"></path></svg>
            &copy; 2026 SiLapor. Terenkripsi 256-bit.
          </p>
        </div>

      </div>
    </div>
  </div>
  `
});
