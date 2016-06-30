//////////////////////////////////////////////////////
// FILL QUOTE TEXT LOGIC

let dynamicTxt = document.getElementById("dynamic-output");
let staticTxt = document.getElementById("static-output");
const svgTxt = document.getElementById("svg-output");

const textCharAddFrequency = 120, initialSpaceWidthShift = -11;
let quoteTextIntervalId,  quoteTextBeingFilled = false;

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

function resizeSvgTxtToFit() {
	svgTxt.style.height = staticTxt.getBBox().height + dynamicTxt.getBBox().height + 12 + "px";
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

function doneWithTextTspans(lastOne) {
	lastTextTspan = lastOne;
	resizeSvgTxtToFit();
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

function fillQuoteText() {
	quoteTextBeingFilled = true;
	dynamicTxt.classList.add("dynamic");

	outputTspans(inputStr, addToDynamicTxt, doneWithTextTspans);
}

function onQuoteTextFilled() {
	quoteTextBeingFilled = false;
}

function fillQuoteTextImmediately() {
	clearInterval(quoteTextIntervalId);
	dynamicTxt.classList.remove("animated", "hidden", "dynamic");
	onQuoteTextFilled();
}
