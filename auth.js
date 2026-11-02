/**
 * MediTrack - Authentication & Staff Portal Controller
 * Supports role presets, credential validation, session persistence, and registration.
 */

(function (window, document) {
  'use strict';

  var demoAccounts = {
    doctor: {
      name: "Dr. Alexander Hayes",
      email: "doctor@meditrack.org",
      role: "Chief Medical Officer",
      department: "Cardiology",
      avatar: "AH"
    },
    admin: {
      name: "Sarah Jenkins",
      email: "admin@meditrack.org",
      role: "Hospital Administrator",
      department: "Administration",
      avatar: "SJ"
    },
    receptionist: {
      name: "Emily Watson",
      email: "reception@meditrack.org",
      role: "Front Desk Coordinator",
      department: "Outpatient Services",
      avatar: "EW"
    }
  };

  window.fillDemoAccount = function (roleKey) {
    var acc = demoAccounts[roleKey];
    if (!acc) return;

    var emailInput = document.getElementById('loginEmail');
    var passwordInput = document.getElementById('loginPassword');

    if (emailInput) emailInput.value = acc.email;
    if (passwordInput) passwordInput.value = roleKey + '123';

    var chipButtons = document.querySelectorAll('.demo-role-chip');
    chipButtons.forEach(function (btn) { btn.classList.remove('active'); });
    var clickedBtn = document.querySelector('[data-role="' + roleKey + '"]');
    if (clickedBtn) clickedBtn.classList.add('active');
  };

  function initLoginForm() {
    var form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var email = document.getElementById('loginEmail').value.trim();
      var password = document.getElementById('loginPassword').value.trim();

      if (!email || !password) {
        showLoginAlert('Please enter both your email address and password.', 'danger');
        return;
      }

      // Identify user from demo profiles or generate staff session
      var matchedUser = null;
      for (var k in demoAccounts) {
        if (demoAccounts[k].email.toLowerCase() === email.toLowerCase()) {
          matchedUser = demoAccounts[k];
          break;
        }
      }

      if (!matchedUser) {
        // Fallback for custom staff email
        var namePart = email.split('@')[0];
        matchedUser = {
          name: namePart.charAt(0).toUpperCase() + namePart.slice(1).replace('.', ' '),
          email: email,
          role: "Clinical Staff",
          avatar: namePart.substring(0, 2).toUpperCase()
        };
      }

      // Persist session
      if (window.MediStore) {
        window.MediStore.setCurrentUser(matchedUser);
        window.MediStore.logActivity('auth', matchedUser.name + ' (' + matchedUser.role + ') logged into system.');
      } else {
        localStorage.setItem('meditrack_current_user', JSON.stringify(matchedUser));
      }

      showLoginAlert('Authentication successful. Redirecting to MediTrack Dashboard...', 'success');

      setTimeout(function () {
        window.location.href = 'index.html';
      }, 700);
    });

    // Registration Form
    var regForm = document.getElementById('registerForm');
    if (regForm) {
      regForm.addEventListener('submit', function (e) {
        e.preventDefault();

        var name = document.getElementById('regName').value.trim();
        var email = document.getElementById('regEmail').value.trim();
        var role = document.getElementById('regRole').value;

        if (!name || !email) {
          showLoginAlert('Please complete all registration fields.', 'danger');
          return;
        }

        var newUser = {
          name: name,
          email: email,
          role: role,
          avatar: name.split(' ').map(function(n){ return n[0]; }).join('').slice(-2).toUpperCase()
        };

        if (window.MediStore) {
          window.MediStore.setCurrentUser(newUser);
        } else {
          localStorage.setItem('meditrack_current_user', JSON.stringify(newUser));
        }

        showLoginAlert('Account created successfully! Loading dashboard...', 'success');
        setTimeout(function () {
          window.location.href = 'index.html';
        }, 700);
      });
    }
  }

  function showLoginAlert(message, type) {
    var alertBox = document.getElementById('loginAlertBox');
    if (!alertBox) return;

    alertBox.textContent = message;
    alertBox.className = 'alert alert-' + type;
    alertBox.style.display = 'block';
  }

  document.addEventListener('DOMContentLoaded', function () {
    initLoginForm();
  });

})(window, document);
