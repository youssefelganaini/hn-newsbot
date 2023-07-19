// @youssef: can probably be deleted
const {logger} = require("@simpleanalytics/common");

const {query} = require("../db/sqlite");
const email = require('./lib/email');
const {sendmessage} = require("./telegram");
const twist = require("./twist");

const {SENDGRID_API_KEY, SENDGRID_RECIPIENT} = process.env;


const interestingThreshold = 60;

// @youssef: I think we need to update this query to our needs
// not sure what elements should be covered, I'll make a suggestion:
module.exports = async () => {
    const importantArticles = await query(
        `
      SELECT
        *
      FROM
        articles
      WHERE
        (alerted_at IS NULL OR alerted_at = '')
        AND website_description NOT LIKE $cookiebanner
        AND (
          interesting_index >= $interestingThreshold
          OR (
            interesting_index IS NULL
            AND (
              platform_title LIKE $pk OR website_title LIKE $pk OR website_description LIKE $pk
              OR platform_title LIKE $wa OR website_title LIKE $wa OR website_description LIKE $wa
              OR platform_title LIKE $fd OR website_title LIKE $fd OR website_description LIKE $fd
              OR (
                platform_name = $hackernews
                AND (
                  platform_title LIKE $passwordless
                  OR website_title LIKE $passwordless
                  OR platform_title LIKE $authentication
                  OR website_title LIKE $authentication
                  OR platform_title LIKE $password
                  OR website_title LIKE $password
                  OR website_title LIKE $vue
                  OR website_title LIKE $angular
                  OR website_title LIKE $react
                  OR website_title LIKE $svelte
                  OR website_title LIKE $php
                  OR website_title LIKE $node
                  OR website_title LIKE $php
                  OR website_title LIKE $golang
                 )
              )
              OR keywords LIKE $passwordless
              OR keywords LIKE $authentication
              OR keywords LIKE $password
              OR website_link LIKE $corbadocom
            )
          )
        )
    `,
        {
            // platform / website title and description
            $pk: "%passkeys%",
            $wa: "%webauthn%",
            $fd: "%fido%",
            $hackernews: "hackernews",

            // relevant keywords
            $passwordless: "%passwordless%",
            $authentication: "%authentication%",
            $password: "%password%",

            // Programming languages
            $vue: "%vue%",
            $angular: "%angular%",
            $react: "%react%",
            $nextjs: "%nextjs%",
            $svelte: "%svelte%",
            $php: "%php%",
            $node: "%node%",
            $golang: "%golang%",

            // Other
            $cookiebanner: "%site%use%cookies%",
            $corbadocom: "%corbado.com%",
            $interestingThreshold: interestingThreshold,
        }
    );

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
            /*
            // Send alert to Twist
            await twist.threadIntegration({
              url: twist.integrationUrls.news_alerts,
              content: markdown,
            });

            const service =
              name === "googlealerts"
                ? "Google Alert"
                : `<a href="${hnLink}">Hacker News</a> #${rank} (${points} votes)`;

            const message = [
              `${service}: <b>${title}</b> - <a href="${link}">${hostname}</a>`,
              description?.length > 25
                ? `<i>${description.slice(0, 100)}${
                    description?.length > 101 ? "..." : ""
                  }</i>`
                : null,
            ]
              .filter(Boolean)
              .join("\n");

            // Send alert to Telegram
            const silent = name === "googlealerts" || (index && index < 50);
            await sendmessage(message, { silent });

            */

            //Send alert via email
            email("New Notification from Corbado bot", markdown)            

            // Update alerted_at
            await query(
                `
        UPDATE
          articles
        SET
          alerted_at = CURRENT_TIMESTAMP
        WHERE
          id = ?
      `,
                article.id
            );
        } catch (error) {
            logger.error(error, "notify", article_id);
        }
    }
};
