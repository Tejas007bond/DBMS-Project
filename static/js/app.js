/**
 * Hospital Management System - Enterprise Frontend Application Logic
 * Directly communicates with Flask Backend & Oracle 11g XE Database
 */

// State Management
let currentTab = "viewDashboard";
let allPatientsData = [];
let demoQueriesData = [];
let activeQueryId = "query_1";

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  loadAllData();
});

/**
 * Configure sidebar navigation and tab switching.
 */
function setupNavigation() {
  const navButtons = document.querySelectorAll(".nav-item");
  const viewPanels = document.querySelectorAll(".view-panel");
  const breadcrumbCurrent = document.getElementById("breadcrumbCurrent");

  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetViewId = btn.getAttribute("data-target");
      if (!targetViewId) return;

      navButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      viewPanels.forEach(panel => panel.classList.remove("active"));
      const targetPanel = document.getElementById(targetViewId);
      if (targetPanel) {
        targetPanel.classList.add("active");
      }

      currentTab = targetViewId;
      if (breadcrumbCurrent) {
        const title = btn.querySelector(".nav-text")?.textContent || "Dashboard";
        breadcrumbCurrent.textContent = title;
      }
    });
  });
}

function navigateTo(viewId) {
  const targetNavBtn = document.querySelector(`.nav-item[data-target="${viewId}"]`);
  if (targetNavBtn) {
    targetNavBtn.click();
  }
}

/**
 * Load all data across views from Oracle backend.
 */
async function loadAllData() {
  await Promise.all([
    checkDatabaseStatus(),
    loadDashboardSummary(),
    loadPatients(),
    loadDoctors(),
    loadNurses(),
    loadPharmacists(),
    loadRooms(),
    loadBilling(),
    loadAppointmentsAndTests(),
    loadDemoQueries()
  ]);
}

async function refreshAllData() {
  const btn = document.querySelector(".app-topbar .btn-secondary");
  if (btn) btn.innerHTML = "⏳ Refreshing...";
  await loadAllData();
  if (btn) btn.innerHTML = "🔄 Refresh Data";
}

/**
 * Database Health & Status Check
 */
async function checkDatabaseStatus() {
  const topbarBadge = document.getElementById("topbarDbBadge");
  const sidebarDot = document.getElementById("sidebarDbDot");
  const sidebarText = document.getElementById("sidebarDbText");
  const sidebarSub = document.getElementById("sidebarDbSub");
  const diagStatusBadge = document.getElementById("diagStatusBadge");

  try {
    const res = await fetch("/api/db-status");
    const data = await res.json();

    if (data.connected) {
      if (topbarBadge) {
        topbarBadge.className = "status-badge badge-success";
        topbarBadge.innerHTML = `<span class="status-dot connected"></span> Oracle Connected`;
      }
      if (sidebarDot) sidebarDot.className = "status-dot connected pulse";
      if (sidebarText) sidebarText.textContent = "Oracle: Connected";
      if (sidebarSub) sidebarSub.textContent = `${data.details.host || 'localhost'}:${data.details.port || 1521} / ${data.details.service_name || 'XE'}`;
      if (diagStatusBadge) {
        diagStatusBadge.className = "status-badge badge-success";
        diagStatusBadge.textContent = "CONNECTED (200 OK)";
      }
      if (document.getElementById("diagVersion")) {
        document.getElementById("diagVersion").textContent = data.details.version || "11.2.0.2.0";
      }
    } else {
      if (topbarBadge) {
        topbarBadge.className = "status-badge badge-danger";
        topbarBadge.innerHTML = `<span class="status-dot disconnected"></span> Oracle Error`;
      }
      if (sidebarDot) sidebarDot.className = "status-dot disconnected";
      if (sidebarText) sidebarText.textContent = "Oracle: Disconnected";
      if (diagStatusBadge) {
        diagStatusBadge.className = "status-badge badge-danger";
        diagStatusBadge.textContent = "DISCONNECTED";
      }
    }
  } catch (err) {
    if (topbarBadge) {
      topbarBadge.className = "status-badge badge-danger";
      topbarBadge.innerHTML = `<span class="status-dot disconnected"></span> Network Error`;
    }
  }
}

/**
 * 1. Dashboard KPIs
 */
