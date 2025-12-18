// ===== Configuration =====
const CONFIG = {
    API_BASE_URL: 'https://read-solomon-git-main-eng-hussein-fahime-projects.vercel.app/api',
    DEFAULT_NSYM: 10,
    DEFAULT_ERROR_RATE: 15,
    DEVELOPER: {
        name: "المهندس حسين فاهم الخزعلي",
        email: "husseinfaheem6@gmail.com",
        phone: "07716167814"
    }
};

// ===== State Management =====
let state = {
    currentTheme: localStorage.getItem('theme') || 'light',
    encodedData: null,
    simulationResults: null,
    errorType: 'random',
    channelType: 'wireless'
};

// ===== DOM Elements =====
const elements = {
    themeToggle: document.getElementById('themeToggle'),
    html: document.documentElement,
    loadingScreen: document.getElementById('loadingScreen'),
    menuToggle: document.getElementById('menuToggle'),
    closeMenu: document.getElementById('closeMenu'),
    mobileMenu: document.getElementById('mobileMenu'),
    mobileNavLinks: document.querySelectorAll('.mobile-nav-link'),
    nsymSlider: document.getElementById('nsym'),
    nsymValue: document.getElementById('nsymValue'),
    errorRateSlider: document.getElementById('errorRate'),
    errorRateValue: document.getElementById('errorRateValue'),
    encodeBtn: document.getElementById('encodeBtn'),
    simulateBtn: document.getElementById('simulateBtn'),
    copyResults: document.getElementById('copyResults'),
    clearResults: document.getElementById('clearResults'),
    exportResults: document.getElementById('exportResults'),
    backToTop: document.getElementById('backToTop'),
    errorTypeButtons: document.querySelectorAll('.error-type-btn'),
    channelOptions: document.querySelectorAll('.channel-option'),
    resultTabs: document.querySelectorAll('.result-tab'),
    tabContents: document.querySelectorAll('.tab-content'),
    inputData: document.getElementById('inputData'),
    encodedData: document.getElementById('encodedData'),
    hexData: document.getElementById('hexData'),
    originalLength: document.getElementById('originalLength'),
    encodedLength: document.getElementById('encodedLength'),
    parityBytes: document.getElementById('parityBytes'),
    overhead: document.getElementById('overhead'),
    successRate: document.getElementById('successRate'),
    totalErrors: document.getElementById('totalErrors'),
    errorsCorrected: document.getElementById('errorsCorrected'),
    maxCorrectable: document.getElementById('maxCorrectable'),
    originalVisual: document.getElementById('originalVisual'),
    encodedVisual: document.getElementById('encodedVisual'),
    corruptedVisual: document.getElementById('corruptedVisual'),
    correctedVisual: document.getElementById('correctedVisual')
};

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initEventListeners();
    initMobileMenu();
    updateNsymValue();
    updateErrorRateValue();
    updateMaxCorrectable();
    initializeDataVisualizations();
    
    setTimeout(() => {
        elements.loadingScreen.style.opacity = '0';
        setTimeout(() => {
            elements.loadingScreen.style.display = 'none';
        }, 500);
    }, 1000);
});

// ===== Theme Management =====
function initTheme() {
    elements.html.setAttribute('data-theme', state.currentTheme);
    updateThemeIcon();
    elements.themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    state.currentTheme = state.currentTheme === 'light' ? 'dark' : 'light';
    elements.html.setAttribute('data-theme', state.currentTheme);
    localStorage.setItem('theme', state.currentTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = elements.themeToggle.querySelector('i');
    icon.className = state.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ===== Mobile Menu =====
function initMobileMenu() {
    elements.menuToggle.addEventListener('click', () => {
        elements.mobileMenu.classList.add('show');
    });
    
    elements.closeMenu.addEventListener('click', () => {
        elements.mobileMenu.classList.remove('show');
    });
    
    elements.mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            elements.mobileMenu.classList.remove('show');
        });
    });
    
    document.addEventListener('click', (event) => {
        if (!elements.mobileMenu.contains(event.target) && 
            !elements.menuToggle.contains(event.target) &&
            elements.mobileMenu.classList.contains('show')) {
            elements.mobileMenu.classList.remove('show');
        }
    });
}

