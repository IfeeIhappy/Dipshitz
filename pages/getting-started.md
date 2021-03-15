# Getting started

To start blogging with Oregano, you'll first need a [Glitch](https://glitch.com) account. That will let you **remix** this app:

## [Click here to remix!](https://glitch.com/edit/#!/remix/oregano-blog)

That will create a brand new copy of this app on your own account. 

## What comes in the box

When you remix Oregano, you'll have access to five main components:

* **oregano.js**: This is where the brains of the entire operation live, and where you'll input your blog's unique settings.
* **.env**: A secret file just for you, which comes built into each Glitch project. That's where you'll set a secret key that lets you publish from anywhere.
* **posts/**: A folder that holds all of your blog posts as `.md` Markdown files. 
* **pages/**: A folder for all of the Markdown files that aren't blog posts, like your site's index or about page.
* **views/ and css/**: These folders dictate the look and feel of your site, using CSS and [Pug](https://pugjs.org/)

## Make it your own

When you're logged in and editing your new copy of Oregano, the first thing you'll want to do is head to `oregano.js` and check out the very first line, which is your `site` settings. There, you can adjust each of the following:

* **title**: The primary title of your site -- Appears on every page, and in the browser tab
* **description**: A brief description of your site, used for search results and some social sharing
* **url**: Your site's primary URL (ex.: "https://YourSite.com")
* **image**: The default image for your site, primarily used on social media
* **favicon**: The icon that appears in the browser tab
* **header**: Links to display in your site's header, beneath the title. Uses this format: `{"Link 1":"URL 1","Link 2":"URL 2"}`
* **footer**: Links to display in your site's footer. Uses the same format as header.
* **posts**: The folder that your blog posts are kept in
* **pages**: The folder that pages - files that you can link to directly, but aren't listed on the index page - are kept.
* **rss**: Where people can go to get an RSS feed for your site
* **blog**: Where users request blog posts from, ex.: "blog" publishes your posts at https://YourSite.com/blog
* **write**: Where you send new posts to be published, ex.: using "write" means you can send new posts to https://YourSite.com/write

Then, you can start adding new Markdown files to your `pages/` and `posts/` folders, and Oregano will start publishing right away! 

## Write from anywhere

Using Express gives Oregano a really cool ability: you can use the `/write` endpoint to publish new content from anywhere. All you have to do is make a "POST" request to your site's `/write` endpoint, and include the markdown content you want to publish 