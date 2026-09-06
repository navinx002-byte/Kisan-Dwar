// Minister / District Admin Dashboard Logic with Farmer-wise Financial Ledger & Charts

let adminMap = null;
let mandiMarkers = [];
let adminDBTChartInstance = null;
let allFarmerDBTHistory = [];

async function loadAdminDashboard() {
  try {
    const res = await fetch('/api/admin/analytics');
    const data = await res.json();

    // 1. Populate KPI Summary Cards
    document.getElementById('kpi-procured-tons').innerText = `${data.kpis.total_procured_metric_tons.toLocaleString()} MT`;
    document.getElementById('kpi-target-pct').innerText = `${data.kpis.target_achieved_pct}% of Target`;
    document.getElementById('kpi-dbt-disbursed').innerText = `₹${(data.kpis.total_dbt_disbursed_rs / 10000000).toFixed(2)} Cr`;
    document.getElementById('kpi-farmers-count').innerText = `${data.kpis.total_farmers_served.toLocaleString()}`;
    document.getElementById('kpi-mandis-count').innerText = `${data.kpis.active_mandis_count} Mandis Active`;

    // 2. Render / Update Leaflet.js GIS Map
    renderAdminGISMap(data.mandis);

    // 3. Render Pending DBT Payment Batches
    renderPendingDBT(data.pending_dbt_batches);

    // 4. Render Anomaly & Fraud Alerts
    renderAnomalyAlerts(data.anomaly_alerts);

    // 5. Load Farmer-wise Yearly/Monthly Financial Ledger
    loadAdminFarmerLedger();

  } catch (err) {
    console.error("Error loading admin dashboard:", err);
  }
}

function renderAdminGISMap(mandis) {
  if (!adminMap) {
    adminMap = L.map('admin-leaflet-map').setView([15.5, 78.0], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors'
    }).addTo(adminMap);
  }

  mandiMarkers.forEach(m => adminMap.removeLayer(m));
  mandiMarkers = [];

  mandis.forEach(m => {
    const color = m.congestion_level === 'RED' ? '#ef4444' : (m.congestion_level === 'YELLOW' ? '#f59e0b' : '#10b981');
    
    const circle = L.circleMarker([m.lat, m.lng], {
      radius: 12,
      fillColor: color,
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.85
    }).addTo(adminMap);

    const popupContent = `
      <div style="font-family: sans-serif; min-width: 180px;">
        <strong style="color: #111827; font-size: 13px;">${m.name}</strong><br>
        <span style="font-size: 11px; color: #4b5563;">${m.district}, ${m.state}</span>
        <hr style="margin: 6px 0; border: 0; border-top: 1px solid #e5e7eb;">
        <div style="font-size: 11.5px; line-height: 1.5;">
          <strong>Queue:</strong> <span style="color:${color}; font-weight:bold;">${m.current_queue} Vehicles</span><br>
          <strong>Avg Wait:</strong> ${m.avg_wait_mins} mins<br>
          <strong>Rain Risk:</strong> ${m.rain_risk_percent}% ${m.rain_risk_percent > 70 ? '☔ (High)' : ''}<br>
          <strong>Tarp Stock:</strong> ${m.tarpaulin_stock} Covers<br>
          <strong>Status:</strong> ${m.is_frozen ? '<span style="color:red; font-weight:bold;">FROZEN</span>' : '<span style="color:green; font-weight:bold;">ACTIVE</span>'}
        </div>
        <button onclick="toggleMandiFreeze(${m.id})" style="margin-top: 8px; width: 100%; background: ${m.is_frozen ? '#10b981' : '#ef4444'}; color: white; border: none; padding: 4px 8px; font-size: 10.5px; font-weight: bold; border-radius: 4px; cursor: pointer;">
          ${m.is_frozen ? '▶️ Resume Mandi Slots' : '⏸️ Freeze Slots (Weather Override)'}
        </button>
      </div>
    `;

    circle.bindPopup(popupContent);
    mandiMarkers.push(circle);
  });
}

function renderPendingDBT(batches) {
  const tbody = document.getElementById('admin-dbt-table');
  const countBadge = document.getElementById('pending-dbt-count');
  
  if (!batches || batches.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-emerald-700 font-medium text-xs">✅ All DBT payment batches have been reviewed and approved!</td></tr>`;
    countBadge.innerText = `0 Pending`;
    document.getElementById('bulk-approve-btn').disabled = true;
    document.getElementById('bulk-approve-btn').classList.add('opacity-50', 'cursor-not-allowed');
    return;
  }

  countBadge.innerText = `${batches.length} Pending Approval`;
  document.getElementById('bulk-approve-btn').disabled = false;
  document.getElementById('bulk-approve-btn').classList.remove('opacity-50', 'cursor-not-allowed');

  tbody.innerHTML = batches.map(b => `
    <tr class="hover:bg-gray-50 border-b border-gray-100 transition text-xs">
      <td class="py-3 px-4 font-mono font-bold text-gray-800">${b.batch_ref}</td>
      <td class="py-3 px-4 text-gray-700">${b.mandi_name}</td>
      <td class="py-3 px-4 text-gray-600">${b.total_farmers} Farmer(s)</td>
      <td class="py-3 px-4 font-bold text-emerald-700">₹${b.total_payout.toLocaleString()}</td>
      <td class="py-3 px-4 text-gray-500">${b.created_at}</td>
    </tr>
  `).join('');
}

