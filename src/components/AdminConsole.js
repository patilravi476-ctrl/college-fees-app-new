// AdminConsole.js - Super Admin controls, Audit Logs, and Backups
import { translate } from "../services/translationService.js";
import { dbService } from "../services/dbService.js";

export const AdminConsole = {
  render: (state) => {
    const lang = state.language;
    const staffList = dbService.getStaff();
    const logs = state.logs || [];
    
    // Check if current user is Super Admin
    const isSuperAdmin = state.user.role === 'super_admin';

    if (!isSuperAdmin) {
      return `
        <div class="card-glass" style="text-align: center; padding: 40px; border-color: var(--accent-red-bg);">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; background: var(--accent-red-bg); color: var(--accent-red); border-radius: 50%; margin-bottom: 16px;">
            <i data-lucide="shield-alert" style="width: 28px; height: 28px;"></i>
          </div>
          <h2 style="font-size: 1.25rem; color: var(--text-primary); margin-bottom: 8px;">Access Restricted</h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary); max-width: 400px; margin: 0 auto 16px;">
            Only the primary institution owner (Super Admin) is authorized to view audit logs, adjust staff accounts, or perform database restorations.
          </p>
          <button class="btn btn-primary" onclick="app.changeTab('dashboard')">Back to Dashboard</button>
        </div>
      `;
    }

    return `
      <div>
        <div style="margin-bottom: 20px;">
          <h1 style="font-size: 1.75rem; color: var(--text-primary);">${translate('adminConsole', lang)}</h1>
          <p style="font-size: 0.9rem; color: var(--text-secondary);">Super Admin security logs, staff credentials, and backups</p>
        </div>

        <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 24px; margin-bottom: 24px; align-items: start;">
          
          <!-- Column 1: Staff Directory & Backups -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            
            <!-- Staff Accounts -->
            <div class="card-glass">
              <h3 style="font-size: 1.1rem; color: var(--text-primary); margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
                <span style="display: flex; align-items: center; gap: 8px;">
                  <i data-lucide="user-cog" style="color: var(--primary); width: 20px; height: 20px;"></i>
                  <span>Staff Portal Users</span>
                </span>
                <button class="btn btn-primary" onclick="app.openStaffCreateModal()" style="padding: 6px 12px; font-size: 0.8rem;">
                  Add Staff
                </button>
              </h3>
              
              <div class="table-container" style="border: none;">
                <table class="cptc-table" style="font-size: 0.85rem;">
                  <thead>
                    <tr>
                      <th>Staff Name</th>
                      <th>Role</th>
                      <th>Username</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${staffList.map(u => `
                      <tr>
                        <td>
                          <div style="font-weight: 600;">${u.name}</div>
                          <div style="font-size: 0.7rem; color: var(--text-light);">${u.mobile || '-'}</div>
                        </td>
                        <td><span class="badge badge-info">${translate(u.role, lang)}</span></td>
                        <td><code>${u.username}</code></td>
                        <td>
                          <span class="badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}">
                            ${u.status}
                          </span>
                        </td>
                        <td>
                          <div style="display: flex; gap: 6px;">
                            ${u.username === 'owner' ? `
                              <span style="font-size: 0.7rem; color: var(--text-light); font-style: italic;">Primary Admin</span>
                            ` : `
                              <button class="btn btn-secondary" onclick="app.toggleStaffStatus('${u.uid}')" style="padding: 4px 8px; font-size: 0.75rem; color: ${u.status === 'active' ? 'var(--accent-red)' : 'var(--accent-green)'};">
                                ${u.status === 'active' ? 'Deactivate' : 'Activate'}
                              </button>
                            `}
                          </div>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Backup & Restore -->
            <div class="card-glass">
              <h3 style="font-size: 1.1rem; color: var(--text-primary); margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                <i data-lucide="database" style="color: var(--primary); width: 20px; height: 20px;"></i>
                <span>${translate('backupRestore', lang)}</span>
              </h3>
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 16px;">
                ${translate('backupDesc', lang)}
              </p>
              
              <div style="display: flex; flex-wrap: wrap; gap: 12px;">
                <!-- Download backup button -->
                <button class="btn btn-primary" onclick="app.downloadBackupSnapshot()">
                  <i data-lucide="download"></i>
                  <span>${translate('downloadBackup', lang)}</span>
                </button>

                <!-- Restore backup trigger -->
                <button class="btn btn-secondary" onclick="document.getElementById('backup-file-input').click()">
                  <i data-lucide="upload"></i>
                  <span>${translate('restoreBackup', lang)}</span>
                </button>
                <input type="file" id="backup-file-input" accept=".json" style="display: none;" onchange="app.handleRestoreBackup(event)">
              </div>
            </div>

          </div>

          <!-- Column 2: Audit Logs -->
          <div class="card-glass" style="display: flex; flex-direction: column;">
            <h3 style="font-size: 1.1rem; color: var(--text-primary); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="shield-check" style="color: var(--primary); width: 20px; height: 20px;"></i>
              <span>${translate('activityLogTitle', lang)}</span>
            </h3>

            <div style="max-height: 500px; overflow-y: auto; flex: 1;">
              ${logs.length === 0 ? `
                <p style="text-align: center; color: var(--text-light); padding: 32px 0;">No system logs recorded.</p>
              ` : `
                <div style="display: flex; flex-direction: column; gap: 12px;">
                  ${logs.map(log => {
                    let logColor = "var(--primary)";
                    let logIcon = "info";
                    if (log.type === "payment") { logColor = "var(--accent-green)"; logIcon = "indian-rupee"; }
                    if (log.type.startsWith("student_delete")) { logColor = "var(--accent-red)"; logIcon = "trash-2"; }
                    if (log.type === "excel_import") { logColor = "var(--accent-blue)"; logIcon = "file-spreadsheet"; }
                    if (log.type === "login") { logColor = "var(--accent-orange)"; logIcon = "key"; }

                    return `
                      <div style="border-left: 3px solid ${logColor}; padding-left: 10px; font-size: 0.8rem; display: flex; flex-direction: column; gap: 2px;">
                        <div style="display: flex; justify-content: space-between; font-weight: 500;">
                          <span style="color: var(--text-primary);">${log.action}</span>
                          <span style="font-size: 0.7rem; color: var(--text-light);">${new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-secondary);">
                          <span>By: <strong>${log.userName}</strong></span>
                          <span>${new Date(log.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              `}
            </div>
          </div>

        </div>

        <!-- Add Staff Dialog Popup Overlay -->
        ${state.showStaffCreateModal ? `
          <div class="modal-overlay">
            <div class="modal-container" style="max-width: 400px;">
              <div class="modal-header">
                <h3 style="font-size: 1.1rem; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                  <i data-lucide="user-plus" style="color: var(--primary); width: 20px; height: 20px;"></i>
                  <span>Add New Staff Account</span>
                </h3>
                <button onclick="app.closeStaffCreateModal()" style="background: transparent; border: none; color: var(--text-light); cursor: pointer;">
                  <i data-lucide="x" style="width: 24px; height: 24px;"></i>
                </button>
              </div>
              <form onsubmit="app.handleCreateStaff(event)">
                <div class="modal-body">
                  <div class="form-group">
                    <label for="staff-name">Staff Name *</label>
                    <input type="text" class="form-control" id="staff-name" required placeholder="e.g. Ramesh Patil">
                  </div>
                  <div class="form-group">
                    <label for="staff-mobile">Mobile Number</label>
                    <input type="tel" class="form-control" id="staff-mobile" placeholder="10-digit number" pattern="[0-9]{10}">
                  </div>
                  <div class="form-group">
                    <label for="staff-username">Username *</label>
                    <input type="text" class="form-control" id="staff-username" required placeholder="e.g. ramesh">
                  </div>
                  <div class="form-group">
                    <label for="staff-password">Password *</label>
                    <input type="password" class="form-control" id="staff-password" required placeholder="Password">
                  </div>
                  <div class="form-group">
                    <label for="staff-role">Role Permissions *</label>
                    <select class="form-control" id="staff-role" required>
                      <option value="clerk">Clerk (Operator)</option>
                      <option value="admin">Admin (Manager)</option>
                    </select>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" onclick="app.closeStaffCreateModal()">${translate('cancel', lang)}</button>
                  <button type="submit" class="btn btn-primary">Create Account</button>
                </div>
              </form>
            </div>
          </div>
        ` : ''}

      </div>
    `;
  }
};
export default AdminConsole;
