previous_titles = [];

function myTimer() {
  chrome.tabs.query({audible: true}, function(tabs) {
    var list = []
    tabs.forEach(element => list.push(element.title))
    list.sort()
    if (!arrayEquals(list, previous_titles)) {
      console.log(`Audio changed: [${previous_titles.join(', ')}] to [${
          list.join(', ')}]`)
      previous_titles = list
      $.ajax({
        type: 'POST',
        url: 'http://localhost:8080/',
        data: {'titles': list}
      });
    }
    chrome.runtime.sendMessage({currently_playing: list});
  });
}

timer = null;

chrome.runtime.onMessage.addListener(function(request) {
  if (request.message === 'listener_on') {
    if (timer) {
      return;
    }

    console.log('Started tracking the audio!')
    myTimer();
    timer = setInterval(myTimer, 1000);
  }

  if (request.message === 'listener_off') {
    if (!timer) {
      return;
    }

    console.log('Stopped tracking the audio!')
    clearInterval(timer);
    timer = null;
  }
});
