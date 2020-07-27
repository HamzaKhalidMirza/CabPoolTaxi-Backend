const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
const sendGrid = require('@sendgrid/mail');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.email.split('@')[0];
    this.url = url;
    this.from = process.env.EMAIL_FROM;
  }

  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });

    // 2) Define email options
    const mailOptions = {
      to: this.to,
      from: this.from,
      subject,
      text: htmlToText.fromString(html),
      html
    };

    // 3) Create a transport and send email
    if (process.env.NODE_ENV.trim() === 'production') {
      sendGrid.setApiKey(process.env.SENDGRID_API_KEY);
      await sendGrid.send(mailOptions);
    } else {
      await this.newTransport().sendMail(mailOptions);
    }

  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the CabPool Ride Service!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};
