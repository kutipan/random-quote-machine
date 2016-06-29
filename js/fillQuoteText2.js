let outputTxt = document.getElementById("output");
let staticTxt = document.getElementById("static-output");
let svgOut = document.getElementById("svg-output");

const inputStr = "I have come to believe that the whole world is an enigma, a harmless enigma that is made terrible by our own mad attempt to interpret it as though it had an underlying truth.";
const svgNS = "http://www.w3.org/2000/svg";

const charAddFrequency = 180;
let quoteTextIntervalId, quoteFilled = false, quoteTextBeingFilled = false, quoteBeingFilled = false, quoteTextInterval;

function outputTspans(str, freq=100, cb, done) {
	str = str.replace(/\n+\s*/g, "\n").trim();
	const len = str.length;
	if(len === 0) return;

	// quoteTextIntervalId = setInterval(produceOneTspan, freq);
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
		if(ind === len) {
			// clearInterval(quoteTextIntervalId);
			if(done) done(tspan);
		}
	}

	// function produceOneTspan() {
	// 	const tspan = document.createElementNS(svgNS, "tspan");
	// 	let ch = str.charAt(ind++);
	// 	if(ch === " " || ch === "\n" && ind < len-1) {
	// 		let nextCh =str.charAt(ind++);
	// 		if(nextCh === " " || nextCh === "\n" && ind < len - 1) nextCh += str.charAt(ind++);
	//
	// 		ch += nextCh;
	// 	}
	// 	tspan.textContent = ch;
	// 	cb(tspan);
	// 	if(ind === len) {
	// 		// clearInterval(quoteTextIntervalId);
	// 		if(done) done(tspan);
	// 	}
	// }
}

let lastTspan, wordStartTspan, spaceWidthShift, svgWidth = svgOut.getBoundingClientRect().width;
function addToOutput(tspan) {
	const firstChar = tspan.textContent.charAt(0);
	const secondChar = tspan.textContent.charAt(1);
	//console.log("char", firstChar, "code", firstChar.codePointAt(0));
	if(firstChar === " ") {
		wordStartTspan = tspan;
	}
	if(firstChar === "\n" || secondChar === "\n") {
		console.log("line feed");
		tspan.setAttribute("x", secondChar !== "\n" && secondChar !== " " ? 0 : spaceWidthShift || -11);
		tspan.setAttribute("dy", "1em");
		//tspan.textContent = tspan.textContent.replace("\n", "");
		console.log(outputTxt.children);
		console.log(tspan, "second", tspan === outputTxt.children[1]);
		tspan.firstInLine = true;
	}
	//console.log("before", outputTxt.clientWidth);
	outputTxt.appendChild(tspan);
	if(!spaceWidthShift && wordStartTspan ) {
		//spaceWidthShift || (spaceWidthShift = -wordStartTspan.getSubStringLength(0,1))
		try {
			spaceWidthShift = -Math.round(wordStartTspan.getStartPositionOfChar(1).x - wordStartTspan.getStartPositionOfChar(0).x);
			console.log("SPACEw",wordStartTspan.getStartPositionOfChar(1).x - wordStartTspan.getStartPositionOfChar(0).x);
		} catch(e) {
			console.log("Error", e.message);
		}
	}
	//console.log("after", outputTxt.clientWidth);
	if(outputTxt.getBoundingClientRect().width + (spaceWidthShift || -11)/3 > svgWidth) {
		console.log("\\n");
		//console.log("svgWidth", svgWidth, ", rect width", outputTxt.getBoundingClientRect().width, ", rect width--", outputTxt.getBoundingClientRect().width + (spaceWidthShift || -11));
		console.log("wst", wordStartTspan);
		wordStartTspan.setAttribute("x", spaceWidthShift || -11);
		wordStartTspan.setAttribute("dy", "1em");
		wordStartTspan.firstInLine = true;
	}
}

function resizeSvgOutToFit() {
	svgOut.style.height = staticTxt.getBBox().height + outputTxt.getBBox().height + 12 + "px";
}


