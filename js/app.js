(function() {
    'use strict';

    var uuid, avatar, color, cat;

    // Assign a uuid made of a random cat and a random color
    var ranlistElColor = function() {   
        var colors = ['navy', 'slate', 'olive', 'moss', 'chocolate', 'buttercup', 'maroon', 'cerise', 'plum', 'orchid'];   
        return colors[(Math.random() * colors.length) >>> 0];
    };

    var ranlistElCat = function() {   
        var cats = ['tabby', 'bengal', 'persian', 'mainecoon', 'ragdoll', 'sphynx', 'siamese', 'korat', 'japanesebobtail', 'abyssinian', 'scottishfold'];           
        return cats[(Math.random() * cats.length) >>> 0];        
    }; 

    color = ranlistElColor();
    cat = ranlistElCat();
    uuid = color + '-' + cat;
    avatar = 'images/' + cat + '.jpg';

    function showNewest() {
        //document.querySelector('core-scaffold').$.headerPanel.scroller.scrollTop = document.querySelector('.chat-list').scrollHeight;
        var chatDiv = document.querySelector('.chat-list');
        chatDiv.scrollTop = chatDiv.scrollHeight;
    }

    /* Polymer UI and UX */

    var template = document.querySelector('template[is=auto-binding]');

    template.channel = 'polymer-chat';
    template.uuid = uuid;
    template.avatar = avatar;
    template.color = color;

    template.checkKey = function(e) {
        if(e.keyCode === 13 || e.charCode === 13) {
            template.publish();
        }
    };

    template.sendMyMessage = function(e) {
        template.publish();
    };

    template.messageList = [];
    

    /* PubNub Realtime Chat */

    var pastMsgs = [];
    var onlineUuids = [];

    template.getListWithOnlineStatus = function(list) {
        [].forEach.call(list, function(l) {
            if(onlineUuids.indexOf(l.uuid) > -1) {
                l.status = 'online';
            }
        });
        return list;
    };

    template.displayChatList = function(list) {
        template.messageList = list;
        // scroll to bottom
        template.async(showNewest);
    };

    template.subscribeCallback = function(e) {
        if(template.$.sub.messages.length > 0) { 
            template.displayChatList(pastMsgs.concat(this.getListWithOnlineStatus(template.$.sub.messages)));
        } 
    };

    template.presenceChanged = function(e) {
        template.$.sub.presence.map(function(m){
            template.occupancy = m.occupancy;
        });
    };

    template.herePresenceChanged = function(e) {
        // Display at left as list
        onlineUuids = e.detail.uuids;
        template.people = onlineUuids;
    };

    template.historyRetrieved = function(e) {
        if(e.detail[0].length > 0) {
            pastMsgs = this.getListWithOnlineStatus(e.detail[0]); 
            template.displayChatList(pastMsgs);
        } 
    };

    template.publish = function() {
        if(!template.input) return;

        template.$.pub.message = {
            uuid: uuid, 
            avatar: avatar, 
            color: color, 
            text: template.input,
            timestamp: Date.now()
        };
        template.$.pub.publish();
        template.input = '';
    };

    template.error = function(e) {
        console.log(e);
    };


})();