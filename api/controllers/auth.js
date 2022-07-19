import User from '../models/user.js';
import UserVerification from '../models/user-verification.js';
import CryptoJS from 'crypto-js';
import nodemailer from 'nodemailer';


import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  }
})


export const postUser = async (req, res) => {
 
  const newUser = new User({
    username: req.body.username,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_PHRASE
    ).toString(), //encryt password
    email: req.body.email,
    verified: false
  });

  try {
    //check if email has already being used
    const user = await User.findOne({
      email: req.body.email,
    })
    if (user) {
      res.status(401).json({
        message: 'Email is already in use',
      })
    } else {
      //save user
      const createdUser = await newUser.save();
      //handle verification
      sendVerificationEmail(createdUser, res);
    }
  } catch (err) {
    res.status(400).json(err);
  };
}



const sendVerificationEmail = async (createdUser, res) => {
  const { _id, email } = createdUser._doc;

  //generate random number
  const randomNumber = Math.floor(Math.random() * 90000) + 10000;

  const mailOptions = {
    from: process.env.MAIL_USERNAME,
    to: email,
    subject: 'Verifiy Your Email',
    html: `<p>Verify your email address to complete the signup and login into your account.</p><p>This pin <b>expires in 6 hours</b>.</p> <h3>${randomNumber}</h3>`
  }

  const convertNumToString = randomNumber.toString();
  //encryt passcode
  const encryptedPasscode = CryptoJS.AES.encrypt(
    convertNumToString,
    process.env.PASS_PHRASE
  ).toString()

  const userVerification = new UserVerification({
    userId: _id,
    passcode: encryptedPasscode,
    createdAt: Date.now(),
    expiresAt: Date.now() + 21600000
  })

  try {
    await userVerification.save();

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        res.status(401).json({
          message: 'Email verification failed to send',
          err
        })
      } else
        res.status(200).json({
          message: 'Email verification message sent successfully', info
        });

    })


  } catch (err) {
    res.status(401).json({
      message: 'Email verification failed',
      err
    })
  }
}

export const verifyUser = async (req, res) => {
  const { userId, passcode } = req.body;

  try {
    const verifyObject = await UserVerification.findOne({
      userId: userId
    })

    

    if (verifyObject) {
      const { expiresAt } = verifyObject;
      //check if userVerification has expired

      if (expiresAt.getHours() > expiresAt.getHours() * 6) {
        //if true delete userVerification and user collection from database
        UserVerification.deleteOne({ userId })
        User.deleteOne({ _id: userId })
        res.status(401).json({
          message: 'link has expired',
        })
      } else {
        //check if strings match
        const hashedString = CryptoJS.AES.decrypt(
          verifyObject.uniqueString,
          process.env.PASS_PHRASE
        );
        const decryptString = hashedString.toString(CryptoJS.enc.Utf8);

        if (decryptString !== uniqueString && res.status(401).json('uniqueString does not match the one stored in the database')) return;

        const user = await User.findOneAndUpdate({ _id: userId }, { verified: true }, { new: true })
        if (!user) {
          res.status(401).json({
            message: 'Unable to verify user',
          })
        } else {
         await UserVerification.deleteOne({ userId })
          let { password, ...others } = user._doc;
          res.status(201).json({ ...others });
        }
      }

    }
  } catch (err) {
    res.status(401).json({
      message: 'User verification failed',
      err
    })
  }
}

export const getUser = async (req, res) => {
  try {
    //find user
    //check if verified
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.status(401).json({
        message: 'user not found',
      });
    } else if (!user.verified) {
      res.status(401).json({
        message: 'user is not verified',
      });

    } else {
      const hashedPassword = CryptoJS.AES.decrypt(
        user.password,
        process.env.PASS_PHRASE
      );
      const decryptPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

      //evaluate password
      if (decryptPassword !== req.body.password) {
        res.status(401).json('password does not match the one stored in the database');
      } else {
        const { password, ...others } = user._doc; //because of mongodb
        res.status(200).json({ ...others, accessToken });
      }
    }

  } catch (err) {
    res.status(500).json(err)
  }
};


