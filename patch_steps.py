import sys

path = r'C:\xampp\htdocs\UAS_Web2_312410545_Muhammad_Arkhamullah\frontend-spa\components\Home.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Original Step 1
step1_old = '''            <!-- Step 1 -->
            <div class="flex flex-col items-center text-center">
              <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 border border-blue-100 text-blue-600">
                 <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M10.42 12.61a2.1 2.1 0 1 1 2.97 2.97L7.95 21 4 22l.99-3.95 5.43-5.44Z"/></svg>
              </div>
              <h3 class="text-lg font-bold text-slate-900 mb-2">1. Lapor</h3>
              <p class="text-slate-500 text-sm leading-relaxed">Warga mengirimkan laporan masalah beserta bukti visual.</p>
            </div>'''

step1_new = '''            <!-- Step 1 -->
            <div class="flex items-center justify-center md:justify-start gap-4">
              <div class="flex flex-col items-center text-center w-full md:w-48 mx-auto md:mx-0 relative">
                <div class="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-3 transition-all duration-200 hover:bg-blue-100 border border-blue-100 text-blue-600">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M10.42 12.61a2.1 2.1 0 1 1 2.97 2.97L7.95 21 4 22l.99-3.95 5.43-5.44Z"/></svg>
                </div>
                <h3 class="font-display font-semibold text-sm mb-1 text-slate-900">1. Pencatatan</h3>
                <p class="text-xs text-gray-500 leading-relaxed">Laporan dari masyarakat dicatat oleh petugas ke dalam sistem.</p>
              </div>
              <div class="hidden md:block flex-shrink-0 w-12 border-t-2 border-dashed border-gray-200 mt-[-60px] absolute right-[-2.5rem]"></div>
            </div>'''
# Wait, user's HTML was:
step1_user = '''            <!-- Step 1 -->
            <div class="flex items-center justify-center gap-4">
              <div class="flex flex-col items-center text-center w-48">
                <div class="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-3 transition-all duration-200 hover:bg-blue-100 border border-blue-100 text-blue-600">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M10.42 12.61a2.1 2.1 0 1 1 2.97 2.97L7.95 21 4 22l.99-3.95 5.43-5.44Z"/></svg>
                </div>
                <h3 class="font-display font-semibold text-sm mb-1 text-slate-900">1. Pencatatan</h3>
                <p class="text-xs text-gray-500 leading-relaxed">Laporan dari masyarakat dicatat oleh petugas ke dalam sistem.</p>
              </div>
              <div class="hidden md:block flex-shrink-0 w-12 border-t-2 border-dashed border-gray-200 mt-[-60px]"></div>
            </div>'''

step2_old = '''            <!-- Step 2 -->
            <div class="flex flex-col items-center text-center">
              <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 border border-blue-100 text-blue-600">
                 <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="m8 11 2 2 4-4"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <h3 class="text-lg font-bold text-slate-900 mb-2">2. Verifikasi</h3>
              <p class="text-slate-500 text-sm leading-relaxed">Admin memverifikasi kebenaran dan kategori laporan.</p>
            </div>'''
            
step2_user = '''            <!-- Step 2 -->
            <div class="flex items-center justify-center gap-4">
              <div class="flex flex-col items-center text-center w-48">
                <div class="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-3 transition-all duration-200 hover:bg-blue-100 border border-blue-100 text-blue-600">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="m8 11 2 2 4-4"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
                <h3 class="font-display font-semibold text-sm mb-1 text-slate-900">2. Verifikasi</h3>
                <p class="text-xs text-gray-500 leading-relaxed">Admin memverifikasi kebenaran dan kategori laporan.</p>
              </div>
              <div class="hidden md:block flex-shrink-0 w-12 border-t-2 border-dashed border-gray-200 mt-[-60px]"></div>
            </div>'''

step3_old = '''            <!-- Step 3 -->
            <div class="flex flex-col items-center text-center">
              <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 border border-blue-100 text-blue-600">
                 <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
              </div>
              <h3 class="text-lg font-bold text-slate-900 mb-2">3. Tindak Lanjut</h3>
              <p class="text-slate-500 text-sm leading-relaxed">Instansi terkait melakukan tindakan di lapangan.</p>
            </div>'''

step3_user = '''            <!-- Step 3 -->
            <div class="flex items-center justify-center gap-4">
              <div class="flex flex-col items-center text-center w-48">
                <div class="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-3 transition-all duration-200 hover:bg-blue-100 border border-blue-100 text-blue-600">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                </div>
                <h3 class="font-display font-semibold text-sm mb-1 text-slate-900">3. Tindak Lanjut</h3>
                <p class="text-xs text-gray-500 leading-relaxed">Instansi terkait melakukan tindakan di lapangan.</p>
              </div>
              <div class="hidden md:block flex-shrink-0 w-12 border-t-2 border-dashed border-gray-200 mt-[-60px]"></div>
            </div>'''

step4_old = '''            <!-- Step 4 -->
            <div class="flex flex-col items-center text-center">
              <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 border border-blue-100 text-blue-600">
                 <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <h3 class="text-lg font-bold text-slate-900 mb-2">4. Selesai</h3>
              <p class="text-slate-500 text-sm leading-relaxed">Laporan ditutup dengan publikasi hasil tindak lanjut.</p>
            </div>'''
            
step4_user = '''            <!-- Step 4 -->
            <div class="flex items-center justify-center gap-4">
              <div class="flex flex-col items-center text-center w-48">
                <div class="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-3 transition-all duration-200 hover:bg-blue-100 border border-blue-100 text-blue-600">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <h3 class="font-display font-semibold text-sm mb-1 text-slate-900">4. Selesai</h3>
                <p class="text-xs text-gray-500 leading-relaxed">Laporan ditandai selesai setelah penanganan tuntas.</p>
              </div>
              <!-- No dashed line for the last step -->
            </div>'''

content = content.replace(step1_old, step1_user)
content = content.replace(step2_old, step2_user)
content = content.replace(step3_old, step3_user)
content = content.replace(step4_old, step4_user)

# Also update cache buster to 65
path_html = r'C:\xampp\htdocs\UAS_Web2_312410545_Muhammad_Arkhamullah\frontend-spa\index.html'
with open(path_html, 'r', encoding='utf-8') as f2:
    html_content = f2.read()
html_content = html_content.replace('?v=64', '?v=65')
with open(path_html, 'w', encoding='utf-8') as f2:
    f2.write(html_content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
