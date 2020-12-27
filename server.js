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
    var posts = [];
    fs.readdirSync(path).forEach(file => {
      posts.push(file);
    });
    if (posts.indexOf(`${req.params.post}.md`) > -1) {
      const text = fs.readFileSync(`./posts/${req.params.post}.md`, "utf8");
      const html = converter.makeHtml(text);
      const title = text.match(/(\w.*)\n/)[0];
      res.render("post", { title: title, content: html });
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
    list += `<li><a href='/read/${post.slug}'>${post.title}</a> <span class="meta">${post.modified == post.created ? "Posted on " + post.created : "Modified on " + post.modified}</span></li>`;
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

/* Start listening */
app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});

const getPosts = () => {
  return fs.readdirSync(path)
            .map(file => {
              var markdown = fs.readFileSync(`${path}/${file}`, "utf8");
              var stats = fs.statSync(`${path}/${file}`);
              return {
                "slug": file.split(".")[0],
                "markdown": markdown,
                "title": markdown.match(/(\w.*)\n/)[0],
                "html": converter.makeHtml(markdown),
                "created": `${stats.ctime.getFullYear()}-${stats.ctime.getMonth()}-${stats.ctime}`,
                "modified": `${stats.mtime}-${stats.ctime}-${stats.ctime}`
              };
            })
            .sort((a,b) => {
              return b.modified - a.modified
            });
};