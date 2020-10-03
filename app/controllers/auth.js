const User = require('../models/user');
const jwt = require('jsonwebtoken')
const expressJwt = require('express-jwt');
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

/**
 * when user wants to signup we will send a email verfifcation to reduce junk emails
 * on that email verfifcation we will send user information encoded in jwt there will be also url link
 * clicking on that link they will taken to our client/react app
 * where we will grab the encoded jwt.(which containes user info)
 * then we make a request to backend to register the user into database
 */


exports.signup = (req, res) => {
    const { name, email, password } = req.body;
    /** find emailid is existing or not if not create user into database*/
    User.findOne({ email }).exec((err, user) => {
        if (user) {
            return res.status(400).json({ error: 'email is already taken' })
        }

        const token = jwt.sign(
            { name, email, password },
            process.env.JWT_ACCOUNT_ACTIVATION,
            { expiresIn: '10m' }
        )

        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Account activation link`,
            html: `
                <h3>Please use the following link to activate your account</h3>
                <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
                <hr/>
                <p>This email may cotaine sensitive data</p>
                <p>${process.env.CLIENT_URL}</p>
            `
        }
        sgMail.send(emailData)
            .then(sent => {
                return res.json({
                    message: `Email has been sent to ${email}. Follow the instruction to activate your account`
                })
            })
            .catch(err => {
                res.json({
                    message: err
                })
            })
    })
}

exports.accountActivation = (req, res) => {
    const { token } = req.body;
    if (token) {
        jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, (err, decoded) => {
            if (err) {
                console.log('JWT VERIFY IN ACCOUNT ACTIVATION ERROR', err)
                return res.status(401).json({
                    error: 'Link was expired, signup again'
                })
            }
            const { name, email, password } = jwt.decode(token);
            const user = new User({ name, email, password })
            user.save((err, user) => {
                if (err) {
                    console.log('Save user in account activation error')
                    return res.status(401).json({ error: 'error saving user in database, signup again' })
                }
                return res.json({ message: 'Signup success please signin' })
            })
        })
    }
    else {
        return res.json({ message: 'Something went wrong please try again later' })
    }
}

exports.signin = (req, res) => {
    const { email, password } = req.body;
    User.findOne({ email }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({ error: 'Email is not existing with us, please sign in' })
        }
        if (!user.authenticate(password)) {
            return res.status(400).json({ error: 'Email and password dont match' })
        }
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
        const { _id, name, email, role } = user;
        return res.json({
            token,
            user: {
                _id, name, email, role
            }
        })

    })
}

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256']
})


exports.adminMiddleware = (req, res, next) => {
    User.findById({ _id: req.user._id }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({ error: 'User not found' })
        }
        if (user.role !== 'admin') {
            return res.status(400).json({ error: 'Admin resources access denied' })
        }
        req.profile = user;
        next()
    })
}

exports.forgotPassword = (req, res) => {
    const { email } = req.body;
    User.findOne({ email }, (err, user) => {
        if (err || !user) return res.status(400).json({ error: `User that email with doesn't exist` })
        const token = jwt.sign(
            { _id: user._id },
            process.env.JWT_RESET_PASSWORD,
            { expiresIn: '10m' }
        )

        // return user.updateOne({ resetPasswordLink: token }, (err, success) => {
        //     if (err) return res.status(400).json({ error: `User that email with doesn't exist` })

        // })

        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Password Reset link`,
            html: `
                <h3>Please use the following link to reset your password</h3>
                <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
                <hr/>
                <p>This email may cotaine sensitive data</p>
                <p>${process.env.CLIENT_URL}</p>
            `
        }


        sgMail.send(emailData)
            .then(sent => {
                return res.json({
                    message: `Email has been sent to ${email}. Follow the instruction to activate your account`
                })
            })
            .catch(err => {
                res.json({
                    message: err
                })
            })
    })
}

exports.resetPassword = (req, res) => {
    const { resetPasswordLink, newPassword } = req.body;
}