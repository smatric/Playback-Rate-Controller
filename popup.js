var PRCPopup = {
    MAX_PLAYBACK_RATE: 3.0,
    MIN_PLAYBACK_RATE: 0.1,
    PLAYBACK_RATE_STEP: 0.1,
    SHOW_DECIMAL_PLACES: 1,
    CSS_CLASS_HIDDEN: 'hidden',


    playbackRates: [],
    pauseStates: [],
    types: [],

    reset: function() {
        var me = this;

        me.playbackRates = [];
        me.pauseStates   = [];
        me.types         = [];
    },

    addClass: function(el, cssClass) {
        var me = this;

        // Avoid duplicate classes
        me.removeClass(el, cssClass);

        el.className += ' ' + cssClass;
    },

    removeClass: function(el, cssClass) {
        var elClasses = el.className.split(' ');

        elClasses.filter(function(elClass) {
            return elClass != cssClass;
        });

        el.className = elClasses;
    },

    showEl: function(el) {
        var me = this;

        me.removeClass(el, me.CSS_CLASS_HIDDEN);
    },

    hideEl: function(el) {
        var me = this;

        me.addClass(el, me.CSS_CLASS_HIDDEN);
    },

    renderContent: function(content) {
        var me = this;
        var messageEl = document.getElementById('prc-popup-no-content');
        var contentEl = document.getElementById('prc-popup-content');

        me.hideEl(messageEl);
        me.showEl(contentEl);

        contentEl.innerHTML = content;
    },

    showNoContentMessage: function() {
        var me = this;
        var messageEl = document.getElementById('prc-popup-no-content');
        var contentEl = document.getElementById('prc-popup-content');

        me.showEl(messageEl);
        me.hideEl(contentEl);
    },

    renderRate: function(pos) {
        var me = this;

        document.getElementById('prc-rate-' + pos).innerHTML = me.formatRate(pos);
    },

    formatRate: function(pos) {
        var me = this;

        return me.playbackRates[pos].toFixed(me.SHOW_DECIMAL_PLACES) + 'x';
    },

    addCallbacks: function() {
        var me = this;

        me.playbackRates.forEach(function (rate, pos) {
            document.getElementById('prc-slower-' + pos).addEventListener('click', function() {
                me.slower(pos);
            });

            document.getElementById('prc-faster-' + pos).addEventListener('click', function() {
                me.faster(pos);
            });
        });
    },

    renderComponent: function() {
        var me = this;

        if (me.playbackRates.length === 0) {
            return;
        }

        var html = '<table id="prc-controls"><tbody>';

        me.playbackRates.forEach(function (rate, pos) {
            html += '<tr>';

            if (me.playbackRates.length > 1) {
                html += '<td><span class="prc-video-label">' + me.types[pos] + ' ' + (pos + 1) + ': </span></td>';
            }

            html += '<td><button id="prc-slower-' + pos + '" class="prc-control-btn"> - </button></td>';
            html += '<td><span id="prc-rate-' + pos + '" class="prc-control-rate">' + me.formatRate(pos) + '</span></td>';
            html += '<td><button id="prc-faster-' + pos + '" class="prc-control-btn"> + </button></td>';

            html += '</tr>';
        });

        html += '</tbody></table>';

        me.renderContent(html);
        me.addCallbacks();
    },

    setPlaybackRate: function(pos) {
        var me = this;

        chrome.tabs.getSelected(null, function(tab) {
            chrome.tabs.sendMessage(tab.id, { type: "prc-set-playback-rate", itemPos: pos, newPlaybackRate: me.playbackRates[pos] }, function(response) {
                if (response.status === 'success') {
                    me.renderRate(pos);
                }
            });
        });
    },

    faster: function(pos) {
        var me = this;

        if (me.playbackRates[pos] < me.MAX_PLAYBACK_RATE) {
            me.playbackRates[pos] = Math.round((me.playbackRates[pos] + me.PLAYBACK_RATE_STEP) * 10) / 10.0;

            me.setPlaybackRate(pos)
        }
    },

    slower: function(pos) {
        var me = this;

        if (me.playbackRates[pos] > me.MIN_PLAYBACK_RATE) {
            me.playbackRates[pos] = Math.round((me.playbackRates[pos] - me.PLAYBACK_RATE_STEP) * 10) / 10.0;

            me.setPlaybackRate(pos)
        }
    },

    checkForPlaybackResources: function() {
        var me = this;

        me.showNoContentMessage();
        me.reset();

        chrome.tabs.getSelected(null, function(tab) {
            chrome.tabs.sendMessage(tab.id, { type: "prc-get-summary" }, function(response) {
                if (response && response.status === 'success') {
                    me.playbackRates = response.playbackRates;
                    me.pauseStates   = response.pauseStates;
                    me.types         = response.types;

                    me.renderComponent();
                }
            });
        });
    },

    init: function() {
        var me = this;

        me.checkForPlaybackResources();
    }
};

document.addEventListener('DOMContentLoaded', PRCPopup.init.bind(PRCPopup));