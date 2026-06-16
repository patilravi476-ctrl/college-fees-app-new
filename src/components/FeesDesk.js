// FeesDesk.js - Fees Entry, Receipts, and History
import { translate } from "../services/translationService.js";

export const FeesDesk = {
  render: (state) => {
    const lang = state.language;
    const students = state.students || [];
    const transactions = state.transactions || [];

    // Preselected student if any
    const selectedStudentId = state.selectedStudentId;
    const selectedStudent = students.find(s => s.id === selectedStudentId);

    // Search query for history
    const historyQuery = (state.historySearchQuery || "").trim().toLowerCase();
    const filteredTx = transactions.filter(t => 
      t.studentName.toLowerCase().includes(historyQuery) ||
      t.admissionId.toLowerCase().includes(historyQuery) ||
      t.receiptNo.toLowerCase().includes(historyQuery) ||
      t.collectedBy.toLowerCase().includes(historyQuery)
    );

    return `
      <div>
        <div style="margin-bottom: 20px;">
          <h1 style="font-size: 1.75rem; color: var(--text-primary);">${translate('feesDesk', lang)}</h1>
          <p style="font-size: 0.9rem; color: var(--text-secondary);">Record and track installment collections</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; margin-bottom: 24px;">
          
          <!-- Column 1: Record Payment Form -->
          <div class="card-glass">
            <h3 style="font-size: 1.1rem; color: var(--text-primary); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="plus-circle" style="color: var(--primary); width: 20px; height: 20px;"></i>
              <span>${translate('collectFees', lang)}</span>
            </h3>
            
            <form onsubmit="app.handleRecordPayment(event)">
              <!-- Student Dropdown Selector -->
              <div class="form-group">
                <label for="fee-student-select">Select Student *</label>
                <select class="form-control" id="fee-student-select" onchange="app.setSelectedStudent(this.value)" required>
                  <option value="">-- Choose Student Profile --</option>
                  ${students.map(s => `
                    <option value="${s.id}" ${s.id === selectedStudentId ? 'selected' : ''}>
                      ${s.name} (${s.admissionId} - ${s.course}) - Bal: ₹${s.pendingFees}
                    </option>
                  `).join('')}
                </select>
              </div>

              <!-- Student Ledger Info Panel -->
              ${selectedStudent ? `
                <div style="background: var(--bg-primary); border-radius: var(--radius-sm); padding: 14px; margin-bottom: 16px; border: 1px dashed var(--border-color);">
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.8rem;">
                    <div><span style="color: var(--text-secondary);">Course:</span> <strong>${selectedStudent.course}</strong></div>
                    <div><span style="color: var(--text-secondary);">Batch:</span> <strong>${selectedStudent.batch}</strong></div>
                    <div><span style="color: var(--text-secondary);">Total Fees:</span> <strong>₹${selectedStudent.totalFees}</strong></div>
                    <div><span style="color: var(--text-secondary);">Paid:</span> <strong style="color: var(--accent-green);">₹${selectedStudent.paidFees}</strong></div>
                  </div>
                  <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">${translate('pendingFees', lang)}:</span>
                    <span style="font-size: 1rem; font-weight: 700; color: ${selectedStudent.pendingFees > 0 ? 'var(--accent-red)' : 'var(--text-secondary)'};">
                      ₹${selectedStudent.pendingFees}
                    </span>
                  </div>
                </div>
              ` : ''}

              <!-- Installment Entry -->
              <div class="form-group">
                <label for="fee-amount">${translate('installmentAmount', lang)} *</label>
                <input type="number" class="form-control" id="fee-amount" min="1" required 
                  value="" 
                  max="${selectedStudent ? selectedStudent.pendingFees : ''}">
              </div>

              <!-- Method selector -->
              <div class="form-group">
                <label for="fee-method">${translate('paymentMethod', lang)} *</label>
                <select class="form-control" id="fee-method" required onchange="app.handlePaymentMethodChange(this.value)">
                  <option value="Cash">${translate('cash', lang)}</option>
                  <option value="UPI">${translate('upi', lang)}</option>
                  <option value="Card">${translate('card', lang)}</option>
                  <option value="Net Banking">${translate('netBanking', lang)}</option>
                </select>
              </div>

              <!-- Reference transaction ID -->
              <div class="form-group" id="tx-ref-group" style="display: none;">
                <label for="fee-tx-ref">${translate('transactionId', lang)}</label>
                <input type="text" class="form-control" id="fee-tx-ref" placeholder="UPI Ref Number / Card Slip ID">
              </div>

              <!-- Remarks -->
              <div class="form-group">
                <label for="fee-remarks">${translate('remarks', lang)}</label>
                <input type="text" class="form-control" id="fee-remarks" placeholder="e.g. 2nd installment, exam fees">
              </div>

              <button type="submit"
        class="btn btn-primary"
        style="width: 100%; margin-top: 10px;"
        ${!selectedStudent || state.isSavingPayment ? 'disabled' : ''}>

  <i data-lucide="check-circle" style="width: 18px; height: 18px;"></i>

  <span>
    ${state.isSavingPayment ? 'Saving...' : 'Log Collection Entry'}
  </span>

</button>
            </form>
          </div>

          <!-- Column 2: Receipt History Logs -->
          <div class="card-glass" style="display: flex; flex-direction: column;">
            <h3 style="font-size: 1.1rem; color: var(--text-primary); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="history" style="color: var(--primary); width: 20px; height: 20px;"></i>
              <span>${translate('paymentHistory', lang)}</span>
            </h3>

            <!-- Search box for history -->
            <div class="search-wrapper" style="margin-bottom: 16px;">
              <i data-lucide="search" class="search-icon-svg" style="width: 16px; height: 16px; left: 12px;"></i>
              <input type="text" class="search-input" style="padding: 8px 12px 8px 36px; font-size: 0.85rem;" 
                placeholder="Search receipts, students..." 
                value="${state.historySearchQuery || ''}"
                oninput="app.handleHistorySearchInput(this.value)">
            </div>

            <div style="flex: 1; overflow-y: auto; max-height: 400px;">
              ${filteredTx.length === 0 ? `
                <p style="text-align: center; color: var(--text-light); padding: 32px 0;">No receipts match search.</p>
              ` : `
                <div class="table-container" style="border: none;">
                  <table class="cptc-table" style="font-size: 0.85rem;">
                    <thead>
                      <tr>
                        <th>Receipt</th>
                        <th>Student</th>
                        <th>Amount</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${filteredTx.map(tx => `
                        <tr>
                          <td>
                            <div style="font-weight: 600;">${tx.receiptNo}</div>
                            <div style="font-size: 0.7rem; color: var(--text-light);">${new Date(tx.date).toLocaleDateString()}</div>
                          </td>
                          <td>
                            <div style="font-weight: 500;">${tx.studentName}</div>
                            <div style="font-size: 0.7rem; color: var(--text-light);">${tx.course}</div>
                          </td>
                          <td style="font-weight: 600; color: var(--accent-green);">₹${tx.amount}</td>
                          <td>
                            <button class="btn btn-secondary" onclick="app.openReceiptModal('${tx.id}')" style="padding: 4px 6px; font-size: 0.7rem; border-radius: 4px;" title="Print Receipt">
                              <i data-lucide="printer" style="width: 14px; height: 14px;"></i>
                            </button>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `}
            </div>
          </div>
        </div>

        <!-- Receipt Print Dialog Modal Overlay -->
        ${state.printingReceiptId ? app.renderReceiptModalHtml(state) : ''}
      </div>
    `;
  },

  // Generates HTML code for the Printable Receipt voucher
  renderReceiptModalHtml: (state) => {
    const lang = state.language;
    const txId = state.printingReceiptId;
    const tx = state.transactions.find(t => t.id === txId);
    if (!tx) return '';

    // Find the associated student
    const student = state.students.find(s => s.id === tx.studentId) || { totalFees: tx.amount, pendingFees: 0 };
    const dateFormatted = new Date(tx.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

    return `
      <div class="modal-overlay no-print">
        <div class="modal-container" style="max-width: 500px;">
          <div class="modal-header">
            <h3 style="font-size: 1.1rem; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
              <i data-lucide="printer" style="color: var(--primary); width: 20px; height: 20px;"></i>
              <span>Receipt Preview</span>
            </h3>
            <button onclick="app.closeReceiptModal()" style="background: transparent; border: none; color: var(--text-light); cursor: pointer;">
              <i data-lucide="x" style="width: 24px; height: 24px;"></i>
            </button>
          </div>

          <div class="modal-body" style="padding: 16px;">
            <!-- Render visual paper mockup of receipt -->
            <div id="receipt-preview-box" style="background: white; color: black; padding: 24px; border: 1px solid #ccc; border-radius: 4px; font-family: 'Courier New', Courier, monospace; box-shadow: inset 0 0 10px rgba(0,0,0,0.05); font-size: 0.85rem;">
              
              <!-- Header -->
              <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 12px;">
                <h2 style="font-size: 1.1rem; font-weight: 700; margin: 0; line-height: 1.3;">CHIKHLI PARAMEDICAL & TECHNOLOGY COLLEGE</h2>
                <p style="font-size: 0.75rem; margin: 2px 0;">Chikhli, Dist. Buldhana</p>
                <p style="font-size: 0.7rem; font-weight: 600; margin-top: 6px; letter-spacing: 0.1em; border: 1px solid #000; display: inline-block; padding: 2px 8px; border-radius: 20px;">FEES VOUCHER</p>
              </div>

              <!-- Meta Grid -->
              <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 6px; margin-bottom: 12px; font-size: 0.8rem; border-bottom: 1px dashed #ccc; padding-bottom: 8px;">
                <div>Receipt No: <strong>${tx.receiptNo}</strong></div>
                <div style="text-align: right;">Date: <strong>${new Date(tx.date).toLocaleDateString()}</strong></div>
                <div>Admission ID: <strong>${tx.admissionId}</strong></div>
                <div style="text-align: right;">Course: <strong>${tx.course}</strong></div>
              </div>

              <!-- Main contents -->
              <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
                <div>Student Name: <strong style="text-transform: uppercase;">${tx.studentName}</strong></div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Payment Mode: <strong>${translate(tx.paymentMethod.toLowerCase(), lang)}</strong></span>
                  ${tx.transactionId ? `<span>Ref: <strong>${tx.transactionId}</strong></span>` : ''}
                </div>
                ${tx.remarks ? `<div>Remarks: <i>${tx.remarks}</i></div>` : ''}
              </div>

              <!-- Financial ledger table -->
              <table style="width: 100%; border-collapse: collapse; border-top: 1px solid #000; border-bottom: 1px solid #000; margin-bottom: 16px; font-size: 0.8rem;">
                <thead>
                  <tr style="border-bottom: 1px solid #000;">
                    <th style="text-align: left; padding: 4px 0;">Description</th>
                    <th style="text-align: right; padding: 4px 0;">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: 6px 0;">Fees Installment Paid</td>
                    <td style="text-align: right; padding: 6px 0; font-weight: 700;">₹${tx.amount.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style="border-top: 1px dashed #ccc; font-size: 0.75rem; color: #555;">
                    <td style="padding: 4px 0; font-style: italic;">Course Total Fee</td>
                    <td style="text-align: right; padding: 4px 0;">₹${student.totalFees.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style="font-size: 0.75rem; color: #555;">
                    <td style="padding: 4px 0; font-style: italic;">Remaining Outstanding</td>
                    <td style="text-align: right; padding: 4px 0;">₹${student.pendingFees.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>

              <!-- Footer block -->
              <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 24px; font-size: 0.75rem;">
                <div>
                  Collected By:<br>
                  <strong>${tx.collectedBy}</strong>
                </div>
                <div style="text-align: right; border-top: 1px solid #000; width: 120px; padding-top: 4px;">
                  Authorized Sign
                </div>
              </div>

              <div style="text-align: center; margin-top: 20px; border-top: 1px dashed #ccc; padding-top: 10px; font-size: 0.75rem; font-style: italic; color: #666;">
                Thank you for your payment! Keep this copy safe.
              </div>

            </div>
          </div>

          <div class="modal-footer no-print">
            <button class="btn btn-secondary" onclick="app.closeReceiptModal()">${translate('cancel', lang)}</button>
            <button class="btn btn-primary" onclick="app.triggerSystemPrint()"><i data-lucide="printer"></i>Print Voucher</button>
          </div>
        </div>
      </div>
    `;
  }
};
export default FeesDesk;
