// Reports.js - Financial Ledger Reports Generator
import { translate } from "../services/translationService.js";

export const Reports = {
  render: (state) => {
    const lang = state.language;
    const reportType = state.selectedReportType || "daily"; // daily, monthly, pending, student
    const students = state.students || [];
    const transactions = state.transactions || [];

    // Form inputs state
    const reportDate = state.reportFilterDate || new Date().toISOString().split('T')[0];
    const reportMonth = state.reportFilterMonth || new Date().toISOString().slice(0, 7); // YYYY-MM
    const reportStudentId = state.reportFilterStudentId || "";

    let reportTitle = translate('dailyReport', lang);
    let reportData = [];
    let csvHeaders = [];
    let csvRows = [];
    let totalsSummaryHtml = "";

    // 1. DAILY REPORT FILTER
    if (reportType === "daily") {
      reportTitle = `${translate('dailyReport', lang)} - ${new Date(reportDate).toLocaleDateString()}`;
      reportData = transactions.filter(t => t.date.split('T')[0] === reportDate);
      
      const totalCol = reportData.reduce((sum, t) => sum + t.amount, 0);
      totalsSummaryHtml = `
        <div style="display: flex; justify-content: flex-end; gap: 24px; padding: 16px; background: var(--bg-primary); border-top: 2px solid var(--border-color); font-weight: 700; font-size: 1rem;">
          <span>Transactions: ${reportData.length}</span>
          <span style="color: var(--accent-green);">Total Collected: ₹${totalCol.toLocaleString('en-IN')}</span>
        </div>
      `;
      
      csvHeaders = ["Receipt No", "Date", "Admission ID", "Student Name", "Course", "Amount Paid", "Method", "Collected By", "Remarks"];
      csvRows = reportData.map(t => [t.receiptNo, new Date(t.date).toLocaleTimeString(), t.admissionId, t.studentName, t.course, t.amount, t.paymentMethod, t.collectedBy, t.remarks]);
    }
    
    // 2. MONTHLY REPORT FILTER
    else if (reportType === "monthly") {
      const [year, month] = reportMonth.split('-');
      const monthName = new Date(year, month - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
      reportTitle = `${translate('monthlyReport', lang)} - ${monthName}`;
      reportData = transactions.filter(t => t.date.startsWith(reportMonth));
      
      const totalCol = reportData.reduce((sum, t) => sum + t.amount, 0);
      totalsSummaryHtml = `
        <div style="display: flex; justify-content: flex-end; gap: 24px; padding: 16px; background: var(--bg-primary); border-top: 2px solid var(--border-color); font-weight: 700; font-size: 1rem;">
          <span>Transactions: ${reportData.length}</span>
          <span style="color: var(--accent-green);">Total Collected: ₹${totalCol.toLocaleString('en-IN')}</span>
        </div>
      `;
      
      csvHeaders = ["Receipt No", "Date", "Admission ID", "Student Name", "Course", "Amount Paid", "Method", "Collected By", "Remarks"];
      csvRows = reportData.map(t => [t.receiptNo, new Date(t.date).toLocaleDateString(), t.admissionId, t.studentName, t.course, t.amount, t.paymentMethod, t.collectedBy, t.remarks]);
    }
    
    // 3. PENDING FEES REPORT
    else if (reportType === "pending") {
      reportTitle = translate('pendingReport', lang);
      reportData = students.filter(s => s.pendingFees > 0);
      
      const totalExpected = reportData.reduce((sum, s) => sum + s.totalFees, 0);
      const totalCollected = reportData.reduce((sum, s) => sum + s.paidFees, 0);
      const totalPending = reportData.reduce((sum, s) => sum + s.pendingFees, 0);
      
      totalsSummaryHtml = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; padding: 16px; background: var(--bg-primary); border-top: 2px solid var(--border-color); font-weight: 700; font-size: 0.95rem; text-align: right;">
          <div>Expected: ₹${totalExpected.toLocaleString('en-IN')}</div>
          <div style="color: var(--accent-green);">Collected: ₹${totalCollected.toLocaleString('en-IN')}</div>
          <div style="color: var(--accent-red);">Total Outstanding: ₹${totalPending.toLocaleString('en-IN')}</div>
        </div>
      `;
      
      csvHeaders = ["Admission ID", "Student Name", "Course", "Mobile", "Parent Mobile", "Total Fees", "Paid Fees", "Pending Fees", "Status"];
      csvRows = reportData.map(s => [s.admissionId, s.name, s.course, s.mobile, s.parentMobile, s.totalFees, s.paidFees, s.pendingFees, s.status]);
    }
    
    // 4. STUDENT LEDGER REPORT
    else if (reportType === "student") {
      const selectedStudent = students.find(s => s.id === reportStudentId);
      reportTitle = selectedStudent ? `${translate('studentReport', lang)} - ${selectedStudent.name}` : translate('studentReport', lang);
      reportData = selectedStudent ? transactions.filter(t => t.studentId === reportStudentId) : [];
      
      const totalCol = reportData.reduce((sum, t) => sum + t.amount, 0);
      totalsSummaryHtml = selectedStudent ? `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--bg-primary); border-top: 2px solid var(--border-color); font-weight: 700; font-size: 0.95rem;">
          <div>Remaining Balance: <span style="color: var(--accent-red);">₹${selectedStudent.pendingFees.toLocaleString('en-IN')}</span> (Total Course Fees: ₹${selectedStudent.totalFees})</div>
          <div style="color: var(--accent-green);">Total Paid: ₹${totalCol.toLocaleString('en-IN')}</div>
        </div>
      ` : '';
      
      csvHeaders = ["Receipt No", "Date", "Amount Paid", "Payment Mode", "Ref Transaction ID", "Collected By", "Remarks"];
      csvRows = reportData.map(t => [t.receiptNo, new Date(t.date).toLocaleString(), t.amount, t.paymentMethod, t.transactionId, t.collectedBy, t.remarks]);
    }

    return `
      <div>
        <div style="margin-bottom: 20px;" class="no-print">
          <h1 style="font-size: 1.75rem; color: var(--text-primary);">${translate('reportsTitle', lang)}</h1>
          <p style="font-size: 0.9rem; color: var(--text-secondary);">Query collection books and download Excel/PDF records</p>
        </div>

        <!-- Filter Selection Card -->
        <div class="card-glass no-print" style="margin-bottom: 24px;">
          <!-- Report Type Tabs -->
          <div style="display: flex; flex-wrap: wrap; gap: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 20px;">
            <button class="course-tab-btn ${reportType === 'daily' ? 'active' : ''}" onclick="app.setReportType('daily')">${translate('dailyReport', lang)}</button>
            <button class="course-tab-btn ${reportType === 'monthly' ? 'active' : ''}" onclick="app.setReportType('monthly')">${translate('monthlyReport', lang)}</button>
            <button class="course-tab-btn ${reportType === 'pending' ? 'active' : ''}" onclick="app.setReportType('pending')">${translate('pendingReport', lang)}</button>
            <button class="course-tab-btn ${reportType === 'student' ? 'active' : ''}" onclick="app.setReportType('student')">${translate('studentReport', lang)}</button>
          </div>

          <!-- Dynamic Form Inputs based on Report Type -->
          <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end;">
            
            ${reportType === 'daily' ? `
              <div class="form-group" style="margin-bottom: 0; min-width: 200px;">
                <label for="report-date-input">${translate('selectDate', lang)}</label>
                <input type="date" class="form-control" id="report-date-input" value="${reportDate}" onchange="app.handleReportFilterChange('reportFilterDate', this.value)">
              </div>
            ` : ''}

            ${reportType === 'monthly' ? `
              <div class="form-group" style="margin-bottom: 0; min-width: 200px;">
                <label for="report-month-input">${translate('selectMonth', lang)}</label>
                <input type="month" class="form-control" id="report-month-input" value="${reportMonth}" onchange="app.handleReportFilterChange('reportFilterMonth', this.value)">
              </div>
            ` : ''}

            ${reportType === 'student' ? `
              <div class="form-group" style="margin-bottom: 0; min-width: 250px;">
                <label for="report-student-select">Search Student</label>
                <select class="form-control" id="report-student-select" onchange="app.handleReportFilterChange('reportFilterStudentId', this.value)">
                  <option value="">-- Choose Student Profile --</option>
                  ${students.map(s => `
                    <option value="${s.id}" ${s.id === reportStudentId ? 'selected' : ''}>
                      ${s.name} (${s.admissionId})
                    </option>
                  `).join('')}
                </select>
              </div>
            ` : ''}

            <!-- Export Buttons -->
            <div style="margin-left: auto; display: flex; gap: 10px;">
              <button class="btn btn-secondary" onclick="app.exportReportCsv('${reportType}')" ${reportType === 'student' && !reportStudentId ? 'disabled' : ''}>
                <i data-lucide="file-spreadsheet"></i>
                <span>${translate('exportCsv', lang)}</span>
              </button>
              <button class="btn btn-primary" onclick="app.triggerReportPrint()" ${reportType === 'student' && !reportStudentId ? 'disabled' : ''}>
                <i data-lucide="printer"></i>
                <span>Print PDF</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Report Content Block (Visual & Print-Friendly) -->
        <div class="card-glass" style="padding: 24px;" id="reports-output-card">
          <!-- Print Only Header -->
          <div style="display: none; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px; text-align: center;" class="print-header-show">
            <h2 style="font-size: 1.4rem; font-weight: 700; margin: 0;">CHIKHLI PARAMEDICAL & TECHNOLOGY COLLEGE, CHIKHLI</h2>
            <p style="font-size: 0.8rem; margin: 2px 0;">Chikhli, Dist. Buldhana</p>
            <h3 style="font-size: 1.1rem; margin-top: 10px; text-decoration: underline;">${reportTitle}</h3>
          </div>

          <h2 style="font-size: 1.25rem; color: var(--text-primary); margin-bottom: 16px;" class="no-print">${reportTitle}</h2>
          
          <div class="table-container" style="border: none;">
            <table class="cptc-table">
              <thead>
                ${reportType === 'daily' || reportType === 'monthly' ? `
                  <tr>
                    <th>Receipt No</th>
                    <th>Date / Time</th>
                    <th>Admission ID</th>
                    <th>Student Name</th>
                    <th>Course</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th class="no-print">Collected By</th>
                  </tr>
                ` : ''}

                ${reportType === 'pending' ? `
                  <tr>
                    <th>Admission ID</th>
                    <th>Student Name</th>
                    <th>Course</th>
                    <th>Mobile</th>
                    <th>Total Fees</th>
                    <th>Paid Fees</th>
                    <th>Pending Bal</th>
                    <th>Status</th>
                  </tr>
                ` : ''}

                ${reportType === 'student' ? `
                  <tr>
                    <th>Receipt No</th>
                    <th>Payment Date</th>
                    <th>Amount Paid</th>
                    <th>Payment Method</th>
                    <th>Reference transaction ID</th>
                    <th>Remarks</th>
                  </tr>
                ` : ''}
              </thead>
              <tbody>
                ${reportData.length === 0 ? `
                  <tr>
                    <td colspan="10" style="text-align: center; color: var(--text-light); padding: 32px 0;">
                      ${reportType === 'student' && !reportStudentId ? 'Select a student to generate their ledger account.' : translate('noRecords', lang)}
                    </td>
                  </tr>
                ` : reportData.map(row => {
                  if (reportType === 'daily' || reportType === 'monthly') {
                    return `
                      <tr>
                        <td><strong>${row.receiptNo}</strong></td>
                        <td>${new Date(row.date).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                        <td>${row.admissionId}</td>
                        <td><strong>${row.studentName}</strong></td>
                        <td><span class="badge badge-info">${row.course}</span></td>
                        <td style="font-weight: 600; color: var(--accent-green);">₹${row.amount.toLocaleString('en-IN')}</td>
                        <td><span class="badge badge-success">${row.paymentMethod}</span></td>
                        <td class="no-print" style="font-size: 0.8rem; color: var(--text-secondary);">${row.collectedBy}</td>
                      </tr>
                    `;
                  } else if (reportType === 'pending') {
                    return `
                      <tr>
                        <td>${row.admissionId}</td>
                        <td><strong>${row.name}</strong></td>
                        <td><span class="badge badge-info">${row.course}</span></td>
                        <td>${row.mobile}</td>
                        <td>₹${row.totalFees.toLocaleString('en-IN')}</td>
                        <td style="color: var(--accent-green);">₹${row.paidFees.toLocaleString('en-IN')}</td>
                        <td style="font-weight: 600; color: var(--accent-red);">₹${row.pendingFees.toLocaleString('en-IN')}</td>
                        <td><span class="badge badge-warning">${translate(row.status.toLowerCase(), lang)}</span></td>
                      </tr>
                    `;
                  } else if (reportType === 'student') {
                    return `
                      <tr>
                        <td><strong>${row.receiptNo}</strong></td>
                        <td>${new Date(row.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                        <td style="font-weight: 600; color: var(--accent-green);">₹${row.amount.toLocaleString('en-IN')}</td>
                        <td><span class="badge badge-success">${row.paymentMethod}</span></td>
                        <td>${row.transactionId || '-'}</td>
                        <td><i>${row.remarks || '-'}</i></td>
                      </tr>
                    `;
                  }
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Total Aggregates Summary Panel -->
          ${totalsSummaryHtml}

          <!-- Print footer signatory -->
          <div style="display: none; justify-content: space-between; align-items: flex-end; margin-top: 40px; font-size: 0.8rem;" class="print-signatory-show">
            <div>Report generated on: ${new Date().toLocaleString()}</div>
            <div style="border-top: 1px solid #000; width: 150px; text-align: center; padding-top: 4px;">Principal / Admin Sign</div>
          </div>
        </div>
      </div>
    `;
  },

  // Generates CSV string and prompts user to save
  generateCsvDownload: (title, headers, rows) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add title line
    csvContent += `"${title.replace(/"/g, '""')}"\n\n`;
    
    // Add headers
    csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(",") + "\n";
    
    // Add rows
    rows.forEach(row => {
      csvContent += row.map(val => {
        const strVal = String(val === null || val === undefined ? "" : val);
        return `"${strVal.replace(/"/g, '""')}"`;
      }).join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
export default Reports;
