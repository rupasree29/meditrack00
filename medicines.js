/**
 * MediTrack - Pharmacy & Medicine Inventory Controller
 * Stock level tracking, low-stock warnings, expiration auditing, and restock workflows.
 */

(function (window, document) {
  'use strict';

  var currentEditingMedicineId = null;

  function renderMedicines() {
    var tbody = document.getElementById('medicinesTableBody');
    if (!tbody || !window.MediStore) return;

    var medicines = window.MediStore.getMedicines();
    var search = (document.getElementById('medSearchInput') ? document.getElementById('medSearchInput').value : '').toLowerCase().trim();
    var catFilter = document.getElementById('medCategoryFilter') ? document.getElementById('medCategoryFilter').value : 'All';
    var stockFilter = document.getElementById('medStockStatusFilter') ? document.getElementById('medStockStatusFilter').value : 'All';

    var now = new Date();
    var sixtyDaysLater = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

    // Compute stats
    var lowStockCount = 0;
    var expiringCount = 0;
    var totalUnits = 0;

    medicines.forEach(function (m) {
      totalUnits += Number(m.stockQuantity || 0);
      var threshold = m.minStockThreshold || 25;
      if (m.stockQuantity <= threshold) lowStockCount++;
      if (m.expiryDate) {
        var exp = new Date(m.expiryDate);
        if (exp <= sixtyDaysLater) expiringCount++;
      }
    });

    var countTotal = document.getElementById('statMedTotal');
    var countLow = document.getElementById('statMedLow');
    var countExp = document.getElementById('statMedExpiring');
    var countUnits = document.getElementById('statMedUnits');

    if (countTotal) countTotal.textContent = medicines.length;
    if (countLow) countLow.textContent = lowStockCount;
    if (countExp) countExp.textContent = expiringCount;
    if (countUnits) countUnits.textContent = totalUnits.toLocaleString();

    // Low stock banner visibility
    var alertBanner = document.getElementById('lowStockAlertBanner');
    var alertDesc = document.getElementById('lowStockAlertDesc');
    if (alertBanner && alertDesc) {
      if (lowStockCount > 0) {
        alertBanner.style.display = 'flex';
        alertDesc.textContent = lowStockCount + ' pharmaceutical item(s) are at or below minimum threshold. Restock recommended.';
      } else {
        alertBanner.style.display = 'none';
      }
    }

    var filtered = medicines.filter(function (m) {
      var matchesSearch = !search ||
        m.name.toLowerCase().indexOf(search) !== -1 ||
        (m.genericName && m.genericName.toLowerCase().indexOf(search) !== -1) ||
        (m.code && m.code.toLowerCase().indexOf(search) !== -1) ||
        (m.supplier && m.supplier.toLowerCase().indexOf(search) !== -1);

      var matchesCat = catFilter === 'All' || m.category === catFilter;

      var matchesStock = true;
      var threshold = m.minStockThreshold || 25;
      if (stockFilter === 'Low') {
        matchesStock = m.stockQuantity <= threshold;
      } else if (stockFilter === 'InStock') {
        matchesStock = m.stockQuantity > threshold;
      } else if (stockFilter === 'Expiring') {
        matchesStock = m.expiryDate && new Date(m.expiryDate) <= sixtyDaysLater;
      }

      return matchesSearch && matchesCat && matchesStock;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="empty-state">' +
        '<div class="empty-title">No pharmaceutical items found</div>' +
        '<div class="empty-desc">Check your search query or add a new drug to the inventory.</div>' +
      '</td></tr>';
      return;
    }

    var html = '';
    filtered.forEach(function (m) {
      var threshold = m.minStockThreshold || 25;
      var isLow = m.stockQuantity <= threshold;
      var isExpiring = m.expiryDate && new Date(m.expiryDate) <= sixtyDaysLater;

      html += '<tr>' +
        '<td><span class="cell-title font-mono">' + (m.code || 'MED-' + m.id) + '</span></td>' +
        '<td>' +
          '<div class="cell-title">' + m.name + '</div>' +
          '<div class="cell-sub">' + (m.genericName || 'Standard formulation') + '</div>' +
        '</td>' +
        '<td><span class="badge badge-slate">' + (m.category || 'General') + '</span></td>' +
        '<td class="tabular-nums">' +
          '<div style="display:flex;align-items:center;gap:6px;">' +
            '<strong style="font-size:0.95rem;color:' + (isLow ? 'var(--danger)' : 'var(--navy-900)') + ';">' + m.stockQuantity + '</strong> ' +
            '<span class="cell-sub">' + (m.unit || 'Units') + '</span>' +
            (isLow ? '<span class="badge badge-danger badge-sm">Low</span>' : '') +
          '</div>' +
        '</td>' +
        '<td class="tabular-nums font-mono" style="font-weight:600;">$' + Number(m.unitPrice).toFixed(2) + '</td>' +
        '<td class="tabular-nums">' +
          '<div style="' + (isExpiring ? 'color:var(--danger);font-weight:600;' : '') + '">' + m.expiryDate + '</div>' +
          (isExpiring ? '<span class="badge badge-warning badge-sm">Expiring Soon</span>' : '') +
        '</td>' +
        '<td><span class="cell-sub">' + (m.supplier || 'Hospital Wholesaler') + '</span></td>' +
        '<td>' +
          '<div style="display:flex;gap:6px;">' +
            '<button class="btn btn-sm btn-outline" onclick="openRestockModal(' + m.id + ')" title="Adjust / Restock">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>' +
              ' Restock' +
            '</button>' +
            '<button class="btn btn-sm btn-outline" onclick="openEditMedicineModal(' + m.id + ')" title="Edit Item">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>' +
            '</button>' +
            '<button class="btn btn-sm btn-outline" style="color:var(--danger);" onclick="deleteMedicineConfirm(' + m.id + ')" title="Delete Item">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>' +
            '</button>' +
          '</div>' +
        '</td>' +
      '</tr>';
    });

    tbody.innerHTML = html;
  }

  // Restock modal
  window.openRestockModal = function (id) {
    var med = window.MediStore.getMedicines().find(function (m) { return m.id === Number(id); });
    if (!med) return;

    document.getElementById('restockMedId').value = med.id;
    document.getElementById('restockMedName').textContent = med.name + ' (' + med.code + ')';
    document.getElementById('restockCurrentStock').textContent = med.stockQuantity + ' ' + med.unit;
    document.getElementById('restockAmount').value = 50;

    if (window.MediApp) window.MediApp.openModal('modalRestockMedicine');
  };

  window.openAddMedicineModal = function () {
    currentEditingMedicineId = null;
    var form = document.getElementById('medicineForm');
    if (form) form.reset();
    var title = document.getElementById('medModalTitle');
    if (title) title.textContent = 'Add Pharmaceutical Item';
    if (window.MediApp) window.MediApp.openModal('modalMedicineForm');
  };

  window.openEditMedicineModal = function (id) {
    var med = window.MediStore.getMedicines().find(function (m) { return m.id === Number(id); });
    if (!med) return;

    currentEditingMedicineId = med.id;
    var title = document.getElementById('medModalTitle');
    if (title) title.textContent = 'Edit Item – ' + med.name;

    document.getElementById('medName').value = med.name;
    document.getElementById('medGenericName').value = med.genericName || '';
    document.getElementById('medCategory').value = med.category;
    document.getElementById('medStockQty').value = med.stockQuantity;
    document.getElementById('medUnit').value = med.unit;
    document.getElementById('medUnitPrice').value = med.unitPrice;
    document.getElementById('medExpiryDate').value = med.expiryDate;
    document.getElementById('medSupplier').value = med.supplier || '';
    document.getElementById('medMinThreshold').value = med.minStockThreshold || 25;

    if (window.MediApp) window.MediApp.openModal('modalMedicineForm');
  };

  window.deleteMedicineConfirm = function (id) {
    var med = window.MediStore.getMedicines().find(function (m) { return m.id === Number(id); });
    if (!med) return;

    if (confirm('Are you sure you want to delete "' + med.name + '" from the pharmacy inventory?')) {
      window.MediStore.deleteMedicine(id);
      renderMedicines();
      if (window.MediApp) window.MediApp.showToast('info', 'Medicine Deleted', med.name + ' was removed.');
    }
  };

  function initMedicineForms() {
    // Restock form
    var restockForm = document.getElementById('formRestock');
    if (restockForm) {
      restockForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var id = document.getElementById('restockMedId').value;
        var amount = Number(document.getElementById('restockAmount').value);

        window.MediStore.adjustStock(id, amount);
        if (window.MediApp) {
          window.MediApp.closeModal('modalRestockMedicine');
          window.MediApp.showToast('success', 'Stock Adjusted', 'Inventory replenished successfully.');
        }
        renderMedicines();
      });
    }

    // Add/Edit Medicine form
    var medForm = document.getElementById('medicineForm');
    if (medForm) {
      medForm.addEventListener('submit', function (e) {
        e.preventDefault();

        var medData = {
          name: document.getElementById('medName').value.trim(),
          genericName: document.getElementById('medGenericName').value.trim(),
          category: document.getElementById('medCategory').value,
          stockQuantity: Number(document.getElementById('medStockQty').value),
          unit: document.getElementById('medUnit').value,
          unitPrice: Number(document.getElementById('medUnitPrice').value),
          expiryDate: document.getElementById('medExpiryDate').value,
          supplier: document.getElementById('medSupplier').value.trim(),
          minStockThreshold: Number(document.getElementById('medMinThreshold').value)
        };

        if (!medData.name || !medData.expiryDate) {
          if (window.MediApp) window.MediApp.showToast('error', 'Validation Error', 'Medicine Name and Expiry Date are required.');
          return;
        }

        if (currentEditingMedicineId) {
          window.MediStore.updateMedicine(currentEditingMedicineId, medData);
          if (window.MediApp) window.MediApp.showToast('success', 'Medicine Updated', medData.name + ' saved.');
        } else {
          window.MediStore.addMedicine(medData);
          if (window.MediApp) window.MediApp.showToast('success', 'Medicine Added', medData.name + ' added to inventory.');
        }

        if (window.MediApp) window.MediApp.closeModal('modalMedicineForm');
        renderMedicines();
      });
    }

    var searchInput = document.getElementById('medSearchInput');
    var catFilter = document.getElementById('medCategoryFilter');
    var stockFilter = document.getElementById('medStockStatusFilter');

    if (searchInput) searchInput.addEventListener('input', renderMedicines);
    if (catFilter) catFilter.addEventListener('change', renderMedicines);
    if (stockFilter) stockFilter.addEventListener('change', renderMedicines);
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderMedicines();
    initMedicineForms();
  });

})(window, document);
