// StudentList.js - Student Roster and Search Management
import { translate } from "../services/translationService.js";

export const StudentList = {
  render: (state) => {
    const lang = state.language;
    const userRole = state.user.role; // super_admin, admin, clerk
    const students = state.students || [];

    // Filter by Course Tab
    let filtered = students;
    if (state.selectedCourseFilter && state.selectedCourseFilter !== "ALL") {
      filtered = filtered.filter(s => s.course === state.selectedCourseFilter);
    }

    // Search filter
    const query = (state.searchQuery || "").trim().toLowerCase();
    if (query !== "") {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(query) ||
        s.mobile.includes(query) ||
        s.admissionId.toLowerCase().includes(query) ||
        s.course.toLowerCase().includes(query)
      );
    }

    // Perm check helper
    const canEdit = userRole === 'super_admin' || userRole === 'admin';
    const canDelete = userRole === 'super_admin';

    return `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <h1 style="font-size: 1.75rem; color: var(--text-primary);">${translate('students', lang)}</h1>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">Manage and view records of registered students</p>
          </div>
          ${canEdit ? `
            <button class="btn btn-primary" onclick="app.openStudentFormModal(null)">
              <i data-lucide="plus" style="width: 18px; height: 18px;"></i>
              <span>${translate('addStudent', lang)}</span>
            </button>
          ` : ''}
        </div>

        <!-- Filter bar -->
        <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
          <!-- Course Selection -->
          <div class="course-tabs" style="margin-bottom: 0;">
            <button class="course-tab-btn ${(!state.selectedCourseFilter || state.selectedCourseFilter === 'ALL') ? 'active' : ''}" onclick="app.setCourseFilter('ALL')">All Courses</button>
            <button class="course-tab-btn ${state.selectedCourseFilter === 'ADMLT' ? 'active' : ''}" onclick="app.setCourseFilter('ADMLT')">ADMLT</button>
            <button class="course-tab-btn ${state.selectedCourseFilter === 'ADXRT' ? 'active' : ''}" onclick="app.setCourseFilter('ADXRT')">ADXRT</button>
          </div>

          <!-- Live Search Bar -->
          <div class="search-wrapper">
            <i data-lucide="search" class="search-icon-svg" style="width: 20px; height: 20px;"></i>
            <input type="text" class="search-input" id="student-search-box" 
              placeholder="${translate('searchPlaceholder', lang)}" 
              value="${state.searchQuery || ''}" 
              oninput="app.handleSearchInput(this.value)">
          </div>
        </div>

        <!-- Student Database Table -->
        <div class="card-glass" style="padding: 0; overflow: hidden;">
          <div class="table-container" style="border: none; border-radius: 0;">
            <table class="cptc-table">
              <thead>
                <tr>
                  <th>${translate('admissionId', lang)}</th>
                  <th>${translate('fullName', lang)}</th>
                  <th>${translate('course', lang)}</th>
                  <th>${translate('mobile', lang)}</th>
                  <th>${translate('totalFees', lang)}</th>
                  <th>${translate('paidFees', lang)}</th>
                  <th>${translate('pendingFees', lang)}</th>
                  <th>${translate('status', lang)}</th>
                  <th>${translate('actions', lang)}</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.length === 0 ? `
                  <tr>
                    <td colspan="9" style="text-align: center; color: var(--text-light); padding: 32px 0;">
                      ${translate('noRecords', lang)}
                    </td>
                  </tr>
                ` : filtered.map(student => {
                  const total = Number(student.totalFees) || 0;
                  const paid = Number(student.paidFees) || 0;
                  const pending = Number(student.pendingFees) || 0;
                  
                  let statusBadge = "badge-info";
                  if (student.status === "Completed") statusBadge = "badge-success";
                  if (student.status === "Suspended") statusBadge = "badge-danger";
                  if (student.status === "Active" && pending > 0) statusBadge = "badge-warning";

                  return `
                    <tr>
                      <td style="font-weight: 600; color: var(--text-primary);">${student.admissionId}</td>
                      <td>
                        <div style="font-weight: 600; color: var(--text-primary);">${student.name}</div>
                        <div style="font-size: 0.75rem; color: var(--text-light);">Batch: ${student.batch}</div>
                      </td>
                      <td><span class="badge badge-info">${student.course}</span></td>
                      <td>
                        <div style="font-size: 0.85rem;"><i data-lucide="phone" style="width: 12px; height: 12px; display: inline; vertical-align: middle; margin-right: 4px;"></i>${student.mobile}</div>
                        ${student.parentMobile ? `<div style="font-size: 0.75rem; color: var(--text-light);">Parent: ${student.parentMobile}</div>` : ''}
                      </td>
                      <td style="font-weight: 500;">₹${total.toLocaleString('en-IN')}</td>
                      <td style="font-weight: 500; color: var(--accent-green);">₹${paid.toLocaleString('en-IN')}</td>
                      <td style="font-weight: 600; color: ${pending > 0 ? 'var(--accent-red)' : 'var(--text-secondary)'};">
                        ₹${pending.toLocaleString('en-IN')}
                      </td>
                      <td><span class="badge ${statusBadge}">${translate(student.status.toLowerCase(), lang)}</span></td>
                      <td>
                        <div style="display: flex; gap: 8px; align-items: center;">
                          <!-- Collect installment -->
                          <button class="btn btn-secondary" onclick="app.openCollectFeesModal('${student.id}')" style="padding: 6px 10px; font-size: 0.75rem; color: var(--primary); border-color: var(--primary-light); background: var(--primary-light);" title="${translate('collectFees', lang)}">
                            <i data-lucide="indian-rupee" style="width: 14px; height: 14px;"></i>
                          </button>
                          
                          <!-- Edit (restricted to admin/owner) -->
                          ${canEdit ? `
                            <button class="btn btn-secondary" onclick="app.openStudentFormModal('${student.id}')" style="padding: 6px 10px; font-size: 0.75rem;" title="${translate('editStudent', lang)}">
                              <i data-lucide="edit" style="width: 14px; height: 14px;"></i>
                            </button>
                          ` : ''}

                          <!-- Delete (restricted to super admin only) -->
                          ${canDelete ? `
                            <button class="btn btn-secondary" onclick="app.confirmDeleteStudent('${student.id}')" style="padding: 6px 10px; font-size: 0.75rem; color: var(--accent-red); border-color: rgba(239, 68, 68, 0.1);" title="${translate('deleteStudent', lang)}">
                              <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                            </button>
                          ` : ''}
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }
};
export default StudentList;
