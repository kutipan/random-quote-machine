let dynamicTxt = document.getElementById("dynamic-output");
let staticTxt = document.getElementById("static-output");
const svgTxt = document.getElementById("svg-output");

const svgAuthor = document.getElementById("svg-author");
let authorTxt = document.getElementById("author");

const inputStr = "I have come to believe that the whole world is an enigma, a harmless enigma that is made terrible by our own mad attempt to interpret it as though it had an underlying truth.", author = "Umberto Eco";
const svgNS = "http://www.w3.org/2000/svg";

const charAddFrequency = 180, initialSpaceWidthShift = -11;
let quoteTextIntervalId, quoteAuthorIntervalId, quoteIntervalId, quoteFilled = false, quoteTextBeingFilled = false, quoteBeingFilled = false, quoteAuthorBeingFilled = false, interrupted = false;

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
	//console.log("char", firstChar, "code", firstChar.codePointAt(0));
	if(firstChar === " ") {
		wordStartTspan = tspan;
	}
	if(firstChar === "\n" || secondChar === "\n") {
		// console.log("line feed");
		tspan.setAttribute("x", secondChar !== "\n" && secondChar !== " " ? 0 : spaceWidthShift || initialSpaceWidthShift);
		tspan.setAttribute("dy", "1em");
		//tspan.textContent = tspan.textContent.replace("\n", "");
		// console.log(dynamicTxt.children);
		// console.log(tspan, "second", tspan === dynamicTxt.children[1]);
		tspan.firstInLine = true;
	}
	//console.log("before", dynamicTxt.clientWidth);
	dynamicTxt.appendChild(tspan);
	if(!spaceWidthShift && wordStartTspan ) {
		//spaceWidthShift || (spaceWidthShift = -wordStartTspan.getSubStringLength(0,1))
		try {
			spaceWidthShift = -Math.round(wordStartTspan.getStartPositionOfChar(1).x - wordStartTspan.getStartPositionOfChar(0).x);
			console.log("SPACEw",wordStartTspan.getStartPositionOfChar(1).x - wordStartTspan.getStartPositionOfChar(0).x);
		} catch(e) {
			console.log("Error", e.message);
		}
	}
	//console.log("after", dynamicTxt.clientWidth);
	if(dynamicTxt.getBoundingClientRect().width + (spaceWidthShift || initialSpaceWidthShift)/3 > svgWidth) {
		// console.log("\\n");
		//console.log("svgWidth", svgWidth, ", rect width", dynamicTxt.getBoundingClientRect().width, ", rect width--", dynamicTxt.getBoundingClientRect().width + (spaceWidthShift || initialSpaceWidthShift));
		// console.log("wst", wordStartTspan);
		wordStartTspan.setAttribute("x", spaceWidthShift || initialSpaceWidthShift);
		wordStartTspan.setAttribute("dy", "1em");
		wordStartTspan.firstInLine = true;
	}

	// console.log("added", tspan);
}

let lastAuthorTspan;
function addToAuthorTxt(tspan) {
	console.log("adding", tspan);
	authorTxt.appendChild(tspan);
}

function resizeSvgTxtToFit() {
	console.log("resizing Text to", staticTxt.getBBox().height, "+", dynamicTxt.getBBox().height, "+ 12px = ", staticTxt.getBBox().height + dynamicTxt.getBBox().height + 12 + "px");
	svgTxt.style.height = staticTxt.getBBox().height + dynamicTxt.getBBox().height + 12 + "px";
}

function resizeSvgAuthorToFit() {
	console.log("resizing Author to", authorTxt.getBBox().width + 5, "px");
	svgAuthor.style.width = authorTxt.getBBox().width + 5 + "px";
}


