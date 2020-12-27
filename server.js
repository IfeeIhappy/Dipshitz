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
      res.render("post", { title: post.title, content: post.html });
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
    var meta = post.modified == post.created ? `Posted ${post.created.getFullYear()}-${post.created.getMonth()+1}-${post.created.getDate()}` : `Modified ${post.modified.getFullYear()}-${post.modified.getMonth()+1}-${post.modified.getDate()}`;
    list += `<li><a href='/read/${post.slug}'>${post.title}</a><br/><span class="meta">${meta}</span></li>`;
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
  /* Get everything from posts/ and sort it by modified date */
  /* Cant't see the posts/ folder in Glitch? It's hidden by the .gitignore file */
  return fs.readdirSync(path)
            .map(file => {
              var markdown = fs.readFileSync(`${path}/${file}`, "utf8");
              var stats = fs.statSync(`${path}/${file}`);
              return {
                "slug": file.split(".")[0],
                "markdown": markdown,
                "title": markdown.match(/(\w.*)\n/)[0],
                "html": converter.makeHtml(markdown),
                "created": stats.ctime,
                "modified": stats.mtime
              };
            })
            .sort((a,b) => {
              return b.modified.getTime() - a.modified.getTime();
            });
};