const fs = require('fs');
const express = require('express');
const showdown  = require('showdown');
const converter = new showdown.Converter();

const app = express();
const port = 3000;
const path = require('./posts'); 

app.set('view engine', 'pug');

app.get('/read/:post', (req, res) => {
  if (typeof(req.params.post) !== "undefined") {
    const filenames = fs.readdirSync(path, function(err, files){
      files = files.map(function (fileName) {
      return {
        name: fileName,
        time: fs.statSync(path + '/' + fileName).mtime.getTime()
      };
      })
      .sort(function (a, b) {
        return a.time - b.time; })
      .map(function (v) {
        return v.name; });
    });
    var posts = [];
    filenames.forEach(file => { 
      if (path.extname(file) == ".md") {
        posts.push(file.split('.')[0]);
      }
    });
    if (posts.indexOf(req.params.post) > -1){
      const markdown = fs.readfileSync(`./posts/${req.params.post}.md`);
      const html = converter.makeHtml(markdown);
      const title = markdown.match(/(\w.*)\n/)[0];
      res.render('default', { title: title, content: html });
    } else {
      res.redirect('/');
    }
  } else {
    res.redirect('/');
  }
});

app.get('/', (red, res) => {
   res.render('default', { title: 'Hey', content: 'Hello there!' });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});