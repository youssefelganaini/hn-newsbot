const { logger } = require("@simpleanalytics/common");
const sqlite3 = require("sqlite3");

const { NODE_ENV = "development" } = process.env;
const DATABASE = `${__dirname}/newsalerts-${NODE_ENV}.db`;

function createTables(db, resolve, reject) {
  db.exec(
    `
      CREATE TABLE IF NOT EXISTS test_db (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        platform_name TEXT NOT NULL,
        platform_id TEXT,
        platform_rank INT,
        platform_title text NOT NULL,
        platform_points INT,
        website_link TEXT NOT NULL,
        website_title TEXT,
        website_description TEXT,
        keywords TEXT,
        interesting_reason TEXT,
        interesting_index INTEGER,
        first_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        alerted_at TIMESTAMP,
        characters TEXT
      );

      CREATE UNIQUE INDEX IF NOT EXISTS unique_platfrom_id
        ON test_db (platform_id, platform_name);
    `,
    (error) => {
      if (error) return reject(error);

      // Add column and silently fail when it already exists
      db.exec(
        "ALTER TABLE test_db ADD COLUMN interesting_reason TEXT;",
        () => {}
      );
      db.exec(
        "ALTER TABLE test_db ADD COLUMN interesting_index INTEGER;",
        () => {}
      );

      return resolve(db);
    }
  );
}

const getDatabase = () =>
  new Promise((resolve, reject) => {
    const db = new sqlite3.Database(
      DATABASE,
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      (error) => {
        if (error) {
          reject(error);
        } else if (error === null) {
          return createTables(db, resolve, reject);
        } else {
          reject(new Error("Unknown sqlite3 error"));
        }
      }
    );
  });

let db = null;

const query = async (...props) => {
  try {
    if (db === null) {
      db = await getDatabase();
    }

    return new Promise((resolve, reject) => {
      db.all(...props, function (error, tables) {
        if (error) reject(error);
        resolve(tables);
      });
    });
  } catch (error) {
    logger.error(error);
  }
};

// Assuming you have already defined the 'query' function as provided in the previous code snippet
/* ONLY FOR TESTING PURPOSES
async function insertExampleData() {
  try {
    if (db === null) {
      db = await getDatabase();
    }

    const exampleData = {
      platform_name: "Example Platform",
      platform_id: "example_id_124",
      platform_rank: 5,
      platform_title: "Example Platform Title 2",
      platform_points: 1000,
      website_link: "https://example.com",
      website_title: "Example Website",
      website_description: "This is an example website",
      keywords: "example, test, data",
      interesting_reason: "This platform is interesting because...",
      interesting_index: 90,
      characters: "Example characters or details",
    };
  

    const queryResult = await query(
      "INSERT INTO test_db (platform_name, platform_id, platform_rank, platform_title, platform_points, website_link, website_title, website_description, keywords, interesting_reason, interesting_index, characters) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        exampleData.platform_name,
        exampleData.platform_id,
        exampleData.platform_rank,
        exampleData.platform_title,
        exampleData.platform_points,
        exampleData.website_link,
        exampleData.website_title,
        exampleData.website_description,
        exampleData.keywords,
        exampleData.interesting_reason,
        exampleData.interesting_index,
        exampleData.characters,
      ]
    );

    console.log("Data inserted successfully:", queryResult);
  } catch (error) {
    console.error("Error inserting data:", error);
  }
}

// Call the function to insert the example data
const db_query = "SELECT * FROM test_db"
important = null
const articles = query(db_query).then(result => {
  console.log(result)
  important = result
}).catch(error => console.error(error))
console.log(important)
*/
