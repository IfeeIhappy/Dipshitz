# How to make Minesweeper in Google Sheets

Do people still play those mindless desktop games? You know the ones: Solitaire, SkiFree, anything that used to come pre-loaded with Windows 98. 

I was recently setting up a new computer with Windows 10, and found myself pining for the days when freeware was actually fun, and not the piles of bloatware that come with new machines. I spent some time trying to track down one of my old favorites, [Minesweeper](https://en.wikipedia.org/wiki/Minesweeper_(video_game)), and couldn't find anything that hit in quite the same way. So, I got to work and made my own:

# ✨ [Click here to make a copy](https://docs.google.com/spreadsheets/d/1xgR00FXH1lwjiF_4H6A1eAnJX8Tupwcjw4oCIc1FYww/copy) ✨

## Here's how I made it:

The spreadsheet is broken into four sections:

* **Rows 3-28:** The mines
* **Rows 29-54:** The spaces between the mines
* **Rows 55-80:** What the player has selected so far
* **Rows 81-112:** The display

Each section is 26-by-26 cells, resized into small squares.

### The mines

![](https://cdn.zappy.app/82b7fc21860cc9fdfecd8b84bb668cfc.png)

In each cell of the "Mines" section, we get a random number between 1 and some arbitrary number, and see if the result is 1. If it is, that cell becomes a mine. In the end product, I let the user adjust the higher number and stored in a value called `chance`, but I tend to find that between 3 and 10 makes for a good difficulty. If the game needs to be reset, which I assigned to a named range called `reset`, the cell calculates that random number again. Here's the formula in each cell:

`=IF(reset,IF(RANDBETWEEN(1,chance)=chance,"X",""),B3)`

### The spaces in-between

![](https://cdn.zappy.app/2c8ab8524f48215c1af6f9e17cd7217a.png)

To play Minesweeper, you click on a cell, and it returns a number that tells you how many mines are next to it, both orthogonally (up, down, left, right) and diagonally. In this section, we check each of the corresponding cells in the "Mines" section. If that cell is a mine, display an "X", but otherwise display the number of surrounding mines using a `COUNTIF` formula. For example, here's the formula from the top-left corner of this section:

`=IF(B3="X","X",COUNTIF({C3;C4;B4},"=X"))`

The `COUNTIF` is looking at an array that I set manually for each cell that lines the edges of this section, and for the middle I made one formula that referenced each of the surrounding cells, and copied it to the remainder. 

### What the player has selected so far

![](https://cdn.zappy.app/0ec0f378bb8e88cc60896bebe2d75ee2.png)

In the penultimate section, we take a look at what the player's clicked on. 

In the "Display" section, which I'll cover next, the player has an array of checkboxes, so we know that we'll see either `TRUE` or `FALSE` there. When the game is `reset`, the cells in this section update themselves to match the corresponding checkboxes in the "Display". Then, if the checkbox in display is changed to something different (such as when it's checked or unchecked), the cell instead becomes the corresponding cell from the "Spaces In-Between" section. That formula looks like this:

`=IF(reset,B82,IF(NOT(B82=B55),B29,B55))`

That way, when the game starts, a cell in this section might be set to `FALSE`. When the user checks the corresponding checkbox, making it `TRUE`, this cell will instead reveal whether that space has a mine, or how many mines are nearby. 

### The display

![](https://cdn.zappy.app/929a0dabf7e21f61f51577d819aa057f.png)

This is the most complex section, because we're hiding so much from the user. 

The first thing you'll notice is that no checkboxes appear, just those gray squares. _Those are actually checkboxes._ Unlike text, Google Sheets won't typically let you hide checkboxes by setting the Text Color to the same value as the Background Color, but if you set the Text Color to be _slightly different_, it doesn't bat an eye. Here, the Text Color is `#eeeeee` and the Background Color is `#efefef`. To you or me, that doesn't look very different, but it's just enough to let us get away with what we're about to get away with. 

When you click on one of the gray boxes, that changes the checkbox to either `TRUE` or `FALSE`, setting off the chain of events from the last section. We then use **Conditional Formatting** to change the color of the square again (making sure to set slightly different Text and Background Colors), based on what the previous section reveals. You can use whatever colors you like, but I ended up going for increasingly darker shades of blue (white meaning there are _no_ mines nearby, and black meaning the space is _surrounded_ by mines), and red for the mines themselves:

![](https://cdn.zappy.app/8b39b4aff721bfc7376add2a713e7525.png)

When a mine is uncovered, that causes a `COUNTIF` formula in cell D1 to return `TRUE`, causing everything referencing the `reset` value to, well, reset. Then, the game starts over, and you can keep on playing. I also included a separate "reset" button for the player, just in case they get stuck or bored with the current game.

To make the game more enjoyable, I hid rows 1-80, so all the player sees is the "Display". I also added a "Score" section, which adds up all of the numbers that have been revealed in the "What the Player has Selected" section, and a section for the player to adjust the "Difficulty", which is really just the chance that a square will contain a mine. 

## What do you think?

Is this fun? Interesting? Should I alter it in any way? 

If you have thoughts, [hit me up on Twitter](https://twitter.com/aTylerRobertson). Thanks! 👋