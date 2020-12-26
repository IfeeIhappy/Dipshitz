const
  express = require('express'),
  app = express(),
  port = 3000,
  Poet = require('poet');

const poet = Poet(app, {
  posts: './posts/',
  postsPerPage: 5,
  metaFormat: 'yaml'
});

poet.init().then(function () {
  // ready to go!
});

/*
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
*/