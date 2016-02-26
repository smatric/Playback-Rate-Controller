var PRCPopup = {
    MAX_PLAYBACK_RATE: 4.0,
    MIN_PLAYBACK_RATE: 0.1,
    PLAYBACK_RATE_STEP: 0.1,
    SHOW_DECIMAL_PLACES: 1,
    CSS_CLASS_HIDDEN: 'hidden',


    playbackRate: null,

    reset: function() {
        var me = this;

        me.playbackRate = null;
    },

    addClass: function(el, cssClass) {
        var me = this;

        // Avoid duplicate classes
        me.removeClass(el, cssClass);

        el.className += ' ' + cssClass;
    },

    removeClass: function(el, cssClass) {
        var elClasses = el.className.split(' ');

        el.className = elClasses.filter(function(elClass) {
            return elClass != cssClass;
        });
    },

    showEl: function(el) {
        var me = this;

        me.removeClass(el, me.CSS_CLASS_HIDDEN);
    },

    hideEl: function(el) {
        var me = this;

        me.addClass(el, me.CSS_CLASS_HIDDEN);
    },

    showContent: function() {
        var me = this;
        var messageEl = document.getElementById('prc-popup-no-content');
        var contentEl = document.getElementById('prc-popup-content');

        me.hideEl(messageEl);
        me.showEl(contentEl);
    },

    showNoContentMessage: function() {
        var me = this;
        var messageEl = document.getElementById('prc-popup-no-content');
        var contentEl = document.getElementById('prc-popup-content');

        me.showEl(messageEl);
        me.hideEl(contentEl);
    },

    renderRate: function() {
        var me = this;

        document.getElementById('prc-rate').innerHTML = me.formatRate(me.playbackRate);
    },

    formatRate: function(rate) {
        var me = this;

        return rate.toFixed(me.SHOW_DECIMAL_PLACES) + 'x';
    },

    addCallbacks: function() {
        var me = this;

        document.getElementById('prc-slower').addEventListener('click', function() {
            me.slower();
        });

        document.getElementById('prc-faster').addEventListener('click', function() {
            me.faster();
        });

        document.getElementById('prc-rate-05').addEventListener('click', function() {
            me.setPlaybackRate(0.5);
        });

        document.getElementById('prc-rate-08').addEventListener('click', function() {
            me.setPlaybackRate(0.8);
        });

        document.getElementById('prc-rate-1').addEventListener('click', function() {
            me.setPlaybackRate(1.0);
        });

        document.getElementById('prc-rate-15').addEventListener('click', function() {
            me.setPlaybackRate(1.5);
        });

        document.getElementById('prc-rate-2').addEventListener('click', function() {
            me.setPlaybackRate(2.0);
        });
    },

    updatePlaybackRate: function() {
        var me = this;

        chrome.tabs.getSelected(null, function(tab) {
            var options = {
                type: "prc-set-playback-rate",
                newPlaybackRate: me.playbackRate
            };

            chrome.tabs.sendMessage(tab.id, options, function(response) {
                if (response.status === 'success') {
                    me.playbackRate = response.playbackRate;
                    me.renderRate();
                }
            });
        });
    },

    faster: function() {
        var me = this;

        if (me.playbackRate < me.MAX_PLAYBACK_RATE) {
            me.playbackRate = Math.round((me.playbackRate + me.PLAYBACK_RATE_STEP) * 10) / 10.0;

            me.updatePlaybackRate()
        }
    },

    slower: function() {
        var me = this;

        if (me.playbackRate > me.MIN_PLAYBACK_RATE) {
            me.playbackRate = Math.round((me.playbackRate - me.PLAYBACK_RATE_STEP) * 10) / 10.0;

            me.updatePlaybackRate()
        }
    },

    setPlaybackRate: function(newPlaybackRate) {
        var me = this;

        me.playbackRate = newPlaybackRate;
        me.updatePlaybackRate();
    },

    checkForPlaybackResources: function() {
        var me = this;

        me.reset();
        me.showNoContentMessage();

        chrome.tabs.getSelected(null, function(tab) {
            chrome.tabs.sendMessage(tab.id, { type: "prc-get-summary" }, function(response) {
                if (response && response.status === 'success') {
                    me.playbackRate = response.playbackRate;
                    me.showContent();
                    me.renderRate();
                }
            });
        });
    },

    init: function() {
        var me = this;

        me.checkForPlaybackResources();
        me.addCallbacks();
    }
};

document.addEventListener('DOMContentLoaded', PRCPopup.init.bind(PRCPopup));