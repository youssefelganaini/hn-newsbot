require("dotenv").config();

const { ms, logger } = require("@simpleanalytics/common");
const sgMail = require('@sendgrid/mail');

const crawlers = require("./crawlers/index");
const notify = require("./lib/notify");
const { loop } = require("./lib/utils");
const nodemailer = require("nodemailer")
const { sendmessage } = require("./lib/telegram");

const { NODE_ENV = "development" } = process.env;

(async () => {
  if (NODE_ENV === "production") {
    let message = "News alerts app just started up";
    try {
      const current = require("./commits/current.json");
      const previous = require("./commits/previous.json");

      const url =
        previous.commit && current.commit
          ? `https://github.com/${current.repo}/compare/${previous.commit}...${current.commit}`
          : null;

      const commit = current?.message?.replace(/-/g, " ");
      message = `Deployed "${commit}" ${
        url ? `<a href="${url}">GitHub</a>` : ""
      }`;
    } catch (error) {
      logger.error(error);
    }

     //Send message via email
     const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey('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');

      const msg = {
        to: 'elganainiyoussef@gmail.com',
        from: 'user2000burneracc@gmail.com',
        subject: 'Test Email',
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

    //sendmessage(message, { silent: true });
  }

  loop(crawlers, { interval: ms.second * 90 });
  loop(notify, { interval: ms.second * 30 });
})();
