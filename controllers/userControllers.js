const McqQuizUser = require("../Models/UserSchema");
const userotp = require("../Models/userOtp");
const nodemailer = require("nodemailer");
const keysecret = "vishnupratapsingh99353527349794315611";
const jwt = require("jsonwebtoken");




// PDF Upload Route
exports.uploadpdf = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const pdfUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        
        return res.status(200).json({ pdfUrl });
    } catch (error) {
        return res.status(500).json({ message: "File upload failed", error: error.message });
    }
};

// email config
const tarnsporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "start112002up@gmail.com",
        pass: "sxdcthedvkukqlsk"
    }
})

// registration-----------------------------------
exports.userregister = async (req, res) => {
    const { fname, email } = req.body;

    if (!fname || !email) {
        res.status(400).json({ error: "Please Enter All Input Data" })
    }

    try {
        const preuser = await McqQuizUser.findOne({ email: email });

        if (preuser) {
            res.status(400).json({ error: "This User Allready Register" })
        } else {
            const userregister = new McqQuizUser({
                fname, email
            });

            const storeData = await userregister.save();
            res.status(200).json(storeData)
        }
    } catch (error) {
        res.status(400).json({ error: "Invalid Details", error })
        console.log(error);
    }
}

// user send otp--------------------------------------------
exports.userOtpSend = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate Email Input
        if (!email) {
            return res.status(400).json({ error: "Please Enter Your Email" });
        }

        // Check if User Exists
        const preuser = await McqQuizUser.findOne({ email });
        if (!preuser) {
            return res.status(400).json({ error: "This User Not Registered" });
        }

        // Generate OTP
        const OTP = Math.floor(100000 + Math.random() * 900000);

        // Check if OTP Already Exists
        const existEmail = await userotp.findOne({ email });

        if (existEmail) {
            // Update Existing OTP
            existEmail.otp = OTP;
            await existEmail.save();
        } else {
            // Save New OTP Entry
            const saveOtpData = new userotp({ email, otp: OTP });
            await saveOtpData.save();
        }

        // Send Email
        const mailOptions = {
            from: "start112002up@gmail.com",
            to: email,
            subject: "Email Verification",
            text: `Your OTP for Email verification is: ${OTP}  this otp is valid for 2 min only`,
        };

        tarnsporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                // console.log("error", error);
                res.status(400).json({ error: "email not send" })
            } else {
                // console.log("Email sent", info.response);
                res.status(200).json({ message: "Email sent Successfully" })
            }
        })

    } catch (error) {
        // console.error("Server Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// enter otp-----------------------------------
exports.userLogin = async (req, res) => {
    try {
        // Extract email and otp from request body
        const { email, otp } = req.body;

        // Check if both email and OTP are provided
        if (!email || !otp) {
            return res.status(400).json({ error: "Please Enter Your OTP and Email" });
        }

        // Find the OTP entry for the given email
        const otpverification = await userotp.findOne({ email });

        // If no OTP entry found
        if (!otpverification) {
            return res.status(400).json({ error: "OTP not found or expired" });
        }

        // Verify OTP
        if (otpverification.otp !== otp) {
            return res.status(400).json({ error: "Invalid OTP" });
        }

        // Find the user in database
        const preuser = await McqQuizUser.findOne({ email });

        if (!preuser) {
            return res.status(400).json({ error: "User not found" });
        }

        // Generate JWT token
        const token = jwt.sign({ _id: preuser._id }, keysecret, { expiresIn: "1d" });

        // Set cookie with JWT token (expires in 1 hour)
        res.cookie("usercookie", token, {
            expires: new Date(Date.now() + 600 * 60 * 1000), // 1 hour (60 min * 60 sec * 1000 ms)
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Ensure secure in production
            sameSite: "Strict"
        });

        // Send response with token and user data
        res.status(200).json({ status: 200, token, user: { _id: preuser._id, email } });

    } catch (error) {
        console.error("Error during login:", error);
        res.status(400).json({ error: "Internal Server Error" });
    }
};

// getting user details
exports.getuser = async (req, res) => {
    const user = await McqQuizUser.findById(req.user._id);
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }
    res.status(200).json(user);
}

// updating score and attempts
exports.submittest = async (req, res) => {
    const { score, pdfUrl } = req.body;

    try {
        const user = await McqQuizUser.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.attempt > 3) {
            return res.status(400).json({ message: "Maximum 3 attempts allowed" });
        }

        user.attempt += 1;

        if (user.attempt === 1) {
            user.attempt1score = score;
            user.attempt1pdf = pdfUrl;
        } else if (user.attempt === 2) {
            user.attempt2score = score;
            user.attempt2pdf = pdfUrl;
        } else if (user.attempt === 3) {
            user.attempt3score = score;
            user.attempt3pdf = pdfUrl;
        }

        await user.save();
        return res.status(200).json({ message: `Attempt ${user.attempt} submitted`, score, pdfUrl });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};