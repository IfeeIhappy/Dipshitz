const fs = require("fs");
const express = require("express");
const showdown = require("showdown");
const converter = new showdown.Converter();

const app = express();
const port = 3000;
const path = "./posts";

/* Site-specific settings */
const site = {
  title: "Tyler Robertson",
  description:
    "Missives and found documents from the desk of the aforementioned person.",
  url: "https://tyler.robertson.click",
  image:
    "https://cdn.glitch.com/1fd701c7-e73d-40ab-8afe-2d1ae4ec1f55%2Fwumbo%202.JPG?v=1609924141332"
};

app.use(express.json());
app.set("view engine", "pug");

/* When a user follows a direct link to a published post */
app.get("/read/:post", (req, res) => {
  if (typeof req.params.post !== "undefined") {
    var posts = getPosts();
    var postID = posts.findIndex(
      p => p.slug.toLowerCase() == req.params.post.toLowerCase()
    );
    if (postID > -1) {
      var post = posts[postID];
      res.render("post", {
        title: post.title,
        content: post.html,
        image: post.image,
        meta: post.meta
      });
    } else {
      res.redirect("/");
    }
  } else {
    res.redirect("/");
  }
});

/* List all published posts on the index page */
app.get("/", (req, res) => {
  /* Get the index page */

  var markdown = fs.readFileSync("./index.md", "utf8");
  var title = markdown.match(/(\w.*)\n/)[0];
  var content = markdown.replace(markdown.match(/.*\n/)[0], "");
  const html = converter.makeHtml(content);

  var list = "";
  var posts = getPosts();

  posts.forEach(post => {
    list += `<li><a href='/read/${post.slug}'>${post.title}</a><br/><span class="meta">${post.meta}</span></li>`;
  });
  res.render("index", {
    title: title,
    content: html,
    image: site.image,
    list: list
  });
});

/* Create new posts */
app.post("/write", (req, res) => {
  if (req.body.key == process.env.key) {
    res.sendStatus(200);
    var title = req.body.title.replace(/\s/g, "-");
    fs.writeFile(`./posts/${req.body.title}.md`, req.body.content, function(
      err
    ) {
      if (err) return console.log(err);
      console.log("Wrote file", req.body.title);
    });
  } else {
    req.send("Unauthorized");
  }
});

/* RSS Feed - Honestly not sure yet if this will work */
app.get("/rss", (req, res) => {
  var rss = `<?xml version="1.0"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><atom:link href="${site.url}/rss" rel="self" type="application/rss+xml" /><title>${site.title}</title><link>${site.url}</link><description>${site.description}</description>
      `;
  var posts = getPosts();
  posts.forEach(post => {
    rss += `<item><title>${post.title}</title><guid>${site.url}/read/${post.slug}</guid><link>${site.url}/read/${post.slug}</link><pubDate>${post.pubdate.toUTCString()}</pubDate><description><![CDATA[${post.html}]]></description></item>`;
  });
  rss += `</channel></rss>`;
  res.set("Content-Type", "application/rss+xml");
  res.send(rss);
});

/* Start listening */
app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});

const getPosts = () => {
  /* Get everything from posts/ and sort it by modified date */
  /* Cant't see the posts/ folder in Glitch? It's hidden by the .gitignore file */
  return fs
    .readdirSync(path)
    .filter(file => {
      return file.toLowerCase().match(/\.md$/);
    })
    .map(file => {
      var markdown = fs.readFileSync(`${path}/${file}`, "utf8");
      var title = markdown.match(/(\w.*)\n/)[0];
      var content = markdown.replace(markdown.match(/(.*)\n/)[0], "");

      var image = markdown.match(/\!\[.*\]\((.*)\)/)
        ? markdown.match(/\!\[.*\]\((.*)\)/)[1]
        : site.image;

      var stats = fs.statSync(`${path}/${file}`);
      var pubdate = stats.mtime;

      /* Pre-write the metadata (might change later) */
      var words = markdown.trim().split(/\s+/).length;
      var readingTime = words / 250; // Average reading speed is 250 words/minute, apparently?
      var months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      var displayPub = `${
        months[pubdate.getMonth()]
      } ${pubdate.getDate()} ${pubdate.getFullYear()} @ ${pubdate.getHours()}:${
        pubdate.getMinutes() < 10 ? "0" : ""
      }${pubdate.getMinutes()}`;
      var meta = `${displayPub} | ${readingTime.toFixed(1)}m to read`;

      return {
        slug: file.split(".")[0],
        markdown: markdown,
        title: title,
        html: converter.makeHtml(content),
        image: image,
        pubdate: pubdate,
        meta: meta
      };
    })
    .sort((a, b) => {
      return b.pubdate.getTime() - a.pubdate.getTime();
    });
};
