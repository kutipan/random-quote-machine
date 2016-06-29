// const $output = $("#quote-text");
// const $getQuote = $("#get-quote");
//
// let quoteFilled = false, quoteTextBeingFilled = false, quoteBeingFilled = false, quoteTextInterval;
// const charInputFrequency = 35;
//
// function outputByChar(str, freq=100, cb, done) {
// 	const len = str.length;
// 	if(len === 0) return;
// 	let ind = 0;
//
// 	quoteTextInterval = setInterval(produceChar, freq);
//
// 	function produceChar() {
// 		cb(str[ind++]);
// 		if(ind === len) {
// 			clearInterval(quoteTextInterval);
// 			if(done) done();
// 		}
// 	}
// }
//
// function addToOutput(s) {
// 	$output.text($output.text() + s);
// }
//
// const inputStr = "I have come to believe that the whole world is an enigma, a harmless enigma that is made terrible by our own mad attempt to interpret it as though it had an underlying truth.";
//
// function fillQuoteText() {
// 	quoteTextBeingFilled = quoteBeingFilled = true;
// 	$output.text("");
// 	$getQuote.addClass("on");
// 	//const str = input.value;
// 	// to be done in 7sec
// 	// const freq = 5000/inputStr.length;
// 	// console.log("freq", freq);
//
// 	outputByChar(inputStr, charInputFrequency, addToOutput, onQuoteFilled);
// }
//
// function onQuoteTextFilled() {
// 	quoteTextBeingFilled = false;
// }
//
// // call after #quote-text and #quote-author are finished
// function onQuoteFilled() {
// 	quoteFilled = true;
// 	quoteBeingFilled = false;
// 	$getQuote.removeClass("on");
// }
//
// function fillQuoteTextImmediately() {
// 	clearInterval(quoteTextInterval);
// 	$output.text(inputStr);
// 	// onQuoteTextFilled();
// 	onQuoteFilled();
// }
//
//
// $getQuote.click(function () {
// 	if(quoteBeingFilled) {
// 		fillQuoteTextImmediately();
// 	} else {
// 		fillQuoteText();
// 	}
// });
