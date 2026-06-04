// StudentFormModal.js - Add/Edit Student Modal Dialog
import { translate } from "../services/translationService.js";

export const StudentFormModal = {
  render: (state) => {
    const lang = state.language;
    const editingId = state.editingStudentId; // String if editing, null if adding
    
    // Find editing student details if any
    let student = {
      admissionId: `CPTC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      name: "",
      mobile: "",
      parentMobile: "",
      course: "ADMLT",
      batch: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      totalFees: 45000, // Default for ADMLT
      paidFees: 0,
      status: "Active"
    };

    if (editingId) {
      const found = state.students.find(s => s.id === editingId);
      if (found) student = { ...found };
    }

    const isEdit = !!editingId;

    return `
      <div class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h2 style="font-size: 1.25rem; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
              <i data-lucide="${isEdit ? 'edit' : 'user-plus'}" style="color: var(--primary); width: 22px; height: 22px;"></i>
              <span>${isEdit ? translate('editStudent', lang) : translate('addStudent', lang)}</span>
            </h2>
            <button onclick="app.closeStudentFormModal()" style="background: transparent; border: none; color: var(--text-light); cursor: pointer;" class="no-print">
              <i data-lucide="x" style="width: 24px; height: 24px;"></i>
            </button>
          </div>
          <form onsubmit="app.handleSaveStudent(event, '${editingId || ''}')">
            <div class="modal-body">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <!-- Admission ID -->
                <div class="form-group">
                  <label for="form-admission-id">${translate('admissionId', lang)} *</label>
                  <input type="text" class="form-control" id="form-admission-id" required value="${student.admissionId}" ${isEdit ? 'disabled' : ''}>
                </div>

                <!-- Course Dropdown -->
                <div class="form-group">
                  <label for="form-course">${translate('course', lang)} *</label>
                  <select class="form-control" id="form-course" required onchange="app.handleCourseChange(this.value)">
                    <option value="ADMLT" ${student.course === 'ADMLT' ? 'selected' : ''}>ADMLT</option>
                    <option value="ADXRT" ${student.course === 'ADXRT' ? 'selected' : ''}>ADXRT</option>
                  </select>
                </div>
              </div>

              <!-- Full Name -->
              <div class="form-group">
                <label for="form-name">${translate('fullName', lang)} *</label>
                <input type="text" class="form-control" id="form-name" placeholder="First Middle Last Name" required value="${student.name}">
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <!-- Mobile -->
                <div class="form-group">
                  <label for="form-mobile">${translate('mobile', lang)} *</label>
                  <input type="tel" class="form-control" id="form-mobile" placeholder="10-digit number" pattern="[0-9]{10}" required value="${student.mobile}">
                </div>

                <!-- Parent Mobile -->
                <div class="form-group">
                  <label for="form-parent-mobile">${translate('parentMobile', lang)}</label>
                  <input type="tel" class="form-control" id="form-parent-mobile" placeholder="10-digit number" pattern="[0-9]{10}" value="${student.parentMobile || ''}">
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <!-- Batch -->
                <div class="form-group">
                  <label for="form-batch">${translate('batch', lang)} *</label>
                  <input type="text" class="form-control" id="form-batch" placeholder="e.g. 2025-2026" required value="${student.batch}">
                </div>

                <!-- Status -->
                <div class="form-group">
                  <label for="form-status">${translate('status', lang)} *</label>
                  <select class="form-control" id="form-status" required>
                    <option value="Active" ${student.status === 'Active' ? 'selected' : ''}>Active</option>
                    <option value="Completed" ${student.status === 'Completed' ? 'selected' : ''}>Completed</option>
                    <option value="Suspended" ${student.status === 'Suspended' ? 'selected' : ''}>Suspended</option>
                  </select>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <!-- Total Fees -->
                <div class="form-group">
                  <label for="form-total-fees">${translate('totalFees', lang)} *</label>
                  <input type="number" class="form-control" id="form-total-fees" min="0" required value="${student.totalFees}">
                </div>

                <!-- Initial Paid Fees (Disabled if editing - must use payment instead) -->
                <div class="form-group">
                  <label for="form-paid-fees">${translate('paidFees', lang)}</label>
                  <input type="number" class="form-control" id="form-paid-fees" min="0" value="${student.paidFees}"  
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="app.closeStudentFormModal()">${translate('cancel', lang)}</button>
              <button type="submit" class="btn btn-primary">${translate('save', lang)}</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }
};
export default StudentFormModal;
