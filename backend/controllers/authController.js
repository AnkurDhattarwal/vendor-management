// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthController {
    // POST /api/auth/signup
    static async signup(req, res, next) {
        try {
            const { email, password } = req.body;

            // prevent creating another admin
            if (email === process.env.ADMIN_EMAIL) {
                return res
                    .status(403)
                    .json({ success: false, message: 'Cannot sign up as admin' });
            }

            // hash password
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);

            // create user with null role/parentId
            const user = await User.create({ email, password: hash });

            res.status(201).json({ success: true, data: { id: user._id, email: user.email } });
        } catch (err) {
            // duplicate email?
            if (err.code === 11000) {
                return res
                    .status(400)
                    .json({ success: false, message: 'Email already in use' });
            }
            next(err);
        }
    }

    // POST /api/auth/login
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            // create JWT payload
            const payload = {
                userId: user._id,
                email: user.email,        // ← add this
                role: user.role,
                parentId: user.parentId
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.json({ success: true, data: { token } });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = AuthController;
