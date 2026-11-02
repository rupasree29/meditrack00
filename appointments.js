/**
 * MediTrack - Appointment Management Controller
 * Booking, rescheduling, status tracking, slip generation, and filtering.
 */

(function (window, document) {
  'use strict';

  function populateDropdowns() {
    if (!window.MediStore) return;
    var patientSelect = document.getElementById('aptPatientSelect');
    var doctorSelect = document.getElementById('aptDoctorSelect');

    if (patientSelect) {
      var patients = window.MediStore.getPatients();
      var pHtml = '<option value="" disabled selected>-- Select Patient --</option>';
      patients.forEach(function (p) {
        pHtml += '<option value="' + p.id + '">' + p.name + ' (' + p.patientCode + ') - ' + p.phone + '</option>';
      });
      patientSelect.innerHTML = pHtml;
    }

    if (doctorSelect) {
      var doctors = window.MediStore.getDoctors();
      var dHtml = '<option value="" disabled selected>-- Select Doctor / Specialist --</option>';
      doctors.forEach(function (d) {
        dHtml += '<option value="' + d.id + '">' + d.name + ' - ' + d.specialization + ' ($' + d.consultationFee + ')</option>';
      });
      doctorSelect.innerHTML = dHtml;
    }
  }

  function renderAppointments() {
    var tbody = document.getElementById('appointmentsTableBody');
    if (!tbody || !window.MediStore) return;

    var appointments = window.MediStore.getAppointments();
    var search = (document.getElementById('aptSearchInput') ? document.getElementById('aptSearchInput').value : '').toLowerCase().trim();
    var statusFilter = document.getElementById('aptStatusFilter') ? document.getElementById('aptStatusFilter').value : 'All';
    var dateFilter = document.getElementById('aptDateFilter') ? document.getElementById('aptDateFilter').value : 'All';

    var todayStr = new Date().toISOString().slice(0, 10);

    var filtered = appointments.filter(function (apt) {
      var matchesSearch = !search ||
        apt.patientName.toLowerCase().indexOf(search) !== -1 ||
        apt.doctorName.toLowerCase().indexOf(search) !== -1 ||
        apt.appointmentCode.toLowerCase().indexOf(search) !== -1;

      var matchesStatus = statusFilter === 'All' || apt.status === statusFilter;

      var matchesDate = true;
      if (dateFilter === 'Today') {
        matchesDate = apt.date === todayStr;
      } else if (dateFilter === 'Upcoming') {
        matchesDate = apt.date >= todayStr;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });

    // Update KPI indicators
    var totalEl = document.getElementById('aptTotalCount');
    var upcomingEl = document.getElementById('aptUpcomingCount');
    var completedEl = document.getElementById('aptCompletedCount');
    var cancelledEl = document.getElementById('aptCancelledCount');

    if (totalEl) totalEl.textContent = appointments.length;
    if (upcomingEl) upcomingEl.textContent = appointments.filter(function(a){ return a.status === 'Upcoming'; }).length;
    if (completedEl) completedEl.textContent = appointments.filter(function(a){ return a.status === 'Completed'; }).length;
    if (cancelledEl) cancelledEl.textContent = appointments.filter(function(a){ return a.status === 'Cancelled'; }).length;

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty-state">' +
        '<div class="empty-title">No appointments found</div>' +
        '<div class="empty-desc">No schedule matches your current filters. Book a new appointment to get started.</div>' +
      '</td></tr>';
      return;
    }

    var html = '';
    filtered.forEach(function (apt) {
      var badgeClass = 'badge-info';
      if (apt.status === 'Completed') badgeClass = 'badge-success';
      if (apt.status === 'Cancelled') badgeClass = 'badge-danger';
      if (apt.status === 'Rescheduled') badgeClass = 'badge-warning';

      html += '<tr>' +
        '<td><span class="cell-title font-mono">' + apt.appointmentCode + '</span></td>' +
        '<td>' +
          '<div class="cell-title">' + apt.patientName + '</div>' +
          '<div class="cell-sub">' + (apt.reason || 'General Checkup') + '</div>' +
        '</td>' +
        '<td>' +
          '<div class="cell-title">' + apt.doctorName + '</div>' +
          '<div class="cell-sub">' + (apt.department || 'Clinical Specialist') + '</div>' +
        '</td>' +
        '<td class="tabular-nums">' +
          '<div style="font-weight:600;">' + apt.date + '</div>' +
          '<div class="cell-sub">' + apt.time + '</div>' +
        '</td>' +
        '<td><span class="badge badge-slate">' + (apt.type || 'Consultation') + '</span></td>' +
        '<td><span class="badge ' + badgeClass + '">' + apt.status + '</span></td>' +
        '<td>' +
          '<div style="display:flex;gap:6px;">' +
            '<button class="btn btn-sm btn-outline" onclick="printAppointmentSlip(' + apt.id + ')" title="Print Slip">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>' +
            '</button>' +
            (apt.status !== 'Completed' ?
              '<button class="btn btn-sm btn-outline" style="color:var(--success);" onclick="markAptComplete(' + apt.id + ')" title="Mark Completed">' +
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
              '</button>' : '') +
            (apt.status !== 'Cancelled' && apt.status !== 'Completed' ?
              '<button class="btn btn-sm btn-outline" onclick="openAptReschedule(' + apt.id + ')" title="Reschedule">' +
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>' +
              '</button>' : '') +
            (apt.status !== 'Cancelled' && apt.status !== 'Completed' ?
              '<button class="btn btn-sm btn-outline" style="color:var(--danger);" onclick="cancelApt(' + apt.id + ')" title="Cancel">' +
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' +
              '</button>' : '') +
          '</div>' +
        '</td>' +
      '</tr>';
    });

    tbody.innerHTML = html;
  }

  window.markAptComplete = function (id) {
    window.MediStore.updateAppointmentStatus(id, 'Completed');
    renderAppointments();
    if (window.MediApp) window.MediApp.showToast('success', 'Status Updated', 'Appointment marked as completed.');
  };

  window.cancelApt = function (id) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      window.MediStore.cancelAppointment(id);
      renderAppointments();
      if (window.MediApp) window.MediApp.showToast('info', 'Cancelled', 'Appointment has been cancelled.');
    }
  };

  window.openAptReschedule = function (id) {
    var apt = window.MediStore.getAppointments().find(function (a) { return a.id === Number(id); });
    if (!apt) return;

    document.getElementById('rescheduleAptId').value = apt.id;
    document.getElementById('rescheduleAptInfo').textContent = apt.patientName + ' with ' + apt.doctorName + ' (' + apt.appointmentCode + ')';
    document.getElementById('rescheduleDate').value = apt.date;
    document.getElementById('rescheduleTime').value = apt.time;

    if (window.MediApp) window.MediApp.openModal('modalReschedule');
  };

  window.printAppointmentSlip = function (id) {
    var apt = window.MediStore.getAppointments().find(function (a) { return a.id === Number(id); });
    if (!apt) return;

    var container = document.getElementById('slipContent');
    if (!container) return;

    var html = 
      '<div style="text-align:center;border-bottom:2px dashed var(--slate-300);padding-bottom:16px;margin-bottom:16px;">' +
        '<h2 style="color:var(--primary);font-size:1.4rem;font-weight:700;">MediTrack Health System</h2>' +
        '<p style="font-size:0.8rem;color:var(--slate-500);">Outpatient Appointment Consultation Pass</p>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:16px;">' +
        '<div><strong>Pass #:</strong> <span class="font-mono">' + apt.appointmentCode + '</span></div>' +
        '<div><strong>Status:</strong> <span class="badge badge-info">' + apt.status + '</span></div>' +
      '</div>' +
      '<table style="width:100%;font-size:0.88rem;margin-bottom:20px;border-collapse:collapse;">' +
        '<tr><td style="padding:6px 0;color:var(--slate-500);">Patient Name:</td><td style="font-weight:600;">' + apt.patientName + '</td></tr>' +
        '<tr><td style="padding:6px 0;color:var(--slate-500);">Consulting Specialist:</td><td style="font-weight:600;">' + apt.doctorName + '</td></tr>' +
        '<tr><td style="padding:6px 0;color:var(--slate-500);">Department:</td><td>' + (apt.department || 'Outpatient') + '</td></tr>' +
        '<tr><td style="padding:6px 0;color:var(--slate-500);">Scheduled Date:</td><td class="tabular-nums" style="font-weight:600;">' + apt.date + '</td></tr>' +
        '<tr><td style="padding:6px 0;color:var(--slate-500);">Scheduled Time:</td><td class="tabular-nums" style="font-weight:600;">' + apt.time + '</td></tr>' +
        '<tr><td style="padding:6px 0;color:var(--slate-500);">Appointment Type:</td><td>' + (apt.type || 'Consultation') + '</td></tr>' +
        '<tr><td style="padding:6px 0;color:var(--slate-500);">Chief Concern:</td><td>' + (apt.reason || 'N/A') + '</td></tr>' +
      '</table>' +
      '<div style="background:var(--slate-50);padding:12px;border-radius:var(--radius-md);font-size:0.75rem;color:var(--slate-500);text-align:center;">' +
        'Please arrive 15 minutes before your scheduled appointment time. Present this slip at the reception desk.' +
      '</div>';

    container.innerHTML = html;
    if (window.MediApp) window.MediApp.openModal('modalAppointmentSlip');
  };

  function initAppointmentForms() {
    var form = document.getElementById('bookAppointmentForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var patientId = document.getElementById('aptPatientSelect').value;
        var doctorId = document.getElementById('aptDoctorSelect').value;

        var patient = window.MediStore.getPatientById(patientId);
        var doctor = window.MediStore.getDoctorById(doctorId);

        if (!patient || !doctor) {
          if (window.MediApp) window.MediApp.showToast('error', 'Incomplete', 'Please select a patient and a doctor.');
          return;
        }

        var aptData = {
          patientId: patient.id,
          patientName: patient.name,
          doctorId: doctor.id,
          doctorName: doctor.name,
          department: doctor.specialization,
          date: document.getElementById('aptDate').value,
          time: document.getElementById('aptTime').value,
          type: document.getElementById('aptType').value,
          reason: document.getElementById('aptReason').value.trim(),
          notes: document.getElementById('aptNotes').value.trim(),
          status: 'Upcoming'
        };

        window.MediStore.bookAppointment(aptData);
        if (window.MediApp) {
          window.MediApp.closeModal('modalBookAppointment');
          window.MediApp.showToast('success', 'Appointment Booked', 'Scheduled with ' + doctor.name + ' for ' + patient.name);
        }
        renderAppointments();
      });
    }

    var searchInput = document.getElementById('aptSearchInput');
    var statusFilter = document.getElementById('aptStatusFilter');
    var dateFilter = document.getElementById('aptDateFilter');

    if (searchInput) searchInput.addEventListener('input', renderAppointments);
    if (statusFilter) statusFilter.addEventListener('change', renderAppointments);
    if (dateFilter) dateFilter.addEventListener('change', renderAppointments);
  }

  document.addEventListener('DOMContentLoaded', function () {
    populateDropdowns();
    renderAppointments();
    initAppointmentForms();
  });

})(window, document);
