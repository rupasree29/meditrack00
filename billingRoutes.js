const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');

router.get('/', billingController.getAllBillings);
router.post('/', billingController.createBilling);
router.patch('/:id/status', billingController.updatePaymentStatus);

module.exports = router;