// ===== Event Listeners =====
function initEventListeners() {
    elements.nsymSlider.addEventListener('input', updateNsymValue);
    elements.errorRateSlider.addEventListener('input', updateErrorRateValue);
    elements.encodeBtn.addEventListener('click', handleEncode);
    elements.simulateBtn.addEventListener('click', handleSimulate);
    elements.copyResults.addEventListener('click', copyResultsToClipboard);
    elements.clearResults.addEventListener('click', clearResults);
    elements.exportResults.addEventListener('click', exportResults);
    
    elements.errorTypeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.errorTypeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.errorType = btn.dataset.type;
        });
    });
    
    elements.channelOptions.forEach(option => {
        option.addEventListener('click', () => {
            elements.channelOptions.forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            state.channelType = option.querySelector('span').textContent;
        });
    });
    
    elements.resultTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            switchTab(tabId);
        });
    });
    
    elements.backToTop.addEventListener('click', scrollToTop);
    window.addEventListener('scroll', toggleBackToTop);
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    initStatsCounter();
}

// ===== UI Updates =====
function updateNsymValue() {
    const value = elements.nsymSlider.value;
    elements.nsymValue.textContent = value;
    updateMaxCorrectable();
}

function updateErrorRateValue() {
    const value = elements.errorRateSlider.value;
    elements.errorRateValue.textContent = `${value}%`;
}

function updateMaxCorrectable() {
    const nsym = parseInt(elements.nsymSlider.value);
    const max = Math.floor(nsym / 2);
    elements.maxCorrectable.textContent = max;
}

function switchTab(tabId) {
    elements.resultTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabId);
    });
    
    elements.tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabId}Tab`);
    });
    
    if (tabId === 'hex' && state.encodedData) {
        updateHexDisplay();
    }
}

// ===== Data Visualizations =====
function initializeDataVisualizations() {
    for (let i = 0; i < 8; i++) {
        const originalBit = document.createElement('div');
        originalBit.className = 'data-bit correct';
        originalBit.textContent = Math.random() > 0.5 ? '1' : '0';
        elements.originalVisual.appendChild(originalBit);
        
        const encodedBit = document.createElement('div');
        encodedBit.className = i < 6 ? 'data-bit correct' : 'data-bit parity';
        encodedBit.textContent = i < 6 ? (Math.random() > 0.5 ? '1' : '0') : 'P';
        elements.encodedVisual.appendChild(encodedBit);
        
        const corruptedBit = document.createElement('div');
        corruptedBit.className = i === 2 ? 'data-bit error' : 'data-bit correct';
        corruptedBit.textContent = i === 2 ? (Math.random() > 0.5 ? '0' : '1') : (Math.random() > 0.5 ? '1' : '0');
        elements.corruptedVisual.appendChild(corruptedBit);
        
        const correctedBit = document.createElement('div');
        correctedBit.className = 'data-bit correct';
        correctedBit.textContent = Math.random() > 0.5 ? '1' : '0';
        elements.correctedVisual.appendChild(correctedBit);
    }
}

// ===== Encoding Functions =====
async function handleEncode() {
    const inputData = elements.inputData.value.trim();
    const nsym = parseInt(elements.nsymSlider.value);
    
    if (!inputData) {
        showNotification('الرجاء إدخال نص للترميز', 'error');
        return;
    }
    
    try {
        setButtonLoading(elements.encodeBtn, true);
        
        // ⚠️ التعديل المهم: nsym → ecc_symbols
        const response = await fetch(`${CONFIG.API_BASE_URL}/encode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: inputData,
                ecc_symbols: nsym  // ✅ تم التعديل
            })
        });
        
        const result = await response.json();
        
        if (result.status === 'success' || result.data) {
            state.encodedData = result.data?.encoded?.base64 || result.encoded_data;
            updateEncodingResults(result);
            updateEncodedVisualization(result);
            showNotification('تم ترميز البيانات بنجاح!', 'success');
        } else {
            throw new Error(result.error?.message || 'حدث خطأ في الترميز');
        }
    } catch (error) {
        console.error('Encoding error:', error);
        
        if (error.message.includes('Failed to fetch')) {
            showNotification('السيرفر غير متصل، جاري استخدام المحاكاة المحلية...', 'warning');
            simulateLocalEncoding(inputData, nsym);
        } else {
            showNotification(`خطأ: ${error.message}`, 'error');
        }
    } finally {
        setButtonLoading(elements.encodeBtn, false);
    }
}

