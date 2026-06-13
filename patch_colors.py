import sys
import re

components_dir = r'C:\xampp\htdocs\UAS_Web2_312410545_Muhammad_Arkhamullah\frontend-spa\components'
index_html = r'C:\xampp\htdocs\UAS_Web2_312410545_Muhammad_Arkhamullah\frontend-spa\index.html'

# 1. Update index.html APP_CONFIG
with open(index_html, 'r', encoding='utf-8') as f:
    idx_content = f.read()

config_old = "IMAGE_BASE_URL: 'http://localhost/UAS_Web2_312410545_Muhammad_Arkhamullah/backend-api/public/'"
config_new = """IMAGE_BASE_URL: 'http://localhost/UAS_Web2_312410545_Muhammad_Arkhamullah/backend-api/public/',
            statusBadgeClass: {
                pending: 'bg-red-50 text-red-700',
                diproses: 'bg-amber-50 text-amber-700',
                selesai: 'bg-emerald-50 text-emerald-700',
                ditolak: 'bg-gray-100 text-gray-600'
            }"""
if config_old in idx_content:
    idx_content = idx_content.replace(config_old, config_new)

# Bump version
idx_content = idx_content.replace('?v=67', '?v=68')

with open(index_html, 'w', encoding='utf-8') as f:
    f.write(idx_content)


# 2. Files to process for text-gray contrast
files_to_check = [
    'Home.js', 'Login.js', 'Dashboard.js', 'Reports.js', 'Categories.js', 'ReportDetail.js', 'CreateReport.js'
]

def replace_text_contrast(content):
    # Split to lines so we can skip placeholders
    lines = content.split('\n')
    new_lines = []
    for line in lines:
        # if 'placeholder:' in line or 'disabled' in line:
        #    new_lines.append(line)
        #    continue
        # We can just replace text-gray-400 with text-gray-600 unless it's placeholder:text-gray-400
        # Wait, if placeholder:text-gray-400 is in the line, we might still want to replace other text-gray-400 in the same line?
        # A regex is better: (?<!placeholder:)text-gray-400
        # Actually in python re:
        line = re.sub(r'(?<!placeholder:)text-gray-400', 'text-gray-600', line)
        line = re.sub(r'(?<!placeholder:)text-gray-300', 'text-gray-500', line)
        new_lines.append(line)
    return '\n'.join(new_lines)

def replace_get_badge_class(content):
    old_badge_func = re.compile(r'getBadgeClass\s*\([^)]*\)\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}')
    new_badge_func = '''getBadgeClass(status) {
      if (!status) return 'bg-gray-100 text-gray-600';
      const s = status.toLowerCase();
      return window.APP_CONFIG.statusBadgeClass[s] || 'bg-gray-100 text-gray-600';
    }'''
    
    # We find methods that look like getBadgeClass(status) { ... }
    # Since re might fail on nested braces, let's just do a string replacement if possible
    # Let's write a simple manual parser for getBadgeClass
    idx = content.find('getBadgeClass(status) {')
    if idx == -1:
        idx = content.find('getBadgeClass(s) {')
        
    while idx != -1:
        # Find the matching closing brace
        brace_count = 0
        started = False
        end_idx = idx
        for i in range(idx, len(content)):
            if content[i] == '{':
                brace_count += 1
                started = True
            elif content[i] == '}':
                brace_count -= 1
            if started and brace_count == 0:
                end_idx = i + 1
                break
        
        content = content[:idx] + new_badge_func + content[end_idx:]
        
        # Look for the next one
        idx = content.find('getBadgeClass(status) {', idx + len(new_badge_func))
        if idx == -1:
            idx = content.find('getBadgeClass(s) {', idx + len(new_badge_func))
    
    return content


import os
for fname in files_to_check:
    fpath = os.path.join(components_dir, fname)
    if not os.path.exists(fpath): continue
    
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Text contrast
    content = replace_text_contrast(content)
    
    # 2. getBadgeClass replacement
    content = replace_get_badge_class(content)
    
    # Custom tweaks per file
    if fname == 'Home.js':
        # Update warnaProgress
        old_warna = "const colors = ['bg-blue-600', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500', 'bg-rose-500', 'bg-cyan-500'];\n      return colors[index % colors.length];"
        new_warna = "const shades = ['bg-blue-600', 'bg-blue-500', 'bg-blue-400', 'bg-blue-300', 'bg-blue-200', 'bg-blue-100'];\n      return shades[index] || 'bg-blue-100';"
        content = content.replace(old_warna, new_warna)
        
        # Update Kategori Tersedia icon color (bg-violet-50 text-violet-600 -> bg-blue-50 text-blue-600)
        # There's only one bg-violet-50 in Home.js stat cards
        content = content.replace('bg-violet-50 text-violet-600', 'bg-blue-50 text-blue-600')
        
        # Home.js Laporan Terbaru table has hardcoded badge classes:
        # <span v-if="report.status === 'selesai'" class="bg-emerald-50 text-emerald-600 ... px-3 py-1.5 ...">
        # Let's replace the inline v-ifs with a method call or standard classes
        # Wait, Home.js doesn't have getBadgeClass inside methods, it uses inline v-ifs for badges.
        # Let's add getBadgeClass to Home.js methods
        if 'getBadgeClass' not in content:
            meth_idx = content.find('methods: {')
            meth_insert = '''methods: {
    getBadgeClass(status) {
      if (!status) return 'bg-gray-100 text-gray-600';
      const s = status.toLowerCase();
      return window.APP_CONFIG.statusBadgeClass[s] + ' text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm uppercase tracking-wider' || 'bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm uppercase tracking-wider';
    },'''
            content = content.replace('methods: {', meth_insert)
            
            # Now replace the inline v-if spans
            inline_span_old = '''                 <span v-if="report.status === 'selesai'" class="bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm uppercase tracking-wider">SELESAI</span>
                 <span v-else-if="report.status === 'diproses'" class="bg-amber-50 text-amber-600 border border-amber-100 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm uppercase tracking-wider">DIPROSES</span>
                 <span v-else class="bg-blue-50 text-blue-600 border border-blue-100 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm uppercase tracking-wider">{{ report.status.toUpperCase() }}</span>'''
            
            inline_span_new = '''                 <span :class="getBadgeClass(report.status)">{{ report.status }}</span>'''
            content = content.replace(inline_span_old, inline_span_new)
            
    if fname == 'Dashboard.js':
        # Dashboard also has some icon colors. Let's make sure 'diproses' uses amber-500 and 'selesai' uses emerald-500 in icon accents.
        # The user says "icon/accent: text-red-500, text-amber-500, text-emerald-500, text-gray-400"
        # We'll replace text-yellow-500 with text-amber-500
        content = content.replace('text-yellow-500', 'text-amber-500')
        content = content.replace('bg-yellow-50', 'bg-amber-50')
        content = content.replace('text-yellow-600', 'text-amber-600')

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Standardization Complete")
