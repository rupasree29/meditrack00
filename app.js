/**
 * MediTrack - Global Application UI Controller
 * Manages navigation, sidebar responsiveness, modals, toast alerts,
 * and project ZIP download functionality.
 */

(function (window, document) {
  'use strict';

  // Toast Notification System
  function showToast(type, title, message) {
    var container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    var toast = document.createElement('div');
    toast.className = 'toast toast-' + (type || 'info');

    var iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
    } else {
      iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = 
      '<div class="toast-icon">' + iconSvg + '</div>' +
      '<div class="toast-content">' +
        '<div class="toast-title">' + (title || 'Notification') + '</div>' +
        '<div class="toast-msg">' + (message || '') + '</div>' +
      '</div>';

    container.appendChild(toast);

    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3800);
  }

  // Modal Dialog System
  function openModal(modalId) {
    var modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modalId) {
    var modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Close modals on clicking overlay backdrop or cancel button
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal-overlay')) {
      e.target.classList.remove('active');
      document.body.style.overflow = '';
    }
    if (e.target.matches('[data-close-modal]')) {
      var targetModal = e.target.closest('.modal-overlay');
      if (targetModal) {
        targetModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  });

  // Mobile navigation drawer toggle
  function initMobileNav() {
    var toggleBtn = document.getElementById('mobileNavToggle');
    var sidebar = document.querySelector('.sidebar');
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', function () {
        sidebar.classList.toggle('mobile-open');
      });

      // Close sidebar when clicking outside on mobile
      document.addEventListener('click', function (e) {
        if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target) && sidebar.classList.contains('mobile-open')) {
          sidebar.classList.remove('mobile-open');
        }
      });
    }
  }

  // Setup user session info in sidebar
  function initUserWidget() {
    if (!window.MediStore) return;
    var user = window.MediStore.getCurrentUser();
    var nameEl = document.getElementById('currentUserName');
    var roleEl = document.getElementById('currentUserRole');
    var avatarEl = document.getElementById('currentUserAvatar');
    if (nameEl) nameEl.textContent = user.name || 'Dr. Alexander Hayes';
    if (roleEl) roleEl.textContent = user.role || 'Chief Medical Officer';
    if (avatarEl) avatarEl.textContent = user.avatar || 'DR';

    var logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        window.MediStore.logout();
      });
    }
  }

  // Backend connection status badge
  function initConnectionIndicator() {
    var statusDot = document.getElementById('backendStatusDot');
    var statusText = document.getElementById('backendStatusText');
    var statusSub = document.getElementById('backendStatusSub');
    
    if (window.MediAPI && (statusDot || statusText)) {
      window.MediAPI.onStatusChange(function (isConnected) {
        if (isConnected) {
          if (statusDot) {
            statusDot.className = 'status-dot';
            statusDot.style.backgroundColor = 'var(--success)';
          }
          if (statusText) statusText.textContent = 'Node.js / MySQL Live';
          if (statusSub) statusSub.textContent = 'Synced with server';
        } else {
          if (statusDot) {
            statusDot.className = 'status-dot standalone';
            statusDot.style.backgroundColor = 'var(--primary)';
          }
          if (statusText) statusText.textContent = 'Standalone Mode';
          if (statusSub) statusSub.textContent = 'Direct browser / Local DB';
        }
      });
    }
  }

  // Download project package function
  function downloadZipPackage() {
    // If running in development environment, fetch or offer pre-built MediTrack.zip
    var zipUrl = 'MediTrack.zip';
    var a = document.createElement('a');
    a.href = zipUrl;
    a.download = 'MediTrack.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('success', 'Download Started', 'Downloading MediTrack complete project archive.');
  }

  // Expose global app helpers
  window.MediApp = {
    showToast: showToast,
    openModal: openModal,
    closeModal: closeModal,
    downloadZipPackage: downloadZipPackage
  };

  // DOM ready initialization
  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initUserWidget();
    initConnectionIndicator();

    // Wire any zip download buttons
    var zipBtns = document.querySelectorAll('.download-zip-btn');
    zipBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        downloadZipPackage();
      });
    });
  });

})(window, document);
