// Dashboard.js - Admin Dashboard View
import { translate } from "../services/translationService.js";

export const Dashboard = {
  render: (state) => {
    const lang = state.language;
    const students = state.students || [];
    const transactions = state.transactions || [];

    // Calculate core metrics
    const totalStudentsCount = students.length;
    const totalFeesExpected = students.reduce((sum, s) => sum + (Number(s.totalFees) || 0), 0);
    const totalFeesCollected = students.reduce((sum, s) => sum + (Number(s.paidFees) || 0), 0);
    const totalFeesPending = students.reduce((sum, s) => sum + (Number(s.pendingFees) || 0), 0);

    // Calculate Today's Collection
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTransactions = transactions.filter(t => t.date.split('T')[0] === todayStr);
    const todayCollectedAmt = todayTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    // Calculate Course breakdown
    const admltStudents = students.filter(s => s.course === "ADMLT");
    const admltExpected = admltStudents.reduce((sum, s) => sum + (Number(s.totalFees) || 0), 0);
    const admltCollected = admltStudents.reduce((sum, s) => sum + (Number(s.paidFees) || 0), 0);
    const admltPct = admltExpected > 0 ? Math.round((admltCollected / admltExpected) * 100) : 0;

    const adxrtStudents = students.filter(s => s.course === "ADXRT");
    const adxrtExpected = adxrtStudents.reduce((sum, s) => sum + (Number(s.totalFees) || 0), 0);
    const adxrtCollected = adxrtStudents.reduce((sum, s) => sum + (Number(s.paidFees) || 0), 0);
    const adxrtPct = adxrtExpected > 0 ? Math.round((adxrtCollected / adxrtExpected) * 100) : 0;

    // Get pending students list (limited to top 5 for dashboard overview)
    const pendingStudents = students
      .filter(s => (Number(s.pendingFees) || 0) > 0)
      .sort((a, b) => b.pendingFees - a.pendingFees)
      .slice(0, 5);

    // Get recent transactions (limited to 5)
    const recentTx = transactions.slice(0, 5);

    return `
      <div>
        <!-- Welcome banner -->
        <div style="margin-bottom: 24px;">
          <h1 style="font-size: 1.75rem; color: var(--text-primary);">${translate('dashboard', lang)}</h1>
          <p style="font-size: 0.9rem; color: var(--text-secondary);">${translate('welcome', lang)}, <strong>${state.user.name}</strong> (${translate(state.user.role, lang)})</p>
        </div>

        <!-- Metric Grid -->
        <div class="stat-grid">
          <!-- Total Students -->
          <div class="card-glass stat-card">
            <div>
              <p style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 500;">${translate('totalStudents', lang)}</p>
              <h2 style="font-size: 2rem; color: var(--text-primary); margin-top: 4px;">${totalStudentsCount}</h2>
            </div>
            <div class="stat-icon" style="background: var(--accent-blue-bg); color: var(--accent-blue);">
              <i data-lucide="users"></i>
            </div>
          </div>

          <!-- Total Collected -->
          <div class="card-glass stat-card">
            <div>
              <p style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 500;">${translate('totalCollected', lang)}</p>
              <h2 style="font-size: 2rem; color: var(--accent-green); margin-top: 4px;">₹${totalFeesCollected.toLocaleString('en-IN')}</h2>
              <span style="font-size: 0.75rem; color: var(--text-light);">expected: ₹${totalFeesExpected.toLocaleString('en-IN')}</span>
            </div>
            <div class="stat-icon" style="background: var(--accent-green-bg); color: var(--accent-green);">
              <i data-lucide="indian-rupee"></i>
            </div>
          </div>

          <!-- Total Pending -->
          <div class="card-glass stat-card">
            <div>
              <p style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 500;">${translate('totalPending', lang)}</p>
              <h2 style="font-size: 2rem; color: var(--accent-red); margin-top: 4px;">₹${totalFeesPending.toLocaleString('en-IN')}</h2>
            </div>
            <div class="stat-icon" style="background: var(--accent-red-bg); color: var(--accent-red);">
              <i data-lucide="clock"></i>
            </div>
          </div>

          <!-- Today's Collection -->
          <div class="card-glass stat-card">
            <div>
              <p style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 500;">${translate('todayCollection', lang)}</p>
              <h2 style="font-size: 2rem; color: var(--primary); margin-top: 4px;">₹${todayCollectedAmt.toLocaleString('en-IN')}</h2>
              <span style="font-size: 0.75rem; color: var(--text-light);">${todayTransactions.length} receipts today</span>
            </div>
            <div class="stat-icon" style="background: var(--primary-light); color: var(--primary);">
              <i data-lucide="calendar"></i>
            </div>
          </div>
        </div>

        <!-- Course-wise Progress Bar Row -->
        <div class="stat-grid" style="grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); margin-bottom: 24px;">
          <!-- ADMLT -->
          <div class="card-glass">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <div>
                <h3 style="font-size: 1.1rem; color: var(--text-primary);">ADMLT</h3>
                <p style="font-size: 0.75rem; color: var(--text-secondary);">Advance Diploma In Medical Laboratory Technology</p>
              </div>
              <span class="badge badge-info" style="font-size: 0.8rem; padding: 4px 10px;">${admltStudents.length} Students</span>
            </div>
            <div style="margin-top: 16px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                <span style="color: var(--text-secondary);">Collected: <strong>₹${admltCollected.toLocaleString('en-IN')}</strong> / ₹${admltExpected.toLocaleString('en-IN')}</span>
                <span style="font-weight: 600; color: var(--primary);">${admltPct}%</span>
              </div>
              <div style="width: 100%; height: 8px; background: var(--border-color); border-radius: 4px; overflow: hidden;">
                <div style="width: ${admltPct}%; height: 100%; background: var(--primary); border-radius: 4px;"></div>
              </div>
            </div>
          </div>

          <!-- ADXRT -->
          <div class="card-glass">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <div>
                <h3 style="font-size: 1.1rem; color: var(--text-primary);">ADXRT</h3>
                <p style="font-size: 0.75rem; color: var(--text-secondary);">Advance Diploma In X-Ray Radiography Technique</p>
              </div>
              <span class="badge badge-info" style="font-size: 0.8rem; padding: 4px 10px;">${adxrtStudents.length} Students</span>
            </div>
            <div style="margin-top: 16px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                <span style="color: var(--text-secondary);">Collected: <strong>₹${adxrtCollected.toLocaleString('en-IN')}</strong> / ₹${adxrtExpected.toLocaleString('en-IN')}</span>
                <span style="font-weight: 600; color: var(--accent-blue);">${adxrtPct}%</span>
              </div>
              <div style="width: 100%; height: 8px; background: var(--border-color); border-radius: 4px; overflow: hidden;">
                <div style="width: ${adxrtPct}%; height: 100%; background: var(--accent-blue); border-radius: 4px;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Double Column Layout -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px;">
          <!-- Overdue Fees List -->
          <div class="card-glass" style="display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h3 style="font-size: 1.1rem; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                <i data-lucide="alert-triangle" style="color: var(--accent-orange); width: 20px; height: 20px;"></i>
                <span>${translate('pendingList', lang)}</span>
              </h3>
              <button class="btn btn-secondary" onclick="app.changeTab('reports')" style="padding: 6px 12px; font-size: 0.8rem;">
                View All
              </button>
            </div>
            <div style="flex: 1;">
              ${pendingStudents.length === 0 ? `
                <p style="text-align: center; color: var(--text-light); padding: 24px 0;">No pending fees!</p>
              ` : `
                <div class="table-container" style="border: none;">
                  <table class="cptc-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Course</th>
                        <th>Pending (₹)</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${pendingStudents.map(student => `
                        <tr>
                          <td>
                            <div style="font-weight: 600;">${student.name}</div>
                            <div style="font-size: 0.75rem; color: var(--text-light);">${student.admissionId}</div>
                          </td>
                          <td><span class="badge badge-info">${student.course}</span></td>
                          <td style="font-weight: 600; color: var(--accent-red);">₹${student.pendingFees.toLocaleString('en-IN')}</td>
                          <td>
                            <button class="btn btn-primary" onclick="app.openCollectFeesModal('${student.id}')" style="padding: 4px 8px; font-size: 0.75rem; border-radius: 4px;">
                              Pay
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

          <!-- Recent Transactions -->
          <div class="card-glass" style="display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h3 style="font-size: 1.1rem; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                <i data-lucide="history" style="color: var(--primary); width: 20px; height: 20px;"></i>
                <span>${translate('recentCollections', lang)}</span>
              </h3>
              <button class="btn btn-secondary" onclick="app.changeTab('fees')" style="padding: 6px 12px; font-size: 0.8rem;">
                Open Fees Desk
              </button>
            </div>
            <div style="flex: 1;">
              ${recentTx.length === 0 ? `
                <p style="text-align: center; color: var(--text-light); padding: 24px 0;">No transactions recorded.</p>
              ` : `
                <div class="table-container" style="border: none;">
                  <table class="cptc-table">
                    <thead>
                      <tr>
                        <th>Receipt & Student</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${recentTx.map(tx => `
                        <tr>
                          <td>
                            <div style="font-weight: 600; font-size: 0.85rem;">${tx.receiptNo}</div>
                            <div style="font-size: 0.75rem; color: var(--text-secondary);">${tx.studentName}</div>
                          </td>
                          <td style="font-weight: 600; color: var(--accent-green);">₹${tx.amount.toLocaleString('en-IN')}</td>
                          <td><span class="badge ${tx.paymentMethod === 'Cash' ? 'badge-warning' : 'badge-success'}">${tx.paymentMethod}</span></td>
                          <td>
                            <button class="btn btn-secondary" onclick="app.printReceiptDirect('${tx.id}')" style="padding: 4px 8px; font-size: 0.75rem; border-radius: 4px;">
                              <i data-lucide="printer" style="width: 12px; height: 12px;"></i>
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
      </div>
    `;
  }
};
export default Dashboard;
