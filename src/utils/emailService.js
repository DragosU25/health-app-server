const sgMail = require('@sendgrid/mail');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const senderEmail = process.env.EMAIL;

const sendVerificationEmail = async (email) => {
  const verificationToken = uuidv4();
  const verificationUrl = `http://localhost:5000/api/auth/verify/${verificationToken}`;

  if (!senderEmail) throw new Error('Sender email is missing.');

  const msg = {
    to: email,
    from: senderEmail,
    subject: 'Account Verification Email',
    text: `Verify your account here: ${verificationUrl}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            background-color: #ffffff;
            margin: 50px auto;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            max-width: 600px;
          }
          .header {
            text-align: center;
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
          }
          .header h1 {
            margin: 0;
            color: #333333;
          }
          .content {
            padding: 20px;
            text-align: center;
          }
          .content p {
            font-size: 16px;
            color: #666666;
          }
          .content a {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #28a745;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
          }
          .content a:hover {
            background-color: #218838;
          }
          .footer {
            text-align: center;
            padding: 10px 0;
            border-top: 1px solid #e0e0e0;
            font-size: 12px;
            color: #999999;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Account Verification</h1>
          </div>
          <div class="content">
            <p>Click the button below to verify your account:</p>
            <a href="${verificationUrl}">Verify Account</a>
          </div>
          <div class="footer">
            <p>If you did not request this verification, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await sgMail.send(msg);
    return verificationToken;
  } catch (error) {
    throw new Error(`Email not sent! The error is: ${error.message}`);
  }
};

module.exports = sendVerificationEmail;
