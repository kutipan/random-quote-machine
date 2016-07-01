//////////////////////////////////////////////////////
// SHARE LOGIC

	document.getElementById("twit").onclick = function (e) {
		e.preventDefault();
		e.stopPropagation();

		if(!quote) return;

		if(quoteBeingFilled) {
			fillQuoteImmediately();
		}

		const width  = 575,
			height = 450,
			left   = (window.innerWidth - width)/2,
			top    = (window.innerHeight - height)/2,
			url    = `https://twitter.com/intent/tweet?hashtags=quotes&related=freecodecamp&text=${encodeURIComponent(`"${quote.quote}" ${quote.author}`)}`,
			opts   = `status=1,
								resizable=1,
								width=${width},
								height=${height},
								left=${left},
								top=${top}`;

		window.open(url, 'twitter', opts);
	};
