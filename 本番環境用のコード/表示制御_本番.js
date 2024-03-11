(function() {
    'use strict';

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//以下、共通処理(新規・詳細・編集・印刷画面)
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
kintone.events.on(["app.record.create.show","app.record.detail.show","app.record.edit.show"], event => {
    const record = event.record;
    var GetLoginUser = kintone.getLoginUser()

    // console.warn("ゲットユーザー",GetLoginUser);
    //【変更】ログインユーザーが1以外のユーザーにはフィールドを隠す処理(環境が変わった際は、メッセージの更新・削除を行うユーザーにしてください。)
    if(GetLoginUser.id != 8561){
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
    kintone.app.record.setFieldShown('システム管理者用',false); 
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
    }else if(record.受付方法.value == "口コミサイト"){
        if(record.受付日時_口コミ.value == undefined || record.受付日時_口コミ.value == ''){

        }else{
            record.受付日時_まとめ.value  = record.受付日時_口コミ.value;
        }
    }else{
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
        kintone.app.record.setFieldShown('口コミサイト受付', false);
        kintone.app.record.setFieldShown('メール・ネットアンケート受付', false);
        kintone.app.record.setFieldShown('電話受付', true);
    }else if(record.受付方法.value == "メール・ネットアンケート"){
        kintone.app.record.setFieldShown('口コミサイト受付', false);
        kintone.app.record.setFieldShown('メール・ネットアンケート受付', true);
        kintone.app.record.setFieldShown('電話受付', false);
    }else if(record.受付方法.value == "口コミサイト"){
        kintone.app.record.setFieldShown('口コミサイト受付', true);
        kintone.app.record.setFieldShown('メール・ネットアンケート受付', false);
        kintone.app.record.setFieldShown('電話受付', false);
    }else {
        kintone.app.record.setFieldShown('口コミサイト受付', false);
        kintone.app.record.setFieldShown('メール・ネットアンケート受付', false);
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

//メール・ネットアンケートの総合評価が利用したくないの時
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

//口コミサイトの総合評価が利用したくないの時
kintone.events.on([ 'app.record.edit.change.総合評価_口コミ', 'app.record.create.change.総合評価_口コミ'], event => {
    const rec = event.record;
    if (rec.総合評価_口コミ.value == '利用したくない') {
        rec.アンケート報告書_口コミ.value = '要';
    }else{
        rec.アンケート報告書_口コミ.value = '否';
    }

    if(rec.総合評価_口コミ.value == "ー" ){
        rec.内容.value = '未記入、その他';
    }else{
        rec.内容.value = rec.総合評価_口コミ.value;
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

kintone.events.on(['app.record.create.change.ご来店日時_電話','app.record.edit.change.ご来店日時_電話','app.record.create.change.ご来店日時_メール_ネットアンケート','app.record.edit.change.ご来店日時_メール_ネットアンケート','app.record.create.change.ご来店日時_口コミ','app.record.edit.change.ご来店日時_口コミ'], event => {
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
    }else if(record.受付方法.value == "口コミサイト"){
        if(record.ご来店日時_口コミ.value == undefined || record.ご来店日時_口コミ.value == ''){

        }else{
            record.発生日時.value = record.ご来店日時_口コミ.value;

            //日付_発生日時に代入
            var visits_date_time_review = new Date(record.ご来店日時_口コミ.value);
            // const dateTime = visits_date_time_call.toISOString('ja-JP', options).split('T')[0];
            // 年月日の取得
            const year = visits_date_time_review.getFullYear();
            const month = String(visits_date_time_review.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため、1を加え、2桁に整形
            const day = String(visits_date_time_review.getDate()).padStart(2, '0'); // 日も2桁に整形
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
    }else if(record.受付方法.value == "口コミサイト"){
        if(record.発生日時.value == undefined || record.発生日時.value == ''){
            
        }else{
            var visits_date_time_review = new Date(record.発生日時.value);
            // const dateTime = visits_date_time_call.toISOString('ja-JP', options).split('T')[0];
            // 年月日の取得
            const year = visits_date_time_review.getFullYear();
            const month = String(visits_date_time_review.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため、1を加え、2桁に整形
            const day = String(visits_date_time_review.getDate()).padStart(2, '0'); // 日も2桁に整形
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
        kintone.app.record.setFieldShown('口コミサイト受付',false );
        kintone.app.record.setFieldShown('メール・ネットアンケート受付', false);
        kintone.app.record.setFieldShown('電話受付', true);
    }else if(record.受付方法.value == "メール・ネットアンケート"){
        kintone.app.record.setFieldShown('口コミサイト受付',false );
        kintone.app.record.setFieldShown('メール・ネットアンケート受付', true);
        kintone.app.record.setFieldShown('電話受付', false);
    }else if(record.受付方法.value == "口コミサイト"){
        kintone.app.record.setFieldShown('口コミサイト受付',true );
        kintone.app.record.setFieldShown('メール・ネットアンケート受付', false);
        kintone.app.record.setFieldShown('電話受付', false);
    }else {
        kintone.app.record.setFieldShown('口コミサイト受付',false);
        kintone.app.record.setFieldShown('メール・ネットアンケート受付', false);
        kintone.app.record.setFieldShown('電話受付', false);
    }
    //お客様とのご連絡回数
    if(record.お客様とのご連絡回数.value == "1回目"){
        //グループの開閉
        kintone.app.record.setGroupFieldOpen('店舗情報詳細',false );
        kintone.app.record.setGroupFieldOpen('電話受付', true);
        kintone.app.record.setGroupFieldOpen('メール・ネットアンケート受付', true);
        kintone.app.record.setGroupFieldOpen('口コミサイト受付', true)
        kintone.app.record.setGroupFieldOpen('アンケート報告書_グループ', true);

        //グループの表示
        kintone.app.record.setFieldShown('お客様とのご連絡詳細_2回目_',false);
        kintone.app.record.setFieldShown('お客様とのご連絡詳細_3回目_',false);
    }else if(record.お客様とのご連絡回数.value == "2回目"){
        //グループの開閉
        kintone.app.record.setGroupFieldOpen('店舗情報詳細',false );
        kintone.app.record.setGroupFieldOpen('電話受付', false)
        kintone.app.record.setGroupFieldOpen('メール・ネットアンケート受付', false);
        kintone.app.record.setGroupFieldOpen('口コミサイト受付', false)
        kintone.app.record.setGroupFieldOpen('お客様とのご連絡詳細_2回目_', true);

        //グループの表示
        kintone.app.record.setFieldShown('お客様とのご連絡詳細_2回目_',true);
        kintone.app.record.setFieldShown('お客様とのご連絡詳細_3回目_',false);
    }else if(record.お客様とのご連絡回数.value == "3回目"){

        //グループの開閉
        kintone.app.record.setGroupFieldOpen('店舗情報詳細',false );
        kintone.app.record.setGroupFieldOpen('電話受付', false);
        kintone.app.record.setGroupFieldOpen('メール・ネットアンケート受付', false);
        kintone.app.record.setGroupFieldOpen('口コミサイト受付', false)
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
        kintone.app.record.setFieldShown('電話受付', false);
        kintone.app.record.setFieldShown('メール・ネットアンケート受付', false);
        kintone.app.record.setFieldShown('口コミサイト受付', false);
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
        kintone.app.record.setGroupFieldOpen('メール・ネットアンケート受付', true);
        kintone.app.record.setGroupFieldOpen('口コミサイト受付', true);
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
        if(GetLoginUser.id == 8561){
            // スペースフィールド
            const element = kintone.app.record.getSpaceElement('send_message');
            element.innerHTML = '送信する➝Garoonメッセージを作成';;
            element.style.cssText = 'color: red; font-size: 18px; font-weight: bold;';

            // スペースフィールド
            const warning_statement = kintone.app.record.getSpaceElement('message_warning');
            warning_statement.innerHTML = '"送信する"を選択後、メッセージを修正してください。';
            warning_statement.style.cssText = 'color: red; font-size: 18px; font-weight: bold;';
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
            kintone.app.record.setGroupFieldOpen('メール・ネットアンケート受付', true);
            kintone.app.record.setGroupFieldOpen('口コミサイト受付', true);
            kintone.app.record.setGroupFieldOpen('アンケート報告書_グループ', true);

            //グループの表示
            kintone.app.record.setFieldShown('お客様とのご連絡詳細_2回目_',false);
            kintone.app.record.setFieldShown('お客様とのご連絡詳細_3回目_',false);

        }else if(record.お客様とのご連絡回数.value == "2回目"){
            //グループの開閉
            kintone.app.record.setGroupFieldOpen('店舗情報詳細',false );
            kintone.app.record.setGroupFieldOpen('電話受付', false)
            kintone.app.record.setGroupFieldOpen('メール・ネットアンケート受付', false);
            kintone.app.record.setGroupFieldOpen('口コミサイト受付', false);
            kintone.app.record.setGroupFieldOpen('お客様とのご連絡詳細_2回目_', true);

            //グループの表示
            kintone.app.record.setFieldShown('お客様とのご連絡詳細_2回目_',true);
            kintone.app.record.setFieldShown('お客様とのご連絡詳細_3回目_',false);

        }else if(record.お客様とのご連絡回数.value == "3回目"){

            //グループの開閉
            kintone.app.record.setGroupFieldOpen('店舗情報詳細',false );
            kintone.app.record.setGroupFieldOpen('電話受付', false);
            kintone.app.record.setGroupFieldOpen('メール・ネットアンケート受付', false);
            kintone.app.record.setGroupFieldOpen('口コミサイト受付', false);
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