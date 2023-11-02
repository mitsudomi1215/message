(() => {

	'use strict';
    // ルックアップによる制御
    kintone.events.on(['app.record.edit.submit'], function(event) {

        const record = event.record;
    
        // アプリのIDに書き換えてください
        const APP_ID = 30;
        const store_id = record.店番.value;
        const date = record.日付.value;
    
        const params = {
            'app': APP_ID,
            'query': `店番 = "${store_id}" and 日付="${date}"`
        };
    
        return kintone.api(kintone.api.url('/k/v1/records', true), 'GET', params).then((resp) => {
            const records = resp.records;
            record.どぅーん.value = records[0].計画.value;
            return event;
        });
    });

    kintone.events.on(['app.record.edit.change._1'], function(event) {
        const record = event.record;
        console.log("処理開始");
        
        let _1Value = parseInt(record._1.value); // _1フィールドの値を整数に変換
        if (!isNaN(_1Value)) {
            for (let i = 2; i <= 15; i++) {
                // _1フィールドの値に1を加え、24を超える場合は1に戻す
                _1Value = (_1Value % 24) + 1;
                record["_" + i].value = _1Value;
            }
        } else {
            console.log("Invalid value in _1 field.");
        }
        return event;
    });

})()