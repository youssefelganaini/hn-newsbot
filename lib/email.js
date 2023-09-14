const path = require('path');
const dotenv = require('dotenv');
const sgMail = require('@sendgrid/mail');

// get the path to the email.js
const envPath = path.resolve(__dirname, '../.env');

// load the env variables relative to the path of email.js
dotenv.config({ path: envPath });

const {SENDGRID_API_KEY, SENDGRID_RECIPIENTS, SENDGRID_SENDER_EMAIL_ADDRESS} = process.env;
const recipientsArray = SENDGRID_RECIPIENTS.split(',')

sgMail.setApiKey(SENDGRID_API_KEY);

recipients = SENDGRID_RECIPIENTS.split(",")

module.exports.email = (subject, message) => {
    const msg = {
        to: recipientsArray,
        from: SENDGRID_SENDER_EMAIL_ADDRESS,
        subject: subject,
        text: message,
        html: `<p>${message}</p>`,
    };

    // we send an email to each recipient in the recipients array
    Promise.all(
        recipients.map((email) => {
            msg.to = email;
            return sgMail.send(msg);
        })
    )
        .then(() => {
            console.log('Emails sent successfully');
        })
        .catch((error) => {
            console.error(error.toString());
        });
};

