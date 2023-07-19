require("dotenv").config();

const { ms, logger } = require("@simpleanalytics/common");
const email = require("./lib/email")

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
    email("Newsbot started", "Newsbot started up successfully")

    //sendmessage(message, { silent: true });
  }

  loop(crawlers, { interval: ms.second * 90 });
  loop(notify, { interval: ms.second * 30 });
})();
