const { getJSON } = require("../lib/request");
const { cleanText } = require("../lib/utils");

const { NODE_ENV = "development" } = process.env;

const TOP_HN_LIMIT = NODE_ENV === "development" ? 10 : 60;

module.exports = async () => {

  /*
  This function returns the top stories from HackerNews in a structured form for our DB
  */

  
  try {

    // get the top HN_LIMIT Stories from Hacker News
    const topstories = await getJSON(
      "https://hacker-news.firebaseio.com/v0/topstories.json"
    );

    const ranked = topstories
      .map((id, index) => ({
        id: "" + id,
        rank: index + 1,
      }))
      .slice(0, TOP_HN_LIMIT);

    const articles = [];
      
    // we push each article we return in ranked to the articles list in form of 
    // structured data to entered later in DB
    for (const { id, rank } of ranked) {
      const story = await getJSON(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json` // get corresponding article from HN
      );

      const isAskHn = !story.url;
      if (isAskHn) story.url = `https://news.ycombinator.com/item?id=${id}`;

     // console.log("HN story is: ", story.text)

      articles.push({
        platform_name: "hackernews",
        platform_id: id,
        platform_rank: rank,
        platform_title: story.title,
        platform_points: story.score,
        website_link: story.url,
        website_title: null,
        website_description: story.text ? cleanText(story.text) : null,
      });
    }

    return articles;
  } catch (error) {
    console.log(error);
  }
};
