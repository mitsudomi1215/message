(function() {
    'use strict';

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//以下、新規画面
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //(新規作成画面)表示したとき
    kintone.events.on("app.record.create.show", event => {
        const record = event.record;

        //フィールド編集不可
        record.お客様とのご連絡回数.disabled = true;
        record.Garoonリンク.disabled = true;

        kintone.app.record.setFieldShown('メール・ネットアンケート・口コミサイト受付', false);
        kintone.app.record.setFieldShown('電話受付', false);
        kintone.app.record.setFieldShown('お客様とのご連絡詳細_2回目以降_', false);

        //アンケート報告書を非表示にする
        kintone.app.record.setFieldShown('アンケート報告書_グループ',false);

        //システム管理者用を非表示にする
        kintone.app.record.setFieldShown('システム管理者用',false);

        //お客様とのご連絡詳細_2回目
        kintone.app.record.setFieldShown('お客様とのご連絡詳細_2回目_',false);

        //お客様とのご連絡詳細_3回目
        kintone.app.record.setFieldShown('お客様とのご連絡詳細_3回目_',false);

        //グループの制御  (変更)
        kintone.app.record.setGroupFieldOpen('電話受付', true)
        kintone.app.record.setGroupFieldOpen('メール・ネットアンケート・口コミサイト受付', true);
        kintone.app.record.setGroupFieldOpen('アンケート報告書', true);

        return event;

    });

    //(新規画面)(グループ)
    kintone.events.on("app.record.create.change.受付方法", event => {
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
    });

    //(新規画面)(アンケート報告書)
    kintone.events.on("app.record.create.change.アンケート報告書", event => {
        const record = event.record;

        //アンケート報告書
        if(record.アンケート報告書.value == "要"){
            kintone.app.record.setFieldShown('アンケート報告書_グループ',true);
            kintone.app.record.setGroupFieldOpen('アンケート報告書_グループ', true);
        }else{
            kintone.app.record.setFieldShown('アンケート報告書_グループ',false);
        }
    });

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//以下、詳細画面
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //(詳細画面)表示したとき
    kintone.events.on("app.record.detail.show", event => {
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
//以下、編集画面
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //(編集画面)表示したとき
    kintone.events.on("app.record.edit.show", event => {
        const record = event.record;
        
        //Garoonリンクフィールドを編集不可
        record.Garoonリンク.disabled = true;
        
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
        //アンケート報告書
        if(record.アンケート報告書.value == "要"){
            kintone.app.record.setFieldShown('アンケート報告書_グループ',true);
            kintone.app.record.setGroupFieldOpen('アンケート報告書_グループ', true);
        }else{
            kintone.app.record.setFieldShown('アンケート報告書_グループ',false);
        }

        //システム管理者用を非表示にする
        kintone.app.record.setFieldShown('システム管理者用',false);

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

         //Garoonメッセージ送信内容フィールドを作成する
         if(record.コメント.value == undefined){
            record.Garoon送信メッセージ内容.value = '店番:' + record.店番.value + '\n' +'店名:' + record.店名.value;
          }else{
            record.Garoon送信メッセージ内容.value = '店番:' + record.店番.value + '\n' +'店名:' + record.店名.value + '\n' + 'コメント:' + record.コメント.value;
          }        

        return event;
    });

    //(編集画面)(グループ)
    kintone.events.on("app.record.edit.change.受付方法", event => {
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
    });

    // //(編集画面)(グループ)
    // kintone.events.on("app.record.edit.change.チェックボックス", event => {
    //     const record = event.record;
    //     if(record.チェックボックス.value == "店舗・ユーザー情報非表示"){
    //         kintone.app.record.setFieldShown('店舗情報詳細', false);
    //         kintone.app.record.setFieldShown('閲覧権限追加ユーザー', false);
    //         kintone.app.record.setFieldShown('特約店ユーザーID', false);
    //     }else {
    //         kintone.app.record.setFieldShown('店舗情報詳細', true);
    //         kintone.app.record.setFieldShown('閲覧権限追加ユーザー', true);
    //         kintone.app.record.setFieldShown('特約店ユーザーID', true);
    //     }
    // });

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

    //(編集画面)(グループ)
    kintone.events.on(['app.record.edit.change.アンケート報告書','app.record.create.change.アンケート報告書'], event => {
        const record = event.record;

        //アンケート報告書
        if(record.アンケート報告書.value == "要"){
            kintone.app.record.setFieldShown('アンケート報告書_グループ',true);
        }else{
            kintone.app.record.setFieldShown('アンケート報告書_グループ',false);
        }
    });

    //メール・口コミ、ネットアンケートの総合評価が利用したくないの時
    kintone.events.on([ 'app.record.edit.change.総合評価_メール', 'app.record.create.change.総合評価_メール'], event => {
        const rec = event.record;
        if (rec.総合評価_メール.value == '利用したくない') {
          rec.アンケート報告書_メール.value = '要';
        }else{
          rec.アンケート報告書_メール.value = '否';
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
        return event;
    });

    //発生日時を日付フィールドに変換
    kintone.events.on([
        'app.record.edit.change.発生日時',
        'app.record.create.change.発生日時'
      ], event => {
        var record = event.record;

        // 文字列からDateオブジェクトを作成
        const dateTimeObject = new Date(record.発生日時.value);
        // 日付部分のみを取得
        record.日付_発生日時.value = dateTimeObject.toISOString().split('T')[0];
      
        return event;
    });
      


})();
