const fs = require("fs"), // fs is used to manipulate our files, such as reading a page or creating a new blog post on request
      express = require("express"), // express is used to accept requests and route content where it needs to go (http://expressjs.com/)
      showdown = require("showdown"), // showdown is used to turn markdown into HTML (http://showdownjs.com/)
      converter = new showdown.Converter(),
      app = express(),
      port = 3000;

app.use(express.json()); // Set up our express app to accept JSON requests
app.set("view engine", "pug"); // Using Pug as our view engine lets us dynamically build HTML pages with the files in the "views" folder (https://pugjs.org/)

// Site-specific settings. These are what you'll edit to make the site your own!
const site = {
  title: "Tyler Robertson",
  description: "Three spreadsheets in a trenchcoat.",
  url: "https://tyler.robertson.click", // the link back to your site
  image: "https://cdn.glitch.com/1fd701c7-e73d-40ab-8afe-2d1ae4ec1f55%2Fwumbo%202.JPG?v=1609924141332", // the default image for your site, primarily used on social media
  favicon: "",
  footer: {"Home":"/","RSS":"/rss","Twitter":"https://twitter.com/aTylerRobertson"},
  posts: "posts", // the folder that your blog posts are kept in
  pages: "pages", // the folder that pages - files that you can link to directly, but aren't listed on the index page - are kept.
  rss: "rss", // where your rss is served
  read: "read", // where users request blog posts from (note: I recommend updating this *before* sharing your posts with people, because changing it will break old links!)
  write: "write" // where you send new posts
};

app.get('/favicon.ico', (req, res) => {
  if (site.favicon == "") {
    res.status(204);
  } else {
    res.send(site.favicon);
  }
});

// The index page is always assumed to be in your pages folder, titled "index.md"
app.get("/", (req, res) => {
  var content = getItem(site.pages,"index");

  // On this page, let's list all posts from /posts
  var list = "";
  getPosts().forEach(post => {
    list += `<li><a href='/read/${post.slug}'>${post.title}</a><span class="meta">${post.pubdate}</span></li>`;
  });
  res.render("content", {
    title: content.title.replace(/(<([^>]+)>)/gi,''),
    displayTitle: content.title,
    content: content.html+`<ul class="post-list">${list}</ul>`,
    image: site.image,
    site: site
  });
});

// Find the specific page or post the user is looking for and display it
app.get("/:page/:post?", (req, res) => {
  var content, meta;
  if (req.params.page == site.rss) {
    res.set("Content-Type", "application/rss+xml");
    res.send(getRSS());
  } else if (req.params.page == site.read) {
    content = getItem(site.posts, req.params.post);
  } else if (typeof req.params.page !== "undefined") {
    content = getItem(site.pages, req.params.page);
  }
  // If the item requested doesn't exist, redirect to index
  if (typeof content == undefined) {
    res.redirect("/");
  } else {
    res.render("content", {
      title: content.title.replace(/(<([^>]+)>)/gi,''),
      displayTitle: content.title,
      content: content.html,
      meta: content.pubdate,
      image: content.image,
      site: site
    });
  }

});

// Get a list of all blog posts, sorted by modification date
const getPosts = () => {
  return fs
    .readdirSync(`./${site.posts}`)
    .filter(file => {
      return file.toLowerCase().match(/\.md$/);
    })
    .map(file => {
      const markdown = fs.readFileSync(`./${site.posts}/${file}`, "utf8");
      return {
        slug: file.split(".")[0],
        title: converter.makeHtml(markdown.match(/(.+)\n/)[0]).replace(/[Hh]\d/g,"span"),
        mtime: fs.statSync(`./${site.posts}/${file}`).mtime,
        pubdate: fs.statSync(`./${site.posts}/${file}`).mtime.toLocaleDateString("en-GB",{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
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
    return {
          slug: post,
          title: converter.makeHtml(markdown.match(/(.*)\n/)[0]).replace(/[Hh]\d/g,"span"),
          html: converter.makeHtml(markdown.replace(markdown.match(/(.*)\n/)[0], "")),
          image: markdown.match(/\!\[.*\]\((.*)\)/) ? markdown.match(/\!\[.*\]\((.*)\)/)[1] : site.image,
          pubdate: fs.statSync(`./${page}/${post}.md`).mtime.toLocaleDateString("en-GB",{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        };
  }
}

// Generate some RSS and fill in each blog post
const getRSS = () => {
  var rss = `<?xml version="1.0"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><atom:link href="${site.url}/${site.rss}" rel="self" type="application/rss+xml" /><title>${site.title}</title><link>${site.url}</link><description>${site.description}</description>`;
  const posts = getPosts();
  posts.forEach(item => {
    const post = getItem(site.posts, item.slug);
    rss += `<item><title>${post.title}</title><guid>${site.url}/${site.posts}/${post.slug}</guid><link>${site.url}/${site.posts}/${post.slug}</link><pubDate>${post.pubdate}</pubDate><description><![CDATA[${post.html}]]></description></item>`;
  });
  rss += `</channel></rss>`;
  return rss;
}

// Writing new posts
app.post(`/${site.write}`, (req, res) => {
  if (req.body.key == process.env.key) { // Check to make sure the right key was provided -- remember to set a key in .env!
    res.sendStatus(200);
    const markdown = req.body.markdown;
    var slug = markdown.match(/(\.*)\n/)[0].replace(/[^\w\s\d]/g,"").trim().replace(/\s/g, "-").toLowerCase();
    if (!slug.match(/\w/)) slug = Date.now();
    fs.writeFile(`./${site.posts}/${slug}.md`, markdown, function(err) {
      if (err) return console.log(err);
      console.log("Created file:", `./${site.posts}/${slug}.md`);
    });
  } else {
    req.send("Unauthorized");
  }
});

// Start listening for requests
app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});
