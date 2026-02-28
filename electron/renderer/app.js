const API_URL = 'http://127.0.0.1:8000';

// DOM Elements
const elements = {
    riskScore: document.getElementById('riskScore'),
    riskStatus: document.getElementById('riskStatus'),
    riskCard: document.getElementById('riskCard'),
    modRate: document.getElementById('modRate'),
    modBar: document.getElementById('modBar'),
    entropyVal: document.getElementById('entropyVal'),
    cpuVal: document.getElementById('cpuVal'),
    suspiciousTableBody: document.getElementById('suspiciousTableBody'),
    alertModal: document.getElementById('alertModal'),
    scanBtn: document.getElementById('scanBtn'),

    btnModalKill: document.getElementById('btnModalKill'),
    btnModalSuspend: document.getElementById('btnModalSuspend'),
    btnModalIgnore: document.getElementById('btnModalIgnore')
};

// State
let isAlertActive = false;
let currentSuspiciousPids = [];

// Chart configuration
Chart.defaults.color = 'rgba(255, 255, 255, 0.5)';
Chart.defaults.font.family = '"Albert Sans", sans-serif';

const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    scales: {
        x: { display: false },
        y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            border: { display: false }
        }
    },
    plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
    },
    elements: {
        point: { radius: 0 },
        line: { tension: 0.4, borderWidth: 2 }
    }
};

const cpuCtx = document.getElementById('cpuChart').getContext('2d');
const cpuChart = new Chart(cpuCtx, {
    type: 'line',
    data: {
        labels: Array(20).fill(''),
        datasets: [{
            data: Array(20).fill(0),
            borderColor: '#8D5CFC', // Secondary color
            backgroundColor: 'rgba(141, 92, 252, 0.1)',
            fill: true
        }]
    },
    options: {
        ...commonOptions,
        scales: { ...commonOptions.scales, y: { ...commonOptions.scales.y, min: 0, max: 100 } }
    }
});

const entropyCtx = document.getElementById('entropyChart').getContext('2d');
const entropyChart = new Chart(entropyCtx, {
    type: 'line',
    data: {
        labels: Array(20).fill(''),
        datasets: [{
            data: Array(20).fill(0),
            borderColor: '#FE4A23', // Primary color
            backgroundColor: 'rgba(254, 74, 35, 0.1)',
            fill: true
        }]
    },
    options: {
        ...commonOptions,
        scales: { ...commonOptions.scales, y: { ...commonOptions.scales.y, min: 0, max: 8.0 } }
    }
});

// Update data functions
function updateChartData(chart, newValue) {
    const data = chart.data.datasets[0].data;
    data.push(newValue);
    data.shift();
    chart.update();
}

async function fetchMetrics() {
    try {
        const response = await fetch(`${API_URL}/metrics`);
        if (!response.ok) return;
        const data = await response.json();

        updateUI(data);
    } catch (err) {
        console.error('API Error:', err);
    }
}

function updateUI(data) {
    // Risk Score
    elements.riskScore.textContent = data.risk_score;

    if (data.risk_score > 70) {
        elements.riskCard.classList.add('glow-red');
        elements.riskStatus.textContent = 'CRITICAL THREAT DETECTED';
        elements.riskStatus.classList.remove('text-brand');
        elements.riskStatus.classList.add('text-red-500', 'font-bold');

        if (!isAlertActive) {
            showAlertModal(data.suspicious_processes);
        }
    } else if (data.risk_score > 30) {
        elements.riskCard.classList.remove('glow-red');
        elements.riskStatus.textContent = 'Elevated Risk';
        elements.riskStatus.classList.add('text-brand');
        elements.riskStatus.classList.remove('text-red-500', 'font-bold');
    } else {
        elements.riskCard.classList.remove('glow-red');
        elements.riskStatus.textContent = 'Normal Behavior';
        elements.riskStatus.classList.add('text-brand');
        elements.riskStatus.classList.remove('text-red-500', 'font-bold');
    }

    // Mod rate
    elements.modRate.textContent = data.modified_files_per_sec.toFixed(1);
    const barWidth = Math.min(100, Math.max(5, (data.modified_files_per_sec / 50) * 100));
    elements.modBar.style.width = `${barWidth}%`;
    if (data.modified_files_per_sec > 20) {
        elements.modBar.style.backgroundColor = '#FE4A23';
    } else {
        elements.modBar.style.backgroundColor = '#8D5CFC';
    }

    // Entropy
    elements.entropyVal.textContent = data.entropy.toFixed(2);
    if (data.entropy > 7.5) {
        elements.entropyVal.classList.add('text-red-500');
    } else {
        elements.entropyVal.classList.remove('text-red-500');
    }

    // CPU Text
    elements.cpuVal.textContent = data.cpu_usage.toFixed(1) + '%';

    // Charts
    updateChartData(cpuChart, data.cpu_usage);
    updateChartData(entropyChart, data.entropy);

    // Suspicious Table
    updateSuspiciousTable(data.suspicious_processes);
}

