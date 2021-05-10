// Welcome to Oregano, a tiny flat-file blogging system by @aTylerRobertson
const site = { // Site-specific settings. These are what you'll edit to make the site your own!
  title: "Oregano", // The primary title of your site -- Appears on every page, and in the browser tab
  description: "Simple, markdown-focused blogging.", // A brief description of your site, used for search results and some social sharing
  url: "https://oregano-blog.glitch.me", // Your site's primary URL
  image: "", // The default image for your site, primarily used on social media
  favicon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌱</text></svg>", // The icon that appears in the browser tab
  header: {"Home":"/","About":"/about-oregano","Getting Started":"/getting-started"}, // Links to display in your site's header, beneath the title. Always use this format: {"Link 1":"URL 1","Link 2":"URL 2"}
  footer: {"Home":"/","RSS":"/rss","Twitter":"https://twitter.com/aTylerRobertson"}, // Links to display in your site's footer. Always use this format: {"Link 1":"URL 1","Link 2":"URL 2"}
  posts: "posts", // The folder that your blog posts are kept in
  pages: "pages", // The folder that pages - files that you can link to directly, but aren't listed on the index page - are kept.
  rss: "rss", // Where people can go to get an RSS feed for your site
  blog: "blog", // Where users request blog posts from, ex.: https://YourSite.com/read (Note: I recommend updating this *before* sharing your posts with people, because changing it will break old links!)
  write: "write" // Where you send new posts to be published, ex.: https://YourSite.com/write
};
// ✨ Everything below here affects how the site works. ✨ 
// It's not required to edit anything there, but I encourage you to poke around!
const fs = require("fs"), // fs is used to manipulate our files, such as reading a page or creating a new blog post on request
      express = require("express"), // express is used to accept requests and route content where it needs to go (http://expressjs.com/)
      showdown = require("showdown"), // showdown is used to turn markdown into HTML (http://showdownjs.com/)
      converter = new showdown.Converter(), // showdown uses a "converter" object to help convert markdown to html, and we'll call it any time we want that to happen
      app = express(), // telling our app (this app right here!) to use express
      port = 3000; // this is the port our app "listens" for new requests at