async function loadDashboardSummary() {
  try {
    const res = await fetch("/api/dashboard-summary");
    const json = await res.json();
    if (!json.success) return;

    const d = json.data;
    document.getElementById("kpiTotalPatients").textContent = d.total_patients;
    document.getElementById("kpiActivePatients").textContent = `${d.active_patients} Currently Admitted`;
    document.getElementById("kpiDischargedPatients").textContent = `${d.discharged_patients} Discharged`;

    document.getElementById("kpiTotalStaff").textContent = d.total_employees;
    document.getElementById("kpiTotalRooms").textContent = d.total_rooms;
    document.getElementById("kpiAvailableRooms").textContent = `${d.available_rooms} Available`;

    document.getElementById("kpiTotalRevenue").textContent = `$${d.total_revenue.toLocaleString()}`;
    document.getElementById("kpiTotalInsurance").textContent = `$${d.total_insurance.toLocaleString()} Insured`;

    document.getElementById("navBadgePatients").textContent = d.total_patients;
    document.getElementById("navBadgeDoctors").textContent = d.total_doctors;
    document.getElementById("navBadgeNurses").textContent = d.total_nurses;
  } catch (err) {
    console.error("Dashboard summary error:", err);
  }
}

/**
 * 2. Patients Module
 */
async function loadPatients() {
  try {
    const res = await fetch("/api/patients");
    const json = await res.json();
    if (!json.success) return;

    allPatientsData = json.data;
    renderPatientsTable(allPatientsData);
  } catch (err) {
    console.error("Error loading patients:", err);
  }
}

function renderPatientsTable(patients) {
  const tbody = document.getElementById("patientsTableBody");
  if (!tbody) return;

  if (patients.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted">No patients found.</td></tr>`;
    return;
  }

  tbody.innerHTML = patients.map(p => {
    const isAdmitted = p.status === "Admitted";
    const statusBadge = isAdmitted 
      ? `<span class="status-badge badge-success">Admitted</span>` 
      : `<span class="status-badge badge-info">Discharged</span>`;

    const insValid = p.insurance_valid === "Yes"
      ? `<span class="status-badge badge-success">Covered ($${(p.insurance_amount || 0).toLocaleString()})</span>`
      : p.insurance_valid === "Pending"
      ? `<span class="status-badge badge-warning">Pending</span>`
      : `<span class="status-badge badge-danger">Uninsured</span>`;

    return `
      <tr>
        <td><strong>#${p.patient_id}</strong></td>
        <td>
          <div style="font-weight: 600;">${p.f_name} ${p.l_name}</div>
        </td>
        <td>${p.gender === 'M' ? 'Male' : 'Female'}</td>
        <td class="mono-text">${p.phone || '-'}</td>
        <td>${p.address || '-'}</td>
        <td>
          ${p.room_no ? `<span class="kpi-tag">Room ${p.room_no} (${p.room_type || 'General'})</span>` : '<span class="text-muted">Unassigned</span>'}
        </td>
        <td>
          ${p.doctor_name ? `<strong>Dr. ${p.doctor_name}</strong><br><small class="text-muted">${p.doctor_specialization || ''}</small>` : '<span class="text-muted">N/A</span>'}
        </td>
        <td>
          <div><strong>In:</strong> ${p.in_date || '-'}</div>
          ${p.out_date ? `<div class="text-muted"><small>Out: ${p.out_date}</small></div>` : ''}
        </td>
        <td>${statusBadge}</td>
        <td>${insValid}</td>
      </tr>
    `;
  }).join("");
}

function filterPatients(type, btn) {
  document.querySelectorAll(".filter-group .btn-filter").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");

  if (type === "admitted") {
    renderPatientsTable(allPatientsData.filter(p => p.status === "Admitted"));
  } else if (type === "discharged") {
    renderPatientsTable(allPatientsData.filter(p => p.status === "Discharged"));
  } else {
    renderPatientsTable(allPatientsData);
  }
}

/**
 * 3. Doctors Module
 */
