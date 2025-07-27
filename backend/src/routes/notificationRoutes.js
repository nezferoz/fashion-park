const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.get('/', notificationController.getByUserId);
router.post('/', notificationController.create);
router.patch('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.remove);

module.exports = router; 