app.use(express.json()); // Set up our express app to accept JSON requests
app.set("view engine", "pug"); // Using Pug as our view engine lets us dynamically build HTML pages with the files in the "views" folder (https://pugjs.org/)
app.get('/favicon.ico', (req, res) => { // This isn't strictly necessary, but
  if (site.favicon == "") { // most browsers will check for a favicon in your root folder.
    res.status(204); // So you can either let it fail,
  } else { // or,
    res.send(site.favicon); // tell it where it is, using the site settings above.
  }
});
// The index page is always assumed to be in your pages folder, titled "index.md"
app.get("/", (req, res) => { // the forward slash here just means "anyone someone requests *just* your site's URL"
  var content = getItem(site.pages,"index"); // grab the index from pages/index.md
  var list = ""; // In addition to the content of the page, let's list all posts from the posts/ folder
  if(getPosts().length > 0){
    getPosts().forEach(post => {
      list += `<li><a href='/${site.blog}/${post.slug}'>${post.title}</a><span class="meta">${post.pubdate}</span></li>`; // There's probably a nicer way to do this using Pug, but using Javascript to build HTML has a sort of an ugly, pure quality to it.
    });
  } else {
    list = `<li><i>Nothing here yet!</i></li>`; // Just in case there aren't any posts, give the people *something*
  }
  res.render("content", { // Now we use Pug to take all of the content from the page and render it
    title: content.title.replace(/(<([^>]+)>)/gi,''), // This regex removes all HTML tags from the title, so that it can be displayed properly in the browser tab (yes I had to google this)
    displayTitle: content.title,
    content: content.html+`<ul class="post-list">${list}</ul>`,
    image: site.image,
    site: site // You'll see this pop up a few times, but we also pass all of the site variables to pug, so we can display site-constant stuff, like the header and footer links
  });
});
// Find the specific page or post the user is looking for and display it
app.get("/:page/:post?", (req, res) => { // This uses some special Express-powers, and first checks if someone went to a page, like /blog. If they did, we also check if the requested a post, like /blog/hello-world
  var content, meta;
  if (req.params.page == site.rss) { // If the page they requested is your RSS feed, let's give them that.
    res.set("Content-Type", "application/rss+xml");
    res.send(getRSS());
  } else if (req.params.page == site.blog) { // If the page is your blog page,
    content = getItem(site.posts, req.params.post); // Let's try and get the post they want
  } else if (typeof req.params.page !== "undefined") { // If there's NO post, and they definitely requested a page,
    content = getItem(site.pages, req.params.page); // let's grab that page
  }
  // If for whatever reason the item they requested doesn't exist, redirect to index
  if (typeof content == undefined || content === false) {
    res.redirect("/");
  } else {
    res.render("content", { // But if we do have a page or post to show, let's render it with Pug
      title: content.title.replace(/(<([^>]+)>)/gi,''), // again this is some great regex to help remove HTML tags, to put your title in the browser window
      displayTitle: content.title,
      content: content.html,
      meta: content.pubdate,
      image: content.image,
      site: site // we send all of the site settings to Pug as well, to display constants like your site title, and nav menus
    });
  }
});
// For the index and RSS feed, we need a list of all blog posts, sorted by modification date
const getPosts = () => {
  return fs // fs lets us look at the File System, and grab your actual markdown files
    .readdirSync(`./${site.posts}`)
    .filter(file => {
      return file.toLowerCase().match(/\.md$/); // this looks at the posts/ folder, and returns all .md files
    })
    .map(file => { // Now, using the content of those files, let's create some posts
      const markdown = fs.readFileSync(`./${site.posts}/${file}`, "utf8");
      return {
        slug: file.split(".")[0], // the "slug" is the part you put in the address bar
        title: converter.makeHtml(markdown.match(/(.+)\n/)[0]).replace(/[Hh]\d/g,"span"), // The title is the first line of your markdown, converted to HTML, then stripped of any Header tags (so our own styles can kick in instead)
        mtime: fs.statSync(`./${site.posts}/${file}`).mtime, // this is the raw "modified time" of the file
        pubdate: fs.statSync(`./${site.posts}/${file}`).mtime.toLocaleDateString("en-GB",{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) // the prettier version of mtime, displayed on the page
      };
    })
    .sort((a, b) => { // sort the posts so that the most recent ones are on top
      return b.mtime - a.mtime;
    });
};
// Find and return a specific page or post for display
const getItem = (folder, file) => {
  var markdown = "";
  try { markdown = fs.readFileSync(`./${folder}/${file}.md`, "utf8"); } catch (err) { return false; }
  return {
      slug: file,
      title: converter.makeHtml(markdown.match(/(.*)\n/)[0]).replace(/[Hh]\d/g,"span"),
      html: converter.makeHtml(markdown.replace(markdown.match(/(.*)\n/)[0], "")),
      image: markdown.match(/\!\[.*\]\((.*)\)/) ? markdown.match(/\!\[.*\]\((.*)\)/)[1] : site.image,
      pubdate: folder == site.posts ? fs.statSync(`./${folder}/${file}.md`).mtime.toLocaleDateString("en-GB",{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ""
  };
}
// Generate some RSS and fill in each blog post
const getRSS = () => { // This is maybe the ugliest function here, becuase we're building the RSS from scratch. If you have a better way to do this, let me know @aTylerRobertson! 
  var rss = `<?xml version="1.0"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><atom:link href="${site.url}/${site.rss}" rel="self" type="application/rss+xml" /><title>${site.title}</title><link>${site.url}</link><description>${site.description}</description>`;
  const posts = getPosts(); // After pasting in the default RSS requirements, let's return all posts and plug them into some XML
  posts.forEach(item => {
    const post = getItem(site.posts, item.slug);
    rss += `<item><title>${post.title}</title><guid>${site.url}/${site.posts}/${post.slug}</guid><link>${site.url}/${site.posts}/${post.slug}</link><pubDate>${post.pubdate}</pubDate><description><![CDATA[${post.html}]]></description></item>`;
  });
  rss += `</channel></rss>`;
  return rss;
}
// Writing new posts
app.post(`/${site.write}`, (req, res) => { // You can publish new posts remotely by making a POST request to your site's /write endpoint
  if (req.body.key == process.env.key) { // Check to make sure the right key was provided -- remember to set a key in .env!
    res.sendStatus(200); // If the key is correct, send a success status!
    const markdown = req.body.markdown; // The only other required value is "markdown", which is the raw markdown content of your post. 
    var slug = markdown.match(/([^\#\!\?\[\]\&].*)\n/)[0].trim().replace(/\s/g, "-").toLowerCase(); // We grab the first line, and try to parse out any text we can from it, replacing spces with dashes, to use as the filename.
    if (!slug.match(/[^\!\?\s]/)) slug = Date.now(); // If the slug doesn't have any usable characters in it, using the current date/time as the filename instead.
    fs.writeFile(`./${site.posts}/${slug}.md`, markdown, function(err) { // Write the file to your posts/ folder
      if (err) return console.log(err);
      console.log("Created file:", `./${site.posts}/${slug}.md`);
    });
  } else {
    req.send("Unauthorized"); // If the key doesn't match, you're outta here!
  }
});
// Tell Express to start listening for requests when your site wakes up
app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});
