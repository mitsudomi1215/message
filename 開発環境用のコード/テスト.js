(function() {
    'use strict';

    kintone.events.on('app.record.edit.submit.success', (event) => {
        event.url = null;
        console.log('url: ' + event.url);
        return event;
      });
})();
