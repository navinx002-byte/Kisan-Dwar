// Mandi Operations Dashboard Logic

let currentMandiId = 1;
let html5QrScanner = null;
let isScannerActive = false;

async function loadMandiDashboard(mandiId = 1) {
  currentMandiId = mandiId;
  try {
    const res = await fetch(`/api/mandi/${mandiId}/schedule`);
    const schedule = await res.json();
    renderMandiSchedule(schedule);

    // Fetch Mandi Status for Weather & Tarpaulins
    const mandisRes = await fetch('/api/mandis');
    const mandis = await mandisRes.json();
    const currentMandi = mandis.find(m => m.id === mandiId) || mandis[0];

    document.getElementById('mandi-name-header').innerText = currentMandi.name;
    document.getElementById('mandi-rain-badge').innerText = `☔ Rain Risk: ${currentMandi.rain_risk_percent}%`;
    document.getElementById('mandi-tarp-stock').innerText = `${currentMandi.tarpaulin_stock} Covers Available`;
    document.getElementById('mandi-queue-count').innerText = `${currentMandi.current_queue} Vehicles in Yard`;

  } catch (err) {
    console.error("Error loading mandi dashboard:", err);
  }
}

function renderMandiSchedule(schedule) {
  const tbody = document.getElementById('mandi-schedule-table');
  if (!schedule || schedule.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-gray-400 text-xs">No slot bookings for today.</td></tr>`;
    return;
  }

  tbody.innerHTML = schedule.map(item => `
    <tr class="hover:bg-gray-50 border-b border-gray-100 transition text-xs">
      <td class="py-3 px-4 font-mono font-bold text-gray-800">${item.booking_ref}</td>
      <td class="py-3 px-4 font-medium text-gray-900">${item.farmer_name}</td>
      <td class="py-3 px-4 text-gray-600">${item.crop_type} (${item.quantity} Qtl)</td>
      <td class="py-3 px-4 font-mono text-gray-700">${item.vehicle_number}</td>
      <td class="py-3 px-4 text-gray-600">${item.time_slot}</td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
          item.status === 'SERVING' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
          item.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
          'bg-gray-100 text-gray-700'
        }">
          ● ${item.status} ${item.token_number ? `(#${item.token_number})` : ''}
        </span>
        ${item.is_tarpaulin_covered ? '<span class="ml-1 text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200">☔ Tarp Covered</span>' : ''}
      </td>
      <td class="py-3 px-4">
        <button onclick="openWeighbridgeModal(${item.booking_id}, '${item.booking_ref}', '${item.farmer_name}', ${item.quantity})" class="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] px-3 py-1.5 rounded shadow transition">
          ⚖️ Weigh & Log
        </button>
      </td>
    </tr>
  `).join('');
}

// In-Browser Web Camera QR Scanner Logic (html5-qrcode)
function toggleWebCameraScanner() {
  const qrContainer = document.getElementById('camera-scanner-container');
  
  if (isScannerActive) {
    if (html5QrScanner) {
      html5QrScanner.stop().then(() => {
        qrContainer.classList.add('hidden');
        isScannerActive = false;
        document.getElementById('toggle-scanner-btn').innerText = "📷 Open Phone Camera Scanner";
      }).catch(err => console.error("Error stopping scanner:", err));
    }
  } else {
    qrContainer.classList.remove('hidden');
    document.getElementById('toggle-scanner-btn').innerText = "⏹️ Stop Camera Scanner";

    html5QrScanner = new Html5Qrcode("qr-reader");
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrScanner.start(
      { facingMode: "environment" }, // Rear camera on mobile
      config,
      onQrScanSuccess,
      onQrScanError
    ).then(() => {
      isScannerActive = true;
    }).catch(err => {
      console.warn("Camera start failed, falling back to manual entry:", err);
      showToast("Camera access unavailable or denied. Use manual QR text entry.", "info");
    });
  }
}

async function onQrScanSuccess(decodedText, decodedResult) {
  console.log("QR Scanned successfully:", decodedText);
  if (html5QrScanner) {
    html5QrScanner.stop().catch(e => console.log(e));
    document.getElementById('camera-scanner-container').classList.add('hidden');
    isScannerActive = false;
    document.getElementById('toggle-scanner-btn').innerText = "📷 Open Phone Camera Scanner";
  }

  // Call Server Scan Endpoint
  processScannedQR(decodedText);
}

function onQrScanError(errorMessage) {
  // Ignore continuous scan frame errors
}

async function processScannedQR(qrText) {
  try {
    const res = await fetch('/api/mandi/scan-qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        qr_code_data: qrText,
        mandi_id: currentMandiId
      })
    });

    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || "Invalid QR Code", "error");
      return;
    }

    showToast(`✅ Gate Check-In Successful! Assigned Live Token #${data.token_number}`, "success");
    document.getElementById('live-serving-token-display').innerText = `#${data.token_number}`;
    await loadMandiDashboard(currentMandiId);

  } catch (err) {
    console.error("Scan processing error:", err);
    showToast("Failed to process QR code", "error");
  }
}

// Live Queue Controller Actions
async function performQueueAction(action) {
  try {
    const res = await fetch('/api/mandi/queue-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: action,
        mandi_id: currentMandiId
      })
    });

    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || "Queue action failed", "error");
      return;
    }

    document.getElementById('live-serving-token-display').innerText = `#${data.token_number}`;
    showToast(data.message, "success");
    await loadMandiDashboard(currentMandiId);

  } catch (err) {
    console.error("Queue controller error:", err);
    showToast("Server communication error", "error");
  }
}

