import { transporter } from '../config/nodemailer.js'
import User from '../models/user.js'
import CryptoJS from 'crypto-js';


export const sendMail = async (req, res) => {
    const { email } = req.body;
    const currentUrl = 'https://ceevo.netlify.app/'
    try {

        const user = await User.findOne({ email: email })
        const userId = user._id
        const mailOptions = {
            from: process.env.MAIL_USERNAME,
            to: email,
            subject: 'Change Your Password',
            html: `</p> <p>Click <a href =${currentUrl + 'change-password/' + userId}>here</a> to change your password.</p>`
        }

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                res.status(401).json({
                    message: 'Password reset message failed to send',
                    err
                })
            } else
                res.status(200).json({
                    message: 'Password reset message sent successfully', info
                });

        })


    } catch (err) {
        res.status(401).json({
            message: 'Password reset message failed to send',
            err
        })
    }

}

export const editUser = async (req, res) => {
    const { userId } = req.params;

    try {

         User.findByIdAndUpdate(userId, {
            password: CryptoJS.AES.encrypt(
                req.body.password,
                process.env.PASS_PHRASE
            ).toString(), //encryt password
        },
            {
                new: true,
            }, (err, doc)=>{
                if (err) {
                    res.json('Pasword reset failed.')
                    
                } else {
                    res.json('Pasword changed successfully.')
                    
                }
            })


    } catch (err) {
        res.status(401).json({
            message: 'Password reset failed',
            err
        })
    }

}