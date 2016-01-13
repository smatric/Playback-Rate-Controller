function getVideoElements() {
    return [].slice.call(document.getElementsByTagName('video'));
}

function getAudioElements() {
    return [].slice.call(document.getElementsByTagName('audio'));
}

function summary(sendResponse) {
    var videos = getVideoElements();
    var audios = getAudioElements();
    var playbackRates = [];
    var pauseStates = [];
    var types = [];

    videos.forEach(function(video) {
        playbackRates.push(video.playbackRate);
        pauseStates.push(video.paused);
        types.push('video');
    });

    audios.forEach(function(audios) {
        playbackRates.push(audios.playbackRate);
        pauseStates.push(audios.paused);
        types.push('audio');
    });

    sendResponse({ status: "success", numOfVideos: videos.length, playbackRates: playbackRates, pauseStates: pauseStates, types: types });
}

function setPlaybackRate(request, sendResponse) {
    var videos = getVideoElements();
    var audios = getAudioElements();

    if (request.itemPos < videos.length) {
        videos[request.itemPos].playbackRate = request.newPlaybackRate;
    }
    else {
        audios[request.itemPos - videos.length].playbackRate = request.newPlaybackRate;
    }

    sendResponse({ status: "success" });
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === 'prc-get-summary') {
        summary(sendResponse);
    }
    else if (request.type === 'prc-set-playback-rate') {
        setPlaybackRate(request, sendResponse);
    }
});