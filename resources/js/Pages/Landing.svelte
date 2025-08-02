<script>
  let scrollY = 0;
  let mounted = false;

  import { onMount } from 'svelte';

  onMount(() => {
    mounted = true;
  });
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
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap">
  <style>
    html {
      scroll-behavior: smooth;
    }

    /* Modern CSS Variables */
    :root {
      --primary-50: #eff6ff;
      --primary-100: #dbeafe;
      --primary-200: #bfdbfe;
      --primary-300: #93c5fd;
      --primary-400: #60a5fa;
      --primary-500: #3b82f6;
      --primary-600: #2563eb;
      --primary-700: #1d4ed8;
      --primary-800: #1e40af;
      --primary-900: #1e3a8a;

      --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      --gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      --gradient-hero: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);

      --shadow-soft: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      --shadow-medium: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      --shadow-large: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      --shadow-glow: 0 0 20px rgba(59, 130, 246, 0.3);
    }

    /* Enhanced Animations */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeInLeft {
      from {
        opacity: 0;
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes fadeInRight {
      from {
        opacity: 0;
        transform: translateX(30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-10px);
      }
    }

    @keyframes pulse-glow {
      0%, 100% {
        box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
      }
      50% {
        box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
      }
    }

    /* Modern Utility Classes */
    .animate-fade-in-up {
      animation: fadeInUp 0.8s ease-out forwards;
    }

    .animate-fade-in-left {
      animation: fadeInLeft 0.8s ease-out forwards;
    }

    .animate-fade-in-right {
      animation: fadeInRight 0.8s ease-out forwards;
    }

    .animate-float {
      animation: float 3s ease-in-out infinite;
    }

    .animate-pulse-glow {
      animation: pulse-glow 2s ease-in-out infinite;
    }

    .delay-100 { animation-delay: 0.1s; }
    .delay-200 { animation-delay: 0.2s; }
    .delay-300 { animation-delay: 0.3s; }
    .delay-400 { animation-delay: 0.4s; }
    .delay-500 { animation-delay: 0.5s; }

    /* Glassmorphism */
    .glass {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .glass-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    /* Enhanced Gradients */
    .gradient-text-modern {
      background: var(--gradient-hero);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .gradient-bg-hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    }

    .gradient-bg-soft {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%);
    }

    /* Modern Shadows */
    .shadow-modern {
      box-shadow: var(--shadow-medium);
    }

    .shadow-glow {
      box-shadow: var(--shadow-glow);
    }

    /* Enhanced Buttons */
    .btn-modern {
      position: relative;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .btn-modern::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }

    .btn-modern:hover::before {
      left: 100%;
    }

    /* Typography Enhancements */
    .text-hero {
      font-size: clamp(2.5rem, 5vw, 4rem);
      line-height: 1.1;
      letter-spacing: -0.02em;
      font-weight: 900;
    }

    .text-subtitle {
      font-size: clamp(1.125rem, 2vw, 1.5rem);
      line-height: 1.6;
      letter-spacing: -0.01em;
      font-weight: 500;
    }

    /* Responsive Improvements */
    @media (max-width: 768px) {
      .glass-card {
        padding: 1.5rem;
      }

      .animate-fade-in-up,
      .animate-fade-in-left,
      .animate-fade-in-right {
        animation-duration: 0.6s;
      }

      .btn-modern {
        padding: 0.875rem 1.5rem;
        font-size: 1rem;
      }
    }

    /* Accessibility Improvements */
    @media (prefers-reduced-motion: reduce) {
      .animate-fade-in-up,
      .animate-fade-in-left,
      .animate-fade-in-right,
      .animate-float,
      .animate-pulse-glow {
        animation: none;
      }

      .transition-all,
      .transition-colors,
      .transition-transform {
        transition: none;
      }
    }

    /* Focus States */
    .btn-modern:focus,
    .glass:focus {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }

    /* Print Styles */
    @media print {
      .animate-float,
      .animate-pulse-glow {
        animation: none;
      }

      .glass,
      .glass-card {
        background: white;
        border: 1px solid #e5e7eb;
      }
    }
  </style>
</svelte:head>

<svelte:window bind:scrollY={scrollY} />

<div class="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-['Inter'] min-h-screen">
  <!-- Hero Section -->
  <div class="relative overflow-hidden min-h-screen">
    <!-- Animated Background Elements -->
    <div class="absolute inset-0 z-0">
      <div class="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
      <div class="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float delay-200"></div>
      <div class="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float delay-400"></div>
    </div>

    <!-- Gradient Overlay -->
    <div class="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 z-1"></div>

    <!-- Navigation -->
    <nav class="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center">
        <div class="text-3xl font-bold">
          <span class="text-2xl md:text-3xl font-black gradient-text-modern animate-fade-in-left">SST Bengkel</span>
        </div>
        <div class="hidden md:flex space-x-8 items-center">
          <a href="#features" class="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium text-lg relative group">
            Fitur
            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#benefits" class="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium text-lg relative group">
            Manfaat
            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#contact" class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 btn-modern animate-pulse-glow">
            Hubungi Kami
          </a>
        </div>

        <!-- Mobile Menu Button -->
        <div class="md:hidden">
          <button class="text-gray-700 hover:text-blue-600 transition-colors duration-300" aria-label="Menu">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Hero Content -->
    <main class="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-32">
      <div class="text-center">
        <div class="opacity-0 {mounted ? 'animate-fade-in-up' : ''}">
          <h1 class="text-hero font-black text-gray-900 mb-8 leading-tight">
            Kelola Bengkel Anda dengan
            <span class="gradient-text-modern block mt-2">SST Bengkel</span>
          </h1>
        </div>

        <div class="opacity-0 {mounted ? 'animate-fade-in-up delay-200' : ''}">
          <p class="text-subtitle text-gray-700 mb-6 max-w-4xl mx-auto font-medium">
            Sistem manajemen digital terlengkap untuk bengkel otomotif. Tingkatkan efisiensi operasional dan kepuasan pelanggan dengan teknologi modern.
          </p>
        </div>

        <div class="opacity-0 {mounted ? 'animate-fade-in-up delay-300' : ''}">
          <p class="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-normal">
            Dari pencatatan servis hingga pembuatan invoice otomatis - semua dalam satu platform yang mudah digunakan dan dapat diandalkan.
          </p>
        </div>

        <div class="opacity-0 {mounted ? 'animate-fade-in-up delay-400' : ''}">
          <div class="flex justify-center space-x-6 flex-wrap gap-4 mb-16">
            <a href="#features" class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-2 btn-modern transform">
              🚀 Lihat Fitur Lengkap
            </a>
            <a href="#benefits" class="glass-card text-gray-800 px-8 py-4 rounded-full hover:bg-white/80 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 border border-white/30">
              📊 Manfaat untuk Bengkel
            </a>
          </div>
        </div>

        <!-- Trust Indicators -->
        <div class="opacity-0 {mounted ? 'animate-fade-in-up delay-500' : ''}">
          <div class="flex justify-center items-center space-x-8 text-sm text-gray-500 flex-wrap gap-4">
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              <span class="font-medium">Konsultasi Gratis</span>
            </div>
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              <span class="font-medium">Demo Langsung</span>
            </div>
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              <span class="font-medium">Setup Mudah</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Benefits Section -->
      <div id="benefits" class="mt-32 px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-20">
          <h2 class="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            Mengapa Memilih <span class="gradient-text-modern">SST Bengkel</span>?
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Bergabunglah dengan ratusan bengkel yang telah merasakan transformasi digital
          </p>
        </div>

        <div class="max-w-6xl mx-auto">
          <div class="glass-card rounded-3xl shadow-2xl overflow-hidden border border-white/30 p-2">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl text-center transition-all duration-500 hover:scale-105 hover:shadow-xl group">
                <div class="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">90%</div>
                <div class="text-base md:text-lg text-gray-700 font-semibold leading-tight">Pengurangan Waktu<br>Administrasi</div>
                <div class="mt-3 text-sm text-gray-500">Otomatisasi proses</div>
              </div>

              <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl text-center transition-all duration-500 hover:scale-105 hover:shadow-xl group">
                <div class="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">100%</div>
                <div class="text-base md:text-lg text-gray-700 font-semibold leading-tight">Akurasi Data<br>Servis</div>
                <div class="mt-3 text-sm text-gray-500">Tanpa kesalahan</div>
              </div>

              <div class="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl text-center transition-all duration-500 hover:scale-105 hover:shadow-xl group">
                <div class="text-5xl md:text-6xl font-black bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">50%</div>
                <div class="text-base md:text-lg text-gray-700 font-semibold leading-tight">Peningkatan<br>Produktivitas</div>
                <div class="mt-3 text-sm text-gray-500">Efisiensi maksimal</div>
              </div>

              <div class="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl text-center transition-all duration-500 hover:scale-105 hover:shadow-xl group">
                <div class="text-5xl md:text-6xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">24/7</div>
                <div class="text-base md:text-lg text-gray-700 font-semibold leading-tight">Akses Data<br>Kapan Saja</div>
                <div class="mt-3 text-sm text-gray-500">Selalu tersedia</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Workflow Section -->
      <div class="mt-32 px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-20">
          <h2 class="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            Alur Kerja yang <span class="gradient-text-modern">Efisien</span>
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Tiga langkah sederhana untuk mengoptimalkan operasional bengkel Anda
          </p>
        </div>

        <div class="max-w-6xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <!-- Step 1 -->
            <div class="relative group">
              <div class="glass-card p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/30">
                <div class="relative">
                  <div class="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl group-hover:scale-110 transition-transform duration-300">
                    <span class="text-3xl font-black text-white">1</span>
                  </div>
                  <div class="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-75 group-hover:scale-150 transition-transform duration-300"></div>
                </div>
                <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">Input Data Kendaraan</h3>
                <p class="text-gray-600 leading-relaxed text-center text-lg">Catat detail kendaraan pelanggan dan riwayat servis sebelumnya dengan mudah dan cepat</p>

                <!-- Icon -->
                <div class="mt-6 flex justify-center">
                  <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Connector Line -->
              <div class="hidden md:block absolute top-12 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300 z-10"></div>
            </div>

            <!-- Step 2 -->
            <div class="relative group">
              <div class="glass-card p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/30">
                <div class="relative">
                  <div class="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl group-hover:scale-110 transition-transform duration-300">
                    <span class="text-3xl font-black text-white">2</span>
                  </div>
                  <div class="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-75 group-hover:scale-150 transition-transform duration-300"></div>
                </div>
                <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">Buat SPK Digital</h3>
                <p class="text-gray-600 leading-relaxed text-center text-lg">Generate Surat Perintah Kerja otomatis dengan template yang dapat disesuaikan</p>

                <!-- Icon -->
                <div class="mt-6 flex justify-center">
                  <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Connector Line -->
              <div class="hidden md:block absolute top-12 -right-4 w-8 h-0.5 bg-gradient-to-r from-purple-300 to-pink-300 z-10"></div>
            </div>

            <!-- Step 3 -->
            <div class="relative group">
              <div class="glass-card p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/30">
                <div class="relative">
                  <div class="w-24 h-24 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl group-hover:scale-110 transition-transform duration-300">
                    <span class="text-3xl font-black text-white">3</span>
                  </div>
                  <div class="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-teal-500 rounded-full opacity-75 group-hover:scale-150 transition-transform duration-300"></div>
                </div>
                <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">Invoice Otomatis</h3>
                <p class="text-gray-600 leading-relaxed text-center text-lg">Sistem akan membuat nota/invoice secara otomatis berdasarkan pekerjaan yang dilakukan</p>

                <!-- Icon -->
                <div class="mt-6 flex justify-center">
                  <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-20 text-center">
          <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed font-medium">
            Proses yang sederhana namun powerful untuk meningkatkan efisiensi bengkel Anda secara signifikan.
          </p>
          <a href="#contact" class="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 btn-modern">
            <span>Pelajari Lebih Lanjut</span>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
            </svg>
          </a>
        </div>
      </div>
      <!-- Features Section -->
      <div id="features" class="mt-32 px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-20">
          <h2 class="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            Fitur <span class="gradient-text-modern">Unggulan</span> Kami
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Solusi lengkap untuk semua kebutuhan manajemen bengkel modern
          </p>
        </div>

        <div class="max-w-7xl mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Database Tracking -->
            <div class="group relative">
              <div class="glass-card p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-white/30 h-full">
                <!-- Background Gradient -->
                <div class="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div class="relative z-10">
                  <!-- Icon -->
                  <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4" />
                    </svg>
                  </div>

                  <!-- Title -->
                  <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Database Tracking</h3>

                  <!-- Features List -->
                  <div class="space-y-4">
                    <div class="flex items-start space-x-3">
                      <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg class="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                      </div>
                      <span class="text-gray-700 font-medium">Riwayat servis lengkap setiap kendaraan</span>
                    </div>
                    <div class="flex items-start space-x-3">
                      <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg class="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                      </div>
                      <span class="text-gray-700 font-medium">Data pelanggan terintegrasi</span>
                    </div>
                    <div class="flex items-start space-x-3">
                      <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg class="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                      </div>
                      <span class="text-gray-700 font-medium">Pencarian cepat berdasarkan plat nomor</span>
                    </div>
                    <div class="flex items-start space-x-3">
                      <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg class="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                      </div>
                      <span class="text-gray-700 font-medium">Backup otomatis data penting</span>
                    </div>
                  </div>

                  <!-- Badge -->
                  <div class="mt-8">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      🗄️ Data Management
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- SPK Digital -->
            <div class="group relative">
              <div class="glass-card p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-white/30 h-full">
                <!-- Background Gradient -->
                <div class="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div class="relative z-10">
                  <!-- Icon -->
                  <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>

                  <!-- Title -->
                  <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6">SPK Digital</h3>

                  <!-- Features List -->
                  <div class="space-y-4">
                    <div class="flex items-start space-x-3">
                      <div class="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg class="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                      </div>
                      <span class="text-gray-700 font-medium">Template SPK yang dapat disesuaikan</span>
                    </div>
                    <div class="flex items-start space-x-3">
                      <div class="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg class="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                      </div>
                      <span class="text-gray-700 font-medium">Generate otomatis dari data kendaraan</span>
                    </div>
                    <div class="flex items-start space-x-3">
                      <div class="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg class="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                      </div>
                      <span class="text-gray-700 font-medium">Tanda tangan digital</span>
                    </div>
                    <div class="flex items-start space-x-3">
                      <div class="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg class="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                      </div>
                      <span class="text-gray-700 font-medium">Export ke PDF untuk print</span>
                    </div>
                  </div>

                  <!-- Badge -->
                  <div class="mt-8">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      📝 Document Generator
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Invoice Otomatis -->
            <div class="group relative">
              <div class="glass-card p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-white/30 h-full">
                <!-- Background Gradient -->
                <div class="absolute inset-0 bg-gradient-to-br from-green-50/50 to-teal-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div class="relative z-10">
                  <!-- Icon -->
                  <div class="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>

                  <!-- Title -->
                  <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Invoice Otomatis</h3>

                  <!-- Features List -->
                  <div class="space-y-4">
                    <div class="flex items-start space-x-3">
                      <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg class="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                      </div>
                      <span class="text-gray-700 font-medium">Kalkulasi biaya otomatis</span>
                    </div>
                    <div class="flex items-start space-x-3">
                      <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg class="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                      </div>
                      <span class="text-gray-700 font-medium">Template invoice profesional</span>
                    </div>
                    <div class="flex items-start space-x-3">
                      <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg class="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                      </div>
                      <span class="text-gray-700 font-medium">Integrasi dengan data SPK</span>
                    </div>
                    <div class="flex items-start space-x-3">
                      <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg class="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                      </div>
                      <span class="text-gray-700 font-medium">Laporan keuangan real-time</span>
                    </div>
                  </div>

                  <!-- Badge -->
                  <div class="mt-8">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      💰 Financial Management
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div id="contact" class="mt-32 px-4 sm:px-6 lg:px-8">
        <div class="max-w-6xl mx-auto">
          <!-- Main CTA -->
          <div class="relative">
            <!-- Background Elements -->
            <div class="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl opacity-90"></div>
            <div class="absolute inset-0 bg-gradient-to-br from-blue-50/10 to-purple-50/10 rounded-3xl"></div>

            <!-- Floating Elements -->
            <div class="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float"></div>
            <div class="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float delay-200"></div>

            <div class="relative z-10 text-center py-20 px-8">
              <h2 class="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">
                Siap <span class="text-yellow-300">Modernisasi</span><br>Bengkel Anda?
              </h2>
              <p class="text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
                Bergabunglah dengan bengkel-bengkel modern yang sudah merasakan manfaat SST Bengkel.
                Tingkatkan efisiensi dan kepuasan pelanggan Anda hari ini juga.
              </p>

              <div class="flex justify-center space-x-6 flex-wrap gap-4 mb-12">
                <a href="mailto:info@sstbengkel.com" class="bg-white text-blue-600 px-10 py-5 rounded-full hover:bg-blue-50 transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-3xl hover:-translate-y-2 btn-modern">
                  ✉️ Hubungi Kami Sekarang
                </a>
                <a href="tel:+6281234567890" class="glass text-white px-10 py-5 rounded-full hover:bg-white/20 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 border border-white/30">
                  📞 0812-3456-7890
                </a>
              </div>

              <!-- Trust Indicators -->
              <div class="flex justify-center items-center space-x-8 text-blue-100 flex-wrap gap-4">
                <div class="flex items-center space-x-2">
                  <svg class="w-6 h-6 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="font-semibold text-lg">Konsultasi Gratis</span>
                </div>
                <div class="flex items-center space-x-2">
                  <svg class="w-6 h-6 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="font-semibold text-lg">Demo Langsung</span>
                </div>
                <div class="flex items-center space-x-2">
                  <svg class="w-6 h-6 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="font-semibold text-lg">Setup Mudah</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- Footer -->
  <footer class="relative mt-32 overflow-hidden">
    <!-- Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900"></div>
    <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

    <!-- Floating Elements -->
    <div class="absolute top-20 left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
    <div class="absolute bottom-20 right-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl animate-float delay-300"></div>

    <div class="relative z-10 py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <!-- Brand Section -->
          <div class="lg:col-span-2">
            <h3 class="text-3xl md:text-4xl font-black gradient-text-modern mb-8">SST Bengkel</h3>
            <p class="text-gray-300 mb-8 max-w-lg leading-relaxed text-lg">
              Sistem manajemen digital terdepan untuk bengkel otomotif. Meningkatkan efisiensi operasional dan kepuasan pelanggan dengan teknologi modern.
            </p>

            <!-- Social Links -->
            <div class="flex space-x-4">
              <a href="mailto:info@sstbengkel.com" class="group w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-blue-500 transition-all duration-300 border border-white/20" aria-label="Email SST Bengkel">
                <svg class="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </a>
              <a href="tel:+6281234567890" class="group w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-green-500 transition-all duration-300 border border-white/20" aria-label="Telepon SST Bengkel">
                <svg class="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
              </a>
              <a href="https://wa.me/6281234567890" class="group w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-green-500 transition-all duration-300 border border-white/20" aria-label="WhatsApp SST Bengkel">
                <svg class="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Features -->
          <div>
            <h4 class="text-xl font-bold mb-8 text-blue-300">Fitur Utama</h4>
            <ul class="space-y-4">
              <li class="group flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer">
                <div class="w-2 h-2 bg-blue-400 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                <span>Database Tracking</span>
              </li>
              <li class="group flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer">
                <div class="w-2 h-2 bg-purple-400 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                <span>SPK Digital</span>
              </li>
              <li class="group flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer">
                <div class="w-2 h-2 bg-green-400 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                <span>Invoice Otomatis</span>
              </li>
              <li class="group flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer">
                <div class="w-2 h-2 bg-pink-400 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                <span>Laporan Real-time</span>
              </li>
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h4 class="text-xl font-bold mb-8 text-purple-300">Kontak</h4>
            <div class="space-y-4">
              <div class="group flex items-start space-x-3 text-gray-300 hover:text-white transition-colors duration-300">
                <div class="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg class="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                  </svg>
                </div>
                <div>
                  <p class="font-medium">Email</p>
                  <p class="text-sm">info@sstbengkel.com</p>
                </div>
              </div>

              <div class="group flex items-start space-x-3 text-gray-300 hover:text-white transition-colors duration-300">
                <div class="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg class="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                  </svg>
                </div>
                <div>
                  <p class="font-medium">Telepon</p>
                  <p class="text-sm">0812-3456-7890</p>
                </div>
              </div>

              <div class="group flex items-start space-x-3 text-gray-300 hover:text-white transition-colors duration-300">
                <div class="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg class="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </div>
                <div>
                  <p class="font-medium">WhatsApp</p>
                  <p class="text-sm">0812-3456-7890</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Section -->
        <div class="border-t border-white/10 mt-16 pt-8">
          <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p class="text-gray-400 text-center md:text-left">
              &copy; 2024 SST Bengkel. Semua hak cipta dilindungi.
            </p>
            <div class="flex items-center space-x-6 text-sm text-gray-400">
              <span class="hover:text-white transition-colors duration-300 cursor-pointer">Privacy Policy</span>
              <span class="hover:text-white transition-colors duration-300 cursor-pointer">Terms of Service</span>
              <span class="hover:text-white transition-colors duration-300 cursor-pointer">Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</div>
