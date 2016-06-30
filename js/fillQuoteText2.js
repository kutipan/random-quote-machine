let dynamicTxt = document.getElementById("dynamic-output");
let staticTxt = document.getElementById("static-output");
const svgTxt = document.getElementById("svg-output");

const svgAuthor = document.getElementById("svg-author");
let authorTxt = document.getElementById("author");

const inputStr = "I have come to believe that the whole world is an enigma, a harmless enigma that is made terrible by our own mad attempt to interpret it as though it had an underlying truth.", author = "Umberto Eco";
const svgNS = "http://www.w3.org/2000/svg";

const textCharAddFrequency = 120, authorCharAddFrequency = 60, initialSpaceWidthShift = -11;
let quoteTextIntervalId, quoteAuthorIntervalId, quoteFilled = false, quoteTextBeingFilled = false, quoteBeingFilled = false, quoteAuthorBeingFilled = false;

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

let lastTextTspan, wordStartTspan, spaceWidthShift, svgWidth = svgTxt.getBoundingClientRect().width;
function addToDynamicTxt(tspan) {
	const firstChar = tspan.textContent.charAt(0);
	const secondChar = tspan.textContent.charAt(1);

	if(firstChar === " ") {
		wordStartTspan = tspan;
	}

	if(firstChar === "\n" || secondChar === "\n") {
		tspan.setAttribute("x", secondChar !== "\n" && secondChar !== " " ? 0 : spaceWidthShift || initialSpaceWidthShift);
		tspan.setAttribute("dy", "1em");
		tspan.firstInLine = true;
	}

	dynamicTxt.appendChild(tspan);
	if(!spaceWidthShift && wordStartTspan ) {
		try {
			spaceWidthShift = -Math.round(wordStartTspan.getStartPositionOfChar(1).x - wordStartTspan.getStartPositionOfChar(0).x);
		} catch(e) {
			console.log("Error", e.message);
		}
	}

	if(dynamicTxt.getBoundingClientRect().width + (spaceWidthShift || initialSpaceWidthShift)/3 > svgWidth) {
		wordStartTspan.setAttribute("x", spaceWidthShift || initialSpaceWidthShift);
		wordStartTspan.setAttribute("dy", "1em");
		wordStartTspan.firstInLine = true;
	}
}

let lastAuthorTspan;
function addToAuthorTxt(tspan) {
	authorTxt.appendChild(tspan);
}

function resizeSvgTxtToFit() {
	svgTxt.style.height = staticTxt.getBBox().height + dynamicTxt.getBBox().height + 12 + "px";
}

function resizeSvgAuthorToFit() {
	svgAuthor.style.width = authorTxt.getBBox().width + 5 + "px";
}


let accumTxt = dynamicTxt.querySelector("tspan.accum");
let finishedBefore = false;
function onTextAnimationEnd({target}) {
	if(target.tagName === "tspan") {

		if(target.firstInLine) {
			placeIntoStatic();
			accumTxt = target;
			accumTxt.classList.add("accum");
			accumTxt.setAttribute("x", 0);

		} else {
			accumTxt.textContent += target.textContent;
			target.remove();
		}

		if(target === lastTextTspan && dynamicTxt.hasChildNodes()) {
			lastTextTspan = null;
			placeIntoStatic();
			accumTxt = document.createElementNS(svgNS, "tspan");
			accumTxt.classList.add("accum");
			if(staticTxt.hasChildNodes()) dynamicTxt.setAttribute("y", staticTxt.childElementCount + 1 + "em");
			dynamicTxt.appendChild(accumTxt);
			finishedBefore = true;
			console.log("dynamicTxt EMPTIED");
			onQuoteTextFilled();
		}

	}
}

function placeIntoStatic() {
	const firstChar = accumTxt.textContent.charAt(0);
	const secondChar = accumTxt.textContent.charAt(1);
	accumTxt.setAttribute("x", firstChar === " " || (firstChar === "\n" && secondChar === " ") ? spaceWidthShift || initialSpaceWidthShift : 0);
	if(finishedBefore && staticTxt.hasChildNodes()) {
		finishedBefore = false;
		accumTxt.setAttribute("dy", "1em");
	}
	staticTxt.appendChild(accumTxt);
	dynamicTxt.setAttribute("y", staticTxt.childElementCount + "em");
}

