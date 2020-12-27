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
  const text = fs.readFileSync("./drafts/index.md", "utf8");
  const html = converter.makeHtml(text);
  const title = text.match(/(\w.*)\n/)[0];
  var list = fs.readdirSync(path).map(file => {
    var filename = file.split(".")[0];
    var title = filename.replace(/\-/gi, " ");
    return `<li><a href='/read/${filename}'>${title}</a></li>`;
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
