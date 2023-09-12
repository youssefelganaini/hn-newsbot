const { XMLParser } = require("fast-xml-parser");
const { getContent } = require("../lib/request");
const { cleanText } = require("../lib/utils");

const PREFIX = "_";
let lastUpdated = null;


module.exports = async () => {

  /*
  This function reads the articles from the RSS feed and returns them in structured form for our DB.
  */


  const articles = [];

  for (const feedUrl of feedUrls) {
    // for each feed: send HTTP Request, get XML, parse to JSON, extract data for our DB for  
    // each entry and add to the array to be returned
    const feed = await getFeed(feedUrl);
    console.log("Google Alerts feed " + feed)
    articles.push(...feed);
  }

  return articles;
};


// function gets content from RSS Feed of Google Alerts
const getFeed = async (url) => {
  const xml = await getContent(url); // HTTP Response

  const options = {
    ignoreAttributes: false,
    attributeNamePrefix: PREFIX,
  };

  // Feed returns XML, which is parsed here to a JSON file
  const parser = new XMLParser(options);
  const json = parser.parse(xml);

  if (
    lastUpdated &&
    json?.feed?.updated &&
    new Date(json?.feed?.updated) <= lastUpdated
  ) {
    return [];
  }
  
  // extract structured data for DB from each feed entry, and return them in an array to be added later to DB
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
  "https://www.google.com/alerts/feeds/14071806628045407587/15467016584903251895",
  "https://www.google.com/alerts/feeds/14071806628045407587/11304386862920147789",
  "https://www.google.com/alerts/feeds/14071806628045407587/8089749364871930633",
  "https://www.google.com/alerts/feeds/14071806628045407587/14149218452270765667",
  "https://www.google.com/alerts/feeds/14071806628045407587/14560884751654479063",
  "https://www.google.com/alerts/feeds/14071806628045407587/14560884751654478823",
];
