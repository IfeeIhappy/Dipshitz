const fs = require("fs");
const express = require("express");
const showdown = require("showdown");
const converter = new showdown.Converter();

const app = express();
const port = 3000;
const path = "./posts";

app.set("view engine", "pug");

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
      res.render("default", { title: title, content: html });
    } else {
      res.redirect("/");
    }
  } else {
    res.redirect("/");
  }
});

app.get("/", (req, res) => {
  const text = fs.readFileSync(`./posts/index.md`, "utf8");
  const html = converter.makeHtml(text);
  const title = text.match(/(\w.*)\n/)[0];
  res.render("default", { title: title, content: html });
});

app.post("/write", (req, res) => {
  console.log(req.data);
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
