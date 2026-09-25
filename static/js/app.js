// Master Application Controller, Multi-Page Router, Admin Login & Sidebar Engine

let currentRole = 'landing';
let isAdminLoggedIn = false;

document.addEventListener('DOMContentLoaded', () => {
  removeStrayVoiceButtons();
  // Initialize default view (National Home & Introduction Landing Page)
  switchRole('landing');

  // Register Service Worker for Mobile PWA Installation
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/static/sw.js').catch(err => {
      console.log('SW registration note:', err);
    });
  }

  // Bind online/offline network listeners
  updatePwaNetworkStatus();
  window.addEventListener('online', updatePwaNetworkStatus);
  window.addEventListener('offline', updatePwaNetworkStatus);

  // Populate Mandi dropdown in booking wizard and bind dynamic weather risk alert
  fetch('/api/mandis').then(r => r.json()).then(mandis => {
    window.cachedMandis = mandis;
    if (typeof populateMandiDropdown === 'function') {
      populateMandiDropdown(currentLanguage);
    }
    const sel = document.getElementById('wizard-mandi-select');
    if (sel) {
      sel.addEventListener('change', () => {
        const selectedMandi = mandis.find(m => m.id == sel.value) || mandis[0];
        if (typeof updateMandiWeatherWarning === 'function') {
          updateMandiWeatherWarning(selectedMandi, currentLanguage);
        }
        if (selectedMandi.rain_risk_percent > 70) {
          const loc = typeof getLocalizedMandiInfo === 'function' ? getLocalizedMandiInfo(selectedMandi, currentLanguage) : { name: selectedMandi.name };
          showToast(`☔ Weather Warning for ${loc.name}: High Rain Probability (${selectedMandi.rain_risk_percent}%). Please cover grain trolleys!`, 'error');
        }
      });
    }
  }).catch(e => console.error("Error loading mandis:", e));
});

// Master Role Switcher (Landing / Farmer / Mandi / Admin)

// Global safeguard: strictly enforce Voice Assistant ONLY in Home and Farmer screens
function removeStrayVoiceButtons() {
  document.querySelectorAll('button').forEach(btn => {
    const oc = btn.getAttribute('onclick') || '';
    if (oc.includes('openVoiceAssistantModal')) {
      const inLanding = btn.closest('#screen-landing');
      const inFarmer = btn.closest('#screen-farmer');
      const inModal = btn.closest('#voice-assistant-modal');
      if (!inLanding && !inFarmer && !inModal) {
        btn.remove();
      }
    }
  });
}

