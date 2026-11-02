/**
 * MediTrack - Billing & Invoicing Controller
 * Patient invoices, itemized fee breakdowns, payment processing, and printable tax invoices.
 */

(function (window, document) {
  'use strict';

  function populateSelects() {
    if (!window.MediStore) return;
    var pSelect = document.getElementById('billPatientSelect');
    var dSelect = document.getElementById('billDoctorSelect');

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
      var dHtml = '<option value="" disabled selected>-- Select Referring Doctor --</option>';
      doctors.forEach(function (d) {
        dHtml += '<option value="' + d.id + '">' + d.name + ' (' + d.specialization + ')</option>';
      });
      dSelect.innerHTML = dHtml;
    }
  }

  function renderBillings() {
    var tbody = document.getElementById('billingsTableBody');
    if (!tbody || !window.MediStore) return;

    var billings = window.MediStore.getBillings();
    var search = (document.getElementById('billSearchInput') ? document.getElementById('billSearchInput').value : '').toLowerCase().trim();
    var statusFilter = document.getElementById('billStatusFilter') ? document.getElementById('billStatusFilter').value : 'All';

    // Calculate revenue stats
    var totalBilled = 0;
    var totalPaid = 0;
    var totalPending = 0;

    billings.forEach(function (b) {
      var amt = Number(b.totalAmount || 0);
      totalBilled += amt;
      if (b.paymentStatus === 'Paid') {
        totalPaid += amt;
      } else {
        totalPending += amt;
      }
    });

    var statBilled = document.getElementById('statBillTotalBilled');
    var statPaid = document.getElementById('statBillTotalPaid');
    var statPending = document.getElementById('statBillTotalPending');
    var statInvoices = document.getElementById('statBillCount');

    if (statBilled) statBilled.textContent = '$' + totalBilled.toLocaleString('en-US', { minimumFractionDigits: 2 });
    if (statPaid) statPaid.textContent = '$' + totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 });
    if (statPending) statPending.textContent = '$' + totalPending.toLocaleString('en-US', { minimumFractionDigits: 2 });
    if (statInvoices) statInvoices.textContent = billings.length;

    var filtered = billings.filter(function (b) {
      var matchesSearch = !search ||
        b.invoiceCode.toLowerCase().indexOf(search) !== -1 ||
        b.patientName.toLowerCase().indexOf(search) !== -1 ||
        (b.doctorName && b.doctorName.toLowerCase().indexOf(search) !== -1);

      var matchesStatus = statusFilter === 'All' || b.paymentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="empty-state">' +
        '<div class="empty-title">No billing records found</div>' +
        '<div class="empty-desc">Generate a new patient invoice using the action button above.</div>' +
      '</td></tr>';
      return;
    }

    var html = '';
    filtered.forEach(function (b) {
      var statusBadge = 'badge-success';
      if (b.paymentStatus === 'Pending') statusBadge = 'badge-warning';
      if (b.paymentStatus === 'Partially Paid') statusBadge = 'badge-info';
      if (b.paymentStatus === 'Overdue') statusBadge = 'badge-danger';

      html += '<tr>' +
        '<td><span class="cell-title font-mono">' + b.invoiceCode + '</span></td>' +
        '<td>' +
          '<div class="cell-title">' + b.patientName + '</div>' +
          '<div class="cell-sub">' + (b.doctorName || 'Hospital Care') + '</div>' +
        '</td>' +
        '<td class="tabular-nums">' + b.invoiceDate + '</td>' +
        '<td class="tabular-nums">' + (b.dueDate || 'Upon receipt') + '</td>' +
        '<td class="tabular-nums font-mono" style="font-weight:700;font-size:0.95rem;color:var(--navy-900);">' +
          '$' + Number(b.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 }) +
        '</td>' +
        '<td><span class="badge ' + statusBadge + '">' + b.paymentStatus + '</span></td>' +
        '<td><span class="cell-sub">' + (b.paymentMethod || 'Insurance/Card') + '</span></td>' +
        '<td>' +
          '<div style="display:flex;gap:6px;">' +
            '<button class="btn btn-sm btn-outline" onclick="viewPrintInvoice(' + b.id + ')" title="View & Print Invoice">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>' +
              ' Invoice' +
            '</button>' +
            (b.paymentStatus !== 'Paid' ?
              '<button class="btn btn-sm btn-outline" style="color:var(--success);" onclick="markBillPaid(' + b.id + ')" title="Mark as Paid">' +
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
                ' Pay' +
              '</button>' : '') +
          '</div>' +
        '</td>' +
      '</tr>';
    });

    tbody.innerHTML = html;
  }

  // Dynamic invoice line item adder
  window.addBillItemRow = function () {
    var container = document.getElementById('billItemsContainer');
    if (!container) return;

    var row = document.createElement('div');
    row.className = 'bill-item-row';
    row.style = 'display:grid;grid-template-columns:3fr 1fr 1.5fr 1.5fr 30px;gap:8px;margin-bottom:8px;align-items:center;';
    row.innerHTML = 
      '<input type="text" class="form-control item-desc" placeholder="Service / Item Description" required>' +
      '<input type="number" class="form-control item-qty" value="1" min="1" oninput="calculateBillTotals()" required>' +
      '<input type="number" class="form-control item-price" value="50.00" step="0.01" min="0" oninput="calculateBillTotals()" required>' +
      '<input type="text" class="form-control item-total tabular-nums font-mono" value="$50.00" readonly style="background:var(--slate-50);">' +
      '<button type="button" onclick="this.parentElement.remove(); calculateBillTotals();" style="background:none;border:none;color:var(--danger);cursor:pointer;padding:4px;">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' +
      '</button>';

    container.appendChild(row);
    calculateBillTotals();
  };

  window.calculateBillTotals = function () {
    var rows = document.querySelectorAll('#billItemsContainer .bill-item-row');
    var subtotal = 0;

    rows.forEach(function (r) {
      var qty = Number(r.querySelector('.item-qty').value) || 0;
      var price = Number(r.querySelector('.item-price').value) || 0;
      var lineTotal = qty * price;
      r.querySelector('.item-total').value = '$' + lineTotal.toFixed(2);
      subtotal += lineTotal;
    });

    var taxRate = Number(document.getElementById('billTaxRate').value) || 0;
    var discount = Number(document.getElementById('billDiscount').value) || 0;

    var taxAmount = (subtotal * taxRate) / 100;
    var grandTotal = Math.max(0, subtotal + taxAmount - discount);

    document.getElementById('billCalcSubtotal').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('billCalcTax').textContent = '$' + taxAmount.toFixed(2);
    document.getElementById('billCalcDiscount').textContent = '-$' + discount.toFixed(2);
    document.getElementById('billCalcTotal').textContent = '$' + grandTotal.toFixed(2);

    return { subtotal: subtotal, taxAmount: taxAmount, discountAmount: discount, grandTotal: grandTotal };
  };

  window.markBillPaid = function (id) {
    window.MediStore.updateBillingStatus(id, 'Paid', 'Cash / Direct Settlement');
    renderBillings();
    if (window.MediApp) window.MediApp.showToast('success', 'Payment Received', 'Invoice marked as Paid.');
  };

  window.viewPrintInvoice = function (id) {
    var bill = window.MediStore.getBillings().find(function (b) { return b.id === Number(id); });
    if (!bill) return;

    var container = document.getElementById('printableInvoiceContent');
    if (!container) return;

    var patient = window.MediStore.getPatientById(bill.patientId) || { address: '742 Evergreen Terr', phone: '+1 555-0192', email: 'patient@meditrack.org' };

    var html = 
      '<div class="invoice-container">' +
        '<div class="invoice-header">' +
          '<div>' +
            '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">' +
              '<div class="brand-icon" style="width:32px;height:32px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></div>' +
              '<h2 style="font-size:1.4rem;font-weight:700;color:var(--navy-900);">MediTrack Medical Center</h2>' +
            '</div>' +
            '<div style="font-size:0.8rem;color:var(--slate-500);">' +
              '100 Innovation Parkway, Suite 500<br>Medical District, NY 10001<br>contact@meditrack.org · +1 (800) 555-MEDI' +
            '</div>' +
          '</div>' +
          '<div style="text-align:right;">' +
            '<div style="font-size:1.5rem;font-weight:800;color:var(--primary);letter-spacing:0.02em;">INVOICE</div>' +
            '<div class="font-mono" style="font-weight:600;font-size:1rem;margin-top:2px;">' + bill.invoiceCode + '</div>' +
            '<div style="font-size:0.8rem;color:var(--slate-500);margin-top:6px;">Date: ' + bill.invoiceDate + '<br>Due: ' + (bill.dueDate || 'Upon Receipt') + '</div>' +
            '<div style="margin-top:8px;"><span class="badge ' + (bill.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning') + '">' + bill.paymentStatus + '</span></div>' +
          '</div>' +
        '</div>' +

        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;font-size:0.85rem;">' +
          '<div>' +
            '<div style="font-size:0.75rem;font-weight:600;color:var(--slate-500);text-transform:uppercase;margin-bottom:4px;">Billed To:</div>' +
            '<div style="font-weight:700;font-size:1rem;color:var(--navy-900);">' + bill.patientName + '</div>' +
            '<div style="color:var(--slate-600);">' + (patient.address || 'Medical Patient') + '</div>' +
            '<div style="color:var(--slate-600);">' + (patient.phone || '') + ' · ' + (patient.email || '') + '</div>' +
          '</div>' +
          '<div>' +
            '<div style="font-size:0.75rem;font-weight:600;color:var(--slate-500);text-transform:uppercase;margin-bottom:4px;">Medical Reference:</div>' +
            '<div><strong>Attending Physician:</strong> ' + (bill.doctorName || 'Dr. Alexander Hayes') + '</div>' +
            '<div><strong>Payment Method:</strong> ' + (bill.paymentMethod || 'Insurance / Card') + '</div>' +
            '<div><strong>Notes / Auth:</strong> ' + (bill.notes || 'None') + '</div>' +
          '</div>' +
        '</div>' +

        '<table style="width:100%;font-size:0.88rem;border-collapse:collapse;margin-bottom:20px;">' +
          '<thead>' +
            '<tr style="background:var(--slate-100);text-align:left;color:var(--slate-700);border-bottom:1px solid var(--slate-300);">' +
              '<th style="padding:10px 12px;">Service / Item Description</th>' +
              '<th style="padding:10px 12px;text-align:center;">Qty</th>' +
              '<th style="padding:10px 12px;text-align:right;">Unit Price</th>' +
              '<th style="padding:10px 12px;text-align:right;">Amount</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' +
            (bill.items || []).map(function(item){
              return '<tr style="border-bottom:1px solid var(--slate-200);">' +
                '<td style="padding:10px 12px;font-weight:500;">' + item.desc + '</td>' +
                '<td style="padding:10px 12px;text-align:center;" class="tabular-nums">' + item.qty + '</td>' +
                '<td style="padding:10px 12px;text-align:right;" class="tabular-nums font-mono">$' + Number(item.unitPrice).toFixed(2) + '</td>' +
                '<td style="padding:10px 12px;text-align:right;font-weight:600;" class="tabular-nums font-mono">$' + Number(item.total).toFixed(2) + '</td>' +
              '</tr>';
            }).join('') +
          '</tbody>' +
        '</table>' +

        '<div style="display:flex;justify-content:flex-end;">' +
          '<div style="width:280px;font-size:0.88rem;display:flex;flex-direction:column;gap:6px;">' +
            '<div style="display:flex;justify-content:space-between;color:var(--slate-600);">' +
              '<span>Subtotal:</span><strong class="tabular-nums font-mono">$' + Number(bill.subtotal || bill.totalAmount).toFixed(2) + '</strong>' +
            '</div>' +
            '<div style="display:flex;justify-content:space-between;color:var(--slate-600);">' +
              '<span>Estimated Tax (5%):</span><strong class="tabular-nums font-mono">$' + Number(bill.taxAmount || 0).toFixed(2) + '</strong>' +
            '</div>' +
            (bill.discountAmount ? 
              '<div style="display:flex;justify-content:space-between;color:var(--success);">' +
                '<span>Discount / Coverage:</span><strong class="tabular-nums font-mono">-$' + Number(bill.discountAmount).toFixed(2) + '</strong>' +
              '</div>' : '') +
            '<div style="display:flex;justify-content:space-between;border-top:2px solid var(--navy-900);padding-top:8px;font-size:1.15rem;font-weight:800;color:var(--navy-900);">' +
              '<span>Grand Total:</span><span class="tabular-nums font-mono">$' + Number(bill.totalAmount).toFixed(2) + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div style="margin-top:40px;border-top:1px solid var(--slate-200);padding-top:16px;display:flex;justify-content:space-between;align-items:flex-end;font-size:0.75rem;color:var(--slate-500);">' +
          '<div>Thank you for choosing MediTrack Healthcare.<br>Payment is due within 15 days of invoice date.</div>' +
          '<div style="text-align:center;border-top:1px solid var(--slate-400);width:160px;padding-top:6px;">Hospital Billing Officer</div>' +
        '</div>' +
      '</div>';

    container.innerHTML = html;
    if (window.MediApp) window.MediApp.openModal('modalPrintInvoice');
  };

  function initBillingForms() {
    var form = document.getElementById('generateBillForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var patientId = document.getElementById('billPatientSelect').value;
        var doctorId = document.getElementById('billDoctorSelect').value;

        var patient = window.MediStore.getPatientById(patientId);
        var doctor = window.MediStore.getDoctorById(doctorId);

        if (!patient) {
          if (window.MediApp) window.MediApp.showToast('error', 'Select Patient', 'Please choose a patient for this bill.');
          return;
        }

        var rows = document.querySelectorAll('#billItemsContainer .bill-item-row');
        var items = [];
        rows.forEach(function (r) {
          var desc = r.querySelector('.item-desc').value.trim();
          var qty = Number(r.querySelector('.item-qty').value) || 1;
          var unitPrice = Number(r.querySelector('.item-price').value) || 0;
          if (desc) {
            items.push({ desc: desc, qty: qty, unitPrice: unitPrice, total: qty * unitPrice });
          }
        });

        if (items.length === 0) {
          if (window.MediApp) window.MediApp.showToast('error', 'Empty Invoice', 'Please enter at least one line item.');
          return;
        }

        var totals = calculateBillTotals();

        var billData = {
          patientId: patient.id,
          patientName: patient.name,
          doctorId: doctor ? doctor.id : null,
          doctorName: doctor ? doctor.name : 'Hospital Care',
          invoiceDate: document.getElementById('billDate').value,
          dueDate: document.getElementById('billDueDate').value,
          items: items,
          subtotal: totals.subtotal,
          taxAmount: totals.taxAmount,
          discountAmount: totals.discountAmount,
          totalAmount: totals.grandTotal,
          paymentStatus: document.getElementById('billPaymentStatus').value,
          paymentMethod: document.getElementById('billPaymentMethod').value,
          notes: document.getElementById('billNotes').value.trim()
        };

        window.MediStore.addBilling(billData);
        if (window.MediApp) {
          window.MediApp.closeModal('modalGenerateBill');
          window.MediApp.showToast('success', 'Invoice Created', 'Bill generated for ' + patient.name + ' ($' + totals.grandTotal.toFixed(2) + ')');
        }
        renderBillings();
      });
    }

    var searchInput = document.getElementById('billSearchInput');
    var statusFilter = document.getElementById('billStatusFilter');

    if (searchInput) searchInput.addEventListener('input', renderBillings);
    if (statusFilter) statusFilter.addEventListener('change', renderBillings);
  }

  document.addEventListener('DOMContentLoaded', function () {
    populateSelects();
    renderBillings();
    initBillingForms();
  });

})(window, document);