function renderAnomalyAlerts(alerts) {
  const container = document.getElementById('admin-anomaly-container');
  if (!alerts || alerts.length === 0) {
    container.innerHTML = `<p class="text-xs text-gray-400">No active anomaly warnings.</p>`;
    return;
  }

  container.innerHTML = alerts.map(a => `
    <div class="p-3 rounded-lg border text-xs ${
      a.severity === 'HIGH' ? 'bg-red-50 border-red-200 text-red-900' : 'bg-amber-50 border-amber-200 text-amber-900'
    }">
      <div class="flex justify-between items-center mb-1">
        <strong class="font-bold flex items-center gap-1.5">
          ${a.severity === 'HIGH' ? '🚨' : '⚠️'} ${a.type}
        </strong>
        <span class="text-[10px] opacity-75">${a.time}</span>
      </div>
      <p class="text-[11px] leading-relaxed">${a.message}</p>
    </div>
  `).join('');
}

// Load Farmer-wise Yearly/Monthly DBT Financial Ledger & Monthly Trend Chart
async function loadAdminFarmerLedger() {
  try {
    const res = await fetch('/api/admin/farmer-dbt-history');
    allFarmerDBTHistory = await res.json();

    renderFarmerDBTTable(allFarmerDBTHistory);
    renderAdminDBTTrendChart();

  } catch (err) {
    console.error("Error loading farmer DBT ledger:", err);
  }
}

function renderFarmerDBTTable(records) {
  const tbody = document.getElementById('admin-farmer-ledger-table');
  if (!tbody) return;

  if (!records || records.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-6 text-gray-400 text-xs">No disbursement records found for this filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = records.map(r => `
    <tr class="hover:bg-gray-50 border-b border-gray-100 transition text-xs">
      <td class="py-3 px-4 font-mono font-bold text-gray-900">${r.farmer_id}</td>
      <td class="py-3 px-4 font-medium text-gray-900">${r.name}</td>
      <td class="py-3 px-4 text-gray-600">${r.district}</td>
      <td class="py-3 px-4 font-mono text-[11px] text-gray-700">${r.bank_account}</td>
      <td class="py-3 px-4 text-gray-600">${r.crop_type} (${r.quantity_qtl} Qtl)</td>
      <td class="py-3 px-4 font-extrabold text-emerald-800">₹${r.total_dbt_paid.toLocaleString()}</td>
      <td class="py-3 px-4">
        <span class="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded text-[10px]">
          ● ${r.payment_status}
        </span>
      </td>
      <td class="py-3 px-4 font-mono text-[10px] text-gray-500">${r.pfms_utr}</td>
    </tr>
  `).join('');
}

function filterFarmerDBTLedger() {
  const search = document.getElementById('ledger-search-input')?.value.toLowerCase() || '';
  const yearFilter = document.getElementById('ledger-year-select')?.value || 'ALL';
  const monthFilter = document.getElementById('ledger-month-select')?.value || 'ALL';

  const filtered = allFarmerDBTHistory.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(search) || 
                          r.farmer_id.toLowerCase().includes(search) || 
                          r.district.toLowerCase().includes(search);
    const matchesYear = yearFilter === 'ALL' || r.year === yearFilter;
    const matchesMonth = monthFilter === 'ALL' || r.month === monthFilter;

    return matchesSearch && matchesYear && matchesMonth;
  });

  renderFarmerDBTTable(filtered);
}

function renderAdminDBTTrendChart() {
  const canvas = document.getElementById('admin-dbt-monthly-chart');
  if (!canvas) return;

  if (adminDBTChartInstance) adminDBTChartInstance.destroy();

  adminDBTChartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: ["Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", "May 2026", "Jun 2026", "Jul 2026", "Aug 2026", "Sep 2026", "Oct 2026"],
      datasets: [{
        label: 'State-wide DBT Disbursed (₹ in Lakhs)',
        data: [12.5, 8.2, 14.0, 45.6, 18.0, 11.2, 16.5, 22.0, 58.4, 92.8],
        backgroundColor: '#059669',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: '📊 Monthly Direct Benefit Transfer (DBT) Payout Velocity (₹ in Lakhs)' }
      }
    }
  });
}

// 1-Click Bulk DBT Approval Action
async function bulkApproveDBT() {
  try {
    const res = await fetch('/api/admin/dbt-bulk-approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || "Approval failed", "error");
      return;
    }

    showToast(data.message, "success");
    await loadAdminDashboard();

  } catch (err) {
    console.error("Bulk approve error:", err);
    showToast("Failed to connect to PFMS banking gateway", "error");
  }
}

// Freeze / Unfreeze Mandi Slots
async function toggleMandiFreeze(mandiId) {
  try {
    const res = await fetch('/api/admin/toggle-mandi-freeze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mandi_id: mandiId })
    });

    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || "Action failed", "error");
      return;
    }

    showToast(data.message, "info");
    await loadAdminDashboard();

  } catch (err) {
    console.error("Freeze toggle error:", err);
    showToast("Error updating mandi state", "error");
  }
}
