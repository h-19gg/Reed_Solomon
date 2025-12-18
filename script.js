// ===== Configuration =====
const CONFIG = {
    // ⚠️ غيّر هذا السطر فقط ⚠️
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
    // Theme
    themeToggle: document.getElementById('themeToggle'),
    html: document.documentElement,
    
    // Loading
    loadingScreen: document.getElementById('loadingScreen'),
    
    // Mobile Menu
    menuToggle: document.getElementById('menuToggle'),
    closeMenu: document.getElementById('closeMenu'),
    mobileMenu: document.getElementById('mobileMenu'),
    mobileNavLinks: document.querySelectorAll('.mobile-nav-link'),
    
    // Sliders
    nsymSlider: document.getElementById('nsym'),
    nsymValue: document.getElementById('nsymValue'),
    errorRateSlider: document.getElementById('errorRate'),
    errorRateValue: document.getElementById('errorRateValue'),
    
    // Buttons
    encodeBtn: document.getElementById('encodeBtn'),
    simulateBtn: document.getElementById('simulateBtn'),
    copyResults: document.getElementById('copyResults'),
    clearResults: document.getElementById('clearResults'),
    exportResults: document.getElementById('exportResults'),
    backToTop: document.getElementById('backToTop'),
    
    // Error Type
    errorTypeButtons: document.querySelectorAll('.error-type-btn'),
    
    // Channel Type
    channelOptions: document.querySelectorAll('.channel-option'),
    
    // Tabs
    resultTabs: document.querySelectorAll('.result-tab'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // Data Display
    inputData: document.getElementById('inputData'),
    encodedData: document.getElementById('encodedData'),
    hexData: document.getElementById('hexData'),
    
    // Statistics
    originalLength: document.getElementById('originalLength'),
    encodedLength: document.getElementById('encodedLength'),
    parityBytes: document.getElementById('parityBytes'),
    overhead: document.getElementById('overhead'),
    
    // Simulation
    successRate: document.getElementById('successRate'),
    totalErrors: document.getElementById('totalErrors'),
    errorsCorrected: document.getElementById('errorsCorrected'),
    maxCorrectable: document.getElementById('maxCorrectable'),
    
    // Visualization
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
    
    // Initialize data visualizations
    initializeDataVisualizations();
    
    // Hide loading screen after everything is loaded
    setTimeout(() => {
        elements.loadingScreen.style.opacity = '0';
        setTimeout(() => {
            elements.loadingScreen.style.display = 'none';
        }, 500);
    }, 1000);
});

// ===== Theme Management =====
function initTheme() {
    // Apply saved theme
    elements.html.setAttribute('data-theme', state.currentTheme);
    updateThemeIcon();
    
    // Theme toggle event
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
    
    // Close menu when clicking on a link
    elements.mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            elements.mobileMenu.classList.remove('show');
        });
    });
    
    // Close menu when clicking outside
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
    // Sliders
    elements.nsymSlider.addEventListener('input', updateNsymValue);
    elements.errorRateSlider.addEventListener('input', updateErrorRateValue);
    
    // Buttons
    elements.encodeBtn.addEventListener('click', handleEncode);
    elements.simulateBtn.addEventListener('click', handleSimulate);
    elements.copyResults.addEventListener('click', copyResultsToClipboard);
    elements.clearResults.addEventListener('click', clearResults);
    elements.exportResults.addEventListener('click', exportResults);
    
    // Error type buttons
    elements.errorTypeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.errorTypeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.errorType = btn.dataset.type;
        });
    });
    
    // Channel type options
    elements.channelOptions.forEach(option => {
        option.addEventListener('click', () => {
            elements.channelOptions.forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            state.channelType = option.querySelector('span').textContent;
        });
    });
    
    // Tabs
    elements.resultTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            switchTab(tabId);
        });
    });
    
    // Back to top
    elements.backToTop.addEventListener('click', scrollToTop);
    window.addEventListener('scroll', toggleBackToTop);
    
    // Navigation links - smooth scroll
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
    
    // Initialize stats counter animation
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
    // Update active tab
    elements.resultTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabId);
    });
    
    // Show active content
    elements.tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabId}Tab`);
    });
    
    // If hex tab, convert data to hex
    if (tabId === 'hex' && state.encodedData) {
        updateHexDisplay();
    }
}

// ===== Data Visualizations =====
function initializeDataVisualizations() {
    // Create sample data for initial display
    const sampleData = 'نظام Reed-Solomon';
    
    for (let i = 0; i < 8; i++) {
        // Original visualization
        const originalBit = document.createElement('div');
        originalBit.className = 'data-bit correct';
        originalBit.textContent = Math.random() > 0.5 ? '1' : '0';
        elements.originalVisual.appendChild(originalBit);
        
        // Encoded visualization
        const encodedBit = document.createElement('div');
        encodedBit.className = i < 6 ? 'data-bit correct' : 'data-bit parity';
        encodedBit.textContent = i < 6 ? (Math.random() > 0.5 ? '1' : '0') : 'P';
        elements.encodedVisual.appendChild(encodedBit);
        
        // Corrupted visualization
        const corruptedBit = document.createElement('div');
        corruptedBit.className = i === 2 ? 'data-bit error' : 'data-bit correct';
        corruptedBit.textContent = i === 2 ? (Math.random() > 0.5 ? '0' : '1') : (Math.random() > 0.5 ? '1' : '0');
        elements.corruptedVisual.appendChild(corruptedBit);
        
        // Corrected visualization
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
        // Show loading state
        setButtonLoading(elements.encodeBtn, true);
        
        // Call API
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/encode`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: inputData,
                nsym: nsym
            })
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            state.encodedData = result.data.encoded.base64;
            
            // Update UI
            updateEncodingResults(result);
            updateEncodedVisualization(result);
            
            showNotification('تم ترميز البيانات بنجاح!', 'success');
        } else {
            throw new Error(result.error?.message || 'حدث خطأ في الترميز');
        }
    } catch (error) {
        console.error('Encoding error:', error);
        
        // Fallback to local simulation if API is not available
        if (error.message.includes('Failed to fetch')) {
            showNotification('السيرفر غير متوصل، جاري استخدام المحاكاة المحلية...', 'warning');
            simulateLocalEncoding(inputData, nsym);
        } else {
            showNotification(`خطأ: ${error.message}`, 'error');
        }
    } finally {
        setButtonLoading(elements.encodeBtn, false);
    }
}

