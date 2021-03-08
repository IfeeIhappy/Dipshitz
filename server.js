const fs = require("fs");
const express = require("express");
const showdown = require("showdown");
const converter = new showdown.Converter();

const app = express();
const port = 3000;
app.use(express.json());
app.set("view engine", "pug");

/* Site-specific settings */

const site = {
  title: "Tyler Robertson",
  description: "Three spreadsheets in a trenchcoat.",
  url: "https://tyler.robertson.click",
  image: "https://cdn.glitch.com/1fd701c7-e73d-40ab-8afe-2d1ae4ec1f55%2Fwumbo%202.JPG?v=1609924141332",
  posts: "posts",
  pages: "pages",
  read: "read",
  write: "write"
};

/* Get the index page */
app.get("/", (req, res) => {
  /* Build the index from /pages/index.md */
  var pages = getPages();
  var page = pages[pages.findIndex(p => p.slug.toLowerCase() == "index")];

  /* On this page, let's list all posts from /posts */
  var list = "";
  var posts = getPosts();

  posts.forEach(post => {
    list += `<li><a href='/read/${post.slug}'>${post.title}</a><br/><span class="meta">${post.meta}</span></li>`;
  });
  res.render("index", {
    title: page.title,
    content: page.html,
    image: site.image,
    list: list
  });
});

/* Find the specific page or post the user is looking for, and serve it */
app.get("/:page/:post?", (req, res) => {
  if (req.params.page == site.read && typeof req.params.post !== "undefined") {
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
        meta: `by <a href="/">${site.title}</a><br/>${post.meta}`
      });
    } else {
      res.redirect("/");
    }
  } else if (req.params.page == "rss") {
    var rss = `<?xml version="1.0"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><atom:link href="${site.url}/rss" rel="self" type="application/rss+xml" /><title>${site.title}</title><link>${site.url}</link><description>${site.description}</description>`;
    var posts = getPosts();
    posts.forEach(post => {
      rss += `<item><title>${post.title}</title><guid>${site.url}/read/${post.slug}</guid><link>${site.url}/read/${post.slug}</link><pubDate>${post.pubdate.toUTCString()}</pubDate><description><![CDATA[${post.html}]]></description></item>`;
    });
    rss += `</channel></rss>`;
    res.set("Content-Type", "application/rss+xml");
    res.send(rss);
  } else if (typeof req.params.page !== "undefined") {
    /* If neither of the above, let's give them the page they ask for from /pages */
    var pages = getPages();
    var id = pages.findIndex(
      p => p.slug.toLowerCase() == req.params.page.toLowerCase()
    );
    if (id > -1) {
      var page = pages[id];
      res.render("page", {
        title: page.title,
        content: page.html,
        image: page.image
      });
    } else {
      res.redirect("/");
    }
  } else {
    /* If a page wasn't requested, go to the index */
    res.redirect("/");
  }
});

/* Publishing new posts */
app.post(`/${site.write}`, (req, res) => {
  if (req.body.key == process.env.key) {
    res.sendStatus(200);
    var title = req.body.title.replace(/\s/g, "-").toLowerCase();
    fs.writeFile(`./${site.posts}/${title}.md`, req.body.content, function(err) {
      if (err) return console.log(err);
      console.log("Published:", req.body.title);
    });
  } else {
    req.send("Unauthorized");
  }
});

const getPosts = () => {
  /* Get everything from /posts and sort it by publishing date */
  return fs
    .readdirSync(`./${site.posts}`)
    .filter(file => {
      return file.toLowerCase().match(/\.md$/);
    })
    .map(file => {
      const markdown = fs.readFileSync(`./${site.posts}/${file}`, "utf8");
      const title = markdown.match(/(\w.*)\n/)[0];
      const content = markdown.replace(markdown.match(/(.*)\n/)[0], "");
      const image = markdown.match(/\!\[.*\]\((.*)\)/) ? markdown.match(/\!\[.*\]\((.*)\)/)[1]
        : site.image;
      var pubdate = fs.statSync(`./${site.posts}/${file}`).mtime;
      var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
      var displayPub = `${months[pubdate.getMonth()]} ${pubdate.getDate()} ${pubdate.getFullYear()}`;

      return {
        slug: file.split(".")[0],
        markdown: markdown,
        title: title,
        html: converter.makeHtml(content),
        image: image,
        pubdate: pubdate,
        meta: displayPub
      };
    })
    .sort((a, b) => {
      return b.pubdate.getTime() - a.pubdate.getTime();
    });
};

const getPages = () => {
  /* Get everything from /pages */
  return fs
    .readdirSync(`./${site.pages}`)
    .filter(file => {
      return file.toLowerCase().match(/\.md$/);
    })
    .map(file => {
      var markdown = fs.readFileSync(`./${site.pages}/${file}`, "utf8");
      var title = markdown.match(/(\w.*)\n/)[0];
      var content = markdown.replace(markdown.match(/(.*)\n/)[0], "");

      var image = markdown.match(/\!\[.*\]\((.*)\)/)
        ? markdown.match(/\!\[.*\]\((.*)\)/)[1]
        : site.image;

      return {
        slug: file.split(".")[0],
        markdown: markdown,
        title: title,
        html: converter.makeHtml(content),
        image: image
      };
    });
};

/* Start listening */
app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});
