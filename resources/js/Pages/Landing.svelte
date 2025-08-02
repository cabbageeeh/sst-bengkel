<script>
  let scrollY = 0;
</script>

<svelte:head>
  <title>SST Bengkel - Sistem Manajemen Digital untuk Bengkel Otomotif</title>
  <meta name="description" content="Sistem manajemen digital terlengkap untuk bengkel otomotif. Database tracking, SPK digital, dan invoice otomatis dalam satu platform.">
  <meta name="keywords" content="sistem bengkel, manajemen bengkel, SPK digital, invoice otomatis, bengkel otomotif, software bengkel">
  <meta name="author" content="SST Bengkel">
  <meta property="og:title" content="SST Bengkel - Sistem Manajemen Digital untuk Bengkel Otomotif">
  <meta property="og:description" content="Tingkatkan efisiensi bengkel Anda dengan sistem manajemen digital terlengkap. Database tracking, SPK digital, dan invoice otomatis.">
  <meta property="og:type" content="website">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
  <style>
    html {
      scroll-behavior: smooth;
    }
  </style>
</svelte:head>

<svelte:window bind:scrollY={scrollY} />

<div class="bg-gray-50 font-['Inter']">
  <!-- Hero Section -->
  <div class="relative overflow-hidden">
    <div class="absolute inset-0 hero-gradient z-0"></div>

    <!-- Navigation -->
    <nav class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex justify-between items-center">
        <div class="text-3xl font-bold text-primary-600">
          <span class="text-2xl md:text-3xl font-bold gradient-text-hero">SST Bengkel</span>
        </div>
        <div class="flex space-x-6 items-center">
          <a href="#features" class="text-gray-600 hover:text-primary-600 transition-colors duration-300 font-medium">Fitur</a>
          <a href="#benefits" class="text-gray-600 hover:text-primary-600 transition-colors duration-300 font-medium">Manfaat</a>
          <a href="#contact" class="btn-primary glow-effect">Hubungi Kami</a>
        </div>
      </div>
    </nav>

    <!-- Main Hero Content -->
    <main class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28">
      <div class="text-center">
        <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
          Kelola Bengkel Anda dengan <span class="gradient-text-hero">SST Bengkel</span>
        </h1>
        <p class="text-xl md:text-2xl text-gray-600 mb-6 max-w-4xl mx-auto leading-relaxed">
          Sistem manajemen digital terlengkap untuk bengkel otomotif. Tingkatkan efisiensi operasional dan kepuasan pelanggan dengan teknologi modern.
        </p>
        <p class="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          Dari pencatatan servis hingga pembuatan invoice otomatis - semua dalam satu platform yang mudah digunakan dan dapat diandalkan.
        </p>
        <div class="flex justify-center space-x-6 flex-wrap gap-4">
          <a href="#features" class="btn-primary glow-effect">
            Lihat Fitur Lengkap
          </a>
          <a href="#benefits" class="btn-secondary">
            Manfaat untuk Bengkel
          </a>
        </div>
      </div>

      <!-- Benefits Section -->
      <div id="benefits" class="mt-20 px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
          Mengapa Memilih <span class="gradient-text">SST Bengkel</span>?
        </h2>
        <div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl modern-shadow overflow-hidden border border-primary-100">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-200">
            <div class="stats-card">
              <div class="text-4xl md:text-5xl font-bold text-primary-600 mb-3">90%</div>
              <div class="text-sm md:text-base text-gray-600 font-medium">Pengurangan Waktu Administrasi</div>
            </div>
            <div class="stats-card">
              <div class="text-4xl md:text-5xl font-bold text-primary-600 mb-3">100%</div>
              <div class="text-sm md:text-base text-gray-600 font-medium">Akurasi Data Servis</div>
            </div>
            <div class="stats-card">
              <div class="text-4xl md:text-5xl font-bold text-primary-600 mb-3">50%</div>
              <div class="text-sm md:text-base text-gray-600 font-medium">Peningkatan Produktivitas</div>
            </div>
            <div class="stats-card">
              <div class="text-4xl md:text-5xl font-bold text-primary-600 mb-3">24/7</div>
              <div class="text-sm md:text-base text-gray-600 font-medium">Akses Data Kapan Saja</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Workflow Section -->
      <div class="mt-24">
        <h2 class="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
          Alur Kerja yang <span class="gradient-text">Efisien</span>
        </h2>
        <div class="max-w-5xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div class="workflow-step">
              <div class="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span class="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 class="text-xl md:text-2xl font-bold text-gray-900 mb-4">Input Data Kendaraan</h3>
              <p class="text-gray-600 leading-relaxed">Catat detail kendaraan pelanggan dan riwayat servis sebelumnya dengan mudah</p>
            </div>
            <div class="workflow-step">
              <div class="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span class="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 class="text-xl md:text-2xl font-bold text-gray-900 mb-4">Buat SPK Digital</h3>
              <p class="text-gray-600 leading-relaxed">Generate Surat Perintah Kerja otomatis dengan template yang dapat disesuaikan</p>
            </div>
            <div class="workflow-step">
              <div class="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span class="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 class="text-xl md:text-2xl font-bold text-gray-900 mb-4">Invoice Otomatis</h3>
              <p class="text-gray-600 leading-relaxed">Sistem akan membuat nota/invoice secara otomatis berdasarkan pekerjaan yang dilakukan</p>
            </div>
          </div>
        </div>
        <div class="mt-16 text-center">
          <p class="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Proses yang sederhana namun powerful untuk meningkatkan efisiensi bengkel Anda.
          </p>
          <a href="#contact" class="text-primary-600 hover:text-primary-700 font-bold text-lg md:text-xl transition-colors duration-300 glow-effect">
            Pelajari Lebih Lanjut →
          </a>
        </div>
      </div>
      <!-- Features Section -->
      <div id="features" class="mt-32 px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
          Fitur <span class="gradient-text">Unggulan</span> Kami
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div class="feature-card">
            <div class="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-6 shadow-md">
              <svg class="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4" />
              </svg>
            </div>
            <div class="text-primary-600 text-xl md:text-2xl font-bold mb-4">Database Tracking</div>
            <ul class="space-y-3 text-gray-600 leading-relaxed">
              <li>• Riwayat servis lengkap setiap kendaraan</li>
              <li>• Data pelanggan terintegrasi</li>
              <li>• Pencarian cepat berdasarkan plat nomor</li>
              <li>• Backup otomatis data penting</li>
            </ul>
          </div>
          <div class="feature-card">
            <div class="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-6 shadow-md">
              <svg class="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="text-primary-600 text-xl md:text-2xl font-bold mb-4">SPK Digital</div>
            <ul class="space-y-3 text-gray-600 leading-relaxed">
              <li>• Template SPK yang dapat disesuaikan</li>
              <li>• Generate otomatis dari data kendaraan</li>
              <li>• Tanda tangan digital</li>
              <li>• Export ke PDF untuk print</li>
            </ul>
          </div>
          <div class="feature-card">
            <div class="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-6 shadow-md">
              <svg class="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="text-primary-600 text-xl md:text-2xl font-bold mb-4">Invoice Otomatis</div>
            <ul class="space-y-3 text-gray-600 leading-relaxed">
              <li>• Kalkulasi biaya otomatis</li>
              <li>• Template invoice profesional</li>
              <li>• Integrasi dengan data SPK</li>
              <li>• Laporan keuangan real-time</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div id="contact" class="mt-32 text-center px-4 sm:px-6 lg:px-8">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-3xl md:text-5xl font-bold text-gray-900 mb-8">
            Siap <span class="gradient-text">Modernisasi</span> Bengkel Anda?
          </h2>
          <p class="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Bergabunglah dengan bengkel-bengkel modern yang sudah merasakan manfaat SST Bengkel.
            Tingkatkan efisiensi dan kepuasan pelanggan Anda hari ini juga.
          </p>
          <div class="flex justify-center space-x-6 flex-wrap gap-4">
            <a href="mailto:info@sstbengkel.com" class="btn-primary glow-effect">
              Hubungi Kami Sekarang
            </a>
            <a href="tel:+6281234567890" class="btn-secondary">
              📞 0812-3456-7890
            </a>
          </div>
          <div class="mt-10 text-base text-gray-500">
            <p class="font-medium">Konsultasi gratis • Demo langsung • Setup mudah</p>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- Footer -->
  <footer class="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 mt-24">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="col-span-1 md:col-span-2">
          <h3 class="text-2xl md:text-3xl font-bold text-primary-400 mb-6">SST Bengkel</h3>
          <p class="text-gray-300 mb-6 max-w-md leading-relaxed">
            Sistem manajemen digital terdepan untuk bengkel otomotif. Meningkatkan efisiensi operasional dan kepuasan pelanggan dengan teknologi modern.
          </p>
          <div class="flex space-x-4">
            <a href="mailto:info@sstbengkel.com" class="text-gray-300 hover:text-primary-400 transition-colors duration-300 p-2 rounded-lg hover:bg-gray-800" aria-label="Email SST Bengkel">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </a>
            <a href="tel:+6281234567890" class="text-gray-300 hover:text-primary-400 transition-colors duration-300 p-2 rounded-lg hover:bg-gray-800" aria-label="Telepon SST Bengkel">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
            </a>
          </div>
        </div>
        <div>
          <h4 class="text-lg md:text-xl font-bold mb-6 text-primary-300">Fitur Utama</h4>
          <ul class="space-y-3 text-gray-300">
            <li class="hover:text-primary-400 transition-colors duration-300 cursor-pointer">Database Tracking</li>
            <li class="hover:text-primary-400 transition-colors duration-300 cursor-pointer">SPK Digital</li>
            <li class="hover:text-primary-400 transition-colors duration-300 cursor-pointer">Invoice Otomatis</li>
            <li class="hover:text-primary-400 transition-colors duration-300 cursor-pointer">Laporan Real-time</li>
          </ul>
        </div>
        <div>
          <h4 class="text-lg md:text-xl font-bold mb-6 text-primary-300">Kontak</h4>
          <ul class="space-y-3 text-gray-300">
            <li class="hover:text-primary-400 transition-colors duration-300">Email: info@sstbengkel.com</li>
            <li class="hover:text-primary-400 transition-colors duration-300">Telepon: 0812-3456-7890</li>
            <li class="hover:text-primary-400 transition-colors duration-300">WhatsApp: 0812-3456-7890</li>
          </ul>
        </div>
      </div>
      <div class="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
        <p class="text-sm md:text-base">&copy; 2024 SST Bengkel. Semua hak cipta dilindungi.</p>
      </div>
    </div>
  </footer>
</div>
