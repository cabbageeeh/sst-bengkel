<script>
  import { onMount } from 'svelte';
  import { inertia } from '@inertiajs/svelte';

  let mounted = false;
  let mobileMenuOpen = false;

  onMount(() => {
    mounted = true;
  });

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }

  // Props untuk kustomisasi
  export let showBackground = true; // Untuk mengontrol background gradient
  export let position = 'relative'; // 'relative' atau 'fixed'
</script>

<svelte:head>
  <style>
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

    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-10px);
      }
    }

    /* Modern Utility Classes */
    .animate-fade-in-left {
      animation: fadeInLeft 0.8s ease-out forwards;
    }

    .animate-float {
      animation: float 3s ease-in-out infinite;
    }

    .delay-200 { animation-delay: 0.2s; }
    .delay-400 { animation-delay: 0.4s; }

    /* Glassmorphism */
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

    /* Responsive Improvements */
    @media (max-width: 768px) {
      .glass-card {
        padding: 1.5rem;
      }

      .animate-fade-in-left {
        animation-duration: 0.6s;
      }
    }

    /* Accessibility Improvements */
    @media (prefers-reduced-motion: reduce) {
      .animate-fade-in-left,
      .animate-float {
        animation: none;
      }

      .transition-all,
      .transition-colors,
      .transition-transform {
        transition: none;
      }
    }
  </style>
</svelte:head>

{#if showBackground}
  <!-- Background Elements (hanya untuk landing page) -->
  <div class="absolute inset-0 z-0">
    <div class="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
    <div class="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float delay-200"></div>
    <div class="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float delay-400"></div>
  </div>

  <!-- Gradient Overlay -->
  <div class="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 z-1"></div>
{/if}

<!-- Navigation -->
<nav class="{position} z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="flex justify-between items-center">
    <div class="text-3xl font-bold">
      <a href="/" use:inertia class="text-2xl md:text-3xl font-black gradient-text-modern animate-fade-in-left">SST Bengkel</a>
    </div>
    <div class="hidden md:flex space-x-8 items-center">
      <!-- Menu Fitur Utama -->
      <a href="/customers" use:inertia class="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium text-lg relative group">
        Pelanggan
        <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
      </a>
      <a href="/vehicles" use:inertia class="text-gray-700 hover:text-green-600 transition-all duration-300 font-medium text-lg relative group">
        Kendaraan
        <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
      </a>
      <!-- Load SPK as a document: the legacy Inertia adapter can update the outgoing page with SPK-only props. -->
      <a href="/spk" class="text-gray-700 hover:text-purple-600 transition-all duration-300 font-medium text-lg relative group">
        SPK Digital
        <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 group-hover:w-full"></span>
      </a>
      <a href="/invoices" use:inertia class="text-gray-700 hover:text-orange-600 transition-all duration-300 font-medium text-lg relative group">
        Invoice
        <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-300 group-hover:w-full"></span>
      </a>
      <a href="/reports" use:inertia class="text-gray-700 hover:text-indigo-600 transition-all duration-300 font-medium text-lg relative group">
        Laporan
        <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
      </a>
    </div>

    <!-- Mobile Menu Button -->
    <div class="md:hidden">
      <button
        on:click={toggleMobileMenu}
        class="text-gray-700 hover:text-blue-600 transition-colors duration-300"
        aria-label="Menu"
      >
        {#if mobileMenuOpen}
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        {:else}
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        {/if}
      </button>
    </div>
  </div>

  <!-- Mobile Menu -->
  {#if mobileMenuOpen}
    <div class="md:hidden absolute top-full left-0 right-0 bg-white shadow-xl border-t border-gray-100 z-50">
      <div class="px-4 py-6 space-y-4">
        <!-- Mobile Fitur Section -->
        <div class="space-y-3">
          <div class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Fitur SST Bengkel</div>

          <a href="/customers" use:inertia on:click={closeMobileMenu} class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors duration-200">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div>
              <div class="font-medium text-gray-900">Manajemen Pelanggan</div>
              <div class="text-sm text-gray-500">Kelola data pelanggan</div>
            </div>
          </a>

          <a href="/vehicles" use:inertia on:click={closeMobileMenu} class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors duration-200">
            <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <div class="font-medium text-gray-900">Manajemen Kendaraan</div>
              <div class="text-sm text-gray-500">Database kendaraan & tracking</div>
            </div>
          </a>

          <a href="/spk" on:click={closeMobileMenu} class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors duration-200">
            <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div>
              <div class="font-medium text-gray-900">SPK Digital</div>
              <div class="text-sm text-gray-500">Surat Perintah Kerja otomatis</div>
            </div>
          </a>

          <a href="/invoices" use:inertia on:click={closeMobileMenu} class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors duration-200">
            <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div>
              <div class="font-medium text-gray-900">Invoice Otomatis</div>
              <div class="text-sm text-gray-500">Pembuatan nota otomatis</div>
            </div>
          </a>

          <a href="/reports" use:inertia on:click={closeMobileMenu} class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors duration-200">
            <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <div>
              <div class="font-medium text-gray-900">Laporan Real-time</div>
              <div class="text-sm text-gray-500">Dashboard & analytics</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  {/if}
</nav>
