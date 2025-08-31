// Enhanced Financial Management System

let employees = [];
let partners = [];
let currentTheme = 'light';
let currentAccentColor = '#3b82f6';
let financialHistory = [];
let currentSection = 'dashboard';

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    loadData();
    setupEventListeners();
    setCurrentMonth();
    updateUI();
});

// Data Management
function loadData() {
    employees = JSON.parse(localStorage.getItem('employees')) || [];
    partners = JSON.parse(localStorage.getItem('partners')) || [];
    financialHistory = JSON.parse(localStorage.getItem('financialHistory')) || [];
}

function saveData() {
    localStorage.setItem('employees', JSON.stringify(employees));
    localStorage.setItem('partners', JSON.stringify(partners));
    localStorage.setItem('financialHistory', JSON.stringify(financialHistory));
}

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedAccentColor = localStorage.getItem('accentColor') || '#3b82f6';
    
    currentTheme = savedTheme;
    currentAccentColor = savedAccentColor;
    
    applyTheme();
    updateAccentColor();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    applyTheme();
}

function applyTheme() {
    document.body.className = currentTheme;
    
    const themeIcon = document.querySelector('.theme-toggle i');
    if (themeIcon) {
        themeIcon.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

function changeAccentColor(color) {
    currentAccentColor = color;
    localStorage.setItem('accentColor', color);
    updateAccentColor();
}

function updateAccentColor() {
    document.documentElement.style.setProperty('--accent-color', currentAccentColor);
}

// Navigation
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.main-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    
    currentSection = sectionName;
    
    // Close mobile menu
    closeMobileMenu();
    
    // Update section-specific content
    updateSectionContent(sectionName);
}

function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('mobile-open');
}

function closeMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.remove('mobile-open');
}

function updateSectionContent(sectionName) {
    switch(sectionName) {
        case 'history':
            updateHistoryList();
            break;
        case 'partners':
            updatePartnersList();
            break;
        case 'employees':
            updateEmployeesListAdvanced();
            break;
        case 'reports':
            // Reports will be generated on demand
            break;
    }
}

// Month Management
function setCurrentMonth() {
    const monthInput = document.getElementById('currentMonth');
    const now = new Date();
    const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    monthInput.value = currentMonth;
}

// Employee Management
function addEmployee() {
    const nameInput = document.getElementById('employeeName');
    const positionInput = document.getElementById('employeePosition');
    const salaryInput = document.getElementById('employeeSalary');
    const startDateInput = document.getElementById('employeeStartDate');
    
    const name = nameInput.value.trim();
    const position = positionInput.value.trim();
    const salary = parseFloat(salaryInput.value) || 0;
    const startDate = startDateInput.value;
    
    if (name && position && salary > 0 && startDate) {
        const employee = {
            id: Date.now(),
            name,
            position,
            salary,
            startDate,
            salaryHistory: [{
                salary,
                date: new Date().toISOString(),
                reason: 'Embauche initiale'
            }]
        };
        
        employees.push(employee);
        saveData();
        updateEmployeesListAdvanced();
        
        // Clear form
        nameInput.value = '';
        positionInput.value = '';
        salaryInput.value = '';
        startDateInput.value = '';
        
        showAlert('Employé ajouté avec succès', 'success');
    } else {
        showAlert('Veuillez remplir tous les champs', 'error');
    }
}

function removeEmployee(index) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
        employees.splice(index, 1);
        saveData();
        updateEmployeesListAdvanced();
        showAlert('Employé supprimé', 'success');
    }
}

function editEmployee(index) {
    const employee = employees[index];
    
    document.getElementById('editEmployeeIndex').value = index;
    document.getElementById('editEmployeeName').value = employee.name;
    document.getElementById('editEmployeePosition').value = employee.position;
    document.getElementById('editEmployeeSalary').value = employee.salary;
    
    document.getElementById('employeeModal').style.display = 'flex';
}

function closeEmployeeModal() {
    document.getElementById('employeeModal').style.display = 'none';
}

