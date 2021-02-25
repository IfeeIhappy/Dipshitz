# Hello, world 👋🌎

In trying to find a new way to publish my writing, I turned to [Glitch](https://glitch.com/) for a few reasons:

1. It seemed fun
2. It would let me own my content in a more concrete way
3. I could write all of the code myself

For folks who are code-averse (and honestly, I applaud you), solutions like Squarespace might be more attractive. I've been using Squarespace up until recently for my writing, but realized slowly that it wasn't meeting my needs. Or rather, I wasn't meeting its market. Tools like Squarespace give you **lots** of tools (which they call "Blocks") for creating content, and it lets you build quite a good website for marketing yourself if you want. I still use it for [my podcasts](https://sandwich.computer) for that reason (podcast syndication being something that I just don't want to tackle yet). 

For me, Squarespace's tools were too much. I'm not trying to start a business, or run some sort of media empire. I just want to write a stupid thing, and have it appear someplace that I can link to. In some ways, the plethora of options actually impeded my desire to write, when crafting a post became to cumbersome. 

So, here we are. 

## I'm building a new blog for myself

Like I said above, this all starts with [Glitch](https://glitch.com/), which I enjoy immensely. 

I started by "remixing" the [hello-express](https://glitch.com/~hello-express) project, which got me started with a small Node.js app using [Express](http://expressjs.com/). Express is fun because it lets you quickly get your app to "listen" at various endpoints, creating hooks for various GET or POST requests. In my case, the app created in `server.js` listens for GET requests at either the "/" or "read/" directories. 

When a request comes in for the "/" directory, it looks for a markdown document at "drafts/index.md" and converts that file's contents to HTML with [Showdown](http://showdownjs.com/). Then, it uses [Pug](https://pugjs.org/) to apply that HTML to a template and display it to the reader. 

Requests to "read/" are similar, but instead I have Express also looking for a post's slug in the URL. For example, this post is at [read/hello-world](/read/hello-world). When a post slug is provided, I look through the "posts/" and "drafts/" folders to find a match, convert it to HTML, and display it. If no matches are found, Express redirects back to the index. 

The end result feels not unlike static site generators like [Jekyll](https://jekyllrb.com/) or [11ty](https://www.11ty.dev/), both great solutions if you're writing markdown directly into your console or browser. I'm opting not to use either of those solutions (yet), because of the other listener I have set up: "write/".

Using Express, I can POST data to the "write/" endpoint on this site, and (provided my secret key is provided) it will create a new markdown file in "posts/" with the text I sent. This means that I can write using the [Drafts](https://getdrafts.com) app on my phone, and publish via a custom action. I'll share the exact action later on once I'm settled, but it's a variant of [this action used with Zapier](https://actions.getdrafts.com/a/1Hf) (disclosure: I work at Zapier, which is how I found that action as well as Showdown). Similar to cameras, the best writing tool is the one you have with you, and now I always have access to my own markdown publishing tools. 

## What's next

I've added some basic CSS, but that'll be a work in progress, I'm sure. The next big things will be:

- RSS feed support (edit: [it lives](/rss))
- Become a Glitch Member (Going to see how much I can get away with for free first)
- Custom domain (edit: [huzzah](https://tyler.robertson.click))
- Rebuild and share my Drafts action for posting ([based on this one](https://actions.getdrafts.com/a/1Hf))
- Clean up the Glitch project for easier remixing