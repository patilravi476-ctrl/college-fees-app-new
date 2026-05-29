// Login.js - Staff Authentication View
import { translate } from "../services/translationService.js";
import { dbService } from "../services/dbService.js";

export const Login = {
  render: (state) => {
    const lang = state.language;
    const staffMembers = dbService.getStaff().filter(u => u.status === "active");

    return `
      <div class="login-bg">
        <div class="login-card">
          <!-- Logo Header -->
          <div style="text-align: center; margin-bottom: 24px;">
          <img src="/assets/logo.png"
     alt="College Logo"
     style="width:100px;height:auto;margin-bottom:10px;">
            ; border-radius: var(--radius); font-weight: 800; font-size: 1.75rem; box-shadow: 0 0 20px rgba(13,148,136,0.3); margin-bottom: 12px;">CP</div>
            <h1 style="font-size: 1.4rem; color: var(--text-primary); margin-bottom: 4px;">${translate('collegeName', lang)}</h1>
            <p style="font-size: 0.85rem; color: var(--text-secondary);">${translate('loginSubtitle', lang)}</p>
          </div>

          <!-- Error Alert -->
          ${state.loginError ? `
            <div style="background: var(--accent-red-bg); color: var(--accent-red); padding: 12px; border-radius: var(--radius-sm); font-size: 0.85rem; margin-bottom: 16px; border: 1px solid rgba(239, 68, 68, 0.2); display: flex; align-items: center; gap: 8px;">
              <i data-lucide="alert-circle" style="width: 18px; height: 18px;"></i>
              <span>${state.loginError}</span>
            </div>
          ` : ''}

          <!-- Form -->
          <form onsubmit="app.handleLogin(event)">
            <!-- Account selector (User-friendly) -->
            <div class="form-group">
              <label for="login-username-select">${translate('selectUser', lang)}</label>
              <select class="form-control" id="login-username-select" onchange="document.getElementById('login-username').value = this.value" style="font-weight: 500;">
                <option value="">-- Select Staff Account --</option>
                ${staffMembers.map(user => `
                  <option value="${user.username}">${user.name} (${translate(user.role, lang)})</option>
                `).join('')}
              </select>
            </div>

            <!-- Manual Username Input -->
            <div class="form-group">
              <label for="login-username">${translate('username', lang)}</label>
              <input type="text" class="form-control" id="login-username" placeholder="e.g., owner, rakesh" required value="">
            </div>

            <!-- Password -->
            <div class="form-group">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label for="login-password" style="margin-bottom: 0;">${translate('password', lang)}</label>
                <span style="font-size: 0.75rem; color: var(--text-light);">Try password: 123</span>
              </div>
              <input type="password" class="form-control" id="login-password" placeholder="••••••••" required>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px; height: 44px;">
              <i data-lucide="log-in" style="width: 18px; height: 18px;"></i>
              <span>${translate('signIn', lang)}</span>
            </button>
          </form>
        </div>
      </div>
    `;
  }
};
export default Login;
