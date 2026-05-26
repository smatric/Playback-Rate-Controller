const DEFAULTS = {
    layout: '2rows',
    speeds: [0.5, 1.0, 1.5, 0.8, 2.0, 0.9, 2.5],
}

const LAYOUT_ROWS = { '1row': 1, '2rows': 2, '3rows': 3 }
const ROW_HEIGHT = 42 // px
const ROW_GAP = 6    // px — must match .speed-grid gap in CSS

let state = { layout: DEFAULTS.layout, speeds: [...DEFAULTS.speeds] }

// Returns button position definitions for a given layout.
// Speeds array index mapping:
//   0=L1  1=C  2=R1  3=L2  4=R2  5=L3  6=R3
function getButtonDefs(layout) {
    const rows = LAYOUT_ROWS[layout]
    const defs = [
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

function buildPreviewHTML(layout) {
    const rows = LAYOUT_ROWS[layout]
    const defs = getButtonDefs(layout)
    const blocks = defs.map(function (d) {
        var rowVal = d.rowSpan > 1 ? (d.row + ' / span ' + d.rowSpan) : d.row
        return '<div class="preview-block" style="grid-column:' + d.col + ';grid-row:' + rowVal + '"></div>'
    }).join('')
    return '<div class="preview-grid" style="grid-template-rows:repeat(' + rows + ',14px)">' + blocks + '</div>'
}

function renderLayoutCards() {
    var container = document.getElementById('layout-cards')
    var options = [
        { value: '1row',  label: '1 row'  },
        { value: '2rows', label: '2 rows' },
        { value: '3rows', label: '3 rows' },
    ]
    container.innerHTML = options.map(function (o) {
        return '<label class="layout-card">' +
            '<input type="radio" name="layout" value="' + o.value + '"' + (state.layout === o.value ? ' checked' : '') + '>' +
            buildPreviewHTML(o.value) +
            '<span class="layout-card-label">' + o.label + '</span>' +
            '</label>'
    }).join('')

    container.querySelectorAll('input[name="layout"]').forEach(function (radio) {
        radio.addEventListener('change', function () {
            state.layout = radio.value
            renderSpeedGrid()
            save()
        })
    })
}

function renderSpeedGrid() {
    var container = document.getElementById('speed-grid')
    var rows = LAYOUT_ROWS[state.layout]
    var defs = getButtonDefs(state.layout)

    container.style.gridTemplateRows = 'repeat(' + rows + ', ' + ROW_HEIGHT + 'px)'
    container.innerHTML = ''

    defs.forEach(function (def) {
        var cellHeight = ROW_HEIGHT * def.rowSpan + ROW_GAP * (def.rowSpan - 1)

        var cell = document.createElement('div')
        cell.className = 'speed-cell'
        cell.style.gridColumn = def.col
        cell.style.gridRow = def.rowSpan > 1 ? (def.row + ' / span ' + def.rowSpan) : def.row
        cell.style.height = cellHeight + 'px'

        var input = document.createElement('input')
        input.type = 'number'
        input.className = 'speed-input' + (def.isCenter ? ' speed-input--center' : '')
        input.value = state.speeds[def.index]
        input.min = 0.1
        input.max = 16
        input.step = 0.1

        input.addEventListener('change', function () {
            var raw = parseFloat(input.value)
            if (!isNaN(raw) && raw >= 0.1 && raw <= 16) {
                state.speeds[def.index] = Math.round(raw * 10) / 10
            }
            input.value = state.speeds[def.index]
            save()
        })

        cell.appendChild(input)
        container.appendChild(cell)
    })
}

var savedTimer = null
function save() {
    chrome.storage.sync.set({ layout: state.layout, speeds: state.speeds })
    var el = document.getElementById('save-status')
    el.classList.add('visible')
    clearTimeout(savedTimer)
    savedTimer = setTimeout(function () { el.classList.remove('visible') }, 1500)
}

function loadAndRender() {
    chrome.storage.sync.get(DEFAULTS, function (data) {
        state = { layout: data.layout, speeds: data.speeds.slice() }
        renderLayoutCards()
        renderSpeedGrid()
    })
}

document.addEventListener('DOMContentLoaded', function () {
    loadAndRender()
    document.getElementById('reset-btn').addEventListener('click', function () {
        state = { layout: DEFAULTS.layout, speeds: DEFAULTS.speeds.slice() }
        renderLayoutCards()
        renderSpeedGrid()
        save()
    })
})
