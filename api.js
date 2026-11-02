/**
 * MediTrack - API Client Layer
 * Checks connection with Node.js/Express MySQL REST Backend.
 * If backend is active (port 5000 or same origin), fetches and pushes to MySQL.
 * If offline/standalone, seamlessly delegates to MediStore (localStorage).
 */

(function (window) {
  'use strict';

  var API_BASE_URL = 'http://localhost:5000/api';
  var isBackendConnected = false;
  var listeners = [];

  function checkBackendHealth() {
    // Try pinging backend health endpoint with timeout
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var signal = controller ? controller.signal : undefined;
    var timeoutId = controller ? setTimeout(function () { controller.abort(); }, 2000) : null;

    fetch(API_BASE_URL + '/health', { method: 'GET', signal: signal })
      .then(function (res) {
        if (res.ok) {
          isBackendConnected = true;
          notifyListeners(true);
        } else {
          fallbackOffline();
        }
      })
      .catch(function () {
        // Also test relative /api if served on same host
        fetch('/api/health', { method: 'GET' })
          .then(function (res) {
            if (res.ok) {
              API_BASE_URL = '/api';
              isBackendConnected = true;
              notifyListeners(true);
            } else {
              fallbackOffline();
            }
          })
          .catch(function () {
            fallbackOffline();
          });
      })
      .finally(function () {
        if (timeoutId) clearTimeout(timeoutId);
      });
  }

  function fallbackOffline() {
    isBackendConnected = false;
    notifyListeners(false);
  }

  function notifyListeners(status) {
    listeners.forEach(function (cb) {
      try { cb(status); } catch (e) {}
    });
  }

  var api = {
    getBaseUrl: function () {
      return API_BASE_URL;
    },
    isConnected: function () {
      return isBackendConnected;
    },
    onStatusChange: function (callback) {
      listeners.push(callback);
      // Immediately report current
      callback(isBackendConnected);
    },
    recheckConnection: function () {
      checkBackendHealth();
    },

    // Sync all local records to backend
    syncToBackend: function () {
      if (!isBackendConnected) {
        return Promise.reject(new Error("Backend is offline. Please start Node.js server at port 5000."));
      }
      var dump = window.MediStore.exportDataJSON();
      return fetch(API_BASE_URL + '/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: dump
      }).then(function (res) { return res.json(); });
    }
  };

  // Run initial check
  checkBackendHealth();

  window.MediAPI = api;
})(window);
