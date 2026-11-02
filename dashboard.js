/**
 * MediTrack - Dashboard Module Controller
 * Renders clinical KPI metrics, pure SVG interactive admission charts,
 * today's appointments queue, bed occupancy matrix, and live clinical activity.
 */

(function (window, document) {
  'use strict';

  function renderKPIs() {
    if (!window.MediStore) return;
    var stats = window.MediStore.getDashboardStats();

    var elPatients = document.getElementById('statTotalPatients');
    var elDoctors = document.getElementById('statTotalDoctors');
    var elApts = document.getElementById('statTodayAppointments');
    var elBeds = document.getElementById('statAvailableBeds');
    var elRevenue = document.getElementById('statTotalRevenue');

    if (elPatients) elPatients.textContent = stats.totalPatients;
    if (elDoctors) elDoctors.textContent = stats.totalDoctors;
    if (elApts) elApts.textContent = stats.todayAppointments;
    if (elBeds) elBeds.textContent = stats.availableBeds + ' / ' + stats.totalBeds;
    if (elRevenue) elRevenue.textContent = '$' + Number(stats.totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function renderTodayAppointments() {
    var tbody = document.getElementById('todayAppointmentsTableBody');
    if (!tbody || !window.MediStore) return;

    var appointments = window.MediStore.getAppointments();
    // Sort so upcoming are first
    var list = appointments.slice(0, 5);

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><div class="empty-desc">No appointments scheduled for today.</div></td></tr>';
      return;
    }

    var html = '';
    list.forEach(function (apt) {
      var statusBadgeClass = 'badge-info';
      if (apt.status === 'Completed') statusBadgeClass = 'badge-success';
      if (apt.status === 'Cancelled') statusBadgeClass = 'badge-danger';
      if (apt.status === 'Rescheduled') statusBadgeClass = 'badge-warning';

      html += '<tr>' +
        '<td><span class="cell-title">' + apt.appointmentCode + '</span></td>' +
        '<td>' +
          '<div class="cell-title">' + apt.patientName + '</div>' +
          '<div class="cell-sub">' + (apt.type || 'Consultation') + '</div>' +
        '</td>' +
        '<td>' +
          '<div class="cell-title">' + apt.doctorName + '</div>' +
          '<div class="cell-sub">' + (apt.department || 'General') + '</div>' +
        '</td>' +
        '<td class="tabular-nums">' + apt.date + '<br><span class="cell-sub">' + apt.time + '</span></td>' +
        '<td><span class="badge ' + statusBadgeClass + '">' + apt.status + '</span></td>' +
        '<td>' +
          '<div style="display:flex;gap:6px;">' +
            (apt.status !== 'Completed' ? 
              '<button class="btn btn-sm btn-outline" onclick="completeAppointment(' + apt.id + ')" title="Mark as Completed">' +
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
              '</button>' : '') +
            (apt.status !== 'Cancelled' && apt.status !== 'Completed' ? 
              '<button class="btn btn-sm btn-outline" onclick="openRescheduleModal(' + apt.id + ')" title="Reschedule">' +
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>' +
              '</button>' : '') +
          '</div>' +
        '</td>' +
      '</tr>';
    });

    tbody.innerHTML = html;
  }

  function renderBedMatrix(wardFilter) {
    var container = document.getElementById('bedMatrixGrid');
    if (!container || !window.MediStore) return;

    var beds = window.MediStore.getBeds();
    if (wardFilter && wardFilter !== 'All') {
      beds = beds.filter(function (b) { return b.ward.indexOf(wardFilter) !== -1; });
    }

    var html = '';
    beds.forEach(function (bed) {
      var statusClass = 'available';
      if (bed.status === 'Occupied') statusClass = 'occupied';
      if (bed.status === 'Maintenance') statusClass = 'maintenance';

      html += '<div class="bed-card ' + statusClass + '">' +
        '<div class="bed-num">' + bed.bedNumber + '</div>' +
        '<div class="bed-type">' + bed.type + '</div>' +
        '<span class="badge badge-sm ' + (bed.status === 'Available' ? 'badge-success' : (bed.status === 'Occupied' ? 'badge-danger' : 'badge-warning')) + '">' + bed.status + '</span>' +
        '<div class="cell-sub" style="margin-top:4px;font-size:0.68rem;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' +
          (bed.patientName ? bed.patientName : bed.ward) +
        '</div>' +
      '</div>';
    });

    container.innerHTML = html;
  }

  function renderActivityFeed() {
    var container = document.getElementById('recentActivityFeed');
    if (!container || !window.MediStore) return;

    var activities = window.MediStore.getActivities().slice(0, 6);
    if (activities.length === 0) {
      container.innerHTML = '<div class="empty-desc">No recent clinical events recorded.</div>';
      return;
    }

    var html = '<div style="display:flex;flex-direction:column;gap:12px;">';
    activities.forEach(function (act) {
      var iconColor = 'var(--primary)';
      if (act.type === 'billing') iconColor = 'var(--success)';
      if (act.type === 'pharmacy') iconColor = 'var(--warning)';
      if (act.type === 'patient') iconColor = 'var(--info)';

      html += '<div style="display:flex;align-items:flex-start;gap:12px;padding:8px 0;border-bottom:1px solid var(--slate-100);">' +
        '<div style="width:10px;height:10px;border-radius:50%;background-color:' + iconColor + ';margin-top:6px;flex-shrink:0;"></div>' +
        '<div style="flex:1;">' +
          '<div style="font-size:0.83rem;color:var(--navy-900);font-weight:500;">' + act.text + '</div>' +
          '<div style="font-size:0.72rem;color:var(--slate-500);margin-top:2px;">' + act.time + ' · ' + act.user + '</div>' +
        '</div>' +
      '</div>';
    });
    html += '</div>';

    container.innerHTML = html;
  }

  // Pure SVG Interactive Weekly Trend Chart (Zero External Dependencies)
  function renderAdmissionChart() {
    var container = document.getElementById('admissionChartSvg');
    if (!container) return;

    var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    var admissions = [14, 19, 16, 25, 22, 17, 21];
    var discharges = [10, 15, 12, 18, 19, 14, 15];

    var width = 640;
    var height = 220;
    var padLeft = 40;
    var padRight = 20;
    var padTop = 20;
    var padBottom = 30;

    var chartW = width - padLeft - padRight;
    var chartH = height - padTop - padBottom;
    var maxVal = 30;

    // Build SVG paths
    function getX(i) {
      return padLeft + (i / (days.length - 1)) * chartW;
    }
    function getY(val) {
      return padTop + chartH - (val / maxVal) * chartH;
    }

    var pathAdmit = 'M ' + getX(0) + ' ' + getY(admissions[0]);
    var pathDisch = 'M ' + getX(0) + ' ' + getY(discharges[0]);

    for (var i = 1; i < days.length; i++) {
      pathAdmit += ' L ' + getX(i) + ' ' + getY(admissions[i]);
      pathDisch += ' L ' + getX(i) + ' ' + getY(discharges[i]);
    }

    var areaAdmit = pathAdmit + ' L ' + getX(days.length - 1) + ' ' + (padTop + chartH) + ' L ' + getX(0) + ' ' + (padTop + chartH) + ' Z';

    var svgContent = 
      '<defs>' +
        '<linearGradient id="admitGrad" x1="0%" y1="0%" x2="0%" y2="100%">' +
          '<stop offset="0%" stop-color="#0284c7" stop-opacity="0.25"/>' +
          '<stop offset="100%" stop-color="#0284c7" stop-opacity="0.0"/>' +
        '</linearGradient>' +
      '</defs>' +
      // Horizontal grid lines
      '<line x1="' + padLeft + '" y1="' + getY(0) + '" x2="' + (width - padRight) + '" y2="' + getY(0) + '" stroke="#e2e8f0" stroke-width="1"/>' +
      '<line x1="' + padLeft + '" y1="' + getY(10) + '" x2="' + (width - padRight) + '" y2="' + getY(10) + '" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3,3"/>' +
      '<text x="' + (padLeft - 8) + '" y="' + (getY(10) + 4) + '" text-anchor="end" font-size="11" fill="#94a3b8">10</text>' +
      '<line x1="' + padLeft + '" y1="' + getY(20) + '" x2="' + (width - padRight) + '" y2="' + getY(20) + '" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3,3"/>' +
      '<text x="' + (padLeft - 8) + '" y="' + (getY(20) + 4) + '" text-anchor="end" font-size="11" fill="#94a3b8">20</text>' +
      '<line x1="' + padLeft + '" y1="' + getY(30) + '" x2="' + (width - padRight) + '" y2="' + getY(30) + '" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3,3"/>' +
      '<text x="' + (padLeft - 8) + '" y="' + (getY(30) + 4) + '" text-anchor="end" font-size="11" fill="#94a3b8">30</text>' +
      // Shaded area
      '<path d="' + areaAdmit + '" fill="url(#admitGrad)"/>' +
      // Lines
      '<path d="' + pathAdmit + '" fill="none" stroke="#0284c7" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="' + pathDisch + '" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-dasharray="5,4" stroke-linecap="round"/>';

    // Data points & X labels
    for (var j = 0; j < days.length; j++) {
      var x = getX(j);
      var yA = getY(admissions[j]);
      var yD = getY(discharges[j]);

      svgContent += 
        '<text x="' + x + '" y="' + (height - 8) + '" text-anchor="middle" font-size="12" fill="#64748b" font-weight="500">' + days[j] + '</text>' +
        '<circle cx="' + x + '" cy="' + yA + '" r="4.5" fill="#0284c7" stroke="#ffffff" stroke-width="2"/>' +
        '<circle cx="' + x + '" cy="' + yD + '" r="4" fill="#16a34a" stroke="#ffffff" stroke-width="2"/>';
    }

    container.innerHTML = svgContent;
  }

  // Pure SVG Department Donut Chart
  function renderDepartmentDonut() {
    var container = document.getElementById('departmentDonutSvg');
    if (!container) return;

    var total = 100;
    var data = [
      { name: 'Cardiology', pct: 32, color: '#0284c7' },
      { name: 'Orthopedics', pct: 24, color: '#0ea5e9' },
      { name: 'Neurology', pct: 18, color: '#38bdf8' },
      { name: 'Pediatrics', pct: 14, color: '#16a34a' },
      { name: 'General', pct: 12, color: '#f59e0b' }
    ];

    var cx = 80;
    var cy = 80;
    var r = 60;
    var strokeWidth = 24;
    var circumference = 2 * Math.PI * r;

    var offset = 0;
    var slicesSvg = '';

    data.forEach(function (d) {
      var strokeDasharray = (d.pct / total) * circumference;
      slicesSvg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" ' +
        'fill="transparent" stroke="' + d.color + '" stroke-width="' + strokeWidth + '" ' +
        'stroke-dasharray="' + strokeDasharray + ' ' + (circumference - strokeDasharray) + '" ' +
        'stroke-dashoffset="' + (-offset) + '" ' +
        'transform="rotate(-90 ' + cx + ' ' + cy + ')"/>';
      offset += strokeDasharray;
    });

    var legendHtml = '<div style="display:flex;flex-direction:column;gap:6px;font-size:0.78rem;">';
    data.forEach(function (d) {
      legendHtml += '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">' +
        '<div style="display:flex;align-items:center;gap:6px;">' +
          '<span style="width:8px;height:8px;border-radius:2px;background:' + d.color + '"></span>' +
          '<span style="color:var(--slate-700)">' + d.name + '</span>' +
        '</div>' +
        '<span class="tabular-nums" style="font-weight:600;color:var(--navy-900)">' + d.pct + '%</span>' +
      '</div>';
    });
    legendHtml += '</div>';

    container.innerHTML = 
      '<div style="display:flex;align-items:center;gap:20px;">' +
        '<svg width="160" height="160" viewBox="0 0 160 160">' +
          slicesSvg +
          '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r - strokeWidth/2 - 2) + '" fill="#ffffff"/>' +
          '<text x="' + cx + '" y="' + (cy + 5) + '" text-anchor="middle" font-size="14" font-weight="700" fill="#0f172a">100%</text>' +
        '</svg>' +
        '<div style="flex:1;">' + legendHtml + '</div>' +
      '</div>';
  }

  // Appointment action helpers exposed on window
  window.completeAppointment = function (id) {
    if (!window.MediStore) return;
    window.MediStore.updateAppointmentStatus(id, 'Completed');
    renderTodayAppointments();
    renderKPIs();
    renderActivityFeed();
    if (window.MediApp) window.MediApp.showToast('success', 'Appointment Completed', 'Status updated to Completed.');
  };

  window.openRescheduleModal = function (id) {
    var apt = window.MediStore.getAppointments().find(function (a) { return a.id === Number(id); });
    if (!apt) return;

    var idInput = document.getElementById('rescheduleAptId');
    var infoEl = document.getElementById('rescheduleAptInfo');
    var dateInput = document.getElementById('rescheduleDate');
    var timeInput = document.getElementById('rescheduleTime');

    if (idInput) idInput.value = apt.id;
    if (infoEl) infoEl.textContent = apt.patientName + ' with ' + apt.doctorName + ' (' + apt.appointmentCode + ')';
    if (dateInput) dateInput.value = apt.date;
    if (timeInput) timeInput.value = apt.time;

    if (window.MediApp) window.MediApp.openModal('modalReschedule');
  };

  // Wire form submissions
  function initDashboardForms() {
    var rescheduleForm = document.getElementById('formRescheduleApt');
    if (rescheduleForm) {
      rescheduleForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var id = document.getElementById('rescheduleAptId').value;
        var date = document.getElementById('rescheduleDate').value;
        var time = document.getElementById('rescheduleTime').value;

        window.MediStore.rescheduleAppointment(id, date, time);
        if (window.MediApp) {
          window.MediApp.closeModal('modalReschedule');
          window.MediApp.showToast('success', 'Rescheduled', 'Appointment successfully updated.');
        }
        renderTodayAppointments();
        renderActivityFeed();
      });
    }

    // Ward tab buttons
    var wardButtons = document.querySelectorAll('[data-ward-filter]');
    wardButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        wardButtons.forEach(function (b) { b.classList.remove('btn-primary'); b.classList.add('btn-outline'); });
        btn.classList.add('btn-primary');
        btn.classList.remove('btn-outline');
        renderBedMatrix(btn.getAttribute('data-ward-filter'));
      });
    });
  }

  // Initialize on load
  document.addEventListener('DOMContentLoaded', function () {
    renderKPIs();
    renderTodayAppointments();
    renderBedMatrix('All');
    renderActivityFeed();
    renderAdmissionChart();
    renderDepartmentDonut();
    initDashboardForms();
  });

})(window, document);
