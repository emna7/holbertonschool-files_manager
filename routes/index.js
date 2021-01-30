const express = require('express');
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');
const FilesController = require('../controllers/FilesController');

const router = express.Router();

router.get('/status', (req, res) => AppController.getStatus(req, res));

router.get('/stats', (req, res) => AppController.getStats(req, res));

router.post('/users', (req, res) => UsersController.postNew(req, res));

router.get('/connect', (req, res) => AuthController.getConnect(req, res));

router.get('/disconnect', (req, res) => AuthController.getDisconnect(req, res));

router.get('/users/me', (req, res) => UsersController.getMe(req, res));

router.post('/files', (req, res) => FilesController.postUpload(req, res));

module.exports = router;
