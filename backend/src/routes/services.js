const express = require('express');
const multer = require('multer');
const { convertCurrency, processOCR } = require('../controllers/serviceController');
const { auth } = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.get('/currency/convert', auth, convertCurrency);
router.post('/ocr/upload', auth, upload.single('receipt'), processOCR);

module.exports = router;