const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Cari User
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ msg: 'Username tidak ditemukan.' });
        }

        // 2. Cek Password (Compare hash)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Password salah.' });
        }

        // 3. Buat Token
        const payload = { user: { id: user.id } };
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '12h' }, // Token berlaku 12 jam
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};