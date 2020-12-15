---
title: Posting to Glitch from the Drafts app
date: 2020-12-15 2020-12-15-10-44-09 pm
layout: layouts/post.njk
draft: false
---

# Posting to Glitch from the Drafts app

How it works (briefly)

- I have my Glitch site set up to list for POST requests at `/create-post`
- That listener also checks to see if a key (set in my site's **.env** secrets) is set
- Then, it uses the `fs` node module to create a new markdown file, using the `title` and `content` values provided
- To send the information to Glitch, I have an action built in Drafts (which I'll share once I've cleaned up the code)
- That action takes the current draft's content and creates some basic front matter for Eleventy (using the display title and current date)
- Then it opens the URL that my site is listening for in a web browser, with the key, title, and content as web form parameters (this is the part I'm hoping to clean up, either using `fetch` or something similar)

Effectively, that means that I can write a straightforward draft in the Drafts app (like this one) and post it to my site with the press of a button!