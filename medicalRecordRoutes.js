const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');

router.get('/', medicalRecordController.getAllRecords);
router.post('/', medicalRecordController.createRecord);
router.delete('/:id', medicalRecordController.deleteRecord);

module.exports = router;
