//////////////////////////////////////////////////////
// FILL QUOTE AUTHOR LOGIC

const svgAuthor = document.getElementById("svg-author");
let authorTxt = document.getElementById("author");

const authorCharAddFrequency = 100;
let quoteAuthorIntervalId, quoteAuthorBeingFilled = false;

let lastAuthorTspan;
function addToAuthorTxt(tspan) {
	authorTxt.appendChild(tspan);
}

function resizeSvgAuthorToFit() {
	svgAuthor.style.width = authorTxt.getBBox().width + 5 + "px";
}

let accumAuthor = authorTxt.querySelector("tspan.accum");
function onAuthorAnimationEnd({target}) {
	if(target.tagName === "tspan") {
		accumAuthor.textContent += target.textContent;
		target.remove();

		if(target === lastAuthorTspan) {
			lastAuthorTspan = null;
			onQuoteAuthorFilled();
		}
	}
}
svgAuthor.addEventListener("animationend", onAuthorAnimationEnd);

function emptyAuthor() {
	const clone = authorTxt.cloneNode(false);
	clone.classList.remove("hidden", "animated");

	accumAuthor = document.createElementNS(svgNS, "tspan");
	accumAuthor.classList.add("accum");

	clone.appendChild(accumAuthor);

	svgAuthor.replaceChild(clone, authorTxt);
	authorTxt = clone;
}

function doneWithAuthorTspans(lastOne) {
	lastAuthorTspan = lastOne;
	resizeSvgAuthorToFit();
}

function startAuthorAnimations() {
	authorTxt.classList.add("hidden", "animated");
	clearInterval(quoteAuthorIntervalId);
	// console.log("STARTING ANIMATIONS on", authorTxt);

	// first one is tspan.accum, skip it
	let tspan = authorTxt.children[1];
	if(!tspan) return;
	// immediate animation of first character
	tspan.style.display = "unset";

	quoteAuthorIntervalId = setInterval(startTspanAnimation, authorCharAddFrequency);

	function startTspanAnimation() {
		// protect from button mashing -> events firing off in quick succession
		if(tspan) tspan = tspan.nextSibling;

		if(tspan) tspan.style.display = "unset";
		else clearInterval(quoteAuthorIntervalId);
	}
}

function fillQuoteAuthor() {
	quoteAuthorBeingFilled = true;
	authorTxt.classList.add("dynamic");
	outputTspans(quote.author, addToAuthorTxt, doneWithAuthorTspans);
}

function onQuoteAuthorFilled() {
	quoteAuthorBeingFilled = false;
	onQuoteFilled();
}

function fillQuoteAuthorImmediately() {
	clearInterval(quoteAuthorIntervalId);
	authorTxt.classList.remove("animated", "hidden", "dynamic");
	onQuoteAuthorFilled();
}
