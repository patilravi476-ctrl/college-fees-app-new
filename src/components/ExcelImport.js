// ExcelImport.js - Excel and CSV Import View
import { translate } from "../services/translationService.js";

export const ExcelImport = {
  render: (state) => {
    const lang = state.language;

    return `
      <div>
        <div style="margin-bottom: 20px;">
          <h1 style="font-size: 1.75rem; color: var(--text-primary);">${translate('excelImport', lang)}</h1>
          <p style="font-size: 0.9rem; color: var(--text-secondary);">Batch upload student registers and fees data</p>
        </div>

        <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 24px; align-items: start;">
          <!-- Left Panel: Upload and Preview -->
          <div class="card-glass" style="display: flex; flex-direction: column; gap: 20px;">
            <div>
              <h3 style="font-size: 1.1rem; color: var(--text-primary); margin-bottom: 8px;">Upload Excel/CSV Ledger Sheet</h3>
              <p style="font-size: 0.85rem; color: var(--text-secondary);">${translate('importInstructions', lang)}</p>
            </div>

            <!-- Upload Box Area -->
            <div id="import-drop-zone" style="border: 2px dashed var(--border-color); border-radius: var(--radius); padding: 32px; text-align: center; background: rgba(15, 23, 42, 0.01); transition: var(--transition); cursor: pointer;"
              onclick="document.getElementById('excel-file-input').click()"
              ondragover="event.preventDefault(); this.style.borderColor = 'var(--primary)'; this.style.background = 'var(--primary-light)';"
              ondragleave="event.preventDefault(); this.style.borderColor = 'var(--border-color)'; this.style.background = 'transparent';"
              ondrop="app.handleExcelDrop(event)">
              
              <input type="file" id="excel-file-input" accept=".xlsx, .xls, .csv" style="display: none;" onchange="app.handleExcelSelect(event)">
              
              <div style="display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; background: var(--primary-light); color: var(--primary); border-radius: 50%; margin-bottom: 12px;">
                <i data-lucide="file-spreadsheet" style="width: 28px; height: 28px;"></i>
              </div>
              <p style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary);">Drag & drop your file here, or click to browse</p>
              <p style="font-size: 0.75rem; color: var(--text-light); margin-top: 4px;">Supports Excel (.xlsx, .xls) and standard Comma-Separated Values (.csv)</p>
            </div>

            <!-- Selected File Status Info -->
            ${state.importedFile ? `
              <div style="background: var(--primary-light); border: 1px solid var(--primary); border-radius: var(--radius-sm); padding: 12px; display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem;">
                <div style="display: flex; align-items: center; gap: 8px; color: var(--text-primary);">
                  <i data-lucide="check" style="color: var(--accent-green); width: 18px; height: 18px;"></i>
                  <span>Selected file: <strong>${state.importedFile.name}</strong> (${(state.importedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
                <span style="font-weight: 600; color: var(--primary);">${state.importedRows ? state.importedRows.length : 0} rows parsed</span>
              </div>
            ` : ''}

            <!-- Parsed Data Preview Grid -->
            ${state.importedRows && state.importedRows.length > 0 ? `
              <div>
                <h4 style="font-size: 0.95rem; color: var(--text-primary); margin-bottom: 10px;">Import Preview (First 5 records)</h4>
                <div class="table-container">
                  <table class="cptc-table" style="font-size: 0.8rem;">
                    <thead>
                      <tr>
                        <th>Admission ID</th>
                        <th>Name</th>
                        <th>Mobile</th>
                        <th>Course</th>
                        <th>Total Fees</th>
                        <th>Paid Fees</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${state.importedRows.slice(0, 5).map(row => `
                        <tr>
                          <td><strong>${row.admissionId || 'Auto-Gen'}</strong></td>
                          <td>${row.name || 'Unknown'}</td>
                          <td>${row.mobile || '-'}</td>
                          <td><span class="badge badge-info">${row.course || 'ADMLT'}</span></td>
                          <td>₹${row.totalFees || '-'}</td>
                          <td style="color: var(--accent-green);">₹${row.paidFees || '0'}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
                
                <button class="btn btn-primary" onclick="app.executeImportMerge()" style="margin-top: 16px; width: 100%; height: 44px;">
                  <i data-lucide="upload" style="width: 18px; height: 18px;"></i>
                  <span>Confirm Import & Merge ${state.importedRows.length} Rows</span>
                </button>
              </div>
            ` : ''}
          </div>

          <!-- Right Panel: Template instructions & column matcher mapping -->
          <div class="card-glass" style="display: flex; flex-direction: column; gap: 16px;">
            <h3 style="font-size: 1.1rem; color: var(--text-primary);">Excel Sheet Template Guide</h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary);">For successful importing, structure your Excel/CSV file with columns containing these keywords:</p>
            
            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.8rem;">
              <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 8px;">
                <span style="font-weight: 600; color: var(--text-primary);">Student Full Name *</span>
                <span style="color: var(--text-light);">name, full name, student name</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 8px;">
                <span style="font-weight: 600; color: var(--text-primary);">Course ID *</span>
                <span style="color: var(--text-light);">course, branch (ADMLT or ADXRT)</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 8px;">
                <span style="font-weight: 600; color: var(--text-primary);">Admission ID</span>
                <span style="color: var(--text-light);">admission id, enrollment id, id</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 8px;">
                <span style="font-weight: 600; color: var(--text-primary);">Mobile Number</span>
                <span style="color: var(--text-light);">mobile, phone, contact</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 8px;">
                <span style="font-weight: 600; color: var(--text-primary);">Parent Mobile</span>
                <span style="color: var(--text-light);">parent mobile, guardian mobile</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-color); padding-bottom: 8px;">
                <span style="font-weight: 600; color: var(--text-primary);">Total Fees Expected</span>
                <span style="color: var(--text-light);">total fees, expected, amount</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding-bottom: 8px;">
                <span style="font-weight: 600; color: var(--text-primary);">Paid Fees</span>
                <span style="color: var(--text-light);">paid fees, paid, collected</span>
              </div>
            </div>

            <div style="background: var(--accent-orange-bg); border-left: 3px solid var(--accent-orange); padding: 12px; border-radius: var(--radius-sm); font-size: 0.75rem; color: var(--text-secondary); line-height: 1.4;">
              <strong>Deduplication Rule:</strong> Matching is case-insensitive. If a match is found based on <em>Admission ID</em> or <em>Name + Mobile</em>, the existing record will update its details and adjust its paid/pending fees accordingly.
            </div>
            
            <a class="btn btn-secondary" href="data:text/csv;charset=utf-8,admissionId,name,course,mobile,parentMobile,totalFees,paidFees%0ACPTC-2026-999,Sample%20Student,ADMLT,9876543210,9876543211,45000,10000" download="cptc_import_template.csv" style="font-size: 0.75rem; text-decoration: none;">
              <i data-lucide="download" style="width: 14px; height: 14px;"></i>
              Download Sample Template CSV
            </a>
          </div>
        </div>
      </div>
    `;
  }
};
export default ExcelImport;
