# Making an escape room in Google Sheets

Alright, I have to start with a confession: I've never been to an escape room. It's on my post-pandemic to-do list, but as of now I've only attended one digital escape room experience, and it was enough to make me make this spreadsheet. I say that to say, _please don't confuse this spreadsheet for a professional escape room_. It's a proof of concept, nothing more. (That said, if you're an escape room designer who's interested in spreadsheets, [let's talk!](https://twitter.com/aTylerRobertson))

The online escape room I went to was hosted partly in Zoom, and partly in a custom-built website, with several clues requiring the players to open a "puzzle box" in Google Sheets, where they'd solve a series of math or cypher-related conundrums. It was, despite a few of the natural bumps that come with navigating Zoom calls, a pretty fun experience.

And, naturally, it got me thinking: **What if you did everything in Google Sheets?** 

If the entire experience was kept within Google Sheets, you could cut out the Zoom call, the host, the custom website requirements, and build a variety of escape rooms relatively quickly. They'd be easier to distribute, too, thanks to the ubiquity of Google Docs. Is it a sustainable business? I'm not sure! (Again, if you make escape rooms, [I'd love to chat](https://twitter.com/aTylerRobertson)!)

Here's what I came up with:

## 🔎 [Click here to make a copy!](https://docs.google.com/spreadsheets/d/1xJM10k71-X-4Z68mqjWTsKhZuQny0OxTWUMPKhOQtSk/copy) 🔍

## How it works

The "room" has three puzzles, each broken out into a separate worksheet. You can put multiple puzzles into a single sheet, of course, but having separate tabs really contributes to the feeling of having separate spaces within a larger area. I won't get too deep into how each puzzle works (I'll write up separate pieces for that later on), but the important thing is that they all refer to a separate, hidden, "FORBIDDEN" worksheet. 

_"But Tyler,"_ I hear you cry, _"What's stopping someone from just looking at that sheet and getting all the answers?"_ 

I'm glad you asked! In addition to [hiding the sheet and rows](https://support.google.com/docs/answer/1218656), I prevent the user from opening that sheet using a single function:

`SUBTOTAL()`

_"But Tyler,"_ what, you again? _"Isn't SUBTOTAL just for financial stuff?"_

Well, sure, yeah, [SUBTOTAL](https://support.google.com/docs/answer/3093649) is great for things like invoices, if that's your jam. But it can also **skip hidden rows**, which means if you put your answers _inside_ hidden rows, you can detect when the player un-hides them. 

[Click here to copy another spreadsheet that helps demonstrate this!](https://docs.google.com/spreadsheets/d/1YGhwYb_RLmGEgQQzVh5vL9r9JBoVJfo8r1L-nbkRg3M/copy)

## How this affects the design

By hiding a sheet from the players, we can use that as the "brains" of the whole operation, so that all player-facing cells only reference what we want the player to see. 

For example, in the "ADVENTURE" sheet, the main screen references a cell in the hidden sheet, and _that_ cell uses a VLOOKUP to determine what to show to the player. That keeps the player one step removed from how the game works, helping guarantee that they don't accidentally stumble on information they shouldn't have yet. There are also some puzzles, like the WATER room, that rely solely on navigating the spreadsheet, and don't reference the hidden cells at all.

The one thing we can't really prevent here is players who want to enter their own formulas that reference the hidden cells on their own. We can "protect" cells to some degree, but that will always be a possibility. All we can do here is make that process really, really annoying. In my example above, I do this by placing each puzzle in a different spot, and ensuring that the cell where you enter the answers doesn't reference those answers. That way, even though you can technically use formulas to poke around and find the answers, you've done nothing but spoil your own fun. 

## Taking it further

In addition to just adding more puzzles, there are a few other really cool opportunities presented by using Google Sheets for your escape room:

1. [Google Apps Script](https://developers.google.com/apps-script)! Google lets you add your own custom code to your sheets, superpowering them and allowing for even more complex solutions than what I've shown here. You could even couple your sheet with something like [riddle.com's API](https://www.riddle.com/docs/api/v2/) to generate custom puzzles on the fly.
2. Speaking of generating custom puzzles, Google Sheets has lots of options for [random number generation](https://support.google.com/docs/answer/3093438), which would let you ensure that each playthrough is unique.
3. Incorporating other Google Docs! I stuck to Sheets with this one, but using the [HYPERLINK](https://support.google.com/docs/answer/3093313) and [IMAGE](https://support.google.com/docs/answer/3093333) features, you can link to and import information, so that your players need to hop around to truly different spaces to solve puzzles. This can help break up the action, get players into smaller teams, and diversify the kind of content you're showing them, while still only using Google's sharing features. 

## What else?

What do you think? Is there anything I should have added, or left out? Would you make an escape room in Google Sheets? [Let me know!](https://twitter.com/aTylerRobertson)