// dynamicTxt.addEventListener("animationend", onTextAnimationEnd);
let accumTxt = dynamicTxt.querySelector("tspan.accum");
let finishedBefore = false;
function onTextAnimationEnd({target}) {
	//console.log("anim end:", target);
	if(target.tagName === "tspan") {
		// console.log("anim end:", target.textContent, target.textContent.includes("\n"),target.textContent.length);
		//if(target.textContent.includes("\n")) return;

		// if(target.textContent.charAt(0) === " ") {
		// 	accumWordStart = accumTxt.textContent.length;
		// }
		// console.log("newline", target.dy.baseVal.length > 0);
		//console.log("LL", accumTxt.getComputedTextLength(), "of", accumTxt.textContent);

		if(target.firstInLine) {
			//console.log("LL", accumTxt.getComputedTextLength(), "of", accumTxt.textContent);
			//target.textContent = target.textContent.replace("\n", "");
			placeIntoStatic();
			accumTxt = target;
			accumTxt.classList.add("accum");
			accumTxt.setAttribute("x", 0);

		} else {
			accumTxt.textContent += target.textContent;
			//target.textContent = "";
			target.remove();
		}

		if(target === lastTextTspan && dynamicTxt.hasChildNodes()) {
			lastTextTspan = null;
			placeIntoStatic();
			accumTxt = document.createElementNS(svgNS, "tspan");
			accumTxt.classList.add("accum");
			//accumTxt.setAttribute("dy", "1em");
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
	// console.log("after accumTxt", accumTxt.nextSibling);
	staticTxt.appendChild(accumTxt);
	// console.log("STATIC", accumTxt);
	// console.log("STATIC children", staticTxt.childElementCount);
	//const y = parseInt(dynamicTxt.getAttribute("y"), 10);
	// console.log("y", dynamicTxt.y.baseVal.length > 0 ? dynamicTxt.y.baseVal[0] : null);
	dynamicTxt.setAttribute("y", staticTxt.childElementCount + "em");
	// console.log("y", dynamicTxt.y.baseVal.length > 0 ? dynamicTxt.y.baseVal[0] : null);
}

svgTxt.addEventListener("animationend", onTextAnimationEnd);

let accumAuthor = authorTxt.querySelector("tspan.accum");
function onAuthorAnimationEnd({target}) {
	// console.log("anim end:", target);
	if(target.tagName === "tspan") {
		// console.log("anim end:", target.textContent, target.textContent.length);

		accumAuthor.textContent += target.textContent;
		//target.textContent = "";
		target.remove();


		if(target === lastAuthorTspan) {
			lastAuthorTspan = null;
			console.log("authorTxt FILLED");
			onQuoteAuthorFilled();
		}

	}
}
svgAuthor.addEventListener("animationend", onAuthorAnimationEnd);


// const clearOutBtn = document.getElementById("clear-output");
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
// function recalcSvgWidth() {
// 	console.log("re-width");
// 	svgWidth = svgTxt.getBoundingClientRect().width;
// }
// let timeoutId;
// window.addEventListener("resize", function() {
// 	clearTimeout(timeoutId);
// 	timeoutId = setTimeout(recalcSvgWidth, 100);
// });



function doneWithTextTspans(lastOne) {
	// console.log("lastTextTspan", lastOne);
	lastTextTspan = lastOne;
	resizeSvgTxtToFit();

	// FIX call startAnimation only after both doneWithTextTspans and doneWithAuthorTspans
	// startTextAnimations();
	startAnimations();
}

function doneWithAuthorTspans(lastOne) {
	console.log("lastAuthorTspan", lastOne);
	lastAuthorTspan = lastOne;
	resizeSvgAuthorToFit();
}

function startTextAnimations() {
	dynamicTxt.classList.add("hidden", "animated");
	console.log("STARTING ANIMATIONS on", dynamicTxt);

	// first one is tspan.accum, skip it
	let tspan = dynamicTxt.children[1];

	quoteTextIntervalId = setInterval(startTspanAnimation, charAddFrequency);

	function startTspanAnimation() {
		tspan.style.display = "unset";
		tspan = tspan.nextSibling;
		if(!tspan) {
			clearInterval(quoteTextIntervalId);
		}
	}

}

function startAuthorAnimations() {
	authorTxt.classList.add("hidden", "animated");
	console.log("STARTING ANIMATIONS on", authorTxt);

	// first one is tspan.accum, skip it
	let tspan = authorTxt.children[1];

	quoteAuthorIntervalId = setInterval(startTspanAnimation, charAddFrequency);

	function startTspanAnimation() {
		tspan.style.display = "unset";
		tspan = tspan.nextSibling;
		if(!tspan) {
			clearInterval(quoteAuthorIntervalId);
		}
	}

}

function startAnimations() {
	dynamicTxt.classList.add("hidden", "animated");
	console.log("STARTING ANIMATIONS on", dynamicTxt);

	// first one is tspan.accum, skip it
	let tspan = dynamicTxt.children[1];

	quoteIntervalId = setInterval(startTspanAnimation, charAddFrequency);

	function startTspanAnimation() {
		// console.log("DISP", tspan);
		tspan.style.display = "unset";
		if(tspan === dynamicTxt.lastChild) {
			authorTxt.classList.add("hidden", "animated");
			console.log("STARTING ANIMATIONS on", authorTxt);
			tspan = authorTxt.firstChild;
		}
		tspan = tspan.nextSibling;
		if(!tspan) {
			clearInterval(quoteIntervalId);
		}
	}

}


function fillQuoteText() {
	quoteTextBeingFilled = true;
	// $output.text("");
	getQuote.classList.add("on");
	dynamicTxt.classList.add("dynamic");
	//const str = input.value;
	// to be done in 7sec
	// const freq = 5000/inputStr.length;
	// console.log("freq", freq);

	outputTspans(inputStr, addToDynamicTxt, doneWithTextTspans);
}

function onQuoteTextFilled() {
	quoteTextBeingFilled = false;

	// quote text filled, start with quote author
	// if(!interrupted) startAuthorAnimations();
}

// call after #quote-text and #quote-author are finished
function onQuoteFilled() {
	quoteFilled = true;
	quoteBeingFilled = false;
	getQuote.classList.remove("on");
}

function fillQuoteTextImmediately() {
	// clearInterval(quoteTextIntervalId);
	// $output.text(inputStr);
	// onQuoteTextFilled();
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
	// clearInterval(quoteAuthorIntervalId);
	authorTxt.classList.remove("animated", "hidden", "dynamic");
	onQuoteAuthorFilled();
}


function fillQuote() {
	if(quoteBeingFilled) {
		interrupted = true;
		clearInterval(quoteIntervalId);
		fillQuoteTextImmediately();
		fillQuoteAuthorImmediately();
	} else {
		emptyQuote();
		interrupted = false;
		quoteBeingFilled = true;
		fillQuoteText();
		fillQuoteAuthor();
	}
}


// const addBtn = document.getElementById("add");
const getQuote = document.getElementById("get-quote");
getQuote.onclick = fillQuote;
// addBtn.onclick = function() {
// 	outputTspans(input.value, charAddFrequency, addToDynamicTxt, doneWithTextTspans);
// };
