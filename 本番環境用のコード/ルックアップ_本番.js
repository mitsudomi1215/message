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

    // 後で新規の時だけに変更しよう
    // アンケートユーザー情報アプリのデータを自動取得
    kintone.events.on(['app.record.create.submit','app.record.edit.submit'], function(event) {
        const record = event.record;

        if(record.受付方法.value == '電話'){

        
            // 【変更】アプリのIDに書き換えてください
            const APP_ID = 827;
            const store_id = record.店番.value;
    
            if(store_id){
                const params = {
                    'app': APP_ID,
                    'query': `店番 = "${store_id}"`
                };
                // const params = {
                //     'app': APP_ID,
                //     'query': `店番 = "${store_id}" and 日付="${date}"`
                // };
            
                return kintone.api(kintone.api.url('/k/v1/records', true), 'GET', params).then((resp) => {
                    const records = resp.records;

                    console.warn("レコーズ",records);
                    console.warn("record",record);
                    if(record.受付方法.value == '電話'){
                        record.営業部連絡先.value = records[0].AM電話番号.value;
                    }
                    record.ガルーン宛先に店舗を入れるor入れない.value = records[0].ガルーン宛先に店舗を入れるor入れない.value;

                    // console.warn("recordの中身を確認",record);
                    // console.warn("権限追加ユーザー1",record['権限追加ユーザー' + 1].value)
                    //権限追加ユーザー1~34まで代入していく

                    // record.権限追加ユーザー1.value = records[0].ユーザー1.value;

                    for (let i = 1; i <= 34; i++) {
                        // ここに繰り返し処理したいコードを記述します
                        // record['権限追加ユーザー' + i].value = records[0]['ユーザー' + i].value;
                        // record['Garoon宛先追加ユーザー' + i].value = records[0]['Garoonユーザー' + i].value;
                    }
                    // record.コールセンター1.value = records[0].コールセンター1.value;
                    // record.コールセンター2.value = records[0].コールセンター2.value;
                    // record.コールセンター上長1.value = records[0].コールセンター上長1.value;
                    // record.コールセンター上長2.value = records[0].コールセンター上長2.value;
                    // record.コールセンター上長3.value = records[0].コールセンター上長3.value;
                    // record.コールセンター上長4.value = records[0].コールセンター上長4.value;
                    
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
