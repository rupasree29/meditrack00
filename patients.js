/**
 * MediTrack - Patient Management Controller
 * Full CRUD, real-time search, filters, detailed patient chart, and vitals.
 */

(function (window, document) {
  'use strict';

  var currentEditingId = null;

  function renderPatientsList() {
    var tbody = document.getElementById('patientsTableBody');
    if (!tbody || !window.MediStore) return;

    var patients = window.MediStore.getPatients();
    var searchTerm = (document.getElementById('patientSearchInput') ? document.getElementById('patientSearchInput').value : '').toLowerCase().trim();
    var statusFilter = document.getElementById('patientStatusFilter') ? document.getElementById('patientStatusFilter').value : 'All';
    var genderFilter = document.getElementById('patientGenderFilter') ? document.getElementById('patientGenderFilter').value : 'All';

    var filtered = patients.filter(function (p) {
      var matchesSearch = !searchTerm ||
        p.name.toLowerCase().indexOf(searchTerm) !== -1 ||
        p.patientCode.toLowerCase().indexOf(searchTerm) !== -1 ||
        p.phone.indexOf(searchTerm) !== -1 ||
        (p.medicalCondition && p.medicalCondition.toLowerCase().indexOf(searchTerm) !== -1);

      var matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      var matchesGender = genderFilter === 'All' || p.gender === genderFilter;

      return matchesSearch && matchesStatus && matchesGender;
    });

    // Update count labels
    var countEl = document.getElementById('patientFilteredCount');
    if (countEl) countEl.textContent = filtered.length + ' of ' + patients.length + ' patients';

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="empty-state">' +
        '<div class="empty-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></div>' +
        '<div class="empty-title">No patients found</div>' +
        '<div class="empty-desc">Try clearing your search query or add a new patient.</div>' +
      '</td></tr>';
      return;
    }

    var html = '';
    filtered.forEach(function (p) {
      var statusBadge = 'badge-info';
      if (p.status === 'Inpatient') statusBadge = 'badge-purple';
      if (p.status === 'Discharged') statusBadge = 'badge-slate';
      if (p.status === 'Outpatient') statusBadge = 'badge-success';

      var initials = p.name.split(' ').map(function(n){ return n[0]; }).join('').slice(-2).toUpperCase();

      html += '<tr>' +
        '<td><span class="cell-title font-mono">' + p.patientCode + '</span></td>' +
        '<td>' +
          '<div class="patient-cell">' +
            '<div class="avatar-sm">' + initials + '</div>' +
            '<div>' +
              '<div class="cell-title">' + p.name + '</div>' +
              '<div class="cell-sub">' + p.email + '</div>' +
            '</div>' +
          '</div>' +
        '</td>' +
        '<td>' + p.age + ' yrs · ' + p.gender + '</td>' +
        '<td><span class="badge badge-slate font-mono" style="font-weight:700;">' + p.bloodGroup + '</span></td>' +
        '<td>' +
          '<div style="font-size:0.84rem;">' + p.phone + '</div>' +
          '<div class="cell-sub">' + (p.bedRoom || 'N/A') + '</div>' +
        '</td>' +
        '<td><span style="font-size:0.84rem;color:var(--slate-700);">' + (p.medicalCondition || 'Routine Examination') + '</span></td>' +
        '<td><span class="badge ' + statusBadge + '">' + p.status + '</span></td>' +
        '<td>' +
          '<div style="display:flex;gap:6px;">' +
            '<button class="btn btn-sm btn-outline" onclick="viewPatientDetails(' + p.id + ')" title="View Medical Chart">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>' +
            '</button>' +
            '<button class="btn btn-sm btn-outline" onclick="openEditPatientModal(' + p.id + ')" title="Edit Patient">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>' +
            '</button>' +
            '<button class="btn btn-sm btn-outline" style="color:var(--danger);" onclick="deletePatientConfirm(' + p.id + ')" title="Delete Patient">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>' +
            '</button>' +
          '</div>' +
        '</td>' +
      '</tr>';
    });

    tbody.innerHTML = html;
  }

  // View Patient Details Chart
  window.viewPatientDetails = function (id) {
    var p = window.MediStore.getPatientById(id);
    if (!p) return;

    var container = document.getElementById('patientDetailContent');
    if (!container) return;

    var appointments = window.MediStore.getAppointments().filter(function(a){ return a.patientId === p.id; });
    var records = window.MediStore.getMedicalRecords().filter(function(r){ return r.patientId === p.id; });
    var bills = window.MediStore.getBillings().filter(function(b){ return b.patientId === p.id; });

    var initials = p.name.split(' ').map(function(n){ return n[0]; }).join('').slice(-2).toUpperCase();

    var html = 
      '<div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--slate-200);">' +
        '<div class="avatar-sm" style="width:54px;height:54px;font-size:1.2rem;">' + initials + '</div>' +
        '<div style="flex:1;">' +
          '<h3 style="font-size:1.25rem;font-weight:700;color:var(--navy-900);">' + p.name + '</h3>' +
          '<div style="font-size:0.82rem;color:var(--slate-500);display:flex;gap:12px;margin-top:2px;">' +
            '<span>ID: <strong>' + p.patientCode + '</strong></span>' +
            '<span>·</span>' +
            '<span>' + p.age + ' yrs, ' + p.gender + '</span>' +
            '<span>·</span>' +
            '<span>Blood: <strong>' + p.bloodGroup + '</strong></span>' +
            '<span>·</span>' +
            '<span class="badge badge-sm badge-info">' + p.status + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +

      // Vitals Strip
      '<div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:12px;margin-bottom:20px;">' +
        '<div style="background:var(--slate-50);padding:12px;border-radius:var(--radius-md);text-align:center;border:1px solid var(--slate-200);">' +
          '<div style="font-size:0.72rem;color:var(--slate-500);text-transform:uppercase;">Blood Pressure</div>' +
          '<div class="tabular-nums" style="font-size:1.15rem;font-weight:700;color:var(--navy-900);margin-top:2px;">' + (p.vitals ? p.vitals.bp : '120/80') + '</div>' +
        '</div>' +
        '<div style="background:var(--slate-50);padding:12px;border-radius:var(--radius-md);text-align:center;border:1px solid var(--slate-200);">' +
          '<div style="font-size:0.72rem;color:var(--slate-500);text-transform:uppercase;">Pulse Rate</div>' +
          '<div class="tabular-nums" style="font-size:1.15rem;font-weight:700;color:var(--navy-900);margin-top:2px;">' + (p.vitals ? p.vitals.pulse : '72') + ' bpm</div>' +
        '</div>' +
        '<div style="background:var(--slate-50);padding:12px;border-radius:var(--radius-md);text-align:center;border:1px solid var(--slate-200);">' +
          '<div style="font-size:0.72rem;color:var(--slate-500);text-transform:uppercase;">Body Temp</div>' +
          '<div class="tabular-nums" style="font-size:1.15rem;font-weight:700;color:var(--navy-900);margin-top:2px;">' + (p.vitals ? p.vitals.temp : '98.6 °F') + '</div>' +
        '</div>' +
        '<div style="background:var(--slate-50);padding:12px;border-radius:var(--radius-md);text-align:center;border:1px solid var(--slate-200);">' +
          '<div style="font-size:0.72rem;color:var(--slate-500);text-transform:uppercase;">Oxygen Sat (SpO2)</div>' +
          '<div class="tabular-nums" style="font-size:1.15rem;font-weight:700;color:var(--navy-900);margin-top:2px;">' + (p.vitals ? p.vitals.spo2 : '99%') + '</div>' +
        '</div>' +
      '</div>' +

      // Details Grid
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;font-size:0.85rem;">' +
        '<div>' +
          '<div style="color:var(--slate-500);font-size:0.75rem;text-transform:uppercase;font-weight:600;margin-bottom:4px;">Contact & Address</div>' +
          '<div><strong>Phone:</strong> ' + p.phone + '</div>' +
          '<div><strong>Email:</strong> ' + (p.email || 'N/A') + '</div>' +
          '<div><strong>Address:</strong> ' + (p.address || 'N/A') + '</div>' +
          '<div><strong>Emergency:</strong> ' + (p.emergencyContact || 'N/A') + '</div>' +
        '</div>' +
        '<div>' +
          '<div style="color:var(--slate-500);font-size:0.75rem;text-transform:uppercase;font-weight:600;margin-bottom:4px;">Hospitalization</div>' +
          '<div><strong>Diagnosis:</strong> ' + (p.medicalCondition || 'N/A') + '</div>' +
          '<div><strong>Assigned Bed:</strong> ' + (p.bedRoom || 'Outpatient') + '</div>' +
          '<div><strong>Admitted On:</strong> ' + (p.admissionDate || 'N/A') + '</div>' +
        '</div>' +
      '</div>' +

      // Recent Medical Records
      '<div style="margin-top:20px;border-top:1px solid var(--slate-200);padding-top:16px;">' +
        '<h4 style="font-size:0.95rem;font-weight:600;margin-bottom:10px;">Clinical Encounters & Diagnosis History</h4>' +
        (records.length > 0 ? 
          records.map(function(r){
            return '<div style="background:var(--slate-50);border:1px solid var(--slate-200);border-radius:var(--radius-md);padding:12px;margin-bottom:10px;">' +
              '<div style="display:flex;justify-content:space-between;margin-bottom:4px;">' +
                '<strong style="color:var(--primary);">' + r.diagnosis + '</strong>' +
                '<span class="cell-sub">' + r.visitDate + ' · ' + r.doctorName + '</span>' +
              '</div>' +
              '<div style="font-size:0.82rem;color:var(--slate-600);">' + r.treatment + '</div>' +
            '</div>';
          }).join('') : '<p class="cell-sub">No previous medical records registered for this patient.</p>') +
      '</div>';

    container.innerHTML = html;
    if (window.MediApp) window.MediApp.openModal('modalPatientDetails');
  };

  // Open Add Patient Modal
  window.openAddPatientModal = function () {
    currentEditingId = null;
    var form = document.getElementById('patientForm');
    if (form) form.reset();
    var titleEl = document.getElementById('patientModalTitle');
    if (titleEl) titleEl.textContent = 'Register New Patient';
    if (window.MediApp) window.MediApp.openModal('modalPatientForm');
  };

  // Open Edit Patient Modal
  window.openEditPatientModal = function (id) {
    var p = window.MediStore.getPatientById(id);
    if (!p) return;

    currentEditingId = p.id;
    var titleEl = document.getElementById('patientModalTitle');
    if (titleEl) titleEl.textContent = 'Edit Patient – ' + p.name;

    document.getElementById('patientName').value = p.name;
    document.getElementById('patientAge').value = p.age;
    document.getElementById('patientGender').value = p.gender;
    document.getElementById('patientBloodGroup').value = p.bloodGroup;
    document.getElementById('patientPhone').value = p.phone;
    document.getElementById('patientEmail').value = p.email || '';
    document.getElementById('patientAddress').value = p.address || '';
    document.getElementById('patientEmergencyContact').value = p.emergencyContact || '';
    document.getElementById('patientCondition').value = p.medicalCondition || '';
    document.getElementById('patientBedRoom').value = p.bedRoom || 'Outpatient';
    document.getElementById('patientStatus').value = p.status || 'Inpatient';

    if (window.MediApp) window.MediApp.openModal('modalPatientForm');
  };

  // Delete Patient Confirm
  window.deletePatientConfirm = function (id) {
    var p = window.MediStore.getPatientById(id);
    if (!p) return;

    if (confirm('Are you sure you want to permanently delete patient "' + p.name + '" (' + p.patientCode + ')?')) {
      window.MediStore.deletePatient(id);
      renderPatientsList();
      if (window.MediApp) window.MediApp.showToast('success', 'Patient Deleted', p.name + ' was removed from records.');
    }
  };

  // Form submit handler
  function initPatientForm() {
    var form = document.getElementById('patientForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var patientData = {
        name: document.getElementById('patientName').value.trim(),
        age: Number(document.getElementById('patientAge').value),
        gender: document.getElementById('patientGender').value,
        bloodGroup: document.getElementById('patientBloodGroup').value,
        phone: document.getElementById('patientPhone').value.trim(),
        email: document.getElementById('patientEmail').value.trim(),
        address: document.getElementById('patientAddress').value.trim(),
        emergencyContact: document.getElementById('patientEmergencyContact').value.trim(),
        medicalCondition: document.getElementById('patientCondition').value.trim(),
        bedRoom: document.getElementById('patientBedRoom').value.trim(),
        status: document.getElementById('patientStatus').value,
        admissionDate: new Date().toISOString().slice(0, 10)
      };

      if (!patientData.name || !patientData.phone) {
        if (window.MediApp) window.MediApp.showToast('error', 'Validation Error', 'Name and Phone number are required.');
        return;
      }

      if (currentEditingId) {
        window.MediStore.updatePatient(currentEditingId, patientData);
        if (window.MediApp) window.MediApp.showToast('success', 'Patient Updated', patientData.name + ' successfully saved.');
      } else {
        window.MediStore.addPatient(patientData);
        if (window.MediApp) window.MediApp.showToast('success', 'Patient Registered', patientData.name + ' admitted/enrolled.');
      }

      if (window.MediApp) window.MediApp.closeModal('modalPatientForm');
      renderPatientsList();
    });

    // Real-time search & filters
    var searchInput = document.getElementById('patientSearchInput');
    var statusFilter = document.getElementById('patientStatusFilter');
    var genderFilter = document.getElementById('patientGenderFilter');

    if (searchInput) searchInput.addEventListener('input', renderPatientsList);
    if (statusFilter) statusFilter.addEventListener('change', renderPatientsList);
    if (genderFilter) genderFilter.addEventListener('change', renderPatientsList);
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderPatientsList();
    initPatientForm();
  });

})(window, document);
