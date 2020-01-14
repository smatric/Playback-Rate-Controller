const MAX_PLAYBACK_RATE = 16.0
const MIN_PLAYBACK_RATE = 0.1
const SHOW_DECIMAL_PLACES = 1
const CSS_CLASS_HIDDEN = 'hidden'

const PLAYBACK_STEPS = {
    0: 0.1,
    1.9: 0.2,
    2.9: 0.5,
    4.9: 1,
    9.9: 2,
}
const PLAYBACK_THRESHOLDS = Object.keys(PLAYBACK_STEPS).map(Number).sort((a,b) => a-b)

let playbackRate = null

function reset() {
    playbackRate = null
}

function showEl(el) {
    el.classList.remove(CSS_CLASS_HIDDEN)
}

function hideEl(el) {
    el.classList.add(CSS_CLASS_HIDDEN)
}

function showContent() {
    var messageEl = document.getElementById('prc-popup-no-content')
    var contentEl = document.getElementById('prc-popup-content')

    hideEl(messageEl)
    showEl(contentEl)
}

function showNoContentMessage() {
    var messageEl = document.getElementById('prc-popup-no-content')
    var contentEl = document.getElementById('prc-popup-content')

    showEl(messageEl)
    hideEl(contentEl)
}

function renderRate() {
    document.getElementById('prc-rate').innerHTML = formatRate(playbackRate)
}

function setSRateSlider() {
    document.getElementById('prc-rate-slider').value = playbackRate
}

function formatRate(rate) {
    return rate.toFixed(SHOW_DECIMAL_PLACES) + 'x'
}

function addCallbacks() {
    document.getElementById('prc-slower').addEventListener('click', slower)
    document.getElementById('prc-faster').addEventListener('click', faster)
    document.getElementById('prc-rate-05').addEventListener('click', () => setPlaybackRate(0.5))
    document.getElementById('prc-rate-08').addEventListener('click', () => setPlaybackRate(0.8))
    document.getElementById('prc-rate-1').addEventListener('click', () => setPlaybackRate(1.0))
    document.getElementById('prc-rate-15').addEventListener('click', () => setPlaybackRate(1.5))
    document.getElementById('prc-rate-2').addEventListener('click', () => setPlaybackRate(2.0))
    document.getElementById('prc-rate-slider').addEventListener('input', e => setPlaybackRate(e.target.value))
}

function updatePlaybackRate() {
    chrome.tabs.getSelected(null, function(tab) {
        const options = {
            type: "prc-set-playback-rate",
            newPlaybackRate: playbackRate,
        }

        chrome.tabs.sendMessage(tab.id, options, function(response) {
            if (response.status === 'success') {
                playbackRate = response.playbackRate
                renderRate()
                setSRateSlider()
            }
        });
    });
}

function getPaybackRateStep() {
    return PLAYBACK_STEPS[PLAYBACK_THRESHOLDS.find((_, i, arr) =>
        playbackRate >= arr[i] && (i+1 === arr.length || playbackRate <= arr[i+1])
    )]
}

function faster() {
    if (playbackRate >= MAX_PLAYBACK_RATE) return

    playbackRate = Math.round((playbackRate + getPaybackRateStep()) * 10) / 10.0
    updatePlaybackRate()
}

function slower() {
    if (playbackRate <= MIN_PLAYBACK_RATE) return

    playbackRate = Math.round((playbackRate - getPaybackRateStep()) * 10) / 10.0
    updatePlaybackRate()
}

function setPlaybackRate(newPlaybackRate) {
    playbackRate = newPlaybackRate
    updatePlaybackRate()
}

function checkForPlaybackResources() {
    reset()
    showNoContentMessage()

    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendMessage(tab.id, { type: "prc-get-summary" }, function(response) {
            if (response && response.status === 'success') {
                playbackRate = response.playbackRate
                showContent()
                renderRate()
                setSRateSlider()
            }
        })
    })
}

function init() {
    checkForPlaybackResources()
    addCallbacks()
}


document.addEventListener('DOMContentLoaded', init)
