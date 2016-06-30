//////////////////////////////////////////////////////
// FILL QUOTE LOGIC

const getQuote = document.getElementById("get-quote");

const inputStr = "I have come to believe that the whole world is an enigma, a harmless enigma that is made terrible by our own mad attempt to interpret it as though it had an underlying truth.", author = "Umberto Eco";
const svgNS = "http://www.w3.org/2000/svg";

let quoteFilled = false, quoteBeingFilled = false;

function outputTspans(str, cb, done) {
	str = str.replace(/\n+\s*/g, "\n").trim();
	const len = str.length;
	if(len === 0) return;

	for (let ind = 0; ind < len;) {
		const tspan = document.createElementNS(svgNS, "tspan");

		let ch = str.charAt(ind++);
		if(ch === " " || ch === "\n" && ind < len-1) {
			let nextCh =str.charAt(ind++);
			if(nextCh === " " || nextCh === "\n" && ind < len - 1) nextCh += str.charAt(ind++);

			ch += nextCh;
		}
		tspan.textContent = ch;
		cb(tspan);
		if(ind === len && done) {
			done(tspan);
		}
	}
}

function emptyQuote() {
	emptyTextOutput();
	emptyAuthor();
}

function onQuoteFilled() {
	quoteFilled = true;
	quoteBeingFilled = false;
	getQuote.classList.remove("on");
}


function fillQuote() {
	if(quoteBeingFilled) {
		fillQuoteTextImmediately();
		fillQuoteAuthorImmediately();
	} else {
		emptyQuote();
		quoteBeingFilled = true;
		getQuote.classList.add("on");

		fillQuoteText();
		fillQuoteAuthor();

		startTextAnimations();
	}
}

getQuote.onclick = fillQuote;


// Inactive browser tabs buffer some of the setInterval or setTimeout functions(at least in Chrome), and then execute all at once
// Messes up timing-dependent animations
document.addEventListener("visibilitychange", function() {
	if(document.visibilityState === "visible" && quoteBeingFilled) {
		fillQuoteTextImmediately();
		fillQuoteAuthorImmediately();
	}
});
