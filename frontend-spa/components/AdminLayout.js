const AdminLayout = Vue.defineComponent({
  props: {
    title: String,
    subtitle: String
  },
  data() {
    return {
      user: null
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
  <div class="flex h-screen bg-slate-50 overflow-hidden text-slate-800 font-sans">
    <!-- Sidebar -->
    <aside class="w-[260px] bg-primary text-white flex flex-col transition-all shrink-0">
      <div class="h-20 flex items-center px-8">
        <div class="flex items-center gap-3 font-bold text-xl tracking-tight text-white">
           <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
           </div>
           <div>
             <div class="leading-none mb-1">E-Report</div>
             <div class="text-[9px] font-medium text-blue-200 font-inter">Sistem Pengaduan Masyarakat</div>
           </div>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto py-8">
        <nav class="px-4 space-y-2">
          <router-link to="/dashboard" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all" :class="$route.path === '/dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-100 hover:bg-primaryHover hover:text-white'">
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            Dashboard
          </router-link>
          <router-link to="/reports" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all" :class="$route.path === '/reports' || $route.path === '/create' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-100 hover:bg-primaryHover hover:text-white'">
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Laporan
          </router-link>
          <router-link to="/categories" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all" :class="$route.path === '/categories' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-100 hover:bg-primaryHover hover:text-white'">
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            Kategori
          </router-link>
          
          <div class="pt-8">
            <button @click="logout" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-blue-100 hover:bg-primaryHover hover:text-white transition-colors">
              <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              Logout
            </button>
          </div>
        </nav>
      </div>
      
      <!-- Footer branding in sidebar -->
      <div class="px-8 pb-8 text-blue-300 text-xs">
         <div class="flex items-center gap-1.5 font-bold mb-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            E-Report
         </div>
         <div class="opacity-70">&copy; 2026 All rights reserved.</div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden relative">
      <!-- Topbar -->
      <header class="bg-white border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between px-8 py-5 z-10 gap-4">
        <div>
           <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">{{ title }}</h2>
           <p v-if="subtitle" class="text-sm font-medium text-slate-500 mt-1">{{ subtitle }}</p>
        </div>
        <div class="flex items-center gap-5">
           <!-- Profile Pill -->
           <div class="flex items-center gap-3 border border-slate-200 rounded-xl py-1.5 pl-1.5 pr-4 shadow-sm bg-white">
              <div class="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">
                {{ user?.name ? user.name.charAt(0).toUpperCase() : 'A' }}
              </div>
              <div class="text-left hidden md:block">
                 <div class="text-sm font-bold text-slate-900 leading-tight">{{ user?.name || 'Administrator' }}</div>
                 <div class="text-xs font-medium text-slate-500">{{ user?.email || 'Administrator' }}</div>
              </div>
              <div class="ml-2 text-slate-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
           </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-8">
        <slot></slot>
      </main>
    </div>
  </div>
  `
});