function updateSuspiciousTable(processes) {
    if (!processes || processes.length === 0) {
        elements.suspiciousTableBody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-gray-500">No suspicious processes detected</td></tr>`;
        return;
    }

    let html = '';
    processes.forEach(p => {
        const isSuspended = p.status === 'suspended';
        html += `
            <tr class="border-b border-border/50 hover:bg-white/5 transition-colors">
                <td class="p-3 font-mono text-gray-400">${p.pid}</td>
                <td class="p-3 font-semibold text-white">${p.name}</td>
                <td class="p-3 text-accent">${p.cpu.toFixed(1)}%</td>
                <td class="p-3 text-brand">${p.suspicion_score}</td>
                <td class="p-3">
                    <span class="px-2 py-1 rounded text-xs font-semibold ${isSuspended ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'}">
                        ${isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                    </span>
                </td>
                <td class="p-3 text-right">
                    <div class="flex items-center justify-end gap-2">
                        <button onclick="suspendProcess(${p.pid})" class="px-3 py-1 bg-card hover:bg-white/10 border border-border rounded text-xs transition-colors" ${isSuspended ? 'disabled style="opacity:0.5"' : ''}>Suspend</button>
                        <button onclick="killProcess(${p.pid})" class="px-3 py-1 bg-brand text-dark hover:bg-opacity-90 rounded text-xs font-bold transition-colors">Kill</button>
                    </div>
                </td>
            </tr>
        `;
    });
    elements.suspiciousTableBody.innerHTML = html;
}

// Actions
function showAlertModal(processes) {
    isAlertActive = true;
    currentSuspiciousPids = processes.map(p => p.pid);
    elements.alertModal.classList.remove('hidden');
}

function hideAlertModal() {
    isAlertActive = false;
    elements.alertModal.classList.add('hidden');
}

async function suspendProcess(pid) {
    try {
        await fetch(`${API_URL}/process/suspend/${pid}`, { method: 'POST' });
        // UI updates on next poll
    } catch (e) {
        console.error('Suspension error', e);
    }
}

async function killProcess(pid) {
    try {
        await fetch(`${API_URL}/process/kill/${pid}`, { method: 'POST' });
        // UI updates on next poll
    } catch (e) {
        console.error('Kill error', e);
    }
}

// Modal Handlers
if (elements.btnModalKill) {
    elements.btnModalKill.addEventListener('click', () => {
        currentSuspiciousPids.forEach(pid => killProcess(pid));
        hideAlertModal();
    });
}
if (elements.btnModalSuspend) {
    elements.btnModalSuspend.addEventListener('click', () => {
        currentSuspiciousPids.forEach(pid => suspendProcess(pid));
        hideAlertModal();
    });
}
if (elements.btnModalIgnore) {
    elements.btnModalIgnore.addEventListener('click', () => {
        hideAlertModal();
    });
}

if (elements.scanBtn) {
    elements.scanBtn.addEventListener('click', async () => {
        try {
            await fetch(`${API_URL}/scan/run`, { method: 'POST' });
            alert("Quick scan initiated.");
        } catch (e) {
            console.error(e);
        }
    });
}

// Initial fetch and poll
fetchMetrics();
setInterval(fetchMetrics, 1000);
