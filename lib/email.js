const path = require('path');
const dotenv = require('dotenv');
const sgMail = require('@sendgrid/mail');

// get the path to the email.js
const envPath = path.resolve(__dirname, '../.env');

// load the env variables relative to the path of email.js
dotenv.config({ path: envPath });

const {SENDGRID_API_KEY, SENDGRID_RECIPIENTS} = process.env;


sgMail.setApiKey(SENDGRID_API_KEY);

module.exports.email = (subject, message) => {

    const msg = {
        to: SENDGRID_RECIPIENTS,
        from: 'user2000burneracc@gmail.com',
        subject: subject,
        text: message,
        html: `<p>${message}</p>`,
    };

    sgMail
        .send(msg)
        .then(() => {
            console.log('Email sent successfully');
        })
        .catch((error) => {
            console.error(error.toString());
        });
};
