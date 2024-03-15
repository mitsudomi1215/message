(function() {
    'use strict';

    // // ルックアップによる制御
    // kintone.events.on(['app.record.create.submit','app.record.edit.submit'], function(event) {

    //     const record = event.record;
    
    //     // 【変更】アプリのIDに書き換えてください
    //     const APP_ID = 6;
    //     const store_id = record.店番.value;
    
    //     // const params = {
    //     //     'app': APP_ID,
    //     //     'query': `店番 = "${store_id}" and 日付="${date}"`
    //     // };
    //     if(store_id){
    //         const params = {
    //             'app': APP_ID,
    //             'query': `店番 = "${store_id}"`
    //         };
        
    //         return kintone.api(kintone.api.url('/k/v1/records', true), 'GET', params).then((resp) => {
    //             const records = resp.records;
    //             console.warn(records);
    //             record.特約店ユーザーID1.value = records[0].GaroonのユーザーID1.value;
    //             return event;
    //         });
    //     }
        
    // });

        // ルックアップによる制御
    kintone.events.on(['app.record.create.submit','app.record.edit.submit'], function(event) {

        const record = event.record;

        if(record.受付方法.value == '電話'){

        
            // 【変更】アプリのIDに書き換えてください
            const APP_ID = 827;
            const store_id = record.店番.value;
        
            // const params = {
            //     'app': APP_ID,
            //     'query': `店番 = "${store_id}" and 日付="${date}"`
            // };
            if(store_id){
                const params = {
                    'app': APP_ID,
                    'query': `店番 = "${store_id}"`
                };
            
                return kintone.api(kintone.api.url('/k/v1/records', true), 'GET', params).then((resp) => {
                    const records = resp.records;
                    if(record.受付方法.value == '電話'){
                        record.営業部連絡先.value = records[0].AM電話番号.value;
                    }
                    record.ガルーン宛先に店舗を入れるor入れない.value = records[0].ガルーン宛先に店舗を入れるor入れない.value;
                    return event;
                });
            }
        }
    });

    //アンケート報告書の時間を自動的に入れる処理
    kintone.events.on(['app.record.create.change._1','app.record.edit.change._1'], function(event) {
        const record = event.record;
        
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
