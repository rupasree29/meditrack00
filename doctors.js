/**
 * MediTrack - Doctor Management Controller
 * Profiles, specialization filters, live availability toggling, and doctor directory.
 */

(function (window, document) {
  'use strict';

  var currentEditingDoctorId = null;

  function renderDoctors() {
    var grid = document.getElementById('doctorCardsGrid');
    if (!grid || !window.MediStore) return;

    var doctors = window.MediStore.getDoctors();
    var search = (document.getElementById('doctorSearchInput') ? document.getElementById('doctorSearchInput').value : '').toLowerCase().trim();
    var specFilter = document.getElementById('doctorSpecialtyFilter') ? document.getElementById('doctorSpecialtyFilter').value : 'All';
    var availFilter = document.getElementById('doctorAvailabilityFilter') ? document.getElementById('doctorAvailabilityFilter').value : 'All';

    var filtered = doctors.filter(function (d) {
      var matchesSearch = !search ||
        d.name.toLowerCase().indexOf(search) !== -1 ||
        d.specialization.toLowerCase().indexOf(search) !== -1 ||
        d.qualification.toLowerCase().indexOf(search) !== -1;

      var matchesSpec = specFilter === 'All' || d.specialization === specFilter;
      var matchesAvail = availFilter === 'All' || d.availabilityStatus === availFilter;

      return matchesSearch && matchesSpec && matchesAvail;
    });

    // Update KPI counts
    var totalEl = document.getElementById('docStatTotal');
    var availEl = document.getElementById('docStatAvailable');
    var surgEl = document.getElementById('docStatSurgery');
    var leaveEl = document.getElementById('docStatLeave');

    if (totalEl) totalEl.textContent = doctors.length;
    if (availEl) availEl.textContent = doctors.filter(function(d){ return d.availabilityStatus === 'Available'; }).length;
    if (surgEl) surgEl.textContent = doctors.filter(function(d){ return d.availabilityStatus === 'In Surgery'; }).length;
    if (leaveEl) leaveEl.textContent = doctors.filter(function(d){ return d.availabilityStatus === 'On Leave'; }).length;

    if (filtered.length === 0) {
      grid.innerHTML = '<div style="grid-column: 1 / -1;" class="empty-state">' +
        '<div class="empty-title">No specialists found</div>' +
        '<div class="empty-desc">Try clearing the filters or add a new doctor profile.</div>' +
      '</div>';
      return;
    }

    var html = '';
    filtered.forEach(function (doc) {
      var availBadge = 'badge-success';
      if (doc.availabilityStatus === 'In Surgery') availBadge = 'badge-danger';
      if (doc.availabilityStatus === 'On Leave') availBadge = 'badge-slate';
      if (doc.availabilityStatus === 'Busy') availBadge = 'badge-warning';

      html += '<div class="doctor-card">' +
        '<div class="doctor-card-top">' +
          '<div class="doctor-avatar-lg">' + (doc.avatar || 'DR') + '</div>' +
          '<div class="doctor-meta" style="flex:1;">' +
            '<h3>' + doc.name + '</h3>' +
            '<div class="doctor-spec">' + doc.specialization + '</div>' +
            '<div class="cell-sub" style="margin-top:2px;">' + doc.qualification + '</div>' +
          '</div>' +
        '</div>' +

        '<div class="doctor-details-list">' +
          '<div class="doctor-detail-row">' +
            '<span>Experience:</span>' +
            '<strong>' + doc.experienceYears + ' Years</strong>' +
          '</div>' +
          '<div class="doctor-detail-row">' +
            '<span>Location:</span>' +
            '<span>' + (doc.roomNumber || 'Consultation Suite') + '</span>' +
          '</div>' +
          '<div class="doctor-detail-row">' +
            '<span>Consultation Fee:</span>' +
            '<strong class="tabular-nums" style="color:var(--navy-900); font-weight:700;">$' + doc.consultationFee + '</strong>' +
          '</div>' +
          '<div class="doctor-detail-row">' +
            '<span>Schedule:</span>' +
            '<span style="font-size:0.75rem;">' + (doc.scheduleHours || 'Mon-Fri 09:00 - 16:00') + '</span>' +
          '</div>' +
          '<div class="doctor-detail-row">' +
            '<span>Contact:</span>' +
            '<span>' + doc.phone + '</span>' +
          '</div>' +
        '</div>' +

        '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:12px;">' +
          '<div style="display:flex;align-items:center;gap:6px;">' +
            '<span class="badge ' + availBadge + '">' + doc.availabilityStatus + '</span>' +
            // Quick status toggle dropdown
            '<select onchange="changeDoctorStatus(' + doc.id + ', this.value)" style="font-size:0.75rem;padding:2px 6px;border-radius:4px;border:1px solid var(--slate-200);background:#fff;">' +
              '<option value="" disabled selected>Change Status</option>' +
              '<option value="Available">Available</option>' +
              '<option value="In Surgery">In Surgery</option>' +
              '<option value="Busy">Busy</option>' +
              '<option value="On Leave">On Leave</option>' +
            '</select>' +
          '</div>' +
          '<div style="display:flex;gap:6px;">' +
            '<button class="btn btn-sm btn-outline" onclick="openEditDoctorModal(' + doc.id + ')" title="Edit Doctor">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>' +
            '</button>' +
            '<button class="btn btn-sm btn-outline" style="color:var(--danger);" onclick="deleteDoctorConfirm(' + doc.id + ')" title="Remove Doctor">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    });

    grid.innerHTML = html;
  }

  window.changeDoctorStatus = function (id, newStatus) {
    if (!newStatus) return;
    window.MediStore.updateDoctor(id, { availabilityStatus: newStatus });
    renderDoctors();
    if (window.MediApp) window.MediApp.showToast('success', 'Status Updated', 'Doctor availability updated to ' + newStatus);
  };

  window.openAddDoctorModal = function () {
    currentEditingDoctorId = null;
    var form = document.getElementById('doctorForm');
    if (form) form.reset();
    var title = document.getElementById('doctorModalTitle');
    if (title) title.textContent = 'Add Medical Specialist';
    if (window.MediApp) window.MediApp.openModal('modalDoctorForm');
  };

  window.openEditDoctorModal = function (id) {
    var doc = window.MediStore.getDoctorById(id);
    if (!doc) return;

    currentEditingDoctorId = doc.id;
    var title = document.getElementById('doctorModalTitle');
    if (title) title.textContent = 'Edit Profile – ' + doc.name;

    document.getElementById('docName').value = doc.name;
    document.getElementById('docSpecialization').value = doc.specialization;
    document.getElementById('docQualification').value = doc.qualification;
    document.getElementById('docExperience').value = doc.experienceYears;
    document.getElementById('docEmail').value = doc.email;
    document.getElementById('docPhone').value = doc.phone;
    document.getElementById('docRoom').value = doc.roomNumber || '';
    document.getElementById('docFee').value = doc.consultationFee;
    document.getElementById('docAvailability').value = doc.availabilityStatus;
    document.getElementById('docHours').value = doc.scheduleHours || '';

    if (window.MediApp) window.MediApp.openModal('modalDoctorForm');
  };

  window.deleteDoctorConfirm = function (id) {
    var doc = window.MediStore.getDoctorById(id);
    if (!doc) return;

    if (confirm('Are you sure you want to remove ' + doc.name + ' from the specialist directory?')) {
      window.MediStore.deleteDoctor(id);
      renderDoctors();
      if (window.MediApp) window.MediApp.showToast('success', 'Specialist Removed', doc.name + ' was removed from roster.');
    }
  };

  function initDoctorForm() {
    var form = document.getElementById('doctorForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var docData = {
        name: document.getElementById('docName').value.trim(),
        specialization: document.getElementById('docSpecialization').value,
        qualification: document.getElementById('docQualification').value.trim(),
        experienceYears: Number(document.getElementById('docExperience').value),
        email: document.getElementById('docEmail').value.trim(),
        phone: document.getElementById('docPhone').value.trim(),
        roomNumber: document.getElementById('docRoom').value.trim(),
        consultationFee: Number(document.getElementById('docFee').value),
        availabilityStatus: document.getElementById('docAvailability').value,
        scheduleHours: document.getElementById('docHours').value.trim()
      };

      if (!docData.name || !docData.email) {
        if (window.MediApp) window.MediApp.showToast('error', 'Validation Error', 'Name and Email are required.');
        return;
      }

      if (currentEditingDoctorId) {
        window.MediStore.updateDoctor(currentEditingDoctorId, docData);
        if (window.MediApp) window.MediApp.showToast('success', 'Specialist Profile Saved', docData.name + ' updated.');
      } else {
        window.MediStore.addDoctor(docData);
        if (window.MediApp) window.MediApp.showToast('success', 'Specialist Added', docData.name + ' joined the medical staff.');
      }

      if (window.MediApp) window.MediApp.closeModal('modalDoctorForm');
      renderDoctors();
    });

    var searchInput = document.getElementById('doctorSearchInput');
    var specFilter = document.getElementById('doctorSpecialtyFilter');
    var availFilter = document.getElementById('doctorAvailabilityFilter');

    if (searchInput) searchInput.addEventListener('input', renderDoctors);
    if (specFilter) specFilter.addEventListener('change', renderDoctors);
    if (availFilter) availFilter.addEventListener('change', renderDoctors);
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderDoctors();
    initDoctorForm();
  });

})(window, document);
