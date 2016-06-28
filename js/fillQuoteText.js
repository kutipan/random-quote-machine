const $output = $("#quote-text");
const $getQuote = $("#get-quote");

function outputByChar(str, freq=100, cb, done) {
	const len = str.length;
	if(len === 0) return;
	let ind = 0;

	const intervalId = setInterval(produceChar, freq);

	function produceChar() {
		cb(str[ind++]);
		if(ind === len) {
			clearInterval(intervalId);
			if(done) done();
		}
	}
}

function addToOutput(s) {
	$output.text($output.text() + s);
}

const inputStr = "I have come to believe that the whole world is an enigma, a harmless enigma that is made terrible by our own mad attempt to interpret it as though it had an underlying truth.";

function fillQuoteText() {
	$output.text("");
	//const str = input.value;
	// to be done in 7sec
	// const freq = 5000/inputStr.length;
	// console.log("freq", freq);

	outputByChar(inputStr, 29, addToOutput, console.log.bind(console, "DONE"));
}

function fillQuoteTextImmediately() {
	$output.text(inputStr);
}


$getQuote.click(fillQuoteText);
