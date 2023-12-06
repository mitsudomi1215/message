(function() {
    'use strict';

    //trueが表示
    //falseが非表示

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//メモ
//
//
//以下、新規画面//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //(新規作成画面)表示したとき
    kintone.events.on("app.record.create.show", event => {
        const record = event.record;

        //フィールド編集不可
        record.お客様とのご連絡回数.disabled = true;

        kintone.app.record.setFieldShown('メール・口コミサイト受付', false);
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
        kintone.app.record.setGroupFieldOpen('メール・口コミサイト受付', true);
        kintone.app.record.setGroupFieldOpen('アンケート報告書', true);

        return event;

    });

    //(新規画面)(グループ)
    kintone.events.on("app.record.create.change.受付方法", event => {
        const record = event.record;
        if(record.受付方法.value == "電話"){
            kintone.app.record.setFieldShown('メール・口コミサイト受付', false);
            kintone.app.record.setFieldShown('電話受付', true);
        }else if(record.受付方法.value == "メール・ネットアンケート"){
            kintone.app.record.setFieldShown('メール・口コミサイト受付', true);
            kintone.app.record.setFieldShown('電話受付', false);
        }else if(record.受付方法.value == "口コミサイト"){
            kintone.app.record.setFieldShown('メール・口コミサイト受付', true);
            kintone.app.record.setFieldShown('電話受付', false);
        }else {
            kintone.app.record.setFieldShown('メール・口コミサイト受付', false);
            kintone.app.record.setFieldShown('電話受付', false);
        }
    });

    //(新規画面)(アンケート報告書)
    kintone.events.on("app.record.create.change.アンケート報告書", event => {
        const record = event.record;

        //アンケート報告書
        if(record.アンケート報告書.value == "表示"){
            kintone.app.record.setFieldShown('アンケート報告書_グループ',true);
            kintone.app.record.setGroupFieldOpen('アンケート報告書_グループ', true);
        }else{
            kintone.app.record.setFieldShown('アンケート報告書_グループ',false);
        }
    });
    



//以下、詳細画面//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //(詳細画面)表示したとき
    kintone.events.on("app.record.detail.show", event => {
        const record = event.record;

        if(record.受付方法.value == "電話"){
            kintone.app.record.setFieldShown('メール・口コミサイト受付', false);
            kintone.app.record.setFieldShown('電話受付', true);
        }else if(record.受付方法.value == "メール・ネットアンケート"){
            kintone.app.record.setFieldShown('メール・口コミサイト受付', true);
            kintone.app.record.setFieldShown('電話受付', false);
        }else if(record.受付方法.value == "口コミサイト"){
            kintone.app.record.setFieldShown('メール・口コミサイト受付', true);
            kintone.app.record.setFieldShown('電話受付', false);
        }else {
            kintone.app.record.setFieldShown('メール・口コミサイト受付', false);
            kintone.app.record.setFieldShown('電話受付', false);
        }
        //お客様とのご連絡回数
        if(record.お客様とのご連絡回数.value == "1回目"){
            //グループの開閉
            kintone.app.record.setGroupFieldOpen('店舗情報詳細',false );
            kintone.app.record.setGroupFieldOpen('電話受付', true)
            kintone.app.record.setGroupFieldOpen('メール・口コミサイト受付', true);
            kintone.app.record.setGroupFieldOpen('アンケート報告書_グループ', true);

            //グループの表示
            kintone.app.record.setFieldShown('お客様とのご連絡詳細_2回目_',false);
            kintone.app.record.setFieldShown('お客様とのご連絡詳細_3回目_',false);

        }else if(record.お客様とのご連絡回数.value == "2回目"){
            //グループの開閉
            kintone.app.record.setGroupFieldOpen('店舗情報詳細',false );
            kintone.app.record.setGroupFieldOpen('電話受付', false)
            kintone.app.record.setGroupFieldOpen('メール・口コミサイト受付', false);
            kintone.app.record.setGroupFieldOpen('お客様とのご連絡詳細_2回目_', true);

            //グループの表示
            kintone.app.record.setFieldShown('お客様とのご連絡詳細_2回目_',true);
            kintone.app.record.setFieldShown('お客様とのご連絡詳細_3回目_',false);

        }else if(record.お客様とのご連絡回数.value == "3回目"){

            //グループの開閉
            kintone.app.record.setGroupFieldOpen('店舗情報詳細',false );
            kintone.app.record.setGroupFieldOpen('電話受付', false);
            kintone.app.record.setGroupFieldOpen('メール・口コミサイト受付', false);
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
        if(record.アンケート報告書.value == "表示"){
            kintone.app.record.setFieldShown('アンケート報告書_グループ',true);
            kintone.app.record.setGroupFieldOpen('アンケート報告書_グループ', true);
        }else{
            kintone.app.record.setFieldShown('アンケート報告書_グループ',false);
        }

        //システム管理者用を非表示にする
        kintone.app.record.setFieldShown('システム管理者用',false);
    });
          

//以下、編集画面/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //(編集画面)表示したとき
    kintone.events.on("app.record.edit.show", event => {
        const record = event.record;
        if(record.受付方法.value == "電話"){
            kintone.app.record.setFieldShown('メール・口コミサイト受付', false);
            kintone.app.record.setFieldShown('電話受付', true);
        }else if(record.受付方法.value == "メール・ネットアンケート"){
            kintone.app.record.setFieldShown('メール・口コミサイト受付', true);
            kintone.app.record.setFieldShown('電話受付', false);
        }else if(record.受付方法.value == "口コミサイト"){
            kintone.app.record.setFieldShown('メール・口コミサイト受付', true);
            kintone.app.record.setFieldShown('電話受付', false);
        }else {
            kintone.app.record.setFieldShown('メール・口コミサイト受付', false);
            kintone.app.record.setFieldShown('電話受付', false);
        }
        //お客様とのご連絡回数
        if(record.お客様とのご連絡回数.value == "1回目"){
            //グループの開閉
            kintone.app.record.setGroupFieldOpen('店舗情報詳細',false );
            kintone.app.record.setGroupFieldOpen('電話受付', true)
            kintone.app.record.setGroupFieldOpen('メール・口コミサイト受付', true);
            kintone.app.record.setGroupFieldOpen('アンケート報告書_グループ', true);

            //グループの表示
            kintone.app.record.setFieldShown('お客様とのご連絡詳細_2回目_',false);
            kintone.app.record.setFieldShown('お客様とのご連絡詳細_3回目_',false);

        }else if(record.お客様とのご連絡回数.value == "2回目"){
            //グループの開閉
            kintone.app.record.setGroupFieldOpen('店舗情報詳細',false );
            kintone.app.record.setGroupFieldOpen('電話受付', false)
            kintone.app.record.setGroupFieldOpen('メール・口コミサイト受付', false);
            kintone.app.record.setGroupFieldOpen('お客様とのご連絡詳細_2回目_', true);

            //グループの表示
            kintone.app.record.setFieldShown('お客様とのご連絡詳細_2回目_',true);
            kintone.app.record.setFieldShown('お客様とのご連絡詳細_3回目_',false);

        }else if(record.お客様とのご連絡回数.value == "3回目"){

            //グループの開閉
            kintone.app.record.setGroupFieldOpen('店舗情報詳細',false );
            kintone.app.record.setGroupFieldOpen('電話受付', false);
            kintone.app.record.setGroupFieldOpen('メール・口コミサイト受付', false);
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
        if(record.アンケート報告書.value == "表示"){
            kintone.app.record.setFieldShown('アンケート報告書_グループ',true);
            kintone.app.record.setGroupFieldOpen('アンケート報告書_グループ', true);
        }else{
            kintone.app.record.setFieldShown('アンケート報告書_グループ',false);
        }

        //システム管理者用を非表示にする
        kintone.app.record.setFieldShown('システム管理者用',false);
    });

    //(編集画面)(グループ)
    kintone.events.on("app.record.edit.change.受付方法", event => {
        const record = event.record;
        if(record.受付方法.value == "電話"){
            kintone.app.record.setFieldShown('メール・口コミサイト受付', false);
            kintone.app.record.setFieldShown('電話受付', true);
        }else if(record.受付方法.value == "メール・ネットアンケート"){
            kintone.app.record.setFieldShown('メール・口コミサイト受付', true);
            kintone.app.record.setFieldShown('電話受付', false);
        }else if(record.受付方法.value == "口コミサイト"){
            kintone.app.record.setFieldShown('メール・口コミサイト受付', true);
            kintone.app.record.setFieldShown('電話受付', false);
        }else {
            kintone.app.record.setFieldShown('メール・口コミサイト受付', false);
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
            kintone.app.record.setGroupFieldOpen('メール・口コミサイト受付', true);
            kintone.app.record.setGroupFieldOpen('アンケート報告書_グループ', true);

            //グループの表示
            kintone.app.record.setFieldShown('お客様とのご連絡詳細_2回目_',false);
            kintone.app.record.setFieldShown('お客様とのご連絡詳細_3回目_',false);

        }else if(record.お客様とのご連絡回数.value == "2回目"){
            //グループの開閉
            kintone.app.record.setGroupFieldOpen('店舗情報詳細',false );
            kintone.app.record.setGroupFieldOpen('電話受付', false)
            kintone.app.record.setGroupFieldOpen('メール・口コミサイト受付', false);
            kintone.app.record.setGroupFieldOpen('お客様とのご連絡詳細_2回目_', true);

            //グループの表示
            kintone.app.record.setFieldShown('お客様とのご連絡詳細_2回目_',true);
            kintone.app.record.setFieldShown('お客様とのご連絡詳細_3回目_',false);

        }else if(record.お客様とのご連絡回数.value == "3回目"){

            //グループの開閉
            kintone.app.record.setGroupFieldOpen('店舗情報詳細',false );
            kintone.app.record.setGroupFieldOpen('電話受付', false);
            kintone.app.record.setGroupFieldOpen('メール・口コミサイト受付', false);
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
    kintone.events.on("app.record.edit.change.アンケート報告書", event => {
        const record = event.record;

        //アンケート報告書
        if(record.アンケート報告書.value == "表示"){
            kintone.app.record.setFieldShown('アンケート報告書_グループ',true);
        }else{
            kintone.app.record.setFieldShown('アンケート報告書_グループ',false);
        }
    });



})();
