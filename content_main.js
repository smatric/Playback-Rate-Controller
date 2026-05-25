function getMediaElements(tagName, root) {
    root = root || document
    var results = [].slice.call(root.querySelectorAll(tagName))
    var all = root.querySelectorAll('*')
    for (var i = 0; i < all.length; i++) {
        if (all[i].shadowRoot) {
            results = results.concat(getMediaElements(tagName, all[i].shadowRoot))
        }
    }
    return results
}

function getVideoElements() {
    return getMediaElements('video')
}

function getAudioElements() {
    return getMediaElements('audio')
}

function summary(sendResponse) {
    var videos = getVideoElements()
    var audios = getAudioElements()
    var playbackRate = null

    if (videos.length > 0) {
        playbackRate = videos[0].playbackRate
    } else if (audios.length > 0) {
        playbackRate = audios[0].playbackRate
    }

    if (playbackRate !== null) {
        sendResponse({
            status: "success",
            playbackRate: playbackRate,
        })
    }
}

function setElementPlaybackRate(el, newPlaybackRate) {
    el.playbackRate = newPlaybackRate
}

function setPlaybackRate(request, sendResponse) {
    var videos = getVideoElements()
    var audios = getAudioElements()
    var newPlaybackRate = request.newPlaybackRate

    videos.forEach(function (video) {
        setElementPlaybackRate(video, newPlaybackRate)
    })

    audios.forEach(function (audio) {
        setElementPlaybackRate(audio, newPlaybackRate)
    })

    summary(sendResponse)
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === 'prc-get-summary') {
        summary(sendResponse)
    } else if (request.type === 'prc-set-playback-rate') {
        setPlaybackRate(request, sendResponse)
    }
})
