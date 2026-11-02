const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

router.get('/', doctorController.getAllDoctors);
router.get('/:id', doctorController.getDoctorById);
router.post('/', doctorController.createDoctor);
router.put('/:id', doctorController.updateDoctor);
router.patch('/:id/availability', doctorController.updateAvailability);
router.delete('/:id', doctorController.deleteDoctor);

module.exports = router;
