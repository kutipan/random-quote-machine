//////////////////////////////////////////////////////
// AJAX LOGIC

function AJAX({url, method, data, sendData, accept, responseType, timeout, headers, user, password, onload, onloadstart, onloadend, onerror, onprogress, onabort, onreadystatechange, ontimeout}) {
	const promise = new Promise( function (resolve, reject) {

		const req = new XMLHttpRequest();


		if(typeof data === "string") {
			url += data.startsWith("?") ? data : "?" + data;

		} else if(Array.isArray(data)){
			url += "?" + data.join("&");

		} else if(typeof data === "object") {
			url += "?" + Object.keys(data).reduce((previous, current, ind) =>  previous + (ind > 0 ? "&" : "" ) + encodeURIComponent(current) + "=" + encodeURIComponent(data[current]), "");

		}

		req.open(method || "GET", url, true, user, password);

		for(let key of Object.keys(headers)) {
			req.setRequestHeader(key, headers[key]);
		}

		if(accept) {
			req.setRequestHeader("Accept", Array.isArray(accept) ? accept.join(",") : accept);
		}

		if(responseType) req.responseType = responseType;
		if(timeout) req.timeout = timeout;

		req.onload = function (e) {
			if (this.status >= 200 && this.status < 300) {
				resolve(this.response);
				if(onload) onload.call(this, e);
			} else {
				reject(this.statusText);
				if(onerror) onerror.call(this, e);
			}
		};
		req.onerror = function (e) {
			reject(this.statusText);
			if(onerror) onerror.call(this, e);
		};

		Object.assign(req, {onloadstart, onloadend, onprogress, onabort, onreadystatechange, ontimeout});

		req.send(sendData);
	});

	return promise;
}

AJAX.get = function (options) {
	options.method = "GET";
	return AJAX(options);
};

AJAX.put = function (options) {
	options.method = "PUT";
	return AJAX(options);
};

AJAX.post = function (options) {
	options.method = "POST";
	return AJAX(options);
};

AJAX.delete = function (options) {
	options.method = "DELETE";
	return AJAX(options);
};
