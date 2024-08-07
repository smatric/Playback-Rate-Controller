function getVideoElements() {
    return [].slice.call(document.getElementsByTagName('video'))
}

function getAudioElements() {
    return [].slice.call(document.getElementsByTagName('audio'))
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
