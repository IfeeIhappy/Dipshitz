// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const fs = require("fs");
let { exec } = require("child_process");
const app = express();

// make all the files in 'src' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("dist"));

app.post("/create-post", (request, response) => {
  if (request.query.key == process.env.api_key) {
    if (typeof request.query.text !== 'undefined') {
      const title = Date.now() + ".md";
      fs.writeFileSync(`./src/${title}`, request.query.text, function (err) {
        if (err) return console.log(err);
        console.log('File created:', title);
      });
      response.sendStatus(200);
    }
    response.sendStatus(400);
  } else {
    response.sendStatus(401);
  }
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
