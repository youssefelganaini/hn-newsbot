// @youssef: can probably be deleted
const {logger} = require("@simpleanalytics/common");
require("dotenv").config();
const {query} = require("../db/sqlite");
const {email} = require('./email');
const {sendmessage} = require("./telegram");
const twist = require("./twist");

const {SENDGRID_API_KEY, SENDGRID_RECIPIENT} = process.env;


const interestingThreshold = 60;

// @youssef: I think we need to update this query to our needs
// not sure what elements should be covered, I'll make a suggestion:
const notify = async () => {
    console.log("HERE")
    const importantArticles = await query(
        `
      SELECT
        *
      FROM
        test_db
      WHERE alerted_at is NULL
      AND interesting_index >= 60
    `)

    for (const article of importantArticles) {
        const {
            id: article_id,
            platform_name: name,
            platform_id: id,
            platform_title: title,
            platform_rank: rank,
            platform_points: points,
            website_link: link,
            website_description: description,
            interesting_index: index,
            interesting_reason: reason,
        } = article;
        try {
            const {hostname: host} = new URL(link);
            const hostname = host.replace(/^www\./g, "");

            const hnLink =
                name === "hackernews"
                    ? `https://news.ycombinator.com/item?id=${id}`
                    : null;

            const serviceMd =
                name === "googlealerts"
                    ? "Google Alert - "
                    : `[Hacker News](${hnLink}) #${rank} (${points} votes)\n`;

            const markdown = `${serviceMd}**${title}** - [${hostname}](${link})${reason && index ? `\n> AI rating ${index}/100: ${reason}` : ""
            }`;
            
        
            //Send alert via email
            await email("New Notification from Corbado bot", markdown)            
            
            // Update alerted_at
            await query(
                `
                  UPDATE
                    test_db
                  SET
                    alerted_at = ?
                  WHERE
                    id = ?
                `,
                [new Date().toISOString(), article_id]
            );
        } catch (error) {
            logger.error(error, "notify", article_id);
        }
    }
};

notify()
