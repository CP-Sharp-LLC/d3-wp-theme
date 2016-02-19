/* globals App: false, Logocolor: false, TweenLite, Power3  */

function MeetManager() {
    this.dialogs = $('.promptbox');
    this.yesButtons = $('.tick');
    this.noButtons = $('.cross');
    this.backButtons = $('.back');
    this.forward = 'forward';
    this.back = 'back';
    this.current = -1;
    this.dialogs.css('opacity', 0).hide();
    this.islocked = false;

    this.currentSlide = function () { return $(manager.dialogs[manager.current]); };
    this.yesButtons.click(function () { manager.dialogs[manager.current].yep(); });
    this.noButtons.click(function () { manager.dialogs[manager.current].nope(); });
    this.backButtons.click(function () { manager.dialogs[manager.current].back(); });

    $(this.dialogs).each(
        function (itemnum, thediag) {
            thediag.yep = function () { manager.shownext(manager.forward);};
            thediag.nope = function () { parent.history.back(); return false; };
            thediag.back = function () { manager.shownext(manager.back);};
        });

    this.shownext = function (direction) {
        if(manager.islocked) { return; }

        if (manager.current > -1) {
            TweenLite.to(manager.currentSlide(), 0.5, { ease: Power3.easeOut, opacity: 0,
                onStart: function () {manager.lockform(true);},
                onComplete: function() { manager.transition(direction); } });
        }
        else
        {
            this.transition(manager.forward);
        }
    };

    this.transition = function (direction) {
        manager.currentSlide().hide();
        manager.iterate(direction);

        if(manager.current < manager.dialogs.length) {
            manager.currentSlide().show();
            TweenLite.to($(manager.currentSlide()),0.5, {ease: Power3.easeIn, opacity: 1});
        }

        manager.lockform(false);
    };

    this.iterate = function (direction)
    {
        if(direction == manager.back)
        {
            manager.current--;
            return;
        }

        manager.current++;
    };

    this.lockform = function (tolock) {
        manager.islocked = tolock;
    };
}

var manager;

$(document).ready(function () {
    manager = new MeetManager();
    for (var i = 0; i < App.childnodes.length; i++) {
        if (App.childnodes[i].tident == "tech") {
            App.Map.selectedparent = App.childnodes[i];
            App.Map.selectedparent.childDetail = App.childnodes[i];
            break;
        }
    }
    var sawIntro = $.cookie('usersawintro');
    var delayLength = 5000;
    if (sawIntro) {
        delayLength = 1;
    }
    $.cookie('usersawintro', true);
    setTimeout(function () {
        App.Map.UI.shownextpage(new Logocolor({r: 0, g: 41, b: 51}).a(1));
        manager.shownext();
    }, delayLength);
});
