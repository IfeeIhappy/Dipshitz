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
  rss: "rss",
  read: "read",
  write: "write"
};

/* Get the index page */
app.get("/", (req, res) => {
  /* Build the index from /pages/index.md */
  var page = getItem(site.pages,"index");

  /* On this page, let's list all posts from /posts */
  var list = "";
  var posts = getPosts();

  posts.forEach(post => {
    list += `<li><a href='/read/${post.slug}'>${post.title}</a><br/><span class="meta">${post.pubdate}</span></li>`;
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
  if (req.params.page == site.read) {
    const post = getItem(site.posts, req.params.post);
    if (post) {
      res.render("post", {
        title: post.title,
        content: post.html,
        image: post.image,
        meta: `by <a href="/">${site.title}</a><br/>${post.pubdate}`
      });
    } else {
      res.redirect("/");
    }
  } else if (req.params.page == site.rss) {
    const rss = getRSS();
    res.set("Content-Type", "application/rss+xml");
    res.send(rss);
  } else if (typeof req.params.page !== "undefined") {
    /* If neither of the above, let's give them the page they ask for from /pages */
    const page = getItem(site.pages, req.params.page);
    if (page) {
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
  /* Get everything from your posts folder and sort it by creation date */
  return fs
    .readdirSync(`./${site.posts}`)
    .filter(file => {
      return file.toLowerCase().match(/\.md$/);
    })
    .map(file => {
      const markdown = fs.readFileSync(`./${site.posts}/${file}`, "utf8");
      const title = markdown.match(/(\w.*)\n/)[0];
      const mtime = fs.statSync(`./${site.posts}/${file}`).mtime;

      return {
        slug: file.split(".")[0],
        title: title,
        mtime: mtime,
        pubdate: mtime.toLocaleDateString("en-GB",{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      };
    })
    .sort((a, b) => {
      return b.mtime - a.mtime;
    });
};

// Find and return a specific page or post for display
const getItem = (page, post) => {
  const markdown = fs.readFileSync(`./${page}/${post}.md`, "utf8");
  if (markdown === null) {
    return false;
  } else {
    const title = markdown.match(/(\w.*)\n/)[0];
    const content = markdown.replace(markdown.match(/(.*)\n/)[0], "");
    const image = markdown.match(/\!\[.*\]\((.*)\)/) ? markdown.match(/\!\[.*\]\((.*)\)/)[1] : site.image;
    const pubdate = fs.statSync(`./${page}/${post}.md`).mtime;
    return {
          slug: post,
          title: title,
          html: converter.makeHtml(content),
          image: image,
          pubdate: pubdate.toLocaleDateString("en-GB",{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        };
  }
}

const getRSS = () => {
  var rss = `<?xml version="1.0"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><atom:link href="${site.url}/rss" rel="self" type="application/rss+xml" /><title>${site.title}</title><link>${site.url}</link><description>${site.description}</description>`;
  const posts = getPosts();
  posts.forEach(item => {
    const post = getItem(site.posts, post.slug);
    rss += `<item><title>${post.title}</title><guid>${site.url}/read/${post.slug}</guid><link>${site.url}/read/${post.slug}</link><pubDate>${post.pubdate}</pubDate><description><![CDATA[${post.html}]]></description></item>`;
  });
  rss += `</channel></rss>`;
  return rss;
}

/* Start listening */
app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});
