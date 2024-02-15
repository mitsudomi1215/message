(function() {
    'use strict';
        // ルックアップによる制御
        // kintone.events.on(['app.record.edit.submit'], function(event) {
    
        //     const record = event.record;
        
        //     // アプリのIDに書き換えてください
        //     const APP_ID = 462;
        //     const store_id = record.店番.value;

        //     const dateTime = new Date(record.日付_発生日時.value);
        //     // const dateTime = visits_date_time_call.toISOString('ja-JP', options).split(' ')[0];

        //     // 年月日の取得
        //     const year = dateTime.getFullYear();
        //     const month = String(dateTime.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため、1を加え、2桁に整形
        //     const day = String(dateTime.getDate()).padStart(2, '0'); // 日も2桁に整形

        //     // ご来店日
        //     var visits_date_call = `${year}-${month}-${day}`;
        
        //     const params = {
        //         'app': APP_ID,
        //         'query': `店番 = "${store_id}" and 日付="${visits_date_call}"`
        //     };
    
        //     // const params = {
        //     //     'app': APP_ID,
        //     //     'query': `店番 = "${store_id}"`
        //     // };
        
        //     return kintone.api(kintone.api.url('/k/v1/records', true), 'GET', params).then((resp) => {
        //         const records = resp.records;
        //         console.warn(records);
        //         record.売上_計画.value = records[0].売上単日_計画.value;
        //         return event;
        //     });
        // });
    
    
    
        //アンケート報告書の時間を自動的に入れる処理
        kintone.events.on(['app.record.create.change._1','app.record.edit.change._1'], function(event) {
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
                console.log("アンケート報告書の時間を自動取得処理でエラー");
            }
            return event;
        });
    
    })();
