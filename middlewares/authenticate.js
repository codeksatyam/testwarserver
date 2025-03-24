const jwt = require("jsonwebtoken");
const keysecret = "vishnupratapsingh99353527349794315611";
const McqQuizUser = require("../Models/UserSchema");

const authenticate = async(req,res,next) => {
    try {
        const token = req.headers.authorization;
        // console.log(token);
        
        if (!token) {
            return res.status(401).json({ status: 401, message: "Unauthorized no token provided" });
        }

        const verifytoken = jwt.verify(token, keysecret);
        const userData = await McqQuizUser.findById(verifytoken._id);

        if (!userData) {
            return res.status(422).json({ status: 401, message: "User not found" });
        }

        req.token = token;
        req.user = userData;
        req.userId = verifytoken._id;
        next();
    } catch (error) {
        console.log("Authentication Error:", error);
        res.status(401).json({ status: 401, message: "Unauthorized" });
    }
}

module.exports = authenticate;