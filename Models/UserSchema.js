const mongoose = require("mongoose");
const validator = require("validator");

const UserSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Not Valid Email")
            }
        }
    },
    attempt: { type: Number, default: 0 },
    attempt1score: { type: Number},
    attempt2score: { type: Number},
    attempt3score: { type: Number},
    attempt1pdf: { type: String },  
    attempt2pdf: { type: String }, 
    attempt3pdf: { type: String }
})

const McqQuizUser = new mongoose.model("McqQuizUser", UserSchema);

module.exports = McqQuizUser;