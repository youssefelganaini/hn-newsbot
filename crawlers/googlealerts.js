const { XMLParser } = require("fast-xml-parser");
const { getContent } = require("../lib/request");
const { cleanText } = require("../lib/utils");

const PREFIX = "_";
let lastUpdated = null;

const getFeed = async (url) => {
  const xml = await getContent(url);

  const options = {
    ignoreAttributes: false,
    attributeNamePrefix: PREFIX,
  };

  const parser = new XMLParser(options);
  const json = parser.parse(xml);

  if (
    lastUpdated &&
    json?.feed?.updated &&
    new Date(json?.feed?.updated) <= lastUpdated
  ) {
    return [];
  }

  const alerts = json?.feed?.entry?.map?.((entry) => {
    const { searchParams } = new URL(entry?.link[`${PREFIX}href`]);
    return {
      platform_name: "googlealerts",
      platform_id: entry?.id.split(":").pop(),
      platform_title: cleanText(entry?.title["#text"]),
      website_description: cleanText(entry?.content["#text"]),
      website_link: searchParams.get("url"),
    };
  });

  return alerts || [];
};

// RSS feed URLs from Google Alert
// see https://www.howtogeek.com/444549/how-to-create-an-rss-feed-from-a-google-alert/

const feedUrls = [
  "https://www.google.com/alerts/feeds/12754239361778858129/11887783294534187044",
  "https://www.google.com/alerts/feeds/12754239361778858129/14212266639972105909",
  "https://www.google.com/alerts/feeds/12754239361778858129/6820764745307726346",
  "https://www.google.com/alerts/feeds/12754239361778858129/13016920313603837827"
];

module.exports = async () => {
  const articles = [];

  for (const feedUrl of feedUrls) {
    const feed = await getFeed(feedUrl);
    articles.push(...feed);
  }

  return articles;
};
