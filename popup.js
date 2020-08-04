class AudioListener {
  constructor() {
    this.currently_playing = null;
    this.textSpan = $('#text_span');
    this.switcher = document.getElementById('switcher');
    this.switcher.addEventListener('change', () => this.changeHandler());

    chrome.runtime.onMessage.addListener(msg => this.onMessage(msg));

    chrome.storage.local.get(['already_setup', 'turned_on'], result => {
      if (result.already_setup) {
        this.switcher.checked = result.turned_on;
        if (result.turned_on) {
          this.textSpan.text('Loading...');
        }
      } else {
        chrome.storage.local.set({'already_setup': true, 'turned_on': false});
        this.switcher.checked = false;
      }
      this.changeHandler();
    });
  }

  onMessage(msg) {
    if (!this.switcher.checked ||
        arrayEquals(msg.currently_playing, this.currently_playing)) {
      return;
    }

    var audio_titles_div = $('#music_titles_block');
    audio_titles_div.children().remove();

    if (msg.currently_playing.length === 0) {
      this.currently_playing = [];
      this.textSpan.text('Nothing is playing now!');
      return;
    }

    this.textSpan.text('Currently playing:');
    msg.currently_playing.forEach(
        title => audio_titles_div.append(
            $('<textarea class=\'area-control\' cols=30 readOnly=true title=\'Click to copy!\'>')
                .attr('rows', Math.ceil(title.length / 30))
                .val(title)
                .click(function() {
                  $(this).select();
                  document.execCommand('copy');
                })));
    this.currently_playing = msg.currently_playing;
  }

  changeHandler() {
    var switchState = this.switcher.checked;
    chrome.storage.local.set({'turned_on': switchState});
    if (switchState) {
      this.textSpan.text('Loading...');
      chrome.runtime.sendMessage({message: 'listener_on'});
    } else {
      $('#music_titles_block').children().remove();
      this.textSpan.text('Turn me on \uD83D\uDE1C');
      chrome.runtime.sendMessage({message: 'listener_off'});
      this.currently_playing = null;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => new AudioListener());