const { Router } = require('express');
const authController = require('../controllers/authController');

const router = Router();

router.get('/register', authController.register_get)
router.post('/register', authController.register_post)

router.get('/login', authController.login_get)
router.post('/login', authController.login_post)


router.get('/dashboard', authController.dashboard_get)

router.get('/createjob', authController.createjob_get)
router.post('/createjob', authController.createjob_post)

// router.get('/job', authController.job_get)
router.get('/job/:id', authController.job_get)

router.get('/logout', authController.logout_get)

module.exports = router;
