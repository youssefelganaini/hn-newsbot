require("dotenv").config();

const { ms } = require("@simpleanalytics/common");
const {email} = require("./lib/email")
const crawlers = require("./crawlers/index");
const notify = require("./lib/notify");
const { loop } = require("./lib/utils");

const { NODE_ENV = "production" } = process.env;

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
      console.log(error);
    }

    console.log("TESTING -----")
     //Send message via email
    await email("Newsbot started", "Newsbot started up successfully")
    console.log("IS THIS SKIPPED?")
    //sendmessage(message, { silent: true });
  }

  loop(crawlers, { interval: ms.second * 90 });
  loop(notify, { interval: ms.second * 30 });
})();
