# What is this?

I've been looking for a new way to write things online. Up until now, I've been using a comped Squarespace site (I worked there for a few years), and while it's been nice to have, the interface is more cumbserome than I would ever need or want. 

The fact is that most of what I'm writing will only ever be just text. I won't need Summary Blocks or Gallery Images or any one of a million embed they offer, and I don't want to have to make six clicks before I can start writing. I just want to start. 

So the goal here is to make a small static site generator (similar to, if not directly using, [11ty](https://www.11ty.dev/) or [Jekyll](https://jekyllrb.com/)) that I can post markdown files with a very small amount of frontmatter to via API. That way, I can write from my phone via the Drafts app, or in an email, or wherever I am, and post to the site right away.

I've already done a short test using 11ty for site generation and express for receiving the text, but that quickly ran into processing issues, as 11ty's constant re-building of the site exceeded Glitch's already-generous processing limits for a free site. (Once I find a solution that I like, I'm positive that I'll upgrade to the monthly plan.)

Next, I'm going to look into smaller solutions that can dynamically read and parse markdown files, using something like [Showdown](https://github.com/showdownjs/showdown) to turn the Markdown into HTML.