async function loadDoctors() {
  try {
    const res = await fetch("/api/doctors");
    const json = await res.json();
    if (!json.success) return;

    const grid = document.getElementById("doctorsGrid");
    if (!grid) return;

    grid.innerHTML = json.data.map(doc => `
      <div class="profile-card">
        <div class="profile-card-top">
          <div class="profile-avatar avatar-doctor">👨‍⚕️</div>
          <div class="profile-meta">
            <h4>Dr. ${doc.f_name} ${doc.l_name}</h4>
            <div class="profile-spec">${doc.specialization}</div>
            <span class="status-badge badge-purple" style="margin-top: 4px;">${doc.designation}</span>
          </div>
        </div>
        <div class="profile-details-list">
          <div class="profile-detail-row">
            <span>Employee ID:</span>
            <strong>#${doc.emp_id}</strong>
          </div>
          <div class="profile-detail-row">
            <span>Age:</span>
            <strong>${doc.age} yrs</strong>
          </div>
          <div class="profile-detail-row">
            <span>Direct Supervisor:</span>
            <strong>${doc.supervisor_name ? `Dr. ${doc.supervisor_name}` : 'Head of Dept'}</strong>
          </div>
          <div class="profile-detail-row">
            <span>Contact Phone:</span>
            <strong class="mono-text">${doc.contact_no}</strong>
          </div>
          <div class="profile-detail-row">
            <span>Active Patients:</span>
            <strong style="color: var(--primary);">${doc.patient_count} Assigned</strong>
          </div>
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.error("Doctors load error:", err);
  }
}

/**
 * 4. Nurses Module
 */
async function loadNurses() {
  try {
    const res = await fetch("/api/nurses");
    const json = await res.json();
    if (!json.success) return;

    const tbody = document.getElementById("nursesTableBody");
    if (!tbody) return;

    tbody.innerHTML = json.data.map(nurse => {
      const shiftBadge = nurse.shift_type === "Morning"
        ? `<span class="status-badge badge-warning">☀️ Morning</span>`
        : nurse.shift_type === "Night"
        ? `<span class="status-badge badge-purple">🌙 Night</span>`
        : `<span class="status-badge badge-info">🌆 Evening</span>`;

      const rooms = (nurse.rooms_handled || []).map(r => `<span class="kpi-tag">${r}</span>`).join(" ") || '<span class="text-muted">None</span>';

      return `
        <tr>
          <td><strong>#${nurse.emp_id}</strong></td>
          <td><strong>${nurse.f_name} ${nurse.l_name}</strong></td>
          <td class="mono-text">${nurse.contact_no}</td>
          <td>${nurse.address}</td>
          <td>${nurse.age} yrs</td>
          <td>${shiftBadge}</td>
          <td>${rooms}</td>
        </tr>
      `;
    }).join("");
  } catch (err) {
    console.error("Nurses load error:", err);
  }
}

/**
 * 5. Pharmacists Module
 */
async function loadPharmacists() {
  try {
    const res = await fetch("/api/pharmacists");
    const json = await res.json();
    if (!json.success) return;

    const grid = document.getElementById("pharmacistsGrid");
    if (!grid) return;

    grid.innerHTML = json.data.map(ph => `
      <div class="profile-card">
        <div class="profile-card-top">
          <div class="profile-avatar avatar-pharm">💊</div>
          <div class="profile-meta">
            <h4>${ph.f_name} ${ph.l_name}</h4>
            <div class="profile-spec">Pharmacist</div>
            <span class="status-badge badge-info" style="margin-top: 4px;">${ph.clearance_level}</span>
          </div>
        </div>
        <div class="profile-details-list">
          <div class="profile-detail-row">
            <span>Emp ID:</span>
            <strong>#${ph.emp_id}</strong>
          </div>
          <div class="profile-detail-row">
            <span>Age:</span>
            <strong>${ph.age} yrs</strong>
          </div>
          <div class="profile-detail-row">
            <span>Contact:</span>
            <strong class="mono-text">${ph.contact_no}</strong>
          </div>
          <div class="profile-detail-row">
            <span>Address:</span>
            <span>${ph.address}</span>
          </div>
          <div class="profile-detail-row">
            <span>Handled Records:</span>
            <strong style="color: var(--primary);">${ph.records_handled_count} Prescription Records</strong>
          </div>
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.error("Pharmacists load error:", err);
  }
}

/**
 * 6. Rooms Module
 */
async function loadRooms() {
  try {
    const res = await fetch("/api/rooms");
    const json = await res.json();
    if (!json.success) return;

    const grid = document.getElementById("roomsGrid");
    if (!grid) return;

    grid.innerHTML = json.data.map(room => {
      const avail = (room.availability || '').toLowerCase();
      const statusClass = avail === 'available' ? 'status-available' : avail === 'full' ? 'status-full' : 'status-maintenance';
      const badgeClass = avail === 'available' ? 'badge-success' : avail === 'full' ? 'badge-danger' : 'badge-warning';

      return `
        <div class="room-card ${statusClass}">
          <div class="room-top">
            <div class="room-number">Room ${room.room_no}</div>
            <span class="room-type-badge">${room.type}</span>
          </div>
          <div class="profile-details-list" style="border:none; padding:0; margin:0;">
            <div class="profile-detail-row">
              <span>Bed Capacity:</span>
              <strong>${room.capacity} Beds</strong>
            </div>
            <div class="profile-detail-row">
              <span>Status:</span>
              <span class="status-badge ${badgeClass}">${room.availability}</span>
            </div>
          </div>
          <div class="room-occupant-box">
            <span style="color: var(--text-secondary); font-size: 11px;">Current Inpatient:</span>
            <div style="font-weight: 600; color: var(--text-primary); margin-top: 2px;">
              ${room.current_occupants || '<span class="text-muted">No patient admitted</span>'}
            </div>
          </div>
        </div>
      `;
    }).join("");
  } catch (err) {
    console.error("Rooms load error:", err);
  }
}

/**
 * 7. Billing Module
 */
async function loadBilling() {
  try {
    const res = await fetch("/api/billing");
    const json = await res.json();
    if (!json.success) return;

    const tbody = document.getElementById("billingTableBody");
    if (!tbody) return;

    tbody.innerHTML = json.data.map(b => {
      const isPaid = b.insurance_status === "Yes";
      const validBadge = isPaid 
        ? `<span class="status-badge badge-success">Approved / Valid</span>` 
        : b.insurance_status === "Pending"
        ? `<span class="status-badge badge-warning">Pending Review</span>`
        : `<span class="status-badge badge-danger">Not Covered</span>`;

      return `
        <tr>
          <td><strong>#${b.b_id}</strong></td>
          <td>#${b.p_id}</td>
          <td><strong>${b.patient_name}</strong></td>
          <td style="font-weight: 700; color: var(--text-primary);">$${b.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          <td style="color: #059669; font-weight: 600;">$${b.i_amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          <td style="color: #d97706; font-weight: 600;">$${b.out_of_pocket.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          <td>${validBadge}</td>
        </tr>
      `;
    }).join("");
  } catch (err) {
    console.error("Billing load error:", err);
  }
}

/**
 * 8. Appointments & Diagnostic Test Reports
 */
async function loadAppointmentsAndTests() {
  try {
    const [apptsRes, testsRes] = await Promise.all([
      fetch("/api/appointments"),
      fetch("/api/test-reports")
    ]);

    const apptsJson = await apptsRes.json();
    const testsJson = await testsRes.json();

    const apptsTbody = document.getElementById("appointmentsTableBody");
    if (apptsTbody && apptsJson.success) {
      apptsTbody.innerHTML = apptsJson.data.map(a => `
        <tr>
          <td><strong>#${a.id}</strong></td>
          <td>${a.app_date}</td>
          <td><strong>${a.patient_name}</strong></td>
          <td>Dr. ${a.doctor_name || 'Assigned Physician'}</td>
        </tr>
      `).join("");
    }

    const testsTbody = document.getElementById("testReportsTableBody");
    if (testsTbody && testsJson.success) {
      testsTbody.innerHTML = testsJson.data.map(t => `
        <tr>
          <td><strong>#${t.r_id}</strong></td>
          <td><strong>${t.patient_name}</strong></td>
          <td><span class="kpi-tag">${t.test_type}</span></td>
          <td><strong style="color: var(--primary);">${t.result}</strong></td>
        </tr>
      `).join("");
    }
  } catch (err) {
    console.error("Error loading appts/tests:", err);
  }
}

/**
 * 9. The 5 Showcase Demonstration Queries
 */
async function loadDemoQueries() {
  try {
    const res = await fetch("/api/demo-queries");
    const json = await res.json();
    if (!json.success) return;

    demoQueriesData = json.queries;
    selectQuery("query_1");
  } catch (err) {
    console.error("Demo queries load error:", err);
  }
}

function selectQuery(queryId, tabBtn) {
  activeQueryId = queryId;

  document.querySelectorAll(".query-tab-btn").forEach(b => b.classList.remove("active"));
  if (tabBtn) {
    tabBtn.classList.add("active");
  } else {
    const targetTab = Array.from(document.querySelectorAll(".query-tab-btn")).find(b => b.getAttribute("onclick") && b.getAttribute("onclick").includes(queryId));
    if (targetTab) {
      targetTab.classList.add("active");
    }
  }

  const queryObj = demoQueriesData.find(q => q.id === queryId);
  if (!queryObj) return;

  document.getElementById("activeQueryTitle").textContent = queryObj.title;
  document.getElementById("activeQueryDesc").textContent = queryObj.description;
  document.getElementById("activeQuerySql").textContent = queryObj.sql;

  // Auto-run query on tab selection for immediate view
  runActiveDemoQuery();
}

function openQueryDetail(queryId) {
  navigateTo("viewQueries");
  selectQuery(queryId);
}

async function runActiveDemoQuery() {
  const btn = document.getElementById("btnExecuteDemo");
  const thead = document.getElementById("queryResultThead");
  const tbody = document.getElementById("queryResultTbody");
  const durationBadge = document.getElementById("queryDurationBadge");
  const rowsBadge = document.getElementById("queryRowsBadge");

  if (btn) btn.innerHTML = "⏳ Executing...";

  try {
    const res = await fetch(`/api/demo-queries/${activeQueryId}/run`);
    const json = await res.json();

    if (!json.success) {
      tbody.innerHTML = `<tr><td class="text-center" style="color: var(--danger);">Error: ${json.error}</td></tr>`;
      return;
    }

    const result = json.result;
    durationBadge.textContent = `Duration: ${result.duration_ms} ms`;
    rowsBadge.textContent = `Rows: ${result.row_count}`;

    // Render Table Header
    thead.innerHTML = `<tr>${result.columns.map(c => `<th>${c}</th>`).join("")}</tr>`;

    // Render Rows
    if (result.rows.length === 0) {
      tbody.innerHTML = `<tr><td colspan="${result.columns.length}" class="text-center text-muted">Query executed successfully. 0 rows returned.</td></tr>`;
    } else {
      tbody.innerHTML = result.rows.map(row => `
        <tr>${row.map(val => `<td>${val !== null ? val : '<span class="text-muted">NULL</span>'}</td>`).join("")}</tr>
      `).join("");
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td class="text-center" style="color: var(--danger);">Execution failed: ${err.message}</td></tr>`;
  } finally {
    if (btn) btn.innerHTML = "▶ Execute on Oracle";
  }
}

function copyActiveSql() {
  const sql = document.getElementById("activeQuerySql").textContent;
  navigator.clipboard.writeText(sql);
  alert("SQL copied to clipboard!");
}

/**
 * 10. Interactive Custom SQL Query Runner
 */
const SAMPLE_QUERIES = [
  "",
  "SELECT Room_no, Capacity FROM ROOMS WHERE Type = 'General'",
  "SELECT Patient_id, F_name, L_name, In_date FROM PATIENT WHERE Out_date IS NULL",
  "SELECT Shift_type, COUNT(Emp_id) AS Total_Nurses FROM NURSE GROUP BY Shift_type",
  "SELECT d.Emp_id, e.F_name, e.L_name, d.Specialization, sup_e.F_name AS Supervisor_Name FROM DOCTOR d JOIN EMPLOYEE e ON d.Emp_id = e.Emp_id LEFT JOIN DOCTOR sup ON d.Supervisor_id = sup.Emp_id LEFT JOIN EMPLOYEE sup_e ON sup.Emp_id = sup_e.Emp_id"
];

function loadSampleSql(index) {
  const textarea = document.getElementById("customSqlInput");
  if (textarea && SAMPLE_QUERIES[index]) {
    textarea.value = SAMPLE_QUERIES[index];
  }
}

async function runCustomSqlQuery() {
  const sql = document.getElementById("customSqlInput").value.trim();
  const resultBox = document.getElementById("customQueryResultBox");
  const thead = document.getElementById("customResultThead");
  const tbody = document.getElementById("customResultTbody");
  const durationBadge = document.getElementById("customDurationBadge");
  const rowsBadge = document.getElementById("customRowsBadge");

  if (!sql) {
    alert("Please enter a SELECT SQL query.");
    return;
  }

  resultBox.style.display = "block";
  tbody.innerHTML = `<tr><td class="text-center">Executing on Oracle Database...</td></tr>`;

  try {
    const res = await fetch("/api/run-custom-query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql })
    });
    const json = await res.json();

    if (!json.success) {
      thead.innerHTML = "";
      tbody.innerHTML = `<tr><td style="color: var(--danger); font-weight: 600;">SQL Error: ${json.error}</td></tr>`;
      return;
    }

    const r = json.result;
    durationBadge.textContent = `Duration: ${r.duration_ms} ms`;
    rowsBadge.textContent = `Rows: ${r.row_count}`;

    thead.innerHTML = `<tr>${r.columns.map(c => `<th>${c}</th>`).join("")}</tr>`;

    if (r.rows.length === 0) {
      tbody.innerHTML = `<tr><td colspan="${r.columns.length}" class="text-center text-muted">0 rows returned.</td></tr>`;
    } else {
      tbody.innerHTML = r.rows.map(row => `
        <tr>${row.map(val => `<td>${val !== null ? val : '<span class="text-muted">NULL</span>'}</td>`).join("")}</tr>
      `).join("");
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td style="color: var(--danger);">Request failed: ${err.message}</td></tr>`;
  }
}

/**
 * 11. Database Re-seed trigger
 */
async function triggerReseed() {
  if (!confirm("Are you sure you want to drop and re-seed all 18 tables with the default dataset?")) return;

  try {
    const res = await fetch("/api/reseed-db", { method: "POST" });
    const json = await res.json();
    if (json.success) {
      alert("Database recreated and reseeded successfully!");
      loadAllData();
    } else {
      alert("Error reseeding: " + json.error);
    }
  } catch (err) {
    alert("Reseed request failed: " + err.message);
  }
}

/**
 * 12. Add Patient Modal Operations
 */
function openAddPatientModal() {
  const modal = document.getElementById("addPatientModal");
  const form = document.getElementById("addPatientForm");
  const errBanner = document.getElementById("patientFormError");
  const inDateInput = document.getElementById("patientInDate");

  if (form) form.reset();
  if (errBanner) {
    errBanner.style.display = "none";
    errBanner.textContent = "";
  }

  // Default admission date to today (YYYY-MM-DD)
  if (inDateInput) {
    const today = new Date().toISOString().split("T")[0];
    inDateInput.value = today;
  }

  if (modal) modal.classList.add("active");
}

function closeAddPatientModal() {
  const modal = document.getElementById("addPatientModal");
  if (modal) modal.classList.remove("active");
}

// Close modal on escape or backdrop click
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAddPatientModal();
});