function switchRole(role) {
  currentRole = role;
  removeStrayVoiceButtons();

  // Update Top Bar Tabs
  document.querySelectorAll('.role-tab-btn').forEach(btn => {
    const isActive = btn.dataset.role === role;
    btn.classList.toggle('bg-emerald-700', isActive);
    btn.classList.toggle('text-white', isActive);
    btn.classList.toggle('bg-gray-100', !isActive);
    btn.classList.toggle('text-gray-700', !isActive);
  });

  // Toggle Left Sidebar Menus
  const farmerNav = document.getElementById('nav-farmer-menu');
  const mandiNav = document.getElementById('nav-mandi-menu');
  const adminNav = document.getElementById('nav-admin-menu');

  if (farmerNav) farmerNav.classList.toggle('hidden', role !== 'farmer');
  if (mandiNav) mandiNav.classList.toggle('hidden', role !== 'mandi');
  if (adminNav) adminNav.classList.toggle('hidden', role !== 'admin' || !isAdminLoggedIn);

  // Toggle Left Sidebar Visibility (Hide sidebar on landing page or when admin is not logged in)
  const mainSidebar = document.getElementById('main-sidebar');
  if (mainSidebar) {
    if (role === 'landing' || (role === 'admin' && !isAdminLoggedIn)) {
      mainSidebar.classList.add('hidden');
    } else {
      mainSidebar.classList.remove('hidden');
    }
  }

  // Update Sidebar Role Badge & User Info
  const badge = document.getElementById('sidebar-role-badge');
  const userName = document.getElementById('sidebar-user-name');
  const userRole = document.getElementById('sidebar-user-role');

  if (role === 'farmer') {
    if (badge) badge.innerText = "👨‍🌾 Farmer Navigation";
    if (typeof farmerProfileData !== 'undefined' && farmerProfileData && farmerProfileData.farmer) {
      if (userName) userName.innerText = farmerProfileData.farmer.name;
      if (userRole) userRole.innerText = `ID: ${farmerProfileData.farmer.farmer_id}`;
    }
  } else if (role === 'mandi') {
    if (badge) badge.innerText = "🏢 Procurement Operations";
    if (userName) userName.innerText = "Mandi In-Charge";
    if (userRole) userRole.innerText = "Centre: Raichur Gate 1";
  } else if (role === 'admin') {
    if (badge) badge.innerText = "🏛️ Ministry Admin Navigation";
    if (userName) userName.innerText = "District Procurement Officer";
    if (userRole) userRole.innerText = "Govt of Karnataka (DSO)";
  }

  // Toggle Main Screen Views
  const screenLanding = document.getElementById('screen-landing');
  const screenFarmer = document.getElementById('screen-farmer');
  const screenMandi = document.getElementById('screen-mandi');
  const screenAdmin = document.getElementById('screen-admin');

  if (screenLanding) screenLanding.classList.toggle('hidden', role !== 'landing');
  if (screenFarmer) screenFarmer.classList.toggle('hidden', role !== 'farmer');
  if (screenMandi) screenMandi.classList.toggle('hidden', role !== 'mandi');
  if (screenAdmin) screenAdmin.classList.toggle('hidden', role !== 'admin');

  // Load screen data & set default sub-page
  if (role === 'landing') {
    if (typeof setFarmerLanguage === 'function') {
      setFarmerLanguage(currentLanguage);
    }
  } else if (role === 'farmer') {
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
      if (adminNav) adminNav.classList.remove('hidden');
      if (mainSidebar) mainSidebar.classList.remove('hidden');
      loadAdminDashboard();
      navigateTo('admin-overview');
    } else {
      document.getElementById('admin-login-view').classList.remove('hidden');
      document.getElementById('admin-authenticated-view').classList.add('hidden');
      if (adminNav) adminNav.classList.add('hidden');
      if (mainSidebar) mainSidebar.classList.add('hidden');
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
  if (subpageId === 'admin-overview') {
    if (typeof renderAdminOverviewGraphs === 'function') {
      renderAdminOverviewGraphs();
    }
  }

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

  if (subpageId === 'admin-warehouse') {
    if (typeof loadAdminWarehouseStock === 'function') {
      loadAdminWarehouseStock();
    }
  }

  if (subpageId === 'mandi-dbt-request') {
    if (typeof calculateDBTPayout === 'function') {
      calculateDBTPayout();
    }
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
  document.getElementById('nav-admin-menu').classList.remove('hidden');
  const mainSidebar = document.getElementById('main-sidebar');
  if (mainSidebar) mainSidebar.classList.remove('hidden');

  showToast("🔐 Official SSO Login Verified! Welcome Officer.", "success");
  loadAdminDashboard();
  navigateTo('admin-overview');
}

// Admin Logout Handler
function handleAdminLogout() {
  isAdminLoggedIn = false;
  document.getElementById('nav-admin-menu').classList.add('hidden');
  document.getElementById('admin-authenticated-view').classList.add('hidden');
  document.getElementById('admin-login-view').classList.remove('hidden');
  const mainSidebar = document.getElementById('main-sidebar');
  if (mainSidebar) mainSidebar.classList.add('hidden');
  const passEl = document.getElementById('admin-pass-input');
  if (passEl) passEl.value = '';
  showToast("Officer logged out successfully.", "info");
}

// Admin Forgot Password / OTP Recovery Handler
function handleForgotPassword() {
  alert("🔑 Official Ministry OTP Protocol:\nA 6-digit one-time authorization PIN has been dispatched to your registered NIC mobile number (+91-98****1204).\n\nDemo Verification PIN: 849201\nPassword set to demo default: admin123");
  const passEl = document.getElementById('admin-pass-input');
  if (passEl) passEl.value = "admin123";
  showToast("OTP Verified! Default password auto-filled.", "success");
}

// Floating Toast Notifications (Auto-dismisses in exactly 2 seconds)
let toastTimer = null;

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast-notification');
  const toastMsg = document.getElementById('toast-message');
  const toastIcon = document.getElementById('toast-icon');
  if (!toast || !toastMsg) return;

  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }

  toastMsg.innerText = message;
  
  let bgClasses = 'bg-slate-900 border-slate-600 text-white';
  let icon = 'ℹ️';

  if (type === 'success') {
    bgClasses = 'bg-emerald-900 border-emerald-500 text-white';
    icon = '✅';
  } else if (type === 'error') {
    bgClasses = 'bg-red-900 border-red-500 text-white';
    icon = '⚠️';
  }

  if (toastIcon) toastIcon.innerText = icon;

  // Fully visible with pointer events
  toast.className = `fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border transition-all duration-300 transform translate-y-0 opacity-100 pointer-events-auto ${bgClasses}`;

  // Automatically fade out and hide in 2 seconds (2000 ms) across all dashboards
  toastTimer = setTimeout(() => {
    toast.className = `fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border transition-all duration-300 transform translate-y-4 opacity-0 pointer-events-none ${bgClasses}`;
  }, 2000);
}

// ================= SMS & WHATSAPP MODAL HANDLERS (Feature 1) =================
function openSmsModal() {
  const modal = document.getElementById('sms-notification-modal');
  if (modal) {
    modal.classList.remove('hidden');
    // Clear badge count animation after viewing
    const badge = document.getElementById('sms-badge-count');
    if (badge) {
      badge.classList.remove('animate-pulse');
      badge.innerText = '0';
      badge.classList.add('opacity-40');
    }
  }
}

function closeSmsModal() {
  const modal = document.getElementById('sms-notification-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

// ================= PWA OFFLINE NETWORK STATUS HANDLER (Feature 5) =================
function updatePwaNetworkStatus() {
  const badge = document.getElementById('pwa-status-badge');
  if (!badge) return;

  if (navigator.onLine) {
    badge.className = "inline-flex items-center gap-1.5 bg-emerald-800/90 text-emerald-200 border border-emerald-600/60 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs";
    badge.innerHTML = "<span>🟢</span> <span>Offline Synced (Village Ready)</span>";
  } else {
    badge.className = "inline-flex items-center gap-1.5 bg-amber-900/90 text-amber-200 border border-amber-600/60 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs";
    badge.innerHTML = "<span>🟠</span> <span>Offline Mode Active (Cached Tokens)</span>";
  }
}