outputTxt.addEventListener("animationend", onAnimationEnd);
let accum = document.querySelector("tspan.accum");
let accumWordStart, finishedBefore = false;
function onAnimationEnd({target}) {
	//console.log("anim end:", target);
	if(target.tagName === "tspan") {
		console.log("anim end:", target.textContent, target.textContent.includes("\n"),target.textContent.length);
		//if(target.textContent.includes("\n")) return;

		// if(target.textContent.charAt(0) === " ") {
		// 	accumWordStart = accum.textContent.length;
		// }
		console.log("newline", target.dy.baseVal.length > 0);
		//console.log("LL", accum.getComputedTextLength(), "of", accum.textContent);

		if(target.firstInLine) {
			//console.log("LL", accum.getComputedTextLength(), "of", accum.textContent);
			//target.textContent = target.textContent.replace("\n", "");
			placeIntoStatic();
			accum = target;
			accum.classList.add("accum");
			accum.setAttribute("x", 0);

		} else {
			accum.textContent += target.textContent;
			//target.textContent = "";
			target.remove();
		}

		// if(outputTxt.getBoundingClientRect().width + (spaceWidthShift || -11)/3 > svgWidth) {
		// 	console.log("break on", accumWordStart || (accum.getNumberOfChars()-1));
		// 	const lastWord = accum.textContent.slice(accumWordStart || (accum.getNumberOfChars()-1));
		// 	accumWordStart = null;
		// 	const nextAccum = document.createElementNS(svgNS, "tspan");
		// 	nextAccum.classList.add("accum");
		// 	nextAccum.textContent = lastWord;
		// 	nextAccum.setAttribute("x", 0);
		// 	nextAccum.setAttribute("dy", "1em");
		//
		// 	accum.textContent = accum.textContent.slice(0, -lastWord.length);
		//
		// 	outputTxt.insertBefore(nextAccum, accum.nextSibling);
		// 	//accum.insertAdjacentElement("afterend", nextAccum);	// to same effect
		// 	//console.log("STATIC", accum.textContent);
		// 	placeIntoStatic();
		// 	accum = nextAccum;
		//
		// 	const nextSib = findNextSiblingWithDy(nextAccum);
		//
		// 	if(nextSib) {
		// 		nextSib.removeAttribute("dy");
		// 		nextSib.removeAttribute("x");
		// 		console.log("NEXT", nextSib);
		// 	}
		//
		// }

		if(target === lastTspan && outputTxt.hasChildNodes()) {
			lastTspan = null;
			placeIntoStatic();
			accum = document.createElementNS(svgNS, "tspan");
			accum.classList.add("accum");
			//accum.setAttribute("dy", "1em");
			if(staticTxt.hasChildNodes()) outputTxt.setAttribute("y", staticTxt.childElementCount + 1 + "em");
			outputTxt.appendChild(accum);
			finishedBefore = true;
			console.log("outputTxt EMPTIED");
			onQuoteTextFilled();
		}

	}
}

function findNextSiblingWithDy(tspan) {
	let nextSib = tspan.nextSibling;
	console.log("searching next sibling");
	while(nextSib) {
		if(nextSib.dy.baseVal.length > 0) {
			return nextSib.lf ? null : nextSib;
		}
		nextSib = nextSib.nextSibling;
	}

	return null;
}

function placeIntoStatic() {
	const firstChar = accum.textContent.charAt(0);
	const secondChar = accum.textContent.charAt(1);
	accum.setAttribute("x", firstChar === " " || (firstChar === "\n" && secondChar === " ") ? spaceWidthShift || -11 : 0);
	if(finishedBefore && staticTxt.hasChildNodes()) {
		finishedBefore = false;
		accum.setAttribute("dy", "1em");
	}
	console.log("after accum", accum.nextSibling);
	staticTxt.appendChild(accum);
	console.log("STATIC", accum);
	console.log("STATIC children", staticTxt.childElementCount);
	//const y = parseInt(outputTxt.getAttribute("y"), 10);
	console.log("y", outputTxt.y.baseVal.length > 0 ? outputTxt.y.baseVal[0] : null);
	outputTxt.setAttribute("y", staticTxt.childElementCount + "em");
	console.log("y", outputTxt.y.baseVal.length > 0 ? outputTxt.y.baseVal[0] : null);
}


// const clearOutBtn = document.getElementById("clear-output");
function emptyTextOutput() {
	const clone = staticTxt.cloneNode(false);

	svgOut.replaceChild(clone, staticTxt);
	staticTxt = clone;
	outputTxt.setAttribute("y", "1em");
	//svgOut.removeChild(svgOut.firstChild);
}

// function recalcSvgWidth() {
// 	console.log("re-width");
// 	svgWidth = svgOut.getBoundingClientRect().width;
// }
// let timeoutId;
// window.addEventListener("resize", function() {
// 	clearTimeout(timeoutId);
// 	timeoutId = setTimeout(recalcSvgWidth, 100);
// });


// const addBtn = document.getElementById("add");
const getQuote = document.getElementById("get-quote");
getQuote.onclick = fillQuoteText;
// addBtn.onclick = function() {
// 	outputTspans(input.value, charAddFrequency, addToOutput, doneWithTspans);
// };

function doneWithTspans(lastOne) {
	console.log("lastTspan", lastOne);
	lastTspan = lastOne;
	resizeSvgOutToFit();

	startAnimations();
}

function startAnimations() {
	outputTxt.classList.add("hidden", "animated");
	console.log("STARTING ANIMATIONS");

	let tspan = outputTxt.children[1];

	quoteTextIntervalId = setInterval(startTspanAnimation, charAddFrequency);

	function startTspanAnimation() {
		tspan.style.display = "unset";
		tspan = tspan.nextSibling;
		if(!tspan) {
			clearInterval(quoteTextIntervalId);
		}
	}

}


function fillQuoteText() {
	quoteTextBeingFilled = quoteBeingFilled = true;
	// $output.text("");
	getQuote.classList.add("on");
	//const str = input.value;
	// to be done in 7sec
	// const freq = 5000/inputStr.length;
	// console.log("freq", freq);

	outputTspans(inputStr, charAddFrequency, addToOutput, doneWithTspans);
}

function onQuoteTextFilled() {
	quoteTextBeingFilled = false;

	// REMOVE later
	onQuoteFilled();
}

// call after #quote-text and #quote-author are finished
function onQuoteFilled() {
	quoteFilled = true;
	quoteBeingFilled = false;
	getQuote.classList.remove("on");
}

function fillQuoteTextImmediately() {
	clearInterval(quoteTextInterval);
	// $output.text(inputStr);
	// onQuoteTextFilled();
	onQuoteFilled();
}


// $getQuote.click(function () {
// 	if(quoteBeingFilled) {
// 		fillQuoteTextImmediately();
// 	} else {
// 		fillQuoteText();
// 	}
// });
