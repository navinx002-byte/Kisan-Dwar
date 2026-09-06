// Master Application Controller, Multi-Page Router, Admin Login & Sidebar Engine

let currentRole = 'farmer';
let isAdminLoggedIn = false;

document.addEventListener('DOMContentLoaded', () => {
  // Initialize default view (Farmer Portal)
  switchRole('farmer');

  // Register Service Worker for Mobile PWA Installation
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/static/sw.js').catch(err => {
      console.log('SW registration note:', err);
    });
  }

  // Populate Mandi dropdown in booking wizard
  fetch('/api/mandis').then(r => r.json()).then(mandis => {
    const sel = document.getElementById('wizard-mandi-select');
    if (sel) {
      sel.innerHTML = mandis.map(m => `
        <option value="${m.id}">${m.name} (${m.district}) - ${m.rain_risk_percent > 70 ? '☔ Rain Risk' : '🟢 Open'}</option>
      `).join('');
    }
  }).catch(e => console.error("Error loading mandis:", e));
});

// Master Role Switcher (Farmer / Mandi / Admin)
function switchRole(role) {
  currentRole = role;

  // Update Top Bar Tabs
  document.querySelectorAll('.role-tab-btn').forEach(btn => {
    const isActive = btn.dataset.role === role;
    btn.classList.toggle('bg-emerald-700', isActive);
    btn.classList.toggle('text-white', isActive);
    btn.classList.toggle('bg-gray-100', !isActive);
    btn.classList.toggle('text-gray-700', !isActive);
  });

  // Toggle Left Sidebar Menus
  document.getElementById('nav-farmer-menu').classList.toggle('hidden', role !== 'farmer');
  document.getElementById('nav-mandi-menu').classList.toggle('hidden', role !== 'mandi');
  document.getElementById('nav-admin-menu').classList.toggle('hidden', role !== 'admin');

  // Update Sidebar Role Badge & User Info
  const badge = document.getElementById('sidebar-role-badge');
  const userName = document.getElementById('sidebar-user-name');
  const userRole = document.getElementById('sidebar-user-role');

  if (role === 'farmer') {
    badge.innerText = "👨‍🌾 Farmer Navigation";
    userName.innerText = "Basavaraj Gowda";
    userRole.innerText = "ID: FARM-KA-8941";
  } else if (role === 'mandi') {
    badge.innerText = "🏢 Mandi Staff Navigation";
    userName.innerText = "Mandi In-Charge";
    userRole.innerText = "Centre: Raichur Gate 1";
  } else if (role === 'admin') {
    badge.innerText = "🏛️ Ministry Admin Navigation";
    userName.innerText = "District Procurement Officer";
    userRole.innerText = "Govt of Karnataka (DSO)";
  }

  // Toggle Main Screen Views
  document.getElementById('screen-farmer').classList.toggle('hidden', role !== 'farmer');
  document.getElementById('screen-mandi').classList.toggle('hidden', role !== 'mandi');
  document.getElementById('screen-admin').classList.toggle('hidden', role !== 'admin');

  // Load screen data & set default sub-page
  if (role === 'farmer') {
    loadFarmerProfile(currentFarmerId);
    setFarmerLanguage(currentLanguage);
    navigateTo('farmer-summary');
  } else if (role === 'mandi') {
    loadMandiDashboard(currentMandiId);
    navigateTo('mandi-schedule');
  } else if (role === 'admin') {
    if (isAdminLoggedIn) {
      document.getElementById('admin-login-view').classList.add('hidden');
      document.getElementById('admin-authenticated-view').classList.remove('hidden');
      loadAdminDashboard();
      navigateTo('admin-overview');
    } else {
      document.getElementById('admin-login-view').classList.remove('hidden');
      document.getElementById('admin-authenticated-view').classList.add('hidden');
    }
  }
}

// Multi-Page Sub-Page Router
function navigateTo(subpageId, navElement = null) {
  // Hide all subpages
  document.querySelectorAll('.subpage').forEach(page => {
    page.classList.remove('active');
  });

  // Show target subpage
  const target = document.getElementById(`subpage-${subpageId}`);
  if (target) {
    target.classList.add('active');
  }

  // Update active sidebar item
  document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    item.classList.remove('active');
  });

  if (navElement) {
    navElement.classList.add('active');
  } else {
    const matchingBtn = document.querySelector(`.sidebar-nav-item[onclick*="${subpageId}"]`);
    if (matchingBtn) {
      matchingBtn.classList.add('active');
    }
  }

  // Handle Chart & Map resizes when navigating
  if (subpageId === 'admin-heatmap' && adminMap) {
    setTimeout(() => {
      adminMap.invalidateSize();
    }, 200);
  }

  if (subpageId === 'farmer-analytics') {
    loadFarmerAnalyticsCharts(currentFarmerId);
  }

  if (subpageId === 'admin-ledger') {
    loadAdminFarmerLedger();
  }
}

// Government Admin Authentication Handler
function handleAdminLogin() {
  const userInput = document.getElementById('admin-user-input').value.trim();
  const passInput = document.getElementById('admin-pass-input').value.trim();

  if (!userInput || !passInput) {
    showToast("Please enter officer credentials", "error");
    return;
  }

  isAdminLoggedIn = true;
  document.getElementById('admin-login-view').classList.add('hidden');
  document.getElementById('admin-authenticated-view').classList.remove('hidden');

  showToast("🔐 Official SSO Login Verified! Welcome Officer.", "success");
  loadAdminDashboard();
  navigateTo('admin-overview');
}

// Floating Toast Notifications
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast-notification');
  const toastMsg = document.getElementById('toast-message');
  const toastIcon = document.getElementById('toast-icon');

  toastMsg.innerText = message;
  
  if (type === 'success') {
    toast.className = 'fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-emerald-500 transition-all duration-300 transform translate-y-0 opacity-100';
    toastIcon.innerText = '✅';
  } else if (type === 'error') {
    toast.className = 'fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-red-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-red-500 transition-all duration-300 transform translate-y-0 opacity-100';
    toastIcon.innerText = '⚠️';
  } else {
    toast.className = 'fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-slate-600 transition-all duration-300 transform translate-y-0 opacity-100';
    toastIcon.innerText = 'ℹ️';
  }

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-4');
  }, 4000);
}
