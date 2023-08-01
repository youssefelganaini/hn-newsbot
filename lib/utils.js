// function that uses regex to remove HTML tags from a string
const removeTags = (str) => {
  return str?.replace?.(/<[^>]*>/g, "").replace(/&nbsp;\.\.\./g, "");
};

// function that converts html entities into their original signs, i.e. '&gt' into '>'
const decodeHTML = (str) => {
  var map = { gt: ">" /* , … */ };
  return str.replace(/&(#(?:x[0-9a-f]+|\d+)|[a-z]+);?/gi, function ($0, $1) {
    if ($1[0] === "#") {
      return String.fromCharCode(
        $1[1].toLowerCase() === "x"
          ? parseInt($1.substr(2), 16)
          : parseInt($1.substr(1), 10)
      );
    } else {
      return map.hasOwnProperty($1) ? map[$1] : $0;
    }
  });
};

// cleans text by removing the html tags and turning the html entities into their respective signs
const cleanText = (str) => {
  return removeTags(decodeHTML(str));
};

// this function is responsible for the cronjob
const loop = (func, { start, interval }) => { 
  if (!start) start = Date.now() - interval;
  const now = Date.now();
  const elapsed = now - start;
  start = Date.now();
  const waiting = Math.max(interval - elapsed, 0);

  setTimeout(async () => {
    func()
      .then(() => loop(func, { start, interval }))
      .catch(() => loop(func, { start, interval }));
  }, waiting);
};

module.exports = {
  removeTags,
  decodeHTML,
  cleanText,
  loop,
};