function simulateLocalEncoding(inputData, nsym) {
    // Local simulation for demo purposes
    const originalLength = inputData.length;
    const encodedLength = originalLength + nsym;
    const overhead = ((encodedLength - originalLength) / originalLength * 100).toFixed(2);
    
    // Generate simulated encoded data
    const simulatedEncoded = btoa(encodeURIComponent(inputData)) + '_' + 'P'.repeat(nsym);
    
    state.encodedData = simulatedEncoded;
    
    const simulatedResult = {
        data: {
            original: {
                length_bytes: originalLength
            },
            encoded: {
                base64: simulatedEncoded,
                length_bytes: encodedLength
            },
            correction: {
                parity_bytes: nsym
            },
            efficiency: {
                overhead_percentage: overhead
            }
        }
    };
    
    updateEncodingResults(simulatedResult);
    updateEncodedVisualization(simulatedResult);
    
    showNotification('تم الترميز باستخدام المحاكاة المحلية', 'info');
}

function updateEncodingResults(result) {
    const data = result.data;
    
    // Update encoded data display
    elements.encodedData.innerHTML = `
        <div class="encoded-content">
            <div class="encoded-header">
                <span class="badge">Base64</span>
                <span class="data-size">${data.encoded.length_bytes} بايت</span>
            </div>
            <div class="encoded-text">${data.encoded.base64.substring(0, 200)}${data.encoded.base64.length > 200 ? '...' : ''}</div>
            <div class="encoded-footer">
                <small>${data.encoded.base64.length} حرف</small>
            </div>
        </div>
    `;
    
    // Update statistics
    elements.originalLength.textContent = `${data.original.length_bytes} بايت`;
    elements.encodedLength.textContent = `${data.encoded.length_bytes} بايت`;
    elements.parityBytes.textContent = `${data.correction.parity_bytes} بايت`;
    elements.overhead.textContent = `${data.efficiency.overhead_percentage}%`;
    
    // Switch to encoded tab
    switchTab('encoded');
}

