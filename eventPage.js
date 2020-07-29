previus_titles = [];

function myTimer() {
	chrome.tabs.query({
		audible: true
	}, function(tabs) {
		var list = []
		tabs.forEach(element => list.push(element.title));


		var is_same = previus_titles.filter(x => !list.includes(x)).concat(list.filter(x => !previus_titles.includes(x))).length == 0

		if (!is_same) {
			console.log('Audio changed!')

			previus_titles = list

			$.ajax({
				type: 'POST',
				url: 'http://localhost:8080/',
				data: {
					'titles': JSON.stringify(list)
				}
			})
		}

		chrome.runtime.sendMessage({
			updatePopup: true,
			currently_playing: list
		});
	});
}

var interval_id;
intervalList = new Array();
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.message === "listener_on") {
			console.log("Listening playing audio!")
			interval_id = setInterval(myTimer, 1000);
			intervalList.push(interval_id);
		}
		if (request.message === "listener_off") {
			console.log("Listening disabled!")
			for (var i in intervalList) {
				clearInterval(intervalList[i]);
			}
			intervalList = new Array();
		}
	}
);


chrome.runtime.onInstalled.addListener(function() {
	chrome.storage.local.set({
		'setup_slider': true
	});
});