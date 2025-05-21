const express = require('express');
const { isAuthenticated } = require('../Middlewares/auth');
const { generateCertificate, downloadCertificate } = require('../Controllers/GenerateCertificateController');

const router = express.Router();

router.get('/courses/:courseId/certificate', isAuthenticated, generateCertificate);
router.get('/download/:certificateId', isAuthenticated, downloadCertificate);

module.exports = router;