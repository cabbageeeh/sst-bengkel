<script>


	// Props
	export let customerData = [];

	// State
	let searchTerm = '';
	let sortBy = 'name';
	let sortOrder = 'asc';
	let minSpent = '';
	let maxSpent = '';

	// Helper functions
	function formatCurrency(amount) {
		if (!amount) return 'Rp 0';
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	function formatDate(dateString) {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString('id-ID', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	// Computed values
	$: totalCustomers = customerData.length;
	$: totalVehicles = customerData.reduce((sum, customer) => sum + (customer.vehicle_count || 0), 0);
	$: totalServices = customerData.reduce((sum, customer) => sum + (customer.service_count || 0), 0);
	$: totalRevenue = customerData.reduce((sum, customer) => sum + (customer.total_spent || 0), 0);
	$: averageSpent = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

	// Filtered and sorted data
	$: filteredData = customerData.filter(customer => {
		const matchesSearch = customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
						  customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
						  customer.phone?.includes(searchTerm);
		
		const matchesSpentRange = (!minSpent || (customer.total_spent || 0) >= parseFloat(minSpent)) &&
							  (!maxSpent || (customer.total_spent || 0) <= parseFloat(maxSpent));
		
		return matchesSearch && matchesSpentRange;
	}).sort((a, b) => {
		let aVal, bVal;
		
		switch (sortBy) {
			case 'name':
				aVal = a.name || '';
				bVal = b.name || '';
				break;
			case 'email':
				aVal = a.email || '';
				bVal = b.email || '';
				break;
			case 'vehicle_count':
				aVal = a.vehicle_count || 0;
				bVal = b.vehicle_count || 0;
				break;
			case 'service_count':
				aVal = a.service_count || 0;
				bVal = b.service_count || 0;
				break;
			case 'total_spent':
				aVal = a.total_spent || 0;
				bVal = b.total_spent || 0;
				break;
			case 'last_service_date':
				aVal = a.last_service_date ? new Date(a.last_service_date) : new Date(0);
				bVal = b.last_service_date ? new Date(b.last_service_date) : new Date(0);
				break;
			default:
				aVal = a.name || '';
				bVal = b.name || '';
		}
		
		if (typeof aVal === 'string') {
			return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
		} else {
			return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
		}
	});

	function handleSort(column) {
		if (sortBy === column) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = column;
			sortOrder = 'asc';
		}
	}

	function getSortIcon(column) {
		if (sortBy !== column) return '↕';
		return sortOrder === 'asc' ? '↑' : '↓';
	}
</script>



<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20">
	<div class="container mx-auto px-4 py-8">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-800 mb-2">Laporan Pelanggan</h1>
			<p class="text-gray-600">Analisis data pelanggan dan aktivitas servis</p>
		</div>

		<!-- Summary Cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
			<div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-600">Total Pelanggan</p>
						<p class="text-2xl font-bold text-gray-900">{totalCustomers}</p>
					</div>
					<div class="p-3 bg-blue-100 rounded-full">
						<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
						</svg>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-600">Total Kendaraan</p>
						<p class="text-2xl font-bold text-gray-900">{totalVehicles}</p>
					</div>
					<div class="p-3 bg-green-100 rounded-full">
						<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
						</svg>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-600">Total Servis</p>
						<p class="text-2xl font-bold text-gray-900">{totalServices}</p>
					</div>
					<div class="p-3 bg-purple-100 rounded-full">
						<svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
						</svg>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-600">Total Pendapatan</p>
						<p class="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
					</div>
					<div class="p-3 bg-yellow-100 rounded-full">
						<svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
						</svg>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-600">Rata-rata Pengeluaran</p>
						<p class="text-2xl font-bold text-gray-900">{formatCurrency(averageSpent)}</p>
					</div>
					<div class="p-3 bg-red-100 rounded-full">
						<svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
						</svg>
					</div>
				</div>
			</div>
		</div>

		<!-- Filters -->
		<div class="bg-white rounded-xl shadow-lg p-6 mb-8">
			<h3 class="text-lg font-semibold text-gray-800 mb-4">Filter & Pencarian</h3>
			<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div>
					<label for="report-customer-search" class="block text-sm font-medium text-gray-700 mb-2">Cari Pelanggan</label>
					<input
						type="text"
						id="report-customer-search" bind:value={searchTerm}
						placeholder="Nama, email, atau telepon..."
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>
				<div>
					<label for="report-min-spent" class="block text-sm font-medium text-gray-700 mb-2">Pengeluaran Minimum</label>
					<input
						type="number"
						id="report-min-spent" bind:value={minSpent}
						placeholder="0"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>
				<div>
					<label for="report-max-spent" class="block text-sm font-medium text-gray-700 mb-2">Pengeluaran Maksimum</label>
					<input
						type="number"
						id="report-max-spent" bind:value={maxSpent}
						placeholder="Tidak terbatas"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>
				<div class="flex items-end">
					<button
						on:click={() => { searchTerm = ''; minSpent = ''; maxSpent = ''; }}
						class="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
					>
						Reset Filter
					</button>
				</div>
			</div>
		</div>

		<!-- Customer Table -->
		<div class="bg-white rounded-xl shadow-lg overflow-hidden">
			<div class="px-6 py-4 border-b border-gray-200">
				<h3 class="text-lg font-semibold text-gray-800">Data Pelanggan ({filteredData.length})</h3>
			</div>
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" on:click={() => handleSort('name')}>
								Nama {getSortIcon('name')}
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" on:click={() => handleSort('email')}>
								Email {getSortIcon('email')}
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Telepon
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" on:click={() => handleSort('vehicle_count')}>
								Jumlah Kendaraan {getSortIcon('vehicle_count')}
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" on:click={() => handleSort('service_count')}>
								Jumlah Servis {getSortIcon('service_count')}
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" on:click={() => handleSort('total_spent')}>
								Total Pengeluaran {getSortIcon('total_spent')}
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" on:click={() => handleSort('last_service_date')}>
								Servis Terakhir {getSortIcon('last_service_date')}
							</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each filteredData as customer}
							<tr class="hover:bg-gray-50 transition-colors">
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm font-medium text-gray-900">{customer.name || '-'}</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm text-gray-900">{customer.email || '-'}</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm text-gray-900">{customer.phone || '-'}</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm text-gray-900">{customer.vehicle_count || 0}</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm text-gray-900">{customer.service_count || 0}</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm font-medium text-gray-900">{formatCurrency(customer.total_spent)}</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm text-gray-900">{formatDate(customer.last_service_date)}</div>
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="7" class="px-6 py-4 text-center text-gray-500">
									Tidak ada data pelanggan yang ditemukan
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			</div>
	</div>
</div>

<style>
	/* Custom scrollbar */
	:global(.overflow-x-auto::-webkit-scrollbar) {
		height: 6px;
	}
	
	:global(.overflow-x-auto::-webkit-scrollbar-track) {
		background: #f1f1f1;
		border-radius: 3px;
	}
	
	:global(.overflow-x-auto::-webkit-scrollbar-thumb) {
		background: #c1c1c1;
		border-radius: 3px;
	}
	
	:global(.overflow-x-auto::-webkit-scrollbar-thumb:hover) {
		background: #a8a8a8;
	}
</style>
