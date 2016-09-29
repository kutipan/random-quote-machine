# Random Quote Generator
A simple random quote generator made as part of FreeCodeCamp course.

Live version [here](https://velenir.github.io/random-quote-machine/).

To help mimic handwritten input of the quote the font used is a special *'single stroke'* font **CamBam-5** with stroke-dashoffset animation applied sequentially to each letter. To cut down on simultaneous animation on screen (which caused significant lags in Chrome when implemented via animation-delay in CSS) the blockquote panel differentiates between **text#dynamic-output** filled with letters in the process of being animated and **text#static-output** with letters that have finished their animations.
