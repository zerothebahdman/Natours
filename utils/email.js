const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const { email, subject, message } = options;
  // 1) create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    logger: true,
    secure: false,
    debug: true,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
    ignoreTLS: true, // add this
  });
  // 2) Define the email options
  const mailOptions = {
    from: `Natours <hello@natours.com>`,
    to: email,
    subject: subject,
    text: message,
  };
  // 3) Send the mail
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