function updateEmployeesListAdvanced() {
    const container = document.getElementById('employeesList');
    
    if (employees.length === 0) {
        container.innerHTML = '<p class="no-employees">Aucun employé ajouté</p>';
        return;
    }
    
    container.innerHTML = employees.map((emp, index) => `
        <div class="employee-card">
            <div class="employee-header">
                <div class="employee-info">
                    <h4>${emp.name}</h4>
                    <span class="employee-position">${emp.position}</span>
                </div>
                <div class="employee-actions">
                    <button class="btn-edit" onclick="editEmployee(${index})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-remove" onclick="removeEmployee(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="employee-details">
                <div class="detail-item">
                    <span class="detail-label">Salaire actuel:</span>
                    <span class="detail-value">${formatCurrency(emp.salary)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Date d'embauche:</span>
                    <span class="detail-value">${formatDate(emp.startDate)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Historique des salaires:</span>
                    <span class="detail-value">${emp.salaryHistory.length} modification(s)</span>
                </div>
            </div>
            ${emp.salaryHistory.length > 1 ? `
                <div class="salary-history">
                    <h5>Historique des salaires:</h5>
                    ${emp.salaryHistory.slice(-3).reverse().map(history => `
                        <div class="history-item">
                            <span>${formatCurrency(history.salary)} - ${formatDate(history.date)}</span>
                            <small>${history.reason}</small>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Partner Management
function addPartner() {
    const nameInput = document.getElementById('partnerName');
    const shareInput = document.getElementById('partnerShare');
    const expensesInput = document.getElementById('partnerPersonalExpenses');
    
    const name = nameInput.value.trim();
    const share = parseFloat(shareInput.value) || 0;
    const personalExpenses = parseFloat(expensesInput.value) || 0;
    const gainsInput = document.getElementById('partnerPersonalGains');
const personalGains = parseFloat(gainsInput.value) || 0;
    if (name && share > 0) {
        const totalCurrentShares = partners.reduce((total, p) => total + p.share, 0);
        
        if (totalCurrentShares + share > 100) {
            showAlert('La somme des parts ne peut pas dépasser 100%', 'error');
            return;
        }
        
        const partner = {
            id: Date.now(),
            name,
            share,
            personalExpenses,
             personalGains
        };
        
        partners.push(partner);
        saveData();
        updatePartnersList();
        
        // Clear form
        nameInput.value = '';
        shareInput.value = '';
        expensesInput.value = '';
        gainsInput.value = '';
        
        showAlert('Associé ajouté avec succès', 'success');
    } else {
        showAlert('Veuillez remplir le nom et la part', 'error');
    }
}

function removePartner(index) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet associé ?')) {
        partners.splice(index, 1);
        saveData();
        updatePartnersList();
        showAlert('Associé supprimé', 'success');
    }
}

function editPartner(index) {
    const partner = partners[index];
    
    document.getElementById('editPartnerIndex').value = index;
    document.getElementById('editPartnerName').value = partner.name;
    document.getElementById('editPartnerShare').value = partner.share;
    document.getElementById('editPartnerPersonalExpenses').value = partner.personalExpenses;
    
    document.getElementById('partnerModal').style.display = 'flex';
}

function closePartnerModal() {
    document.getElementById('partnerModal').style.display = 'none';
}

function updatePartnersList() {
    const container = document.getElementById('partnersList');
    
    if (partners.length === 0) {
        container.innerHTML = '<p class="no-partners">Aucun associé ajouté</p>';
        return;
    }
    
    const totalShares = partners.reduce((total, p) => total + p.share, 0);
    
    container.innerHTML = `
        <div class="partners-summary">
            <div class="summary-item">
                <span>Total des parts: ${totalShares.toFixed(2)}%</span>
                <span class="remaining-shares ${100 - totalShares < 0 ? 'error' : ''}">(Restant: ${(100 - totalShares).toFixed(2)}%)</span>
            </div>
        </div>
        ${partners.map((partner, index) => `
            <div class="partner-card">
                <div class="partner-header">
                    <div class="partner-info">
                        <h4>${partner.name}</h4>
                        <span class="partner-share">${partner.share}% des bénéfices</span>
                    </div>
                    <div class="partner-actions">
                        <button class="btn-edit" onclick="editPartner(${index})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-remove" onclick="removePartner(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="partner-details">
                    <div class="detail-item">
                        <span class="detail-label">Dépenses personnelles:</span>
                        <span class="detail-value">${formatCurrency(partner.personalExpenses)}</span>
                    </div>
                </div>
            </div>
        `).join('')}
    `;
}

// History Management
function updateHistoryList() {
    const container = document.getElementById('historyList');
    
    if (financialHistory.length === 0) {
        container.innerHTML = '<p class="no-data">Aucun historique disponible</p>';
        return;
    }
    
    const sortedHistory = [...financialHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = sortedHistory.map((record, index) => `
        <div class="history-card">
            <div class="history-header">
                <div class="history-info">
                    <h4>${record.month}</h4>
                    <span class="history-date">${formatDate(record.date)}</span>
                </div>
                <div class="history-actions">
                    <button class="btn-view" onclick="viewHistoryDetails(${index})">
                        <i class="fas fa-eye"></i>
                        Voir
                    </button>
                    <button class="btn-remove" onclick="removeHistoryRecord(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="history-summary">
                <div class="summary-item">
                    <span class="summary-label">Revenus:</span>
                    <span class="summary-value positive">${formatCurrency(record.data.monthlyRevenue)}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Dépenses:</span>
                    <span class="summary-value negative">${formatCurrency(record.data.totalExpenses)}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Bénéfice:</span>
                    <span class="summary-value ${record.data.netProfit >= 0 ? 'positive' : 'negative'}">${formatCurrency(record.data.netProfit)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function clearHistory() {
    if (confirm('Êtes-vous sûr de vouloir supprimer tout l\'historique ?')) {
        financialHistory = [];
        saveData();
        updateHistoryList();
        showAlert('Historique supprimé', 'success');
    }
}

function removeHistoryRecord(index) {
    if (confirm('Supprimer cet enregistrement ?')) {
        const sortedHistory = [...financialHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
        const recordToRemove = sortedHistory[index];
        const originalIndex = financialHistory.findIndex(r => r.id === recordToRemove.id);
        
        financialHistory.splice(originalIndex, 1);
        saveData();
        updateHistoryList();
        showAlert('Enregistrement supprimé', 'success');
    }
}

// Calculations
function calculateFinancials(formData) {
    const monthlyRevenue = parseFloat(formData.get('monthlyRevenue')) || 0;
    const waterBill = parseFloat(formData.get('waterBill')) || 0;
    const electricityBill = parseFloat(formData.get('electricityBill')) || 0;
    const wifiBill = parseFloat(formData.get('wifiBill')) || 0;
    const otherExpenses = parseFloat(formData.get('otherExpenses')) || 0;
    
    const totalEmployeeSalaries = employees.reduce((total, emp) => total + emp.salary, 0);
    const totalExpenses = waterBill + electricityBill + wifiBill + otherExpenses + totalEmployeeSalaries;
    const netProfit = monthlyRevenue - totalExpenses;
    
    // Calculate partner profits
const partnerProfits = partners.map(partner => {
    const gross = netProfit * partner.share / 100;
    const partnerProfit = gross - partner.personalExpenses + partner.personalGains;
    return {
        ...partner,
        grossProfit: gross,
        netProfit: partnerProfit
    };
});
    return {
        monthlyRevenue,
        expenses: {
            waterBill,
            electricityBill,
            wifiBill,
            otherExpenses,
            otherExpensesDescription: formData.get('otherExpensesDescription') || ''
        },
        totalEmployeeSalaries,
        totalExpenses,
        netProfit,
        partnerProfits,
        employees: [...employees],
        partners: [...partners]
    };
}

// Form Submission
function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const monthInput = document.getElementById('currentMonth');
    const selectedMonth = monthInput.value;
    
    if (!selectedMonth) {
        showAlert('Veuillez sélectionner un mois', 'error');
        return;
    }
    
    const data = calculateFinancials(formData);
    
    // Save to history
    const historyRecord = {
        id: Date.now(),
        month: selectedMonth,
        date: new Date().toISOString(),
        data
    };
    
    // Remove existing record for the same month
    financialHistory = financialHistory.filter(record => record.month !== selectedMonth);
    financialHistory.push(historyRecord);
    saveData();
    
    displayResults(data);
    
    if (data.netProfit < 0) {
        showAlert('Attention: Perte financière détectée!', 'warning');
    } else {
        showAlert('Calcul effectué avec succès', 'success');
    }
}

// Display Results
function displayResults(data) {
    const resultsSection = document.getElementById('results');
    const expenseItems = [
        { label: 'Facture d\'eau:', value: formatCurrency(data.expenses.waterBill) },
        { label: 'Facture d\'électricité:', value: formatCurrency(data.expenses.electricityBill) },
        { label: 'Facture WiFi:', value: formatCurrency(data.expenses.wifiBill) },
        { label: `Autres dépenses - ${data.expenses.otherExpensesDescription}:`, value: formatCurrency(data.expenses.otherExpenses) }
    ];

    const profitClass = data.netProfit >= 0 ? 'positive' : 'negative';
    const profitIcon = data.netProfit >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';

    resultsSection.innerHTML = `
        <div class="results-container ${data.netProfit < 0 ? 'loss-alert' : ''}">
            <div class="results-header">
                <h2><i class="fas fa-chart-line"></i> Résultats Financiers</h2>
                <div class="results-actions">
                    <button onclick="printResults()" class="btn-secondary">
                        <i class="fas fa-print"></i> Imprimer
                    </button>
                    <button onclick="exportToPDF()" class="btn-secondary">
                        <i class="fas fa-file-pdf"></i> PDF
                    </button>
                </div>
            </div>
            
            ${data.netProfit < 0 ? `
                <div class="loss-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Attention: Perte financière détectée!</span>
                </div>
            ` : ''}
            
            <div class="results-grid">
                <div class="result-card">
                    <div class="result-header">
                        <i class="fas fa-dollar-sign result-icon positive"></i>
                        <h3>Revenu Total</h3>
                    </div>
                    <div class="result-value positive">${formatCurrency(data.monthlyRevenue)}</div>
                </div>
                
                <div class="result-card">
                    <div class="result-header">
                        <i class="fas fa-credit-card result-icon negative"></i>
                        <h3>Dépenses Totales</h3>
                    </div>
                    <div class="result-value negative">${formatCurrency(data.totalExpenses)}</div>
                </div>
                
                <div class="result-card ${profitClass}">
                    <div class="result-header">
                        <i class="fas ${profitIcon} result-icon ${profitClass}"></i>
                        <h3>Bénéfice Net</h3>
                    </div>
                    <div class="result-value ${profitClass}">${formatCurrency(data.netProfit)}</div>
                </div>
            </div>
            
            ${partners.length > 0 ? `
                <div class="partners-breakdown">
                    <h3><i class="fas fa-handshake"></i> Répartition par Associé</h3>
                    <div class="partners-results">
                        ${data.partnerProfits.map(partner => `
                            <div class="partner-result">
                                <div class="partner-result-header">
                                    <h4>${partner.name}</h4>
                                    <span class="partner-share">${partner.share}%</span>
                                </div>
                                <div class="partner-result-details">
                                    <div class="detail-row">
                                        <span>Bénéfice brut:</span>
                                        <span class="positive">${formatCurrency(partner.grossProfit)}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span>Dépenses personnelles:</span>
                                        <span class="negative">${formatCurrency(partner.personalExpenses)}</span>
                                    </div>
                                    <div class="detail-row">
    <span>Gains personnels:</span>
    <span class="positive">${formatCurrency(partner.personalGains)}</span>
</div>

                                    <div class="detail-row total">
                                        <span>Bénéfice net final:</span>
                                        <span class="${partner.netProfit >= 0 ? 'positive' : 'negative'}">${formatCurrency(partner.netProfit)}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="expenses-breakdown">
                <h3><i class="fas fa-list"></i> Détail des Dépenses</h3>
                <div class="expenses-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Catégorie</th>
                                <th>Description</th>
                                <th>Montant</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${expenseItems.map(item => `
                                <tr>
                                    <td>Dépenses</td>
                                    <td>${item.label.replace(':', '')}</td>
                                    <td class="negative">${item.value}</td>
                                </tr>
                            `).join('')}
                            ${employees.map(emp => `
                                <tr>
                                    <td>Salaires</td>
                                    <td>${emp.name} - ${emp.position}</td>
                                    <td class="negative">${formatCurrency(emp.salary)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Reports
function generateReport() {
    const reportType = document.getElementById('reportType').value;
    const reportContent = document.getElementById('reportContent');
    
    switch(reportType) {
        case 'monthly':
            generateMonthlyReport(reportContent);
            break;
        case 'yearly':
            generateYearlyReport(reportContent);
            break;
        case 'comparison':
            generateComparisonReport(reportContent);
            break;
    }
}

function generateMonthlyReport(container) {
    if (financialHistory.length === 0) {
        container.innerHTML = '<p class="no-data">Aucune donnée disponible pour générer un rapport</p>';
        return;
    }
    
    const latestRecord = financialHistory[financialHistory.length - 1];
    const data = latestRecord.data;
    
    container.innerHTML = `
        <div class="report-card">
            <h3>Rapport Mensuel - ${latestRecord.month}</h3>
            <div class="report-metrics">
                <div class="metric">
                    <span class="metric-label">Revenus</span>
                    <span class="metric-value positive">${formatCurrency(data.monthlyRevenue)}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Dépenses</span>
                    <span class="metric-value negative">${formatCurrency(data.totalExpenses)}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Marge</span>
                    <span class="metric-value">${((data.netProfit / data.monthlyRevenue) * 100).toFixed(1)}%</span>
                </div>
            </div>
        </div>
    `;
}

function generateYearlyReport(container) {
    const currentYear = new Date().getFullYear();
    const yearlyData = financialHistory.filter(record => 
        record.month.startsWith(currentYear.toString())
    );
    
    if (yearlyData.length === 0) {
        container.innerHTML = `<p class="no-data">Aucune donnée disponible pour l'année ${currentYear}</p>`;
        return;
    }
    
    const totalRevenue = yearlyData.reduce((sum, record) => sum + record.data.monthlyRevenue, 0);
    const totalExpenses = yearlyData.reduce((sum, record) => sum + record.data.totalExpenses, 0);
    const totalProfit = totalRevenue - totalExpenses;
    
    container.innerHTML = `
        <div class="report-card">
            <h3>Rapport Annuel ${currentYear}</h3>
            <div class="report-metrics">
                <div class="metric">
                    <span class="metric-label">Revenus totaux</span>
                    <span class="metric-value positive">${formatCurrency(totalRevenue)}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Dépenses totales</span>
                    <span class="metric-value negative">${formatCurrency(totalExpenses)}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Bénéfice annuel</span>
                    <span class="metric-value ${totalProfit >= 0 ? 'positive' : 'negative'}">${formatCurrency(totalProfit)}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Mois analysés</span>
                    <span class="metric-value">${yearlyData.length}</span>
                </div>
            </div>
        </div>
    `;
}

function generateComparisonReport(container) {
    if (financialHistory.length < 2) {
        container.innerHTML = '<p class="no-data">Au moins 2 mois de données sont nécessaires pour la comparaison</p>';
        return;
    }
    
    const sortedHistory = [...financialHistory].sort((a, b) => new Date(a.month) - new Date(b.month));
    const latest = sortedHistory[sortedHistory.length - 1];
    const previous = sortedHistory[sortedHistory.length - 2];
    
    const revenueChange = latest.data.monthlyRevenue - previous.data.monthlyRevenue;
    const expenseChange = latest.data.totalExpenses - previous.data.totalExpenses;
    const profitChange = latest.data.netProfit - previous.data.netProfit;
    
    container.innerHTML = `
        <div class="report-card">
            <h3>Comparaison ${previous.month} vs ${latest.month}</h3>
            <div class="comparison-grid">
                <div class="comparison-item">
                    <span class="comparison-label">Revenus</span>
                    <div class="comparison-values">
                        <span class="old-value">${formatCurrency(previous.data.monthlyRevenue)}</span>
                        <i class="fas fa-arrow-right"></i>
                        <span class="new-value">${formatCurrency(latest.data.monthlyRevenue)}</span>
                        <span class="change-value ${revenueChange >= 0 ? 'positive' : 'negative'}">
                            ${revenueChange >= 0 ? '+' : ''}${formatCurrency(revenueChange)}
                        </span>
                    </div>
                </div>
                <div class="comparison-item">
                    <span class="comparison-label">Dépenses</span>
                    <div class="comparison-values">
                        <span class="old-value">${formatCurrency(previous.data.totalExpenses)}</span>
                        <i class="fas fa-arrow-right"></i>
                        <span class="new-value">${formatCurrency(latest.data.totalExpenses)}</span>
                        <span class="change-value ${expenseChange <= 0 ? 'positive' : 'negative'}">
                            ${expenseChange >= 0 ? '+' : ''}${formatCurrency(expenseChange)}
                        </span>
                    </div>
                </div>
                <div class="comparison-item">
                    <span class="comparison-label">Bénéfice</span>
                    <div class="comparison-values">
                        <span class="old-value">${formatCurrency(previous.data.netProfit)}</span>
                        <i class="fas fa-arrow-right"></i>
                        <span class="new-value">${formatCurrency(latest.data.netProfit)}</span>
                        <span class="change-value ${profitChange >= 0 ? 'positive' : 'negative'}">
                            ${profitChange >= 0 ? '+' : ''}${formatCurrency(profitChange)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Event Listeners
function setupEventListeners() {
    // Form submission
    const form = document.getElementById('financialForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Add employee button
    const addEmployeeBtn = document.getElementById('addEmployee');
    if (addEmployeeBtn) {
        addEmployeeBtn.addEventListener('click', addEmployee);
    }
    
    // Add partner button
    const addPartnerBtn = document.getElementById('addPartner');
    if (addPartnerBtn) {
        addPartnerBtn.addEventListener('click', addPartner);
    }
    
    // Edit employee form
    const editEmployeeForm = document.getElementById('editEmployeeForm');
    if (editEmployeeForm) {
        editEmployeeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveEmployeeChanges();
        });
    }
    
    // Edit partner form
    const editPartnerForm = document.getElementById('editPartnerForm');
    if (editPartnerForm) {
        editPartnerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            savePartnerChanges();
        });
    }
    
    // Close modals on outside click
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

function saveEmployeeChanges() {
    const index = parseInt(document.getElementById('editEmployeeIndex').value);
    const name = document.getElementById('editEmployeeName').value.trim();
    const position = document.getElementById('editEmployeePosition').value.trim();
    const newSalary = parseFloat(document.getElementById('editEmployeeSalary').value);
    const reason = document.getElementById('salaryChangeReason').value.trim();
    
    if (name && position && newSalary > 0) {
        const employee = employees[index];
        const oldSalary = employee.salary;
        
        employee.name = name;
        employee.position = position;
        
        if (newSalary !== oldSalary) {
            employee.salary = newSalary;
            employee.salaryHistory.push({
                salary: newSalary,
                date: new Date().toISOString(),
                reason: reason || 'Modification de salaire'
            });
        }
        
        saveData();
        updateEmployeesListAdvanced();
        closeEmployeeModal();
        showAlert('Employé modifié avec succès', 'success');
    } else {
        showAlert('Veuillez remplir tous les champs obligatoires', 'error');
    }
}

function savePartnerChanges() {
    const index = parseInt(document.getElementById('editPartnerIndex').value);
    const name = document.getElementById('editPartnerName').value.trim();
    const share = parseFloat(document.getElementById('editPartnerShare').value);
    const personalExpenses = parseFloat(document.getElementById('editPartnerPersonalExpenses').value) || 0;
    
    if (name && share > 0) {
        const currentPartner = partners[index];
        const otherPartnersShares = partners.reduce((total, p, i) => 
            i !== index ? total + p.share : total, 0
        );
        
        if (otherPartnersShares + share > 100) {
            showAlert('La somme des parts ne peut pas dépasser 100%', 'error');
            return;
        }
        
        partners[index] = {
            ...currentPartner,
            name,
            share,
            personalExpenses
        };
        
        saveData();
        updatePartnersList();
        closePartnerModal();
        showAlert('Associé modifié avec succès', 'success');
    } else {
        showAlert('Veuillez remplir tous les champs obligatoires', 'error');
    }
}

// Alert System
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    const alertId = Date.now();
    
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type}`;
    alertElement.innerHTML = `
        <div class="alert-content">
            <i class="fas ${getAlertIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="alert-close" onclick="closeAlert(${alertId})">
            <i class="fas fa-times"></i>
        </button>
    `;
    alertElement.id = `alert-${alertId}`;
    
    alertContainer.appendChild(alertElement);
    
    // Auto-remove after 5 seconds
    setTimeout(() => closeAlert(alertId), 5000);
}

function getAlertIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

function closeAlert(alertId) {
    const alert = document.getElementById(`alert-${alertId}`);
    if (alert) {
        alert.remove();
    }
}

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
        minimumFractionDigits: 2
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('fr-FR');
}

function updateUI() {
    updateEmployeesListAdvanced();
    updatePartnersList();
    updateHistoryList();
}

function printResults() {
    window.print();
}

function exportToPDF() {
    const printWindow = window.open('', '_blank');
    const resultsContent = document.getElementById('results').innerHTML;
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Rapport Financier</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .results-container { max-width: 800px; margin: 0 auto; }
                    .result-card { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; }
                    .result-value { font-size: 24px; font-weight: bold; }
                    .positive { color: #10b981; }
                    .negative { color: #ef4444; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
                </style>
            </head>
            <body>${resultsContent}</body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}