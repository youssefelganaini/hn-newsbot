require("dotenv").config();

const {ms} = require("@simpleanalytics/common");
const {email} = require("./lib/email")
const crawlers = require("./crawlers/index");
const notify = require("./lib/notify");
const {loop} = require("./lib/utils");

const {NODE_ENV = "production"} = process.env;

(async () => {
    // set NODE_ENV on production to start app
    if (NODE_ENV === "production") {
        console.log("News alerts app just started up")
        
        //Send message via email
        await email("Newsbot started", "Newsbot started up successfully")

    }

    loop(crawlers, {interval: ms.second * 90}); // every 90 seconds, crawl hackernews and googlealerts
    loop(notify, {interval: ms.second * 30}); // every 30 seconds, check if there is new article which needs to be notified of
})();