svgTxt.addEventListener("animationend", onTextAnimationEnd);

let accumAuthor = authorTxt.querySelector("tspan.accum");
function onAuthorAnimationEnd({target}) {
	if(target.tagName === "tspan") {

		accumAuthor.textContent += target.textContent;
		target.remove();


		if(target === lastAuthorTspan) {
			lastAuthorTspan = null;
			console.log("authorTxt FILLED");
			onQuoteAuthorFilled();
		}

	}
}
svgAuthor.addEventListener("animationend", onAuthorAnimationEnd);

function emptyTextOutput() {
	let clone = staticTxt.cloneNode(false);

	svgTxt.replaceChild(clone, staticTxt);
	staticTxt = clone;

	clone = dynamicTxt.cloneNode(false);
	clone.setAttribute("y", "1em");
	clone.classList.remove("hidden", "animated");

	accumTxt = document.createElementNS(svgNS, "tspan");
	accumTxt.classList.add("accum");

	clone.appendChild(accumTxt);
	svgTxt.replaceChild(clone, dynamicTxt);
	dynamicTxt = clone;
}

function emptyAuthor() {
	const clone = authorTxt.cloneNode(false);
	clone.classList.remove("hidden", "animated");

	accumAuthor = document.createElementNS(svgNS, "tspan");
	accumAuthor.classList.add("accum");

	clone.appendChild(accumAuthor);

	svgAuthor.replaceChild(clone, authorTxt);
	authorTxt = clone;

}

function emptyQuote() {
	emptyTextOutput();
	emptyAuthor();
}


function doneWithTextTspans(lastOne) {
	lastTextTspan = lastOne;
	resizeSvgTxtToFit();
}

function doneWithAuthorTspans(lastOne) {
	lastAuthorTspan = lastOne;
	resizeSvgAuthorToFit();
}

function startTextAnimations() {
	dynamicTxt.classList.add("hidden", "animated");
	console.log("STARTING ANIMATIONS on", dynamicTxt);

	// first one is tspan.accum, skip it
	let tspan = dynamicTxt.children[1];

	quoteTextIntervalId = setInterval(startTspanAnimation, textCharAddFrequency);

	function startTspanAnimation() {
		tspan.style.display = "unset";
		tspan = tspan.nextSibling;
		if(!tspan) {
			clearInterval(quoteTextIntervalId);
			startAuthorAnimations();
		}
	}

}

function startAuthorAnimations() {
	authorTxt.classList.add("hidden", "animated");
	console.log("STARTING ANIMATIONS on", authorTxt);

	// first one is tspan.accum, skip it
	let tspan = authorTxt.children[1];
	// immediate animation of first character
	tspan.style.display = "unset";

	quoteAuthorIntervalId = setInterval(startTspanAnimation, authorCharAddFrequency);

	function startTspanAnimation() {
		// tspan.style.display = "unset";
		tspan = tspan.nextSibling;

		if(tspan) tspan.style.display = "unset";
		else clearInterval(quoteAuthorIntervalId);
	}

}




function fillQuoteText() {
	quoteTextBeingFilled = true;
	getQuote.classList.add("on");
	dynamicTxt.classList.add("dynamic");

	outputTspans(inputStr, addToDynamicTxt, doneWithTextTspans);
}

function onQuoteTextFilled() {
	quoteTextBeingFilled = false;
}

function onQuoteFilled() {
	quoteFilled = true;
	quoteBeingFilled = false;
	getQuote.classList.remove("on");
}

function fillQuoteTextImmediately() {
	clearInterval(quoteTextIntervalId);
	dynamicTxt.classList.remove("animated", "hidden", "dynamic");
	onQuoteTextFilled();
}

function fillQuoteAuthor() {
	quoteAuthorBeingFilled = true;
	authorTxt.classList.add("dynamic");
	outputTspans(author, addToAuthorTxt, doneWithAuthorTspans);
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


function fillQuote() {
	if(quoteBeingFilled) {
		fillQuoteTextImmediately();
		fillQuoteAuthorImmediately();
	} else {
		emptyQuote();
		quoteBeingFilled = true;
		fillQuoteText();
		fillQuoteAuthor();

		startTextAnimations();
	}
}


// const addBtn = document.getElementById("add");
const getQuote = document.getElementById("get-quote");
getQuote.onclick = fillQuote;