function simulateLocalEncoding(inputData, nsym) {
    const originalLength = inputData.length;
    const encodedLength = originalLength + nsym;
    const overhead = ((encodedLength - originalLength) / originalLength * 100).toFixed(2);
    const simulatedEncoded = btoa(encodeURIComponent(inputData)) + '_' + 'P'.repeat(nsym);
    
    state.encodedData = simulatedEncoded;
    
    const simulatedResult = {
        data: {
            original: { length_bytes: originalLength },
            encoded: { base64: simulatedEncoded, length_bytes: encodedLength },
            correction: { parity_bytes: nsym },
            efficiency: { overhead_percentage: overhead }
        }
    };
    
    updateEncodingResults(simulatedResult);
    updateEncodedVisualization(simulatedResult);
    showNotification('تم الترميز باستخدام المحاكاة المحلية', 'info');
}

function updateEncodingResults(result) {
    const data = result.data || result;
    
    elements.encodedData.innerHTML = `
        <div class="encoded-content">
            <div class="encoded-header">
                <span class="badge">Base64</span>
                <span class="data-size">${data.encoded?.length_bytes || data.length || 'N/A'} بايت</span>
            </div>
            <div class="encoded-text">${(data.encoded?.base64 || state.encodedData || '').substring(0, 200)}${(data.encoded?.base64 || state.encodedData || '').length > 200 ? '...' : ''}</div>
            <div class="encoded-footer">
                <small>${(data.encoded?.base64 || state.encodedData || '').length} حرف</small>
            </div>
        </div>
    `;
    
    elements.originalLength.textContent = `${data.original?.length_bytes || data.original_length || '--'} بايت`;
    elements.encodedLength.textContent = `${data.encoded?.length_bytes || data.encoded_length || '--'} بايت`;
    elements.parityBytes.textContent = `${data.correction?.parity_bytes || data.ecc_symbols || '--'} بايت`;
    elements.overhead.textContent = `${data.efficiency?.overhead_percentage || '--'}%`;
    switchTab('encoded');
}

function updateEncodedVisualization(result) {
    const inputData = elements.inputData.value;
    const nsym = parseInt(elements.nsymSlider.value);
    
    elements.encodedVisual.innerHTML = '';
    
    for (let i = 0; i < Math.min(inputData.length, 12); i++) {
        const charCode = inputData.charCodeAt(i);
        const bits = charCode.toString(2).padStart(8, '0');
        const dataBit = document.createElement('div');
        dataBit.className = 'data-bit correct';
        dataBit.textContent = bits.charAt(0);
        dataBit.style.animationDelay = `${i * 0.1}s`;
        elements.encodedVisual.appendChild(dataBit);
    }
    
    for (let i = 0; i < Math.min(nsym, 4); i++) {
        const parityBit = document.createElement('div');
        parityBit.className = 'data-bit parity';
        parityBit.textContent = 'P';
        parityBit.style.animationDelay = `${(inputData.length + i) * 0.1}s`;
        elements.encodedVisual.appendChild(parityBit);
    }
}

function updateHexDisplay() {
    if (!state.encodedData) {
        elements.hexData.innerHTML = `
            <div class="placeholder">
                <i class="fas fa-exclamation-triangle"></i>
                <p>لا توجد بيانات مشفرة للعرض</p>
            </div>
        `;
        return;
    }
    
    try {
        const hexString = Array.from(state.encodedData.substring(0, 50))
            .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
            .join(' ');
        
        elements.hexData.innerHTML = `
            <div class="hex-content">
                <div class="hex-header">
                    <span class="badge">Hexadecimal</span>
                    <span class="data-size">${Math.ceil(hexString.length / 3)} بايت</span>
                </div>
                <div class="hex-text">${hexString}${state.encodedData.length > 50 ? '...' : ''}</div>
                <div class="hex-footer">
                    <small>قيمة تجريبية للعرض فقط</small>
                </div>
            </div>
        `;
    } catch (error) {
        elements.hexData.innerHTML = `
            <div class="placeholder">
                <i class="fas fa-exclamation-triangle"></i>
                <p>تعذر تحويل البيانات إلى تنسيق Hex</p>
            </div>
        `;
    }
}

