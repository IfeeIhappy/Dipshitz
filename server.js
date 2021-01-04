const fs = require("fs");
const express = require("express");
const showdown = require("showdown");
const converter = new showdown.Converter();

const app = express();
const port = 3000;
const path = "./posts";

app.use(express.json());
app.set("view engine", "pug");

/* When a user follows a direct link to a published post */
app.get("/read/:post", (req, res) => {
  if (typeof req.params.post !== "undefined") {
    var posts = getPosts();
    var postID = posts.findIndex(p => p.slug == req.params.post);
    if (postID > -1) {
      var post = posts[postID];
      res.render("post", { title: post.title, content: post.html, meta: post.meta });
    } else {
      res.redirect("/");
    }
  } else {
    res.redirect("/");
  }
});

/* List all published posts on the index page */
app.get("/", (req, res) => {
  /* Get the index page from drafts/ */
  const text = fs.readFileSync("./drafts/index.md", "utf8");
  const html = converter.makeHtml(text);
  const title = text.match(/(\w.*)\n/)[0];
  
  var list = "";
  var posts = getPosts();
  
  posts.forEach(post => {
    list += `<li><a href='/read/${post.slug}'>${post.title}</a><br/><span class="meta">${post.meta}</span></li>`;
  });
  res.render("index", { title: title, content: html, list: list });
});

/* Create new posts via API */
app.post("/write", (req, res) => {
  if (req.body.key == process.env.key) {
    res.sendStatus(200);
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
  
});

/* Start listening */
app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});

const getPosts = () => {
  /* Get everything from posts/ and sort it by modified date */
  /* Cant't see the posts/ folder in Glitch? It's hidden by the .gitignore file */
  return fs.readdirSync(path)
            .map(file => {
              var markdown = fs.readFileSync(`${path}/${file}`, "utf8");
              var title = markdown.match(/(\w.*)\n/)[0];
              var content = markdown.replace(title,"");
              var stats = fs.statSync(`${path}/${file}`);
              var meta = stats.mtime == stats.ctime ? `Posted ${stats.ctime.getFullYear()}/${stats.ctime.getMonth()+1}/${stats.ctime.getDate()}` : `Updated ${stats.mtime.getFullYear()}/${stats.mtime.getMonth()+1}/${stats.mtime.getDate()}`;
              var words = markdown.trim().split(/\s+/).length;
              var readingTime = words / 250; // Average reading speed is 250 words/minute, apparently?
              return {
                "slug": file.split(".")[0],
                "markdown": markdown,
                "title": title,
                "html": converter.makeHtml(content),
                "created": stats.ctime,
                "modified": stats.mtime,
                "meta": `${meta} | ~${readingTime.toFixed(1)}-minute read`,
              };
            })
            .sort((a,b) => {
              return b.modified.getTime() - a.modified.getTime();
            });
};