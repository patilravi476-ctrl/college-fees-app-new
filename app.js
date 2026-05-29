// app.js - Main Application Entrypoint and Coordinator
import { translate } from "./services/translationService.js";
import { dbService } from "./services/dbService.js";

// Components
import { Login } from "./components/Login.js";
import { Dashboard } from "./components/Dashboard.js";
import { StudentList } from "./components/StudentList.js";
import { StudentFormModal } from "./components/StudentFormModal.js";
import { FeesDesk } from "./components/FeesDesk.js";
import { ExcelImport } from "./components/ExcelImport.js";
import { Reports } from "./components/Reports.js";
import { AdminConsole } from "./components/AdminConsole.js";

// Core reactive state
const state = {
  user: null, 
  activeTab: "dashboard",
  language: "en",
  theme: "light",
  students: [],
  transactions: [],
  logs: [],
  alert: null, // { message, type: 'success' | 'error' | 'warning' }
  
  // Student filter and modal state
  selectedCourseFilter: "ALL",
  searchQuery: "",
  editingStudentId: null,

  // Fees state
  selectedStudentId: "",
  historySearchQuery: "",
  printingReceiptId: null,

  // Excel state
  importedFile: null,
  importedRows: null,

  // Reports state
  selectedReportType: "daily",
  reportFilterDate: new Date().toISOString().split('T')[0],
  reportFilterMonth: new Date().toISOString().slice(0, 7),
  reportFilterStudentId: "",

  // Staff state
  showStaffCreateModal: false
};

