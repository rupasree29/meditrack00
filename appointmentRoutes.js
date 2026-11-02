const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

router.get('/', appointmentController.getAllAppointments);
router.post('/', appointmentController.createAppointment);
router.patch('/:id/status', appointmentController.updateStatus);
router.patch('/:id/reschedule', appointmentController.reschedule);
router.patch('/:id/cancel', appointmentController.cancel);

module.exports = router;
