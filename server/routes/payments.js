const express = require('express');
const router = require('express').Router();
const { createOrder, verifyPayment, getInvoices, downloadInvoice } = require('../controllers/paymentController');
const protect = require('../middleware/auth');

router.post('/order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/invoices', protect, getInvoices);
router.get('/invoices/:jobId/download', protect, downloadInvoice);

module.exports = router;
