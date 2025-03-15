const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const auth = require('../middleware/auth');

router.get('/', auth, deviceController.getAllDevices);
router.post('/', auth, deviceController.createDevice);
router.put('/:id', auth, deviceController.updateDevice);
router.delete('/:id', auth, deviceController.deleteDevice);

module.exports = router; 