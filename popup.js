var audioListener = {

    onHandler: function(e) {
        var text_span = document.getElementById('text_span')
        text_span.innerText = "Loading..."

        chrome.runtime.sendMessage({
            message: "listener_on"
        })
        document.getElementById("switcher").checked = true
        // window.close()
    },

    offHandler: function(e) {
        chrome.runtime.sendMessage({
            message: "listener_off"
        })
        document.getElementById("switcher").checked = false
        var audio_titles_div = document.getElementById('music_titles_block')
        removeAllChildNodes(audio_titles_div)

        var text_span = document.getElementById('text_span')
        text_span.innerText = "App is off!"
        // window.close()
    },


    changeHandler: function(e) {
        var switchState = document.getElementById("switcher").checked

        chrome.storage.local.set({
            'slider_value': switchState
        })

        if (switchState) {
            audioListener.onHandler()
        } else {
            audioListener.offHandler()
        }
    },

    setup: function() {
        chrome.storage.local.get('setup_slider', function(result) {

            var switcher = document.getElementById("switcher")

            var text_span = document.createElement("SPAN")
            text_span.id = 'text_span'
            text_span.className = "status_text"

            if (result.setup_slider) {
                document.getElementById("switcher").checked = false
                chrome.storage.local.set({
                    'setup_slider': false,
                    'slider_value': false
                })
                text_span.innerText = "Please turn on the app!"
            } else {
                chrome.storage.local.get('slider_value', function(result) {
                    document.getElementById("switcher").checked = result.slider_value
                    if (!result.slider_value) {
                        text_span.innerText = "Please turn on the app!"
                    } else {
                        text_span.innerText = "Loading..."
                    }
                })
            }

            document.getElementById("text_status_block").appendChild(text_span)

            switcher.addEventListener('change', audioListener.changeHandler)
        })
    }
}

document.addEventListener('DOMContentLoaded', function() {
    audioListener.setup()
})


function removeAllChildNodes(parent) {
    if (parent.childNodes.length) {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild)
        }
    }
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {

    if (message.updatePopup) {
        var text_span = document.getElementById('text_span')

        var audio_titles_div = document.getElementById('music_titles_block')
        removeAllChildNodes(audio_titles_div)


        if (message.currently_playing.length > 0) {
            text_span.innerText = "Currently playing:"

            var i
            for (i = 0; i < message.currently_playing.length; i++) {
                var text_area = document.createElement("TEXTAREA")

                text_area.id = "title_id" + i
                text_area.className = "area-control"
                text_area.cols = 30
                text_area.rows = Math.ceil(message.currently_playing[i].length / 30)
                text_area.value = message.currently_playing[i]
                text_area.readOnly = true
                text_area.title = "Click to copy!"

                audio_titles_div.appendChild(text_area)
            }
            $(".area-control").on("click", function() {
                $('#' + this.id).select()
                document.execCommand('copy')
            })
        } else {
            text_span.innerText = "Nothing is playing now!"
        }
    }
})