const fs = require('fs');
const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'pug');

app.get('/:post', (req, res) => {
  if (req.params.post == "") {
    res.render('default', { title: 'Post', content: req
                           .params.post });
  } else {
    res.render('default', { title: 'Hey', content: 'Hello there!' });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});