// Global App Dispatcher
window.app = {
  // Localization & Theme Toggles
  toggleLanguage: () => {
    const nextLang = state.language === 'en' ? 'mr' : 'en';
    updateState({ language: nextLang });
  },

  toggleTheme: () => {
    const nextTheme = state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', nextTheme);
    updateState({ theme: nextTheme });
  },

  changeTab: (tab) => {
    updateState({ activeTab: tab });
  },

  // Toast Notification Trigger
  triggerToast: (message, type = "success") => {
    updateState({ alert: { message, type } });
    setTimeout(() => {
      if (state.alert && state.alert.message === message) {
        updateState({ alert: null });
      }
    }, 4000);
  },

  // Staff Authorization Handlers
  handleLogin: async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {
      const user = await dbService.signIn(username, password);
      updateState({ user, loginError: null, activeTab: "dashboard" });
      app.triggerToast(`Welcome back, ${user.name}!`, "success");
      // Read initial data from database
      app.refreshData();
    } catch (err) {
      updateState({ loginError: err.message });
      app.triggerToast(err.message, "error");
    }
  },

  logout: () => {
    updateState({ user: null, activeTab: "dashboard", editingStudentId: null, selectedStudentId: "" });
  },

  // Refresh lists
  refreshData: async () => {
    try {
      const students = await dbService.getStudents();
      const transactions = await dbService.getTransactions();
      const logs = await dbService.getActivityLogs();
      updateState({ students, transactions, logs });
    } catch (err) {
      console.error(err);
    }
  },

  // Student directory operations
  setCourseFilter: (course) => {
    updateState({ selectedCourseFilter: course });
  },

  handleSearchInput: (query) => {
    updateState({ searchQuery: query });
  },

  openStudentFormModal: (id) => {
    updateState({ editingStudentId: id || 'new' });
  },

  closeStudentFormModal: () => {
    updateState({ editingStudentId: null });
  },

  handleCourseChange: (course) => {
    const feeInput = document.getElementById('form-total-fees');
    if (feeInput) {
      // Auto pre-fill fees based on chosen course parameters
      feeInput.value = course === 'ADMLT' ? 45000 : 50000;
    }
  },

  handleSaveStudent: async (e, id) => {
    e.preventDefault();
    const admissionId = document.getElementById('form-admission-id').value;
    const name = document.getElementById('form-name').value;
    const mobile = document.getElementById('form-mobile').value;
    const parentMobile = document.getElementById('form-parent-mobile').value;
    const course = document.getElementById('form-course').value;
    const batch = document.getElementById('form-batch').value;
    const totalFees = document.getElementById('form-total-fees').value;
    const paidFees = document.getElementById('form-paid-fees') ? document.getElementById('form-paid-fees').value : 0;
    const status = document.getElementById('form-status').value;

    const studentData = { admissionId, name, mobile, parentMobile, course, batch, totalFees, paidFees, status };

    try {
      if (id && id !== 'new') {
        await dbService.editStudent(id, studentData, state.user);
        app.triggerToast("Student updated successfully!", "success");
      } else {
        await dbService.addStudent(studentData, state.user);
        app.triggerToast("Student enrolled successfully!", "success");
      }
      app.closeStudentFormModal();
      app.refreshData();
    } catch (err) {
      app.triggerToast(err.message, "error");
    }
  },

  confirmDeleteStudent: async (id) => {
    const student = state.students.find(s => s.id === id);
    if (!student) return;
    
    const confirmed = confirm(`${translate('deleteConfirm', state.language)}\n\nStudent: ${student.name}`);
    if (confirmed) {
      try {
        await dbService.deleteStudent(id, state.user);
        app.triggerToast("Student record deleted", "warning");
        app.refreshData();
      } catch (err) {
        app.triggerToast(err.message, "error");
      }
    }
  },

  // Fees entry operations
  setSelectedStudent: (id) => {
    updateState({ selectedStudentId: id });
  },

  handlePaymentMethodChange: (method) => {
    const refGroup = document.getElementById('tx-ref-group');
    if (refGroup) {
      refGroup.style.display = method === 'Cash' ? 'none' : 'block';
    }
  },

  handleHistorySearchInput: (query) => {
    updateState({ historySearchQuery: query });
  },

  openCollectFeesModal: (studentId) => {
    // Navigates user to Fees desk and preselects student
    updateState({ activeTab: "fees", selectedStudentId: studentId });
  },

  handleRecordPayment: async (e) => {
    e.preventDefault();
    const studentId = document.getElementById('fee-student-select').value;
    const amount = Number(document.getElementById('fee-amount').value);
    const paymentMethod = document.getElementById('fee-method').value;
    const transactionId = document.getElementById('fee-tx-ref') ? document.getElementById('fee-tx-ref').value : "";
    const remarks = document.getElementById('fee-remarks').value;

    const student = state.students.find(s => s.id === studentId);
    if (!student) return;

    try {
      const tx = await dbService.recordPayment({
        studentId,
        studentName: student.name,
        admissionId: student.admissionId,
        course: student.course,
        amount,
        paymentMethod,
        transactionId,
        remarks
      }, state.user);

      app.triggerToast(`Collected ₹${amount} from ${student.name}`, "success");
      
      // Auto open printed receipt preview modal
      updateState({ printingReceiptId: tx.id });
      app.refreshData();
    } catch (err) {
      app.triggerToast(err.message, "error");
    }
  },

  openReceiptModal: (txId) => {
    updateState({ printingReceiptId: txId });
  },

  closeReceiptModal: () => {
    updateState({ printingReceiptId: null });
  },

  triggerSystemPrint: () => {
    window.print();
  },

  printReceiptDirect: (txId) => {
    updateState({ printingReceiptId: txId });
    setTimeout(() => {
      window.print();
    }, 100);
  },

  renderReceiptModalHtml: (state) => {
    return FeesDesk.renderReceiptModalHtml(state);
  },

  // Excel parsing handlers using SheetJS (XLSX)
  handleExcelDrop: (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) app.parseExcelFile(file);
  },

  handleExcelSelect: (e) => {
    const file = e.target.files[0];
    if (file) app.parseExcelFile(file);
  },

  parseExcelFile: (file) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        if (typeof XLSX === 'undefined') {
          throw new Error("Excel parsing engine (SheetJS) is loading. Please retry in a moment.");
        }
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json(worksheet);

        // Normalize columns matching headers
        const normalizedRows = rawRows.map(row => {
          const norm = {};
          Object.keys(row).forEach(key => {
            const k = key.trim().toLowerCase();
            if (k.includes('name')) norm.name = row[key];
            else if (k.includes('admission') || k.includes('enroll') || k === 'id') norm.admissionId = String(row[key]);
            else if (k.includes('mobile') || k.includes('phone') || k.includes('contact')) {
              if (k.includes('parent') || k.includes('guard')) norm.parentMobile = String(row[key]);
              else norm.mobile = String(row[key]);
            }
            else if (k.includes('course') || k.includes('branch')) norm.course = String(row[key]).toUpperCase();
            else if (k.includes('batch') || k.includes('year')) norm.batch = String(row[key]);
            else if (k.includes('total') || k.includes('expected') || k === 'fees') norm.totalFees = Number(row[key]);
            else if (k.includes('paid') || k.includes('collected') || k.includes('amount')) norm.paidFees = Number(row[key]);
          });
          return norm;
        });

        updateState({ importedFile: file, importedRows: normalizedRows });
        app.triggerToast("Document loaded. Review the records below.", "success");
      } catch (err) {
        app.triggerToast("Parsing failed: " + err.message, "error");
      }
    };
    reader.readAsArrayBuffer(file);
  },

  executeImportMerge: async () => {
    if (!state.importedRows || state.importedRows.length === 0) return;
    try {
      const stats = await dbService.importStudents(state.importedRows, state.user);
      app.triggerToast(`Import completed. Added ${stats.inserted}, Updated ${stats.updated}.`, "success");
      updateState({ importedFile: null, importedRows: null });
      app.refreshData();
    } catch (err) {
      app.triggerToast(err.message, "error");
    }
  },

  // Reports filters and triggers
  setReportType: (type) => {
    updateState({ selectedReportType: type });
  },

  handleReportFilterChange: (key, val) => {
    const update = {};
    update[key] = val;
    updateState(update);
  },

  triggerReportPrint: () => {
    window.print();
  },

  exportReportCsv: (type) => {
    const lang = state.language;
    let title = "";
    let headers = [];
    let rows = [];

    if (type === 'daily') {
      const date = state.reportFilterDate;
      title = `Daily_Report_${date}`;
      headers = ["Receipt No", "Date", "Admission ID", "Student Name", "Course", "Amount Paid", "Method", "Collected By", "Remarks"];
      const data = state.transactions.filter(t => t.date.split('T')[0] === date);
      rows = data.map(t => [t.receiptNo, new Date(t.date).toLocaleTimeString(), t.admissionId, t.studentName, t.course, t.amount, t.paymentMethod, t.collectedBy, t.remarks]);
    } else if (type === 'monthly') {
      const month = state.reportFilterMonth;
      title = `Monthly_Report_${month}`;
      headers = ["Receipt No", "Date", "Admission ID", "Student Name", "Course", "Amount Paid", "Method", "Collected By", "Remarks"];
      const data = state.transactions.filter(t => t.date.startsWith(month));
      rows = data.map(t => [t.receiptNo, new Date(t.date).toLocaleDateString(), t.admissionId, t.studentName, t.course, t.amount, t.paymentMethod, t.collectedBy, t.remarks]);
    } else if (type === 'pending') {
      title = "Pending_Fees_Report";
      headers = ["Admission ID", "Student Name", "Course", "Mobile", "Parent Mobile", "Total Fees", "Paid Fees", "Pending Fees", "Status"];
      const data = state.students.filter(s => s.pendingFees > 0);
      rows = data.map(s => [s.admissionId, s.name, s.course, s.mobile, s.parentMobile, s.totalFees, s.paidFees, s.pendingFees, s.status]);
    } else if (type === 'student') {
      const s = state.students.find(x => x.id === state.reportFilterStudentId);
      if (!s) return;
      title = `Ledger_${s.name.replace(/ /g, '_')}`;
      headers = ["Receipt No", "Date", "Amount Paid", "Payment Mode", "Ref Transaction ID", "Collected By", "Remarks"];
      const data = state.transactions.filter(t => t.studentId === s.id);
      rows = data.map(t => [t.receiptNo, new Date(t.date).toLocaleString(), t.amount, t.paymentMethod, t.transactionId, t.collectedBy, t.remarks]);
    }

    Reports.generateCsvDownload(title, headers, rows);
    app.triggerToast("Excel file generated successfully!", "success");
  },

  // Backups
  downloadBackupSnapshot: () => {
    const dataStr = dbService.exportBackup();
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(dataStr));
    downloadAnchor.setAttribute("download", `cptc_db_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    app.triggerToast("Database snapshot downloaded", "success");
  },

  handleRestoreBackup: (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        await dbService.restoreBackup(evt.target.result, state.user);
        app.triggerToast(translate('restoreSuccess', state.language), "success");
        app.refreshData();
      } catch (err) {
        app.triggerToast("Restore failed: " + err.message, "error");
      }
    };
    reader.readAsText(file);
  },

  // Super Admin: staff management
  openStaffCreateModal: () => {
    updateState({ showStaffCreateModal: true });
  },

  closeStaffCreateModal: () => {
    updateState({ showStaffCreateModal: false });
  },

  handleCreateStaff: (e) => {
    e.preventDefault();
    const name = document.getElementById('staff-name').value;
    const mobile = document.getElementById('staff-mobile').value;
    const username = document.getElementById('staff-username').value.trim().toLowerCase();
    const password = document.getElementById('staff-password').value;
    const role = document.getElementById('staff-role').value;

    const currentStaff = dbService.getStaff();
    if (currentStaff.some(u => u.username === username)) {
      app.triggerToast("Username already exists", "error");
      return;
    }

    const newStaff = {
      uid: "usr-" + Date.now(),
      name,
      mobile,
      username,
      password,
      role,
      status: "active"
    };

    currentStaff.push(newStaff);
    dbService.saveStaff(currentStaff, state.user);
    app.triggerToast(`Staff account for ${name} created!`, "success");
    app.closeStaffCreateModal();
    app.refreshData();
  },

  toggleStaffStatus: (uid) => {
    const currentStaff = dbService.getStaff();
    const idx = currentStaff.findIndex(u => u.uid === uid);
    if (idx === -1) return;
    
    const user = currentStaff[idx];
    user.status = user.status === 'active' ? 'inactive' : 'active';
    
    dbService.saveStaff(currentStaff, state.user);
    app.triggerToast(`Status updated for ${user.name}`, "warning");
    app.refreshData();
  }
};

// UI Rendering coordinators
function updateState(newState) {
  Object.assign(state, newState);
  renderApp();
}

const Shell = {
  render: (state) => {
    const lang = state.language;
    const active = state.activeTab;
    const menuItems = [
      { id: "dashboard", label: translate('dashboard', lang), icon: "layout-dashboard" },
      { id: "students", label: translate('students', lang), icon: "users" },
      { id: "fees", label: translate('feesDesk', lang), icon: "indian-rupee" },
      { id: "import", label: translate('excelImport', lang), icon: "file-spreadsheet" },
      { id: "reports", label: translate('reports', lang), icon: "pie-chart" }
    ];

    // Only render admin settings tab for Super Admin
    if (state.user.role === 'super_admin') {
      menuItems.push({ id: "console", label: translate('adminConsole', lang), icon: "shield-check" });
    }

    // Dynamic router component selector
    let viewContent = "";
    if (active === "dashboard") viewContent = Dashboard.render(state);
    else if (active === "students") viewContent = StudentList.render(state);
    else if (active === "fees") viewContent = FeesDesk.render(state);
    else if (active === "import") viewContent = ExcelImport.render(state);
    else if (active === "reports") viewContent = Reports.render(state);
    else if (active === "console") viewContent = AdminConsole.render(state);

    return `
      <div class="app-shell">
      <aside class="sidebar" id="app-sidebar">  
        <div class="sidebar-logo" style="text-align:center;">
    <img src="./assets/logo.png"
         alt="College Logo"
         style="width:100px; height:auto; display:block; margin:0 auto 8px auto;">
<nav class="sidebar-menu">
     
            ${menuItems.map(item => `
              <div class="sidebar-link ${active === item.id ? 'active' : ''}" onclick="app.changeTab('${item.id}'); document.getElementById('app-sidebar').classList.remove('open')">
                <i data-lucide="${item.icon}" style="width: 20px; height: 20px;"></i>
                <span>${item.label}</span>
              </div>
            `).join('')}
          </nav>

          <!-- Footer User Card -->
          <div class="sidebar-footer">
            <div class="user-indicator">
              <i data-lucide="user" style="width: 16px; height: 16px;"></i>
              <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                <div style="font-weight: 600;">${state.user.name.split(' ')[0]}</div>
                <span class="user-role-badge">${translate(state.user.role, lang).split(' ')[0]}</span>
              </div>
            </div>
            <div class="sidebar-link" onclick="app.logout()" style="margin-top: 8px; color: var(--accent-red);">
              <i data-lucide="log-out" style="width: 18px; height: 18px;"></i>
              <span>${translate('signOut', lang)}</span>
            </div>
          </div>
        </aside>

        <!-- Top Header panel -->
        <header class="app-header">
          <button class="hamburger-btn" onclick="document.getElementById('app-sidebar').classList.toggle('open')">
            <i data-lucide="menu"></i>
          </button>
          
          <h2 style="font-size: 1.15rem; color: var(--text-primary); font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-right: 16px;">
            ${translate('collegeName', lang)}
          </h2>

          <div style="display: flex; gap: 12px; align-items: center;" class="no-print">
            <!-- Language toggle -->
            <button class="btn btn-secondary" onclick="app.toggleLanguage()" style="padding: 6px 12px; font-size: 0.8rem; font-weight: 700; border-radius: 20px;">
              ${state.language === 'en' ? 'मराठी' : 'English'}
            </button>

            <!-- Theme toggle -->
            <button class="btn btn-secondary" onclick="app.toggleTheme()" style="padding: 8px; border-radius: 50%; width: 36px; height: 36px;">
              <i data-lucide="${state.theme === 'light' ? 'moon' : 'sun'}" style="width: 18px; height: 18px;"></i>
            </button>
          </div>
        </header>

        <!-- Main Workspace content -->
        <main class="main-content">
          ${viewContent}
        </main>

        <!-- Modals and dynamic overlays -->
        ${state.editingStudentId ? StudentFormModal.render(state) : ''}
      </div>
    `;
  }
};

// Main router loop
function renderApp() {
  const root = document.getElementById("root");
  if (!root) return;

  if (!state.user) {
    // If not authenticated, render login view
    root.innerHTML = Login.render(state);
  } else {
    // If logged in, render main shell layout
    root.innerHTML = Shell.render(state);
  }

  // Draw active SVG icons loaded from unpkg Lucide helper
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Handle active alerts
  if (state.alert) {
    let alertContainer = document.getElementById("toast-holder");
    if (!alertContainer) {
      alertContainer = document.createElement("div");
      alertContainer.id = "toast-holder";
      alertContainer.className = "toast-container no-print";
      document.body.appendChild(alertContainer);
    }
    
    let alertIcon = "info";
    if (state.alert.type === "success") alertIcon = "check-circle";
    if (state.alert.type === "error") alertIcon = "x-circle";
    if (state.alert.type === "warning") alertIcon = "alert-triangle";

    alertContainer.innerHTML = `
      <div class="toast toast-${state.alert.type}">
        <i data-lucide="${alertIcon}" style="width: 20px; height: 20px; color: var(--accent-${state.alert.type === 'success' ? 'green' : state.alert.type === 'error' ? 'red' : 'orange'});"></i>
        <div style="font-size: 0.9rem; font-weight: 500;">${state.alert.message}</div>
      </div>
    `;
    lucide.createIcons();
  } else {
    const alertContainer = document.getElementById("toast-holder");
    if (alertContainer) alertContainer.innerHTML = "";
  }

  // Inject dynamic printing containers for perfect PDF generation
  let printArea = document.getElementById("receipt-print-area");
  if (state.printingReceiptId) {
    const tx = state.transactions.find(t => t.id === state.printingReceiptId);
    const student = state.students.find(s => s.id === tx.studentId) || { totalFees: tx.amount, pendingFees: 0 };
    if (tx) {
      if (!printArea) {
        printArea = document.createElement("div");
        printArea.id = "receipt-print-area";
        document.body.appendChild(printArea);
      }
      printArea.innerHTML = `
        <div class="print-receipt-voucher">
          <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px;">
            <h2 style="font-size: 1.3rem; font-weight: 700; margin: 0;">CHIKHLI PARAMEDICAL & TECHNOLOGY COLLEGE</h2>
            <p style="font-size: 0.75rem; margin: 2px 0;">Chikhli, Dist. Buldhana</p>
            <p style="font-size: 0.75rem; font-weight: 700; margin: 4px 0; border: 1px solid #000; display: inline-block; padding: 2px 8px;">FEES RECEIPT</p>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.8rem; margin-bottom: 12px;">
            <div>Receipt No: <strong>${tx.receiptNo}</strong></div>
            <div style="text-align: right;">Date: <strong>${new Date(tx.date).toLocaleDateString()}</strong></div>
            <div>Admission ID: <strong>${tx.admissionId}</strong></div>
            <div style="text-align: right;">Course: <strong>${tx.course}</strong></div>
          </div>
          <div style="font-size: 0.85rem; margin-bottom: 12px; line-height: 1.4;">
            Received with thanks from student: <strong>${tx.studentName.toUpperCase()}</strong><br>
            A sum of Rupees: <strong>₹${tx.amount.toLocaleString('en-IN')}</strong> in <strong>${tx.paymentMethod}</strong> ${tx.transactionId ? `(Ref: ${tx.transactionId})` : ''}<br>
            Remarks: <i>${tx.remarks || 'Regular Term Payment'}</i>
          </div>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 16px; font-size: 0.8rem;">
            <thead>
              <tr style="border-bottom: 1px solid #000; background: #eee;">
                <th style="text-align: left; padding: 4px;">Fees Head</th>
                <th style="text-align: right; padding: 4px;">Amount Paid</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 4px;">Tuition / Admission Fees Installment</td>
                <td style="text-align: right; padding: 4px; font-weight: 700;">₹${tx.amount.toLocaleString('en-IN')}</td>
              </tr>
              <tr style="border-top: 1px dashed #000; font-size: 0.75rem;">
                <td style="padding: 4px; font-style: italic;">Course Total Fee</td>
                <td style="text-align: right; padding: 4px;">₹${student.totalFees.toLocaleString('en-IN')}</td>
              </tr>
              <tr style="font-size: 0.75rem;">
                <td style="padding: 4px; font-style: italic;">Remaining Balance</td>
                <td style="text-align: right; padding: 4px;">₹${student.pendingFees.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 32px; font-size: 0.75rem;">
            <div>Collected By: <strong>${tx.collectedBy}</strong></div>
            <div style="border-top: 1px solid #000; width: 150px; text-align: center; padding-top: 4px;">Authorized Signatory</div>
          </div>
        </div>
      `;
    }
  } else if (state.activeTab === "reports") {
    // If active tab is reports, duplicate report table into print area for clear formatting
    const repCard = document.getElementById("reports-output-card");
    if (repCard) {
      if (!printArea) {
        printArea = document.createElement("div");
        printArea.id = "receipt-print-area";
        document.body.appendChild(printArea);
      }
      printArea.innerHTML = `
        <div class="print-report-container">
          ${repCard.innerHTML}
        </div>
      `;
      // Clean up print container classes for printable layout
      const headerShow = printArea.querySelector(".print-header-show");
      if (headerShow) headerShow.style.display = "block";
      const signShow = printArea.querySelector(".print-signatory-show");
      if (signShow) signShow.style.display = "flex";
    }
  } else {
    if (printArea) printArea.innerHTML = "";
  }
}

// Bootstrap
document.addEventListener("DOMContentLoaded", () => {
  renderApp();
});

// Run immediately if DOM already loaded
if (document.readyState === "complete" || document.readyState === "interactive") {
  renderApp();
}
