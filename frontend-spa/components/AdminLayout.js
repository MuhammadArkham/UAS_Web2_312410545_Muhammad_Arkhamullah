const AdminLayout = Vue.defineComponent({
  props: {
    title: String,
    subtitle: String
  },
  data() {
    return {
      user: null,
      showDropdown: false
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
      this.$router.push('/login');
    }
  },
  mounted() {
    const userData = localStorage.getItem('user');
    if(userData) this.user = JSON.parse(userData);
  },
  template: `
  <div class="flex h-screen bg-[#F8FAFC] overflow-hidden text-slate-800 font-sans">
    <!-- Sidebar -->
    <aside class="w-[240px] bg-[#0B3EA8] text-white flex flex-col transition-all shrink-0">
      <div class="h-[72px] flex items-center px-6">
        <div class="flex items-center gap-3 w-full">
           <div class="w-[42px] h-[42px] bg-white rounded-xl flex shrink-0 items-center justify-center shadow-sm p-1">
              <img src="assets/logo_uas.png" alt="Logo SiLapor" class="w-full h-full object-contain" />
           </div>
           <div class="flex flex-col">
             <div class="text-[22px] font-bold text-white tracking-tight leading-none mb-1">SiLapor</div>
             <div class="text-[10px] font-medium text-blue-200/90 leading-[1.3] tracking-wide">Sistem Pelaporan<br>Pengaduan Masyarakat</div>
           </div>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto py-6">
        <nav class="px-4 space-y-2">
          <button @click="$router.push('/dashboard')" class="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all" :class="$route.path === '/dashboard' ? 'bg-white text-[#1D4ED8] shadow-sm' : 'text-blue-100 hover:bg-white/10 hover:text-white'">
            <i class="ti ti-layout-dashboard text-[24px] shrink-0" style="-webkit-text-stroke: 0.5px;"></i>
            Dashboard
          </button>
          <button @click="$router.push('/reports')" class="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all" :class="$route.path === '/reports' || $route.path === '/create' ? 'bg-white text-[#1D4ED8] shadow-sm' : 'text-blue-100 hover:bg-white/10 hover:text-white'">
            <i class="ti ti-file-text text-[24px] shrink-0" style="-webkit-text-stroke: 0.5px;"></i>
            Laporan
          </button>
          <button @click="$router.push('/categories')" class="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all" :class="$route.path === '/categories' ? 'bg-white text-[#1D4ED8] shadow-sm' : 'text-blue-100 hover:bg-white/10 hover:text-white'">
            <i class="ti ti-folder text-[24px] shrink-0" style="-webkit-text-stroke: 0.5px;"></i>
            Kategori
          </button>
          
          <div class="pt-6 mt-6 border-t border-white/10">
            <button @click="logout" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-blue-100 hover:bg-rose-600 hover:text-white transition-colors">
              <i class="ti ti-logout text-[24px] shrink-0" style="-webkit-text-stroke: 0.5px;"></i>
              Logout
            </button>
          </div>
        </nav>
      </div>
      
      <!-- Footer branding removed per request -->
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden relative">
      <!-- Topbar -->
      <header class="bg-white border-b border-[#E2E8F0] flex items-center justify-between px-8 h-[72px] z-10 shrink-0">
        <div>
           <h2 class="text-xl font-semibold text-slate-900 tracking-tight">{{ title }}</h2>
        </div>
        <div class="relative flex items-center gap-5 cursor-pointer z-40">
           <!-- Overlay to close dropdown when clicking outside -->
           <div v-if="showDropdown" @click="showDropdown = false" class="fixed inset-0 z-40"></div>

           <!-- Profile Pill Button -->
           <button @click="showDropdown = !showDropdown" class="relative z-50 flex items-center gap-3 border border-[#E2E8F0] rounded-full py-1 pl-1 pr-3 md:pr-4 shadow-sm bg-white hover:bg-slate-50 hover:border-blue-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <div class="w-9 h-9 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm shadow-inner ring-2 ring-white">
                {{ user?.name ? user.name.charAt(0).toUpperCase() : 'A' }}
              </div>
              <div class="text-left hidden md:block">
                 <div class="text-sm font-bold text-slate-800 leading-none mb-1">{{ user?.name || 'Administrator' }}</div>
                 <div class="text-[11px] font-semibold text-slate-500 leading-none">{{ user?.email || 'admin@silapor.com' }}</div>
              </div>
              <div class="ml-1 text-slate-400">
                <i class="ti ti-chevron-down text-lg transition-transform duration-200" :class="{'rotate-180': showDropdown}"></i>
              </div>
           </button>

           <!-- Dropdown Menu -->
           <div v-if="showDropdown" class="absolute top-[calc(100%+8px)] right-0 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 transform origin-top-right transition-all">
               <!-- Mobile User Info Header -->
               <div class="p-4 border-b border-slate-100 bg-slate-50 md:hidden">
                   <div class="text-sm font-bold text-slate-800">{{ user?.name || 'Administrator' }}</div>
                   <div class="text-xs text-slate-500">{{ user?.email || 'admin@silapor.com' }}</div>
               </div>
               <!-- Menu Items -->
               <div class="p-2">
                   <button class="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-[#2563EB] transition-colors">
                       <i class="ti ti-user text-lg"></i> Profil Saya
                   </button>
                   <button class="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-[#2563EB] transition-colors">
                       <i class="ti ti-settings text-lg"></i> Pengaturan
                   </button>
               </div>
               <div class="p-2 border-t border-slate-100">
                   <button @click="logout" class="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors">
                       <i class="ti ti-logout text-lg"></i> Keluar Aplikasi
                   </button>
               </div>
           </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] p-8">
        <slot></slot>
      </main>
    </div>
  </div>
  `
});
