/**
 * MediTrack - Medical Records Module Controller
 * Electronic Health Records (EHR), clinical encounters, multi-item prescriptions,
 * diagnoses, and lab test reports.
 */

(function (window, document) {
  'use strict';

  function populatePatientAndDoctorSelects() {
    if (!window.MediStore) return;
    var pSelect = document.getElementById('recordPatientSelect');
    var dSelect = document.getElementById('recordDoctorSelect');

    if (pSelect) {
      var patients = window.MediStore.getPatients();
      var pHtml = '<option value="" disabled selected>-- Select Patient --</option>';
      patients.forEach(function (p) {
        pHtml += '<option value="' + p.id + '">' + p.name + ' (' + p.patientCode + ')</option>';
      });
      pSelect.innerHTML = pHtml;
    }

    if (dSelect) {
      var doctors = window.MediStore.getDoctors();
      var dHtml = '<option value="" disabled selected>-- Select Attending Doctor --</option>';
      doctors.forEach(function (d) {
        dHtml += '<option value="' + d.id + '">' + d.name + ' (' + d.specialization + ')</option>';
      });
      dSelect.innerHTML = dHtml;
    }
  }

  function renderRecords() {
    var container = document.getElementById('recordsTimelineContainer');
    if (!container || !window.MediStore) return;

    var records = window.MediStore.getMedicalRecords();
    var search = (document.getElementById('recordSearchInput') ? document.getElementById('recordSearchInput').value : '').toLowerCase().trim();

    var filtered = records.filter(function (r) {
      return !search ||
        r.patientName.toLowerCase().indexOf(search) !== -1 ||
        r.doctorName.toLowerCase().indexOf(search) !== -1 ||
        r.diagnosis.toLowerCase().indexOf(search) !== -1 ||
        r.recordCode.toLowerCase().indexOf(search) !== -1;
    });

    var countEl = document.getElementById('recordCountBadge');
    if (countEl) countEl.textContent = filtered.length + ' Records';

    if (filtered.length === 0) {
      container.innerHTML = '<div class="empty-state">' +
        '<div class="empty-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></div>' +
        '<div class="empty-title">No clinical records found</div>' +
        '<div class="empty-desc">Create a new diagnosis and treatment record using the action button above.</div>' +
      '</div>';
      return;
    }

    var html = '';
    filtered.forEach(function (rec) {
      html += '<div class="card" style="margin-bottom:20px;">' +
        '<div class="card-header">' +
          '<div>' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
              '<span class="badge badge-purple font-mono">' + rec.recordCode + '</span>' +
              '<h3 class="card-title" style="margin:0;">' + rec.diagnosis + '</h3>' +
            '</div>' +
            '<div class="card-subtitle">' +
              'Patient: <strong>' + rec.patientName + '</strong> · Attending: <strong>' + rec.doctorName + '</strong> · Visit Date: ' + rec.visitDate +
            '</div>' +
          '</div>' +
          '<div style="display:flex;gap:6px;">' +
            '<button class="btn btn-sm btn-outline" onclick="printMedicalRecord(' + rec.id + ')" title="Print Clinical Summary">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>' +
              ' Print Report' +
            '</button>' +
            '<button class="btn btn-sm btn-outline" style="color:var(--danger);" onclick="deleteRecordConfirm(' + rec.id + ')" title="Delete Record">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>' +
            '</button>' +
          '</div>' +
        '</div>' +
        '<div class="card-body">' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:16px;">' +
            '<div>' +
              '<div style="font-size:0.75rem;font-weight:600;color:var(--slate-500);text-transform:uppercase;margin-bottom:4px;">Chief Complaints & Symptoms</div>' +
              '<div style="font-size:0.88rem;color:var(--navy-900);">' + (rec.symptoms || 'None specified') + '</div>' +
            '</div>' +
            '<div>' +
              '<div style="font-size:0.75rem;font-weight:600;color:var(--slate-500);text-transform:uppercase;margin-bottom:4px;">Diagnostic Findings & Treatment Plan</div>' +
              '<div style="font-size:0.88rem;color:var(--navy-900);">' + (rec.treatment || 'Observation and supportive therapy') + '</div>' +
            '</div>' +
          '</div>' +

          // Prescriptions table
          (rec.prescriptions && rec.prescriptions.length > 0 ?
            '<div style="margin-top:16px;background:var(--slate-50);border:1px solid var(--slate-200);border-radius:var(--radius-md);padding:14px;">' +
              '<div style="font-size:0.78rem;font-weight:700;color:var(--primary);text-transform:uppercase;margin-bottom:8px;">Prescribed Medications (Rx)</div>' +
              '<table style="width:100%;font-size:0.83rem;border-collapse:collapse;">' +
                '<thead><tr style="text-align:left;color:var(--slate-500);border-bottom:1px solid var(--slate-200);">' +
                  '<th style="padding:4px 0;">Medicine</th><th>Dosage</th><th>Frequency / Timing</th><th>Duration</th>' +
                '</tr></thead>' +
                '<tbody>' +
                  rec.prescriptions.map(function(rx){
                    return '<tr style="border-bottom:1px solid var(--slate-100);">' +
                      '<td style="padding:6px 0;font-weight:600;color:var(--navy-900);">' + rx.medicine + '</td>' +
                      '<td>' + rx.dosage + '</td>' +
                      '<td>' + rx.frequency + '</td>' +
                      '<td>' + rx.duration + '</td>' +
                    '</tr>';
                  }).join('') +
                '</tbody>' +
              '</table>' +
            '</div>' : '') +

          '<div style="display:flex;justify-content:space-between;margin-top:16px;font-size:0.8rem;color:var(--slate-500);padding-top:12px;border-top:1px solid var(--slate-100);">' +
            '<div>Lab Investigations: <strong>' + (rec.labTests || 'Routine Panels') + '</strong></div>' +
            '<div>Scheduled Review: <strong style="color:var(--primary);">' + (rec.followUpDate || 'As needed') + '</strong></div>' +
          '</div>' +
        '</div>' +
      '</div>';
    });

    container.innerHTML = html;
  }

  // Dynamic Prescription Item Rows in Add Modal
  window.addPrescriptionRow = function () {
    var container = document.getElementById('prescriptionItemsContainer');
    if (!container) return;

    var row = document.createElement('div');
    row.className = 'prescription-row';
    row.style = 'display:grid;grid-template-columns:2fr 1fr 1.5fr 1fr 30px;gap:8px;margin-bottom:8px;align-items:center;';
    row.innerHTML = 
      '<input type="text" class="form-control rx-med" placeholder="Medicine (e.g. Amoxicillin)" required>' +
      '<input type="text" class="form-control rx-dose" placeholder="Dosage (500mg)" required>' +
      '<input type="text" class="form-control rx-freq" placeholder="Freq (1-0-1)" required>' +
      '<input type="text" class="form-control rx-dur" placeholder="Duration (7 Days)" required>' +
      '<button type="button" onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--danger);cursor:pointer;padding:4px;">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' +
      '</button>';

    container.appendChild(row);
  };

  window.printMedicalRecord = function (id) {
    var rec = window.MediStore.getMedicalRecords().find(function (r) { return r.id === Number(id); });
    if (!rec) return;

    var container = document.getElementById('medicalReportPrintContent');
    if (!container) return;

    var html = 
      '<div style="text-align:center;border-bottom:2px solid var(--slate-200);padding-bottom:16px;margin-bottom:20px;">' +
        '<h2 style="color:var(--primary);font-size:1.5rem;font-weight:700;">MediTrack Health System</h2>' +
        '<p style="font-size:0.85rem;color:var(--slate-500);">Electronic Health Record (EHR) Clinical Summary</p>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:20px;">' +
        '<div><strong>Record ID:</strong> ' + rec.recordCode + '</div>' +
        '<div><strong>Encounter Date:</strong> ' + rec.visitDate + '</div>' +
      '</div>' +
      '<table style="width:100%;font-size:0.88rem;margin-bottom:24px;border-collapse:collapse;">' +
        '<tr><td style="padding:6px 0;color:var(--slate-500);width:160px;">Patient Name:</td><td style="font-weight:700;">' + rec.patientName + '</td></tr>' +
        '<tr><td style="padding:6px 0;color:var(--slate-500);">Attending Physician:</td><td style="font-weight:700;">' + rec.doctorName + '</td></tr>' +
        '<tr><td style="padding:6px 0;color:var(--slate-500);">Chief Complaints:</td><td>' + rec.symptoms + '</td></tr>' +
        '<tr><td style="padding:6px 0;color:var(--slate-500);">Clinical Diagnosis:</td><td style="font-weight:700;color:var(--primary);">' + rec.diagnosis + '</td></tr>' +
        '<tr><td style="padding:6px 0;color:var(--slate-500);">Treatment Rendered:</td><td>' + rec.treatment + '</td></tr>' +
        '<tr><td style="padding:6px 0;color:var(--slate-500);">Lab Investigations:</td><td>' + (rec.labTests || 'None') + '</td></tr>' +
        '<tr><td style="padding:6px 0;color:var(--slate-500);">Next Follow-up Date:</td><td>' + (rec.followUpDate || 'As needed') + '</td></tr>' +
      '</table>' +
      '<h4 style="font-size:0.95rem;font-weight:700;margin-bottom:10px;border-bottom:1px solid var(--slate-200);padding-bottom:6px;">Prescriptions (Rx)</h4>' +
      '<table style="width:100%;font-size:0.85rem;border-collapse:collapse;margin-bottom:30px;">' +
        '<tr style="background:var(--slate-100);text-align:left;"><th style="padding:8px;">Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th></tr>' +
        (rec.prescriptions || []).map(function(rx){
          return '<tr style="border-bottom:1px solid var(--slate-200);">' +
            '<td style="padding:8px;font-weight:600;">' + rx.medicine + '</td>' +
            '<td>' + rx.dosage + '</td>' +
            '<td>' + rx.frequency + '</td>' +
            '<td>' + rx.duration + '</td>' +
          '</tr>';
        }).join('') +
      '</table>' +
      '<div style="display:flex;justify-content:flex-end;margin-top:40px;">' +
        '<div style="text-align:center;width:200px;border-top:1px solid var(--slate-400);padding-top:8px;">' +
          '<div style="font-weight:600;font-size:0.85rem;">' + rec.doctorName + '</div>' +
          '<div style="font-size:0.75rem;color:var(--slate-500);">Authorized Physician Signature</div>' +
        '</div>' +
      '</div>';

    container.innerHTML = html;
    if (window.MediApp) window.MediApp.openModal('modalMedicalReportPrint');
  };

  window.deleteRecordConfirm = function (id) {
    if (confirm('Are you sure you want to permanently delete this clinical record?')) {
      window.MediStore.deleteMedicalRecord(id);
      renderRecords();
      if (window.MediApp) window.MediApp.showToast('info', 'Record Deleted', 'The medical record was removed.');
    }
  };

  function initRecordForms() {
    var form = document.getElementById('recordForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var patientId = document.getElementById('recordPatientSelect').value;
        var doctorId = document.getElementById('recordDoctorSelect').value;

        var patient = window.MediStore.getPatientById(patientId);
        var doctor = window.MediStore.getDoctorById(doctorId);

        if (!patient || !doctor) {
          if (window.MediApp) window.MediApp.showToast('error', 'Incomplete Form', 'Please select both patient and physician.');
          return;
        }

        // Collect dynamic prescription items
        var rxRows = document.querySelectorAll('#prescriptionItemsContainer .prescription-row');
        var prescriptions = [];
        rxRows.forEach(function (row) {
          var med = row.querySelector('.rx-med').value.trim();
          var dose = row.querySelector('.rx-dose').value.trim();
          var freq = row.querySelector('.rx-freq').value.trim();
          var dur = row.querySelector('.rx-dur').value.trim();
          if (med) {
            prescriptions.push({ medicine: med, dosage: dose, frequency: freq, duration: dur });
          }
        });

        var recordData = {
          patientId: patient.id,
          patientName: patient.name,
          doctorId: doctor.id,
          doctorName: doctor.name,
          visitDate: document.getElementById('recordVisitDate').value,
          symptoms: document.getElementById('recordSymptoms').value.trim(),
          diagnosis: document.getElementById('recordDiagnosis').value.trim(),
          treatment: document.getElementById('recordTreatment').value.trim(),
          labTests: document.getElementById('recordLabTests').value.trim(),
          followUpDate: document.getElementById('recordFollowUpDate').value,
          prescriptions: prescriptions
        };

        window.MediStore.addMedicalRecord(recordData);
        if (window.MediApp) {
          window.MediApp.closeModal('modalAddRecord');
          window.MediApp.showToast('success', 'Record Filed', 'Medical encounter recorded for ' + patient.name);
        }
        renderRecords();
      });
    }

    var searchInput = document.getElementById('recordSearchInput');
    if (searchInput) searchInput.addEventListener('input', renderRecords);
  }

  document.addEventListener('DOMContentLoaded', function () {
    populatePatientAndDoctorSelects();
    renderRecords();
    initRecordForms();
  });

})(window, document);
