const fs = require('fs');
const express = require('express');
const app = express();
const port = 3000;
const path = 'posts';

app.set('view engine', 'pug');

app.get('/read/:post', (req, res) => {
  if (typeof(req.params.post) !== "undefined") {
    const path = require(path); 
    const files = fs.readdirSync(__dirname); 
    var posts = [];
    files.forEach(file => { 
      if (path.extname(file) == ".md") {
        posts.push(file.split('.')[0]);
      }
    });
    if (posts.indexOf(req.params.post) > -1){
      res.render('default', { title: 'Post', content: req.params.post });
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