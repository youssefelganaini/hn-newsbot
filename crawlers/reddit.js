const { getContent } = require("../lib/request");
const feedparser = require("feedparser");



const feeds = [
    "https://www.reddit.com/r/1Password/.rss"
];

const getFeedContent = async () => {
    let content = [];
    for (const feed of feeds) {
        content.push(await feedparser.parser(feed));
        
    }
    return content; // If you want to return the fetched content.
}

getFeedContent().then((result) => {
    console.log(result)
});