// ===== Simulation Functions =====
async function handleSimulate() {
    const inputData = elements.inputData.value.trim();
    const nsym = parseInt(elements.nsymSlider.value);
    const errorRate = parseInt(elements.errorRateSlider.value) / 100;
    
    if (!inputData) {
        showNotification('الرجاء إدخال نص أولاً في قسم الترميز', 'error');
        return;
    }
    
    if (!state.encodedData) {
        showNotification('الرجاء ترميز البيانات أولاً', 'error');
        return;
    }
    
    try {
        setButtonLoading(elements.simulateBtn, true);
        
        // ⚠️ التعديل المهم: data → encoded_data, nsym → ecc_symbols
        const response = await fetch(`${CONFIG.API_BASE_URL}/simulate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                encoded_data: state.encodedData,  // ✅ تم التعديل
                ecc_symbols: nsym,                // ✅ تم التعديل
                error_rate: errorRate,
                error_type: state.errorType,
                channel_type: state.channelType
            })
        });
        
        const result = await response.json();
        
        if (result.status === 'success' || result.status === 'partial' || result.simulation) {
            state.simulationResults = result;
            updateSimulationResults(result);
            updateSimulationVisualization(result);
            
            const message = result.status === 'success' 
                ? `تمت المحاكاة بنجاح! ${result.simulation?.summary?.success_rate || '100%'}`
                : `تمت المحاكاة جزئياً: ${result.simulation?.summary?.success_rate || result.success_rate || 'N/A'}`;
            
            showNotification(message, result.status === 'success' ? 'success' : 'warning');
        } else {
            throw new Error(result.error?.message || 'حدث خطأ في المحاكاة');
        }
    } catch (error) {
        console.error('Simulation error:', error);
        
        if (error.message.includes('Failed to fetch')) {
            showNotification('السيرفر غير متصل، جاري استخدام المحاكاة المحلية...', 'warning');
            simulateLocalTransmission(inputData, nsym, errorRate);
        } else {
            showNotification(`خطأ: ${error.message}`, 'error');
        }
    } finally {
        setButtonLoading(elements.simulateBtn, false);
    }
}

function simulateLocalTransmission(inputData, nsym, errorRate) {
    const errorsIntroduced = Math.floor(inputData.length * errorRate);
    const errorsCorrected = Math.min(errorsIntroduced, Math.floor(nsym / 2));
    const successRate = (errorsCorrected / Math.max(1, errorsIntroduced)) * 100;
    
    const simulatedResult = {
        status: errorsCorrected >= errorsIntroduced ? 'success' : 'partial',
        simulation: {
            summary: {
                was_successful: errorsCorrected >= errorsIntroduced,
                data_recovered: true,
                success_rate: successRate.toFixed(2),
                errors_introduced: errorsIntroduced,
                errors_corrected: errorsCorrected,
                errors_remaining: errorsIntroduced - errorsCorrected,
                max_correctable: Math.floor(nsym / 2)
            }
        },
        error_positions: Array.from({length: Math.min(errorsIntroduced, 10)}, (_, i) => i * 2)
    };
    
    state.simulationResults = simulatedResult;
    updateSimulationResults(simulatedResult);
    updateSimulationVisualization(simulatedResult);
    showNotification('تمت المحاكاة باستخدام المحاكاة المحلية', 'info');
}

function updateSimulationResults(result) {
    const summary = result.simulation?.summary || result;
    
    elements.successRate.textContent = `${summary.success_rate || '100'}%`;
    elements.totalErrors.textContent = summary.errors_introduced || '0';
    elements.errorsCorrected.textContent = summary.errors_corrected || '0';
    elements.maxCorrectable.textContent = summary.max_correctable || Math.floor(parseInt(elements.nsymSlider.value) / 2);
}

function updateSimulationVisualization(result) {
    const inputData = elements.inputData.value;
    const errorPositions = result.error_positions || [];
    const wasSuccessful = result.simulation?.summary?.was_successful || true;
    
    elements.originalVisual.innerHTML = '';
    elements.corruptedVisual.innerHTML = '';
    elements.correctedVisual.innerHTML = '';
    
    for (let i = 0; i < Math.min(inputData.length, 12); i++) {
        const charCode = inputData.charCodeAt(i);
        const bits = charCode.toString(2).padStart(8, '0');
        
        const originalBit = document.createElement('div');
        originalBit.className = 'data-bit correct';
        originalBit.textContent = bits.charAt(0);
        originalBit.style.animationDelay = `${i * 0.1}s`;
        elements.originalVisual.appendChild(originalBit);
        
        const corruptedBit = document.createElement('div');
        corruptedBit.className = errorPositions.includes(i) ? 'data-bit error' : 'data-bit correct';
        corruptedBit.textContent = errorPositions.includes(i) ? (bits.charAt(0) === '1' ? '0' : '1') : bits.charAt(0);
        corruptedBit.style.animationDelay = `${i * 0.1}s`;
        elements.corruptedVisual.appendChild(corruptedBit);
        
        const correctedBit = document.createElement('div');
        correctedBit.className = errorPositions.includes(i) && wasSuccessful ? 'data-bit success' : 'data-bit correct';
        correctedBit.textContent = bits.charAt(0);
        
        if (errorPositions.includes(i) && wasSuccessful) {
            const checkMark = document.createElement('span');
            checkMark.textContent = ' ✓';
            checkMark.style.fontSize = '0.8em';
            checkMark.style.color = '#27ae60';
            correctedBit.appendChild(checkMark);
        }
        
        correctedBit.style.animationDelay = `${i * 0.1}s`;
        elements.correctedVisual.appendChild(correctedBit);
    }
}

// ===== Utility Functions =====
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

async function copyResultsToClipboard() {
    if (!state.encodedData) {
        showNotification('لا توجد بيانات للنسخ', 'warning');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(state.encodedData);
        showNotification('تم نسخ البيانات إلى الحافظة', 'success');
    } catch (error) {
        const textArea = document.createElement('textarea');
        textArea.value = state.encodedData;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('تم نسخ البيانات إلى الحافظة', 'success');
    }
}

function clearResults() {
    state.encodedData = null;
    state.simulationResults = null;
    
    elements.encodedData.innerHTML = `
        <div class="placeholder">
            <i class="fas fa-code"></i>
            <p>ستظهر البيانات المشفرة هنا بعد الترميز</p>
        </div>
    `;
    
    elements.hexData.innerHTML = `
        <div class="placeholder">
            <i class="fas fa-memory"></i>
            <p>عرض البيانات بصيغة Hexadecimal</p>
        </div>
    `;
    
    elements.originalLength.textContent = '--';
    elements.encodedLength.textContent = '--';
    elements.parityBytes.textContent = '--';
    elements.overhead.textContent = '--';
    elements.successRate.textContent = '100%';
    elements.totalErrors.textContent = '0';
    elements.errorsCorrected.textContent = '0';
    
    elements.originalVisual.innerHTML = '';
    elements.encodedVisual.innerHTML = '';
    elements.corruptedVisual.innerHTML = '';
    elements.correctedVisual.innerHTML = '';
    initializeDataVisualizations();
    
    showNotification('تم مسح جميع النتائج', 'info');
}

function exportResults() {
    if (!state.simulationResults) {
        showNotification('لا توجد نتائج للتصدير', 'warning');
        return;
    }
    
    try {
        const data = {
            timestamp: new Date().toISOString(),
            developer: CONFIG.DEVELOPER,
            system: "Reed-Solomon Error Correction System",
            version: "2.0.0",
            ...state.simulationResults
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reed-solomon-simulation-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('تم تصدير النتائج بنجاح', 'success');
    } catch (error) {
        showNotification('تعذر تصدير النتائج', 'error');
    }
}

// ===== Animation Functions =====
function initStatsCounter() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-count'));
                animateCounter(counter, target);
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 30);
}

// ===== Scroll Functions =====
function toggleBackToTop() {
    if (window.scrollY > 300) {
        elements.backToTop.classList.add('show');
    } else {
        elements.backToTop.classList.remove('show');
    }
    
    updateActiveNavLink();
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== Notification System =====
function showNotification(message, type = 'info') {
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    
    notification.innerHTML = `
        <i class="fas fa-${icons[type]}"></i>
        <span>${message}</span>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#3498db'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
        font-family: 'Tajawal', sans-serif;
    `;
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        margin-right: -0.5rem;
        opacity: 0.7;
        transition: opacity 0.2s;
    `;
    
    closeBtn.addEventListener('mouseenter', () => closeBtn.style.opacity = '1');
    closeBtn.addEventListener('mouseleave', () => closeBtn.style.opacity = '0.7');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// ===== Helper Functions =====
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 بايت';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Add animation keyframes
if (!document.querySelector('#animation-styles')) {
    const style = document.createElement('style');
    style.id = 'animation-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .data-bit {
            width: 40px; height: 40px; border-radius: 4px;
            display: flex; align-items: center; justify-content: center;
            font-weight: bold; font-size: 0.875rem;
            transition: all 0.3s; animation: fadeIn 0.5s ease-out;
        }
        .data-bit.correct { background: #27ae60; color: white; }
        .data-bit.error { background: #e74c3c; color: white; animation: pulse 1s infinite; }
        .data-bit.parity { background: #f39c12; color: white; }
        .data-bit.success { background: #27ae60; color: white; position: relative; }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .notification { font-family: 'Tajawal', sans-serif; }
    `;
    document.head.appendChild(style);
}

// Initialize AOS animations if available
if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 800, once: true, offset: 100 });
}

// إضافة fetch timeout
window.fetchWithTimeout = function(url, options = {}, timeout = 10000) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeout)
        )
    ]);
};
