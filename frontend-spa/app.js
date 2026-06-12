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
    { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
    { path: '/categories', component: Categories, meta: { requiresAuth: true } },
    { path: '/reports', component: Reports, meta: { requiresAuth: true } },
    { path: '/create', component: CreateReport, meta: { requiresAuth: true } },
    { path: '/reports/:id', component: ReportDetail, meta: { requiresAuth: true } }
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
