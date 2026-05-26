const MAX_PLAYBACK_RATE = 16.0
const MIN_PLAYBACK_RATE = 0.1
const SHOW_DECIMAL_PLACES = 1
const CSS_CLASS_HIDDEN = 'hidden'

const SETTINGS_DEFAULTS = {
    layout: '2rows',
    speeds: [0.5, 1.0, 1.5, 0.8, 2.0, 0.9, 2.5],
}

const LAYOUT_ROWS = { '1row': 1, '2rows': 2, '3rows': 3 }

const PLAYBACK_STEPS = {
    0: 0.1,
    1.9: 0.2,
    2.9: 0.5,
    4.9: 1,
    9.9: 2,
}
const PLAYBACK_THRESHOLDS = Object.keys(PLAYBACK_STEPS).map(Number).sort((a, b) => a - b)

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

function getButtonDefs(layout) {
    var rows = LAYOUT_ROWS[layout] || 2
    var defs = [
        { index: 0, col: 1, row: 1, rowSpan: 1 },
        { index: 1, col: 2, row: 1, rowSpan: rows, isCenter: true },
        { index: 2, col: 3, row: 1, rowSpan: 1 },
    ]
    if (rows >= 2) {
        defs.push({ index: 3, col: 1, row: 2, rowSpan: 1 })
        defs.push({ index: 4, col: 3, row: 2, rowSpan: 1 })
    }
    if (rows >= 3) {
        defs.push({ index: 5, col: 1, row: 3, rowSpan: 1 })
        defs.push({ index: 6, col: 3, row: 3, rowSpan: 1 })
    }
    return defs
}

function renderButtons(layout, speeds) {
    var container = document.getElementById('prc-extra-controls')
    container.innerHTML = ''

    getButtonDefs(layout).forEach(function (def) {
        var btn = document.createElement('button')
        btn.className = 'prc-control-btn prc-control-rate-btn'
        if (def.isCenter) btn.classList.add('prc-control-rate-btn--center')
        btn.textContent = speeds[def.index]
        btn.dataset.rate = speeds[def.index]
        btn.style.gridColumn = def.col
        btn.style.gridRow = def.rowSpan > 1 ? (def.row + ' / span ' + def.rowSpan) : def.row
        container.appendChild(btn)
    })
}

function loadConfig() {
    return new Promise(function (resolve) {
        chrome.storage.sync.get(SETTINGS_DEFAULTS, function (data) {
            renderButtons(data.layout, data.speeds)
            resolve()
        })
    })
}

function renderRate() {
    document.getElementById('prc-rate').innerHTML = formatRate(playbackRate)
}

function setSRateSlider() {
    document.getElementById('prc-rate-slider').value = playbackRate
}

function formatRate(rate) {
    return rate.toFixed(SHOW_DECIMAL_PLACES) + '×'
}

function formatBadge(rate) {
    return parseFloat(rate.toFixed(1)).toString()
}

function getAccentColor() {
    return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
}

function setBadge(tabId, rate) {
    const text = rate === 1 ? '' : formatBadge(rate)
    chrome.action.setBadgeText({ tabId: tabId, text: text })
    if (text) chrome.action.setBadgeBackgroundColor({ tabId: tabId, color: getAccentColor() })
}

function clearBadge(tabId) {
    chrome.action.setBadgeText({ tabId: tabId, text: '' })
}

function addCallbacks() {
    document.getElementById('prc-slower').addEventListener('click', slower)
    document.getElementById('prc-faster').addEventListener('click', faster)
    document.getElementById('prc-rate-slider').addEventListener('input', function (e) {
        setPlaybackRate(parseFloat(e.target.value))
    })

    // Single delegated handler covers all preset buttons in any layout
    document.getElementById('prc-extra-controls').addEventListener('click', function (e) {
        var btn = e.target.closest('[data-rate]')
        if (btn) setPlaybackRate(parseFloat(btn.dataset.rate))
    })
}

async function getActiveTab() {
    const currentWindow = await chrome.windows.getCurrent()
    const tabs = await chrome.tabs.query({
        active: true,
        windowId: currentWindow.id,
    })
    return tabs[0]
}

function updatePlaybackRate() {
    getActiveTab().then(tab => {
        const options = {
            type: "prc-set-playback-rate",
            newPlaybackRate: playbackRate,
        }

        chrome.tabs.sendMessage(tab.id, options, function (response) {
            if (chrome.runtime.lastError || !response) return
            if (response.status === 'success') {
                playbackRate = response.playbackRate
                renderRate()
                setSRateSlider()
                setBadge(tab.id, playbackRate)
            }
        })
    })
}

function getPaybackRateStep() {
    return PLAYBACK_STEPS[PLAYBACK_THRESHOLDS.find((_, i, arr) =>
        playbackRate >= arr[i] && (i + 1 === arr.length || playbackRate <= arr[i + 1]),
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

    getActiveTab().then(tab => {
        chrome.tabs.sendMessage(tab.id, {type: "prc-get-summary"}, function (response) {
            if (chrome.runtime.lastError || !response) {
                clearBadge(tab.id)
                return
            }
            if (response.status === 'success') {
                playbackRate = response.playbackRate
                showContent()
                renderRate()
                setSRateSlider()
                setBadge(tab.id, playbackRate)
            } else {
                clearBadge(tab.id)
            }
        })
    })
}

async function init() {
    await loadConfig()
    addCallbacks()
    checkForPlaybackResources()
}

document.addEventListener('DOMContentLoaded', init)
