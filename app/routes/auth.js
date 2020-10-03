const express = require('express');
const router = express.Router();

/**
 * import validators
 */

const { userSignupValidator, userSigninValidator, forgotPasswordValidator, resetPasswordValidator } = require('../../utils/auth');
const { runValidation } = require('../../utils/index')


/**
 * import controllers
 */
const { signup, accountActivation, signin, resetPassword, forgotPassword } = require('../controllers/auth');


router.post('/signup', userSignupValidator, runValidation, signup)
router.post('/account-activation', accountActivation)
router.post('/signin', userSigninValidator, runValidation, signin)
router.put('/forgot-password', forgotPasswordValidator, runValidation, forgotPassword)
router.put('/rest-password', resetPasswordValidator, runValidation, resetPassword)






module.exports = router;