const nodemailer = require("nodemailer");
const { gmail, password } = require("../../config");
const Mustache = require("mustache");
const fs = require("fs");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: gmail,
    pass: password,
  },
});

const otpMail = async (email, data) => {
  try {
    let template = fs.readFileSync("app/views/email/otp.html", "utf8");
    const htmlContent = Mustache.render(template, data);

    let message = {
      from: '"Semina" <' + gmail + ">",
      to: email,
      subject: `Your Verification Code: ${data.otp}`,
      text: `Your registration verification code is: ${data.otp}.`,
      html: htmlContent,
    };

    return await transporter.sendMail(message);
  } catch (ex) {
    console.log("Error sending OTP email:", ex);
    throw ex;
  }
};

// const otpMail = async (email, data) => {
//   try {
//     let template = fs.readFileSync("app/views/email/otp.html", "utf8");

//     let message = {
//       from: gmail,
//       to: email,
//       subject: "Otp for registration is: ",
//       html: Mustache.render(template, data),
//     };

//     return await transporter.sendMail(message);
//   } catch (ex) {
//     console.log(ex);
//   }
// };

module.exports = { otpMail };
