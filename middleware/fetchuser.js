const jwt = require('jsonwebtoken');
const JWT_SECRET = 'Theworldofgood$b$oy';

const fetchuser = (req, res, next) => {
    //Get the usser fromm the jwt  token and add id to req object
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ error: "Please authenticate using vallid token" })
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({ error: "please authenticaate using a valid token" })
    }


}
module.exports = fetchuser;