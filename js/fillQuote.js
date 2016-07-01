//////////////////////////////////////////////////////
// FILL QUOTE LOGIC

const getQuote = document.getElementById("get-quote");

const inputStr = "Today, I consider myself the luckiest man on", author = "Umberto Eco";
const svgNS = "http://www.w3.org/2000/svg";
let quote;

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
	if(!quote) return;

	emptyQuote();
	quoteBeingFilled = true;

	fillQuoteText();
	fillQuoteAuthor();

	startTextAnimations();

}

function fillQuoteImmediately() {
	fillQuoteTextImmediately();
	fillQuoteAuthorImmediately();
}

getQuote.onclick = requestQuote;


// Inactive browser tabs buffer some of the setInterval or setTimeout functions(at least in Chrome), and then execute all at once
// Messes up timing-dependent animations
document.addEventListener("visibilitychange", function() {
	if(document.visibilityState === "visible" && quoteBeingFilled) {
		fillQuote();
	}
});


function requestQuote() {
	if(quoteBeingFilled) {
		fillQuoteImmediately();
		return;
	}

	getQuote.classList.add("on");

	AJAX({
		url: 'https://andruxnet-random-famous-quotes.p.mashape.com/?cat=famous',
		headers: {
			"X-Mashape-Key": "LAPt9A7eY1mshE4ecB0COT48Gt6dp1Dxa87jsnNrwQGgt96xMh",
			"Accept": "application/json",
			"Content-Type": "application/x-www-form-urlencoded"
		}
	}).then(quoteGetSuccess, quoteGetError);
}

function quoteGetSuccess(result) {
	// console.log(JSON.parse(result), typeof result);
	quote = JSON.parse(result);
	fillQuote();
}

function quoteGetError(error) {
	console.log("Error executing AJAX request:", error);
	getQuote.classList.remove("on");
}

document.addEventListener("DOMContentLoaded", function(event) {
	// console.log("DOM fully loaded and parsed");
	requestQuote();
});
