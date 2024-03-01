(function() {
    'use strict';

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//以下、共通処理(新規・詳細・編集・印刷画面)
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
kintone.events.on(["app.record.create.show","app.record.detail.show","app.record.edit.show"], event => {
    const record = event.record;
    
    // console.warn('お試し',record.原因.value != '');
    // console.warn('お試し',record.原因.value != undefined);
    
    var GetLoginUser = kintone.getLoginUser()

    // console.warn("ゲットユーザー",GetLoginUser);
    //【変更】ログインユーザーが1以外のユーザーにはフィールドを隠す処理(環境が変わった際は、メッセージの更新・削除を行うユーザーにしてください。)
    if(GetLoginUser.id != 1){
        kintone.app.record.setFieldShown('Garoonメッセージ送信制御', false);
        kintone.app.record.setFieldShown('Garoon送信メッセージ内容', false);
        kintone.app.record.setFieldShown('Garoon送信履歴', false);
    }
    //アンケート報告書
    if(record.アンケート報告書.value == "要"){
        kintone.app.record.setFieldShown('アンケート報告書_グループ',true);
        kintone.app.record.setGroupFieldOpen('アンケート報告書_グループ', true);
    }else{
        kintone.app.record.setFieldShown('アンケート報告書_グループ',false);
    }

    //システム管理者用を非表示にする
    // kintone.app.record.setFieldShown('システム管理者用',false); 
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//以下、共通処理(新規・編集)
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
kintone.events.on(["app.record.create.show","app.record.edit.show"], event => {
    const record = event.record;
        //アンケート報告書のST開始時間、入力不可設定
        record._2.disabled = true;
        record._3.disabled = true;
        record._4.disabled = true;
        record._5.disabled = true;
        record._6.disabled = true;
        record._7.disabled = true;
        record._8.disabled = true;
        record._9.disabled = true;
        record._10.disabled = true;
        record._11.disabled = true;
        record._12.disabled = true;
        record._13.disabled = true;
        record._14.disabled = true;
        record._15.disabled = true;

        //Garoonリンクを編集不可にする
        record.Garoonリンク.disabled = true;

});

    //(編集画面)(グループ)
kintone.events.on(["app.record.create.change.受付日時_電話","app.record.edit.change.受付日時_電話","app.record.create.change.受付日時_メール","app.record.edit.change.受付日時_メール"], event => {
    const record = event.record;
    if(record.受付方法.value == "電話"){
        if(record.受付日時_電話.value == undefined || record.受付日時_電話.value == ''){

        }else{
            record.受付日時_まとめ.value  = record.受付日時_電話.value;
        }
    }else {
        if(record.受付日時_メール.value == undefined || record.受付日時_メール.value == ''){

        }else{
            record.受付日時_まとめ.value  = record.受付日時_メール.value;
        }
    }        
    return event;
});

//(グループ)
kintone.events.on(["app.record.create.change.受付方法","app.record.edit.change.受付方法"], event => {
    const record = event.record;
    if(record.受付方法.value == "電話"){
        kintone.app.record.setFieldShown('メール・ネットアンケート・口コミサイト受付', false);
        kintone.app.record.setFieldShown('電話受付', true);
    }else if(record.受付方法.value == "メール・ネットアンケート"){
        kintone.app.record.setFieldShown('メール・ネットアンケート・口コミサイト受付', true);
        kintone.app.record.setFieldShown('電話受付', false);
    }else if(record.受付方法.value == "口コミサイト"){
        kintone.app.record.setFieldShown('メール・ネットアンケート・口コミサイト受付', true);
        kintone.app.record.setFieldShown('電話受付', false);
    }else {
        kintone.app.record.setFieldShown('メール・ネットアンケート・口コミサイト受付', false);
        kintone.app.record.setFieldShown('電話受付', false);
    }
    return event
});

//(グループ)
kintone.events.on(["app.record.create.change.アンケート報告書","app.record.edit.change.アンケート報告書"], event => {
    const record = event.record;
    //アンケート報告書
    if(record.アンケート報告書.value == "要"){
        kintone.app.record.setFieldShown('アンケート報告書_グループ',true);
        kintone.app.record.setGroupFieldOpen('アンケート報告書_グループ', true);
    }else{
        kintone.app.record.setFieldShown('アンケート報告書_グループ',false);
    }
    return event;
});

//(電話)ご来店人数変更時
kintone.events.on([ 'app.record.edit.change.ご来店人数_電話', 'app.record.create.change.ご来店人数_電話'], event => {
    const rec = event.record;

    rec.ご利用人数.value = rec.ご来店人数_電話.value;

    return event;
});

//(メール・ネットアンケート)ご利用人数変更時
kintone.events.on([ 'app.record.edit.change.ご利用人数_メール_ネット', 'app.record.create.change.ご利用人数_メール_ネット'], event => {
    const rec = event.record;

    rec.ご利用人数.value = rec.ご利用人数_メール_ネット.value;

    return event;
});

//メール・口コミ、ネットアンケートの総合評価が利用したくないの時
kintone.events.on([ 'app.record.edit.change.総合評価_メール', 'app.record.create.change.総合評価_メール'], event => {
    const rec = event.record;
    if (rec.総合評価_メール.value == '利用したくない') {
        rec.アンケート報告書_メール.value = '要';
    }else{
        rec.アンケート報告書_メール.value = '否';
    }

    if(rec.総合評価_メール.value == 'ー' ){
        rec.内容.value = '未記入、その他';
    }else{
        rec.内容.value = rec.総合評価_メール.value;
    }

    return event;
});

//電話の総合評価が利用したくないの時
kintone.events.on(['app.record.edit.change.総合評価_電話','app.record.create.change.総合評価_電話'], event => {
    const rec = event.record;
    if (rec.総合評価_電話.value == '利用したくない') {
        rec.アンケート報告書_電話.value = '要';
    }else{
        rec.アンケート報告書_電話.value = '否';
    }

    rec.内容.value = rec.総合評価_電話.value;

    return event;
});

kintone.events.on(['app.record.create.change.ご来店日時_電話','app.record.edit.change.ご来店日時_電話','app.record.create.change.ご来店日時_メール_ネットアンケート','app.record.edit.change.ご来店日時_メール_ネットアンケート'], event => {
    var record = event.record;
    
    if(record.受付方法.value == "電話"){
        if(record.ご来店日時_電話.value == undefined || record.ご来店日時_電話.value == ''){
        }else{
            record.発生日時.value = record.ご来店日時_電話.value;

            //日付_発生日時に代入
            var visits_date_time_call = new Date(record.ご来店日時_電話.value);
            // const dateTime = visits_date_time_call.toISOString('ja-JP', options).split('T')[0];
            // 年月日の取得
            const year = visits_date_time_call.getFullYear();
            const month = String(visits_date_time_call.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため、1を加え、2桁に整形
            const day = String(visits_date_time_call.getDate()).padStart(2, '0'); // 日も2桁に整形
            record.日付_発生日時.value = year + '-' + month + '-' + day;

        }
    }else{
        if(record.ご来店日時_メール_ネットアンケート.value == undefined || record.ご来店日時_メール_ネットアンケート.value == ''){

        }else{
            record.発生日時.value = record.ご来店日時_メール_ネットアンケート.value;

            //日付_発生日時に代入
            var visits_date_time_mail_net = new Date(record.ご来店日時_メール_ネットアンケート.value);
            // const dateTime = visits_date_time_call.toISOString('ja-JP', options).split('T')[0];
            // 年月日の取得
            const year = visits_date_time_mail_net.getFullYear();
            const month = String(visits_date_time_mail_net.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため、1を加え、2桁に整形
            const day = String(visits_date_time_mail_net.getDate()).padStart(2, '0'); // 日も2桁に整形
            record.日付_発生日時.value = year + '-' + month + '-' + day;
        }
    }
    return event;
});

//(編集画面)ご来店日時
kintone.events.on(['app.record.create.change.発生日時','app.record.edit.change.発生日時'], event => {
    var record = event.record;
    const options = { timeZone: 'Asia/Tokyo' };
    if(record.受付方法.value == "電話"){
        //追加 
        if(record.発生日時 == undefined || record.発生日時.value == ''){
            
        }else{
            //日付_発生日時に代入
            var visits_date_time_call = new Date(record.発生日時.value);
            // const dateTime = visits_date_time_call.toISOString('ja-JP', options).split('T')[0];
            // 年月日の取得
            const year = visits_date_time_call.getFullYear();
            const month = String(visits_date_time_call.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため、1を加え、2桁に整形
            const day = String(visits_date_time_call.getDate()).padStart(2, '0'); // 日も2桁に整形
            record.日付_発生日時.value = year + '-' + month + '-' + day;
        }
    }else{
        if(record.発生日時.value == undefined || record.発生日時.value == ''){
            
        }else{
            var visits_date_time_mail_net = new Date(record.発生日時.value);
            // const dateTime = visits_date_time_call.toISOString('ja-JP', options).split('T')[0];
            // 年月日の取得
            const year = visits_date_time_mail_net.getFullYear();
            const month = String(visits_date_time_mail_net.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため、1を加え、2桁に整形
            const day = String(visits_date_time_mail_net.getDate()).padStart(2, '0'); // 日も2桁に整形
            record.日付_発生日時.value = year + '-' + month + '-' + day;
        }
    }

    return event;
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//以下、詳細画面と編集画面画面と印刷画面のみの処理
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
kintone.events.on(["app.record.detail.show","app.record.edit.show","app.record.print.show"], event => {
    const record = event.record;
    if(record.受付方法.value == "電話"){
        kintone.app.record.setFieldShown('メール・ネットアンケート・口コミサイト受付', false);
        kintone.app.record.setFieldShown('電話受付', true);
    }else if(record.受付方法.value == "メール・ネットアンケート"){
        kintone.app.record.setFieldShown('メール・ネットアンケート・口コミサイト受付', true);
        kintone.app.record.setFieldShown('電話受付', false);
    }else if(record.受付方法.value == "口コミサイト"){
        kintone.app.record.setFieldShown('メール・ネットアンケート・口コミサイト受付', true);
        kintone.app.record.setFieldShown('電話受付', false);
    }else {
        kintone.app.record.setFieldShown('メール・ネットアンケート・口コミサイト受付', false);
        kintone.app.record.setFieldShown('電話受付', false);
    }
    //お客様とのご連絡回数
    if(record.お客様とのご連絡回数.value == "1回目"){
        //グループの開閉
        kintone.app.record.setGroupFieldOpen('店舗情報詳細',false );
        kintone.app.record.setGroupFieldOpen('電話受付', true)
        kintone.app.record.setGroupFieldOpen('メール・ネットアンケート・口コミサイト受付', true);
        kintone.app.record.setGroupFieldOpen('アンケート報告書_グループ', true);

        //グループの表示
        kintone.app.record.setFieldShown('お客様とのご連絡詳細_2回目_',false);
        kintone.app.record.setFieldShown('お客様とのご連絡詳細_3回目_',false);
    }else if(record.お客様とのご連絡回数.value == "2回目"){
        //グループの開閉
        kintone.app.record.setGroupFieldOpen('店舗情報詳細',false );
        kintone.app.record.setGroupFieldOpen('電話受付', false)
        kintone.app.record.setGroupFieldOpen('メール・ネットアンケート・口コミサイト受付', false);
        kintone.app.record.setGroupFieldOpen('お客様とのご連絡詳細_2回目_', true);

        //グループの表示
        kintone.app.record.setFieldShown('お客様とのご連絡詳細_2回目_',true);
        kintone.app.record.setFieldShown('お客様とのご連絡詳細_3回目_',false);
    }else if(record.お客様とのご連絡回数.value == "3回目"){

        //グループの開閉
        kintone.app.record.setGroupFieldOpen('店舗情報詳細',false );
        kintone.app.record.setGroupFieldOpen('電話受付', false);
        kintone.app.record.setGroupFieldOpen('メール・ネットアンケート・口コミサイト受付', false);
        kintone.app.record.setGroupFieldOpen('お客様とのご連絡詳細_2回目_', false);
        kintone.app.record.setGroupFieldOpen('お客様とのご連絡詳細_3回目_', true);

        //グループの表示
        kintone.app.record.setFieldShown('お客様とのご連絡詳細_2回目_',true);
        kintone.app.record.setFieldShown('お客様とのご連絡詳細_3回目_',true);
    } else {

        //グループの表示
        kintone.app.record.setFieldShown('お客様とのご連絡詳細_2回目_',false);
        kintone.app.record.setFieldShown('お客様とのご連絡詳細_3回目_',false);
    }
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//以下、新規画面のみの処理
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //(新規作成画面)表示したとき
    kintone.events.on("app.record.create.show", event => {
        const record = event.record;

        //フィールド編集不可
        record.お客様とのご連絡回数.disabled = true;
        record.Garoonリンク.disabled = true;

        //Garoonメッセージ送信制御を非表示
        // kintone.app.record.setFieldShown('Garoonメッセージ送信制御', false);

        //グループを非表示
        kintone.app.record.setFieldShown('メール・ネットアンケート・口コミサイト受付', false);
        kintone.app.record.setFieldShown('電話受付', false);
        kintone.app.record.setFieldShown('お客様とのご連絡詳細_2回目以降_', false);

        //アンケート報告書を非表示にする
        kintone.app.record.setFieldShown('アンケート報告書_グループ',false);

        //お客様とのご連絡詳細_2回目
        kintone.app.record.setFieldShown('お客様とのご連絡詳細_2回目_',false);

        //お客様とのご連絡詳細_3回目
        kintone.app.record.setFieldShown('お客様とのご連絡詳細_3回目_',false);

        kintone.app.record.setFieldShown('Garoonメッセージ送信制御',false);
        kintone.app.record.setFieldShown('Garoon送信メッセージ内容',false);
        kintone.app.record.setFieldShown('Garoon送信履歴',false);

        //グループの制御
        kintone.app.record.setGroupFieldOpen('電話受付', true)
        kintone.app.record.setGroupFieldOpen('メール・ネットアンケート・口コミサイト受付', true);
        kintone.app.record.setGroupFieldOpen('アンケート報告書', true);

        return event;

    });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//以下、詳細画面のみの処理
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //(詳細画面)表示したとき
    kintone.events.on("app.record.detail.show", event => {
        const record = event.record;

        return event;
    });
          
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//以下、編集画面のみの処理
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //(編集画面)表示したとき
    kintone.events.on("app.record.edit.show", event => {
        const record = event.record;

        //ユーザー情報を取得
        var GetLoginUser = kintone.getLoginUser()
        //【変更】ログインユーザーが1以外のユーザーにはフィールドを隠す処理(環境が変わった際は、メッセージの更新・削除を行うユーザーにしてください。)
        if(GetLoginUser.id == 1){
            // スペースフィールド
            const element = kintone.app.record.getSpaceElement('send_message');
            element.innerHTML = '送信するを選択するとGaroonメッセージを作成';
            element.style.cssText = 'color: red; font-size: 18px; font-weight: bold;';
        }

        //入力不可設定
        record.Garoonメッセージ送信制御.value = '送信しない';
        record.Garoon送信履歴.disabled = true;

        record.受付方法.disabled = true;

        // button_click();//追加

        return event;
    });

    //(編集画面)(グループ)
    kintone.events.on("app.record.edit.change.お客様とのご連絡回数", event => {
        const record = event.record;


        if(record.お客様とのご連絡回数.value == "1回目"){
            //グループの開閉
            kintone.app.record.setGroupFieldOpen('店舗情報詳細',false );
            kintone.app.record.setGroupFieldOpen('電話受付', true)
            kintone.app.record.setGroupFieldOpen('メール・ネットアンケート・口コミサイト受付', true);
            kintone.app.record.setGroupFieldOpen('アンケート報告書_グループ', true);

            //グループの表示
            kintone.app.record.setFieldShown('お客様とのご連絡詳細_2回目_',false);
            kintone.app.record.setFieldShown('お客様とのご連絡詳細_3回目_',false);

        }else if(record.お客様とのご連絡回数.value == "2回目"){
            //グループの開閉
            kintone.app.record.setGroupFieldOpen('店舗情報詳細',false );
            kintone.app.record.setGroupFieldOpen('電話受付', false)
            kintone.app.record.setGroupFieldOpen('メール・ネットアンケート・口コミサイト受付', false);
            kintone.app.record.setGroupFieldOpen('お客様とのご連絡詳細_2回目_', true);

            //グループの表示
            kintone.app.record.setFieldShown('お客様とのご連絡詳細_2回目_',true);
            kintone.app.record.setFieldShown('お客様とのご連絡詳細_3回目_',false);

        }else if(record.お客様とのご連絡回数.value == "3回目"){

            //グループの開閉
            kintone.app.record.setGroupFieldOpen('店舗情報詳細',false );
            kintone.app.record.setGroupFieldOpen('電話受付', false);
            kintone.app.record.setGroupFieldOpen('メール・ネットアンケート・口コミサイト受付', false);
            kintone.app.record.setGroupFieldOpen('お客様とのご連絡詳細_2回目_', false);
            kintone.app.record.setGroupFieldOpen('お客様とのご連絡詳細_3回目_', true);

            //グループの表示
            kintone.app.record.setFieldShown('お客様とのご連絡詳細_2回目_',true);
            kintone.app.record.setFieldShown('お客様とのご連絡詳細_3回目_',true);
        } else {

            //グループの表示
            kintone.app.record.setFieldShown('お客様とのご連絡詳細_2回目_',false);
            kintone.app.record.setFieldShown('お客様とのご連絡詳細_3回目_',false);
        }
    });




        
    // //--------------------------------------------------------------------------------
    // //以下、保存ボタンが押された時にレコードの内容を取得する【追加】
    // //--------------------------------------------------------------------------------
    // // 全てのbutton要素を取得
    // function button_click(){
    //     var allButtons = document.querySelectorAll('button');
    //     // 条件に合致するボタンを探す
    //     for (var i = 0; i < allButtons.length; i++) {
    //     var currentButton = allButtons[i];
    
    //     if (currentButton.textContent === '保存') {
    //         // クリックイベントリスナーを追加
    //         currentButton.addEventListener('click', function() {
    
    //         const obj = kintone.app.record.get();
    //         // ここに保存ボタンが押されたときの処理を書きます
    //         if(obj.record.Gaoonメッセージ内容作成フラグ.value == "左"){
    //             obj.record.Gaoonメッセージ内容作成フラグ.value = "右";
    //             kintone.app.record.set(obj);
    //         }else{
    //             obj.record.Gaoonメッセージ内容作成フラグ.value = "左";
    //             kintone.app.record.set(obj);
    //         }
            
    //         });
    //         // 条件に合致するボタンが見つかったら処理を終了
    //         break;
    //     }
    //     }
    // }

    // //送信するメッセージの内容を作成する
    // kintone.events.on([
    //     'app.record.edit.change.Gaoonメッセージ内容作成フラグ'
    //     ], event => {
    //     var record = event.record;

    //     //■何を確認することが重要だろうか
    //     //⓵文字列複数行を変更されたことが、モーダルに反映できているかどうか
    //     //⓶モーダルを閉じた瞬間、文字列複数行の変更が「Garoon送信メッセージ内容」フィールドに反映されているかどうか
    //     //⓷いつの時点か
    //     console.warn("これはいつの時点のデータか気になる。",record);
    //     //record.Garoon送信メッセージ内容.value + '\n' + record.顛末.valueという風にしないといけない。
    //     record.Garoon送信メッセージ内容.value = record.顛末.value;
    //     //送信するメッセージの内容を構築する(始まり)初期表示+変更があるごとに--------------------------------------------------------------------------------------
    //     //コメントフィールド
    //     // if(record.コメント.value != ''){
    //     // var comment = '\n' + 'コメント:' + record.コメント.value;
    //     // }else {
    //     // var comment = '';
    //     // }
    //     // if(record.お客様とのご連絡回数.value == '1回目' && record.送信1回目フラグ.value == '未送信' && record.アンケート報告書.value == '要'){
    //     // Garoon送信メッセージ内容.value = URL + '\n' + '店番：' + record.店番.value + '\n' + '店名：' + record.店名.value + comment + '\n' + 'アンケート報告書：必要';
    //     // }else if (record.お客様とのご連絡回数.value == '1回目' && record.送信1回目フラグ.value == '未送信' && record.アンケート報告書.value == '否'){
    //     // Garoon送信メッセージ内容.value = URL + '\n' + '店番：' + record.店番.value + '\n' + '店名：' + record.店名.value + comment;
    //     // }else if(record.お客様とのご連絡回数.value == '1回目' && record.送信1回目フラグ.value == '送信済み'){
    //     // Garoon送信メッセージ内容.value = 'コメント：' + record.コメント.value;
    //     // }
    //     //送信するメッセージの内容を構築する(終わり)---------------------------------------------------------------------------------------

    //     return event;
    // });

    // //送信するメッセージの内容を作成する
    // kintone.events.on([
    //     'app.record.edit.change.Garoonメッセージ送信制御'
    //     ], event => {
    //     var record = event.record;
    //     const options = { timeZone: 'Asia/Tokyo' };

    //     if(record.Garoonメッセージ送信制御.value == '送信する'){
    //         //送信するメッセージの内容を構築する(始まり)初期表示+変更があるごとに------------------------------------------------------------
    //         if(record.受付方法.value == '電話'){
                
    //                 //ご来店日時を編集
    //                 if(record.ご来店日時_電話.value == '' || record.ご来店日時_電話.value == undefined){
    //                     var visits_date_call = '' ;
    //                     var visits_time_call = '';
    //                 }else {
    //                     const dateTime = new Date(record.ご来店日時_電話.value);
    //                     // const dateTime = visits_date_time_call.toISOString('ja-JP', options).split(' ')[0];

    //                     // 年月日の取得
    //                     const year = dateTime.getFullYear();
    //                     const month = String(dateTime.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため、1を加え、2桁に整形
    //                     const day = String(dateTime.getDate()).padStart(2, '0'); // 日も2桁に整形

    //                     // 時分の取得
    //                     const hours = String(dateTime.getHours()).padStart(2, '0');
    //                     const minutes = String(dateTime.getMinutes()).padStart(2, '0');

    //                     // ご来店日
    //                     var visits_date_call = `${year}-${month}-${day}`;
                        
    //                     // 来店時間
    //                     var visits_time_call = `${hours}:${minutes}`;
    //                 }//---------------------------------------------------------------------------------------------------

    //                 //ご来店人数
    //                 if(record.ご来店人数_電話.value == undefined || record.ご来店人数_電話.value == undefined ){
    //                     var visits_number = '' ;
    //                 }else{
    //                     var visits_number = record.ご来店人数_電話.value;
    //                 }

    //                 //お気づきの内容
    //                 if(record.ご意見詳細.value == undefined || record.ご意見詳細.value == '' ){
    //                     var opinion_detail = '';
    //                 }else{
    //                     var opinion_detail = record.ご意見詳細.value;
    //                 }

    //                 //総合評価
    //                 if(record.総合評価_電話.value == undefined || record.総合評価_電話.value == ''){
    //                     var evaluation_call = '';
    //                 }else{
    //                     var evaluation_call = record.総合評価_電話.value;
    //                 }

    //                 //性別
    //                 if(record.性別_電話.value == undefined || record.性別_電話 == ''){
    //                     var sex_call = '';
    //                 }else{
    //                     var sex_call = record.性別_電話.value;
    //                 }

    //                 //名前
    //                 if(record.お名前_電話.value == undefined || record.お名前_電話.value == ''){
    //                     var name_call = '';
    //                 }else{
    //                     var name_call = record.お名前_電話.value;
    //                 }

    //                 //ご連絡先
    //                 if(record.ご連絡先_電話.value == undefined || record.ご連絡先_電話.value == ''){
    //                     var contact_address_call = '';
    //                 }else{ 
    //                     var contact_address_call = record.ご連絡先_電話.value;
    //                 }

    //                 //電話の場合、Garoonに送信するメッセージを作成
    //                 if(record.お客様とのご連絡回数.value == '1回目' && record.送信1回目フラグ.value == '未送信' && record.アンケート報告書.value == '要'){
    //                     record.Garoon送信メッセージ内容.value = 
    //                     '【1通目(始)】' + '\n' +
    //                     'ご利用店舗:' + record.店名.value+ '\n' + 
    //                     'ご来店日:' + visits_date_call + '\n' + 
    //                     '来店日時:' + visits_time_call +'\n' + 
    //                     '利用人数:' + visits_number + '\n' + 
    //                     'お気づきの内容:'+'\n'+opinion_detail+ '\n' + 
    //                     '総合評価:' + evaluation_call + '\n' + 
    //                     '性別:' + sex_call + '\n' + 
    //                     '漢字氏名:' + name_call + '\n' + 
    //                     'ご連絡先:' + contact_address_call + '\n' +
    //                     'アンケート報告書：必要' + '\n'+
    //                     '【1通目(終)】';
    //                 }else if (record.お客様とのご連絡回数.value == '1回目' && record.送信1回目フラグ.value == '未送信' && record.アンケート報告書.value == '否'){
    //                     record.Garoon送信メッセージ内容.value = 
    //                     '【1通目(始)】' + '\n' + 
    //                     'ご利用店舗：' + record.店名.value+ '\n' + 
    //                     'ご来店日:' + visits_date_call + '\n' + 
    //                     '来店日時:' + visits_time_call +'\n' + 
    //                     '利用人数:' + visits_number + '\n' + 
    //                     'お気づきの内容:'+'\n'+opinion_detail + '\n' + 
    //                     '総合評価:' + evaluation_call + '\n' + 
    //                     '性別:' + sex_call + '\n' + 
    //                     '漢字氏名:' + name_call + '\n' + 
    //                     'ご連絡先:' + contact_address_call + '\n' + 
    //                     '【1通目(終)】';
    //                 }else if(record.お客様とのご連絡回数.value == '1回目' && record.送信1回目フラグ.value == '送信済み'){
    //                     //記入者_電話
    //                     if(record.ご返答内容_記入者_電話.value == undefined || record.ご返答内容_記入者_電話.value == ''){
    //                         var reply_content_entry_person_call = '';
    //                     }else{
    //                         var reply_content_entry_person_call = record.ご返答内容_記入者_電話.value;
    //                     }
    //                     //ご返答内容_電話
    //                     if(record.ご返答内容_電話.value == undefined || record.ご返答内容_電話.value == ''){
    //                         var reply_content_call = '';
    //                     }else{
    //                         var reply_content_call = record.ご返答内容_電話.value;
    //                     }
    //                     //ご返答日_電話
    //                     if(record.ご返答日_電話.value == undefined || record.ご返答日_電話.value == ''){
    //                         var reply_content_call = '';
    //                     }else{
    //                         var reply_content_call = record.ご返答日_電話.value;
    //                     }

    //                     //記入者
    //                     record.Garoon送信メッセージ内容.value = 
    //                     '【2通目(始)】' + '\n' +
    //                     '記入者：' + reply_content_entry_person_call + '\n' +
    //                     'ご返答内容：' + '\n'  + reply_content_call + '\n' +
    //                     'ご返答日：' + reply_content_call + '\n' +
    //                     '【2通目(終)】';

    //                 }else{
    //                     //変化があったフィールドのみを送信する予定(一旦コメントで待機)
    //                     record.Garoon送信メッセージ内容.value ='2回目以降のメッセージ内容は未実装です。';
    //                 }
    //         }else if(record.受付方法.value == 'メール・ネットアンケート' || record.受付方法.value == '口コミサイト'){

    //                 //ご来店日時を編集
    //                 if(record.ご来店日時_メール_ネットアンケート.value == '' || record.ご来店日時_メール_ネットアンケート.value == undefined){
    //                     var visits_date_mail_net = '' ;
    //                     var visits_time_mail_net = '';
    //                 }else {
    //                     var visits_date_time_mail_net = record.ご来店日時_メール_ネットアンケート.value;
    //                     const dateTime = new Date(visits_date_time_mail_net);

    //                     // 年月日の取得
    //                     const year = dateTime.getFullYear();
    //                     const month = String(dateTime.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため、1を加え、2桁に整形
    //                     const day = String(dateTime.getDate()).padStart(2, '0'); // 日も2桁に整形

    //                     // 時分の取得
    //                     const hours = String(dateTime.getHours()).padStart(2, '0');
    //                     const minutes = String(dateTime.getMinutes()).padStart(2, '0');

    //                     // ご来店日
    //                     var visits_date_mail_net = `${year}-${month}-${day}`;
                        
    //                     // 来店時間
    //                     var visits_time_mail_net = `${hours}:${minutes}`;
    //                 }

    //                 //ご利用人数
    //                 if(record.ご利用人数_メール_ネット.value == undefined || record.ご利用人数_メール_ネット.value == ''){
    //                     var use_count = '';
    //                 }else{
    //                     var use_count = record.ご利用人数_メール_ネット.value;
    //                 }

    //                 //お気づきの内容
    //                 if(record.お気づきの内容.value == undefined || record.お気づきの内容.value == '' ){
    //                     var opinion_detail = '';
    //                 }else{
    //                     var opinion_detail = record.お気づきの内容.value;
    //                 }

    //                 //総合評価
    //                 if(record.総合評価_メール.value == undefined || record.総合評価_メール.value == ''){
    //                     var evaluation_mail = '';
    //                 }else{
    //                     var evaluation_mail = record.総合評価_メール.value;
    //                 }

    //                 //性別
    //                 if(record.性別_メール.value == undefined || record.性別_メール.value == ''){
    //                     var sex_mail = '';
    //                 }else{
    //                     var sex_mail = record.性別_メール.value;
    //                 }

    //                 //漢字氏名
    //                 if(record.お名前_メール.value == undefined || record.お名前_メール.value == ''){
    //                     var name_mail = '';
    //                 }else{
    //                     var name_mail = record.お名前_メール.value;
    //                 }   

    //                 //ご連絡先
    //                 if(record.ご連絡先_メール.value == undefined || record.ご連絡先_メール.value == ''){
    //                     var contact_address_call = '';
    //                 }else{
    //                     var contact_address_call = record.ご連絡先_メール.value;
    //                 }

    //                 //電話の場合、Garoonに送信するメッセージを作成
    //                 if(record.お客様とのご連絡回数.value == '1回目' && record.送信1回目フラグ.value == '未送信' && record.アンケート報告書.value == '要'){
    //                     record.Garoon送信メッセージ内容.value = 
    //                     '【1通目(始)】' + '\n' +
    //                     'ご利用店舗:' + record.店名.value+ '\n' + 
    //                     'ご来店日:' + visits_date_mail_net + '\n' + 
    //                     '来店日時:' + visits_time_mail_net +'\n' + 
    //                     '利用人数:' + use_count + '\n' +  
    //                     'お気づきの内容:'+ '\n' + opinion_detail + '\n'  + 
    //                     '総合評価:' + evaluation_mail + '\n' + 
    //                     '性別:' + sex_mail + '\n' + 
    //                     '漢字氏名:' + name_mail + '\n' + 
    //                     'ご連絡先:' + contact_address_call +
    //                     'アンケート報告書：必要' + '\n'+
    //                     '【1通目(終)】';
    //                 }else if (record.お客様とのご連絡回数.value == '1回目' && record.送信1回目フラグ.value == '未送信' && record.アンケート報告書.value == '否'){
    //                     record.Garoon送信メッセージ内容.value =
    //                     '【1通目(始)】' + '\n' + 
    //                     'ご利用店舗：' + record.店名.value+ '\n' + 
    //                     'ご来店日:' + visits_date_mail_net + '\n' + 
    //                     '来店日時:' + visits_time_mail_net +'\n' + 
    //                     '利用人数:' + use_count + '\n' +  
    //                     'お気づきの内容:'+ '\n' + opinion_detail + '\n'  + 
    //                     '総合評価:' + evaluation_mail + '\n' + 
    //                     '性別:' + sex_mail + '\n' + 
    //                     '漢字氏名:' + name_mail + '\n' + 
    //                     'ご連絡先:' + contact_address_call + '\n' + 
    //                     '【1通目(終)】';
    //                 }else if(record.お客様とのご連絡回数.value == '1回目' && record.送信1回目フラグ.value == '送信済み'){
    //                     //記入者_メール
    //                     if(record.ご返信内容_記入者_メール.value == undefined || record.ご返信内容_記入者_メール.value == ''){
    //                         var reply_content_entry_person_email = '';
    //                     }else{
    //                         var reply_content_entry_person_email = record.ご返信内容_記入者_メール.value;
    //                     }
    //                     //ご返答内容_電話
    //                     if(record.ご返答内容_メール.value == undefined || record.ご返答内容_メール.value == ''){
    //                         var reply_content_email = '';
    //                     }else{
    //                         var reply_content_email = record.ご返答内容_メール.value;
    //                     }
    //                     //ご返答日_電話
    //                     if(record.ご返答日_電話.value == undefined || record.ご返答日_電話.value == ''){
    //                         var reply_date_email = '';
    //                     }else{
    //                         var reply_date_email = record.ご返答日_電話.value;
    //                     }

    //                     //記入者
    //                     record.Garoon送信メッセージ内容.value = 
    //                     '【2通目(始)】' + '\n' +
    //                     '記入者' + reply_content_entry_person_email + '\n' +
    //                     'ご返答内容' + '\n'  + reply_content_email + '\n' +
    //                     'ご返答日' + reply_date_email + '\n' +
    //                     '【2通目(終)】';
    //                 }else{
    //                     record.Garoon送信メッセージ内容.value = '3通目以降のメッセージ内容は未実装です。'
    //                 }


    //         }

    //     //送信するメッセージの内容を構築する(終わり)---------------------------------------------------------------------------------------
    //     }
    //     return event;
    // });

    //--------------------------------------------------------------------------------
    //以下、印刷画面の制御
    //--------------------------------------------------------------------------------
    //(詳細画面)表示したとき
    kintone.events.on("app.record.print.show", event => {
        const record = event.record;

        //フィールドを非表示
        kintone.app.record.setFieldShown('Garoonメッセージ送信制御', false);
        kintone.app.record.setFieldShown('Garoon送信メッセージ内容', false);
        kintone.app.record.setFieldShown('Garoon送信履歴', false);

        //アンケート報告書
        if(record.アンケート報告書.value == "要"){
            kintone.app.record.setFieldShown('アンケート報告書_グループ',true);
            kintone.app.record.setGroupFieldOpen('アンケート報告書_グループ', true);
        }else{
            kintone.app.record.setFieldShown('アンケート報告書_グループ',false);
        }
    
        //システム管理者用を非表示にする
        kintone.app.record.setFieldShown('システム管理者用',false); 
        return event;
    });

    

})();