function updateEncodedVisualization(result) {
    const inputData = elements.inputData.value;
    const nsym = parseInt(elements.nsymSlider.value);
    
    // Clear existing visualization
    elements.encodedVisual.innerHTML = '';
    
    // Create data bits visualization
    for (let i = 0; i < Math.min(inputData.length, 12); i++) {
        const charCode = inputData.charCodeAt(i);
        const bits = charCode.toString(2).padStart(8, '0');
        
        const dataBit = document.createElement('div');
        dataBit.className = 'data-bit correct';
        dataBit.textContent = bits.charAt(0);
        dataBit.style.animationDelay = `${i * 0.1}s`;
        elements.encodedVisual.appendChild(dataBit);
    }
    
    // Add parity bits
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
        // Convert base64 to hex for demo
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
        // Show loading state
        setButtonLoading(elements.simulateBtn, true);
        
        // Call API
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/simulate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: inputData,
                nsym: nsym,
                error_rate: errorRate,
                error_type: state.errorType,
                channel_type: state.channelType
            })
        });
        
        const result = await response.json();
        
        if (result.status === 'success' || result.status === 'partial') {
            state.simulationResults = result;
            
            // Update UI
            updateSimulationResults(result);
            updateSimulationVisualization(result);
            
            const message = result.status === 'success' 
                ? `تمت المحاكاة بنجاح! ${result.simulation.summary.success_rate}`
                : `تمت المحاكاة جزئياً: ${result.simulation.summary.success_rate}`;
            
            showNotification(message, result.status === 'success' ? 'success' : 'warning');
        } else {
            throw new Error(result.error?.message || 'حدث خطأ في المحاكاة');
        }
    } catch (error) {
        console.error('Simulation error:', error);
        
        // Fallback to local simulation
        if (error.message.includes('Failed to fetch')) {
            showNotification('السيرفر غير متوصل، جاري استخدام المحاكاة المحلية...', 'warning');
            simulateLocalTransmission(inputData, nsym, errorRate);
        } else {
            showNotification(`خطأ: ${error.message}`, 'error');
        }
    } finally {
        setButtonLoading(elements.simulateBtn, false);
    }
}

function simulateLocalTransmission(inputData, nsym, errorRate) {
    // Local simulation for demo purposes
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
    const summary = result.simulation.summary;
    
    elements.successRate.textContent = `${summary.success_rate}%`;
    elements.totalErrors.textContent = summary.errors_introduced;
    elements.errorsCorrected.textContent = summary.errors_corrected;
    elements.maxCorrectable.textContent = summary.max_correctable;
}

function updateSimulationVisualization(result) {
    const inputData = elements.inputData.value;
    const errorPositions = result.error_positions || [];
    const wasSuccessful = result.simulation.summary.was_successful;
    
    // Clear existing visualizations
    elements.originalVisual.innerHTML = '';
    elements.corruptedVisual.innerHTML = '';
    elements.correctedVisual.innerHTML = '';
    
    // Update original visualization
    for (let i = 0; i < Math.min(inputData.length, 12); i++) {
        const charCode = inputData.charCodeAt(i);
        const bits = charCode.toString(2).padStart(8, '0');
        
        const originalBit = document.createElement('div');
        originalBit.className = 'data-bit correct';
        originalBit.textContent = bits.charAt(0);
        originalBit.style.animationDelay = `${i * 0.1}s`;
        elements.originalVisual.appendChild(originalBit);
    }
    
    // Update corrupted visualization
    for (let i = 0; i < Math.min(inputData.length, 12); i++) {
        const charCode = inputData.charCodeAt(i);
        const bits = charCode.toString(2).padStart(8, '0');
        const isError = errorPositions.includes(i);
        
        const corruptedBit = document.createElement('div');
        corruptedBit.className = isError ? 'data-bit error' : 'data-bit correct';
        corruptedBit.textContent = isError ? (bits.charAt(0) === '1' ? '0' : '1') : bits.charAt(0);
        corruptedBit.style.animationDelay = `${i * 0.1}s`;
        elements.corruptedVisual.appendChild(corruptedBit);
    }
    
    // Update corrected visualization
    for (let i = 0; i < Math.min(inputData.length, 12); i++) {
        const charCode = inputData.charCodeAt(i);
        const bits = charCode.toString(2).padStart(8, '0');
        const wasError = errorPositions.includes(i);
        
        const correctedBit = document.createElement('div');
        correctedBit.className = wasError && wasSuccessful ? 'data-bit success' : 'data-bit correct';
        correctedBit.textContent = bits.charAt(0);
        
        if (wasError && wasSuccessful) {
            const checkMark = document.createElement('span');
            checkMark.textContent = ' ✓';
            checkMark.style.fontSize = '0.8em';
            checkMark.style.color = 'var(--success)';
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
        // Fallback for older browsers
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
    
    // Reset displays
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
    
    // Clear simulation
    elements.successRate.textContent = '100%';
    elements.totalErrors.textContent = '0';
    elements.errorsCorrected.textContent = '0';
    
    // Reset visualization to initial state
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
    
    // Update active navigation link
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
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ===== Notification System =====
function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    // Create notification
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
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getComputedStyle(document.documentElement).getPropertyValue(`--${type}`)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius-lg);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        box-shadow: var(--shadow-lg);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;
    
    // Close button
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
    
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.opacity = '1';
    });
    
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.opacity = '0.7';
    });
    
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    });
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .data-bit.success {
        background: var(--success) !important;
        color: white !important;
    }
    
    .notification {
        font-family: 'Tajawal', sans-serif;
    }
`;
document.head.appendChild(style);

// ===== Helper Functions =====
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 بايت';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Initialize AOS animations if available
if (typeof AOS !== 'undefined') {
    AOS.init({
        duration: 800,
        once: true,
        offset: 100
    });

}
