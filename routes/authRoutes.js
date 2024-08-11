const { Router } = require('express');
const authController = require('../controllers/authController');
const { requireAuth, checkUser } = require('../middleware/authMiddleware');

const router = Router();
router.get('*', checkUser);
router.get('/profile', requireAuth, (req, res) => res.render('profile'));

router.get('/register', authController.register_get)
router.post('/register', authController.register_post)

router.get('/login', authController.login_get)
router.post('/login', authController.login_post)


router.get('/dashboard', requireAuth, authController.dashboard_get)

router.get('/createjob', requireAuth, authController.createjob_get)
router.post('/createjob', authController.createjob_post)

// router.get('/job', authController.job_get)
router.get('/job/:id', requireAuth, authController.job_get)

router.get('/editjob/:id', requireAuth, authController.editjob_get)
router.post('/editjob/:id', authController.editjob_post)

router.get('/updateprofile', requireAuth, authController.updateprofile_get)
router.post('/updateprofile', requireAuth, authController.updateprofile_post)

router.get('/download-cv/:userId', requireAuth, authController.download_cv);

// router.post('/delete-cv', requireAuth, authController.delete_cv);


router.get('/logout', authController.logout_get)


module.exports = router;