// Weighbridge & Scale Slip Photo Audit
function openWeighbridgeModal(bookingId, bookingRef, farmerName, expectedQtl) {
  document.getElementById('weigh-booking-id').value = bookingId;
  document.getElementById('weigh-ref-display').innerText = `${bookingRef} (${farmerName})`;
  document.getElementById('weigh-gross-input').value = (expectedQtl + 40.0).toFixed(1);
  document.getElementById('weigh-tare-input').value = "40.0";
  calculateNetWeight();

  document.getElementById('weighbridge-modal').classList.remove('hidden');
}

function closeWeighbridgeModal() {
  document.getElementById('weighbridge-modal').classList.add('hidden');
}

function calculateNetWeight() {
  const gross = parseFloat(document.getElementById('weigh-gross-input').value) || 0;
  const tare = parseFloat(document.getElementById('weigh-tare-input').value) || 0;
  const net = Math.max(0, gross - tare);
  const mspRate = 2320.0;
  const total = Math.round(net * mspRate);

  document.getElementById('weigh-net-display').innerText = `${net.toFixed(1)} Quintals`;
  document.getElementById('weigh-total-display').innerText = `₹${total.toLocaleString()}`;
}

async function submitWeighbridgeLog() {
  const bookingId = document.getElementById('weigh-booking-id').value;
  const gross = parseFloat(document.getElementById('weigh-gross-input').value);
  const tare = parseFloat(document.getElementById('weigh-tare-input').value);
  const moisture = parseFloat(document.getElementById('weigh-moisture-input').value);

  if (moisture > 17.0) {
    showToast("⚠️ Moisture exceeds 17% FAQ limit! Must be sun-dried or graded B.", "error");
  }

  try {
    const res = await fetch('/api/mandi/weighbridge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking_id: bookingId,
        gross_weight: gross,
        tare_weight: tare,
        moisture_reading: moisture,
        scale_slip_photo: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=60"
      })
    });

    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || "Weighbridge logging failed", "error");
      return;
    }

    closeWeighbridgeModal();
    showToast(`✅ ${data.message}`, "success");
    await loadMandiDashboard(currentMandiId);

  } catch (err) {
    console.error("Weighbridge submit error:", err);
    showToast("Failed to save weighbridge record", "error");
  }
}

// Monsoon Emergency Tarpaulin Squad Deployment
async function triggerRainSquad() {
  try {
    const res = await fetch('/api/mandi/deploy-rain-squad', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mandi_id: currentMandiId })
    });

    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || "Deployment failed", "error");
      return;
    }

    showToast(data.message, "success");
    await loadMandiDashboard(currentMandiId);

  } catch (err) {
    console.error("Rain squad trigger error:", err);
    showToast("Failed to dispatch squad", "error");
  }
}
