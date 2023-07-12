const {SENDGRID_API_KEY, SENDGRID_RECIPIENTS} = process.env;
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(SENDGRID_API_KEY);

module.exports = (subject, message) => {

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
