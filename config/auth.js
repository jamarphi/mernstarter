const jwt = require('jsonwebtoken');

const auth = (req,res,next) => {
    try {
        const token = req.header('x-auth-token');
        if(!token) return res.status(401).json({msg: 'user is unauthorized'});

        const decodedToken = jwt.verify(token,process.env.JWT_SECRET);
        next();
    } catch (err) {
        return res.status(400).json({msg: 'no token found'});
    }
}

module.exports = auth;