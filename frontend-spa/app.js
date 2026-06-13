const { createApp } = Vue;
const { createRouter, createWebHashHistory } = VueRouter;

// --- AXIOS CONFIGURATION ---
window.api = axios.create({
    baseURL: window.APP_CONFIG.API_BASE_URL
});

// Request Interceptor: Attach Bearer token to all requests if logged in
window.api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Response Interceptor: Handle 401 Unauthorized globally
window.api.interceptors.response.use(response => {
    return response;
}, error => {
    if (error.response && error.response.status === 401) {
        // If not on login page, alert and redirect
        if (window.location.hash !== '#/login') {
            alert('Sesi Anda telah habis. Silakan login kembali.');
            localStorage.clear();
            window.location.hash = '#/login';
        }
    }
    return Promise.reject(error);
});


// --- ROUTER CONFIGURATION ---
const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login, meta: { guestOnly: true } },
    { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true, layout: 'admin', title: 'Dashboard', subtitle: 'Ringkasan statistik dan aktivitas sistem.' } },
    { path: '/categories', component: Categories, meta: { requiresAuth: true, layout: 'admin', title: 'Kategori Laporan', subtitle: 'Kelola daftar kategori yang dapat digunakan oleh masyarakat untuk melaporkan aduan.' } },
    { path: '/reports', component: Reports, meta: { requiresAuth: true, layout: 'admin', title: 'Semua Laporan', subtitle: 'Daftar seluruh laporan masyarakat beserta status penanganannya.' } },
    { path: '/create', component: CreateReport, meta: { requiresAuth: true, layout: 'admin', title: 'Buat Laporan Baru', subtitle: '' } },
    { path: '/reports/:id', component: ReportDetail, meta: { requiresAuth: true, layout: 'admin', title: 'Detail Laporan', subtitle: 'Lihat informasi lengkap pengaduan masyarakat beserta tanggapannya.' } }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return { top: 0 };
        }
    }
});

// Navigation Guard
router.beforeEach((to, from, next) => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (to.meta.requiresAuth && !isLoggedIn) {
        next('/login');
    } else if (to.meta.guestOnly && isLoggedIn) {
        next('/dashboard');
    } else {
        next();
    }
});

router.afterEach(() => {
    setTimeout(() => {
        if (typeof window.observeFadeSections === 'function') {
            window.observeFadeSections();
        }
    }, 100);
});

// --- INIT APP ---
const app = createApp({});
app.use(router);
app.component('AdminLayout', AdminLayout);
app.mount('#app');
