const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../Config/web.secret").jwt_secret;

module.exports = {
    validateJWTToken : (req, res, next) => {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({message: "Authorization token is missing."})
        }

        jwt.verify(token.split(" ")[1], JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({message: "Invalid or expired token."})
            }
            
            req.user = user
            next()
        })
    } 
}