document.addEventListener("click", (e) => {
  const modal = document.getElementById("addPatientModal");
  if (modal && e.target === modal) {
    closeAddPatientModal();
  }
});

async function handlePatientFormSubmit(event) {
  event.preventDefault();

  const submitBtn = document.getElementById("btnSubmitPatient");
  const errBanner = document.getElementById("patientFormError");

  const payload = {
    f_name: document.getElementById("patientFname").value.trim(),
    l_name: document.getElementById("patientLname").value.trim(),
    gender: document.getElementById("patientGender").value,
    phone: document.getElementById("patientPhone").value.trim(),
    address: document.getElementById("patientAddress").value.trim(),
    room_no: document.getElementById("patientRoom").value || null,
    doctor_id: document.getElementById("patientDoctor").value || null,
    in_date: document.getElementById("patientInDate").value || null,
    out_date: document.getElementById("patientOutDate").value || null,
    insurance_valid: document.getElementById("patientInsurance").value,
    bill_amount: document.getElementById("patientBillAmount").value || null,
    i_amount: document.getElementById("patientInsuranceAmount").value || null
  };

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = "⏳ Saving to Oracle...";
  }
  if (errBanner) errBanner.style.display = "none";

  try {
    const res = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const json = await res.json();

    if (!json.success) {
      if (errBanner) {
        errBanner.style.display = "block";
        errBanner.textContent = "Error: " + (json.error || "Failed to create patient.");
      }
      return;
    }

    // Success
    closeAddPatientModal();
    alert(`✅ Success: ${json.message}`);

    // Refresh all views and stay on Patients tab
    await loadAllData();
    navigateTo("viewPatients");

  } catch (err) {
    if (errBanner) {
      errBanner.style.display = "block";
      errBanner.textContent = "Network error: " + err.message;
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "💾 Save Patient to Oracle";
    }
  }
}

