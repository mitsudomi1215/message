(function() {
    'use strict';

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//以下、共通処理(新規・詳細・編集)
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
kintone.events.on(["app.record.create.show","app.record.detail.show","app.record.edit.show"], event => {
    const record = event.record;
    
    //【変更】ログインユーザーが1以外のユーザーにはフィールドを隠す処理(環境が変わった際は、メッセージの更新・削除を行うユーザーにしてください。)
    if(kintone.getLoginUser()!=1){
        kintone.app.record.setFieldShown('Garoonメッセージ送信制御', false);
        kintone.app.record.setFieldShown('Garoon送信メッセージ内容', false);
        kintone.app.record.setFieldShown('Garoon送信履歴', false);
    }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//以下、共通処理(新規・詳細)
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
kintone.events.on("app.record.create.show", event => {
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
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//以下、新規画面
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //(新規作成画面)表示したとき
    kintone.events.on("app.record.create.show", event => {
        const record = event.record;

        //フィールド編集不可
        record.お客様とのご連絡回数.disabled = true;

        //Garoonメッセージ送信制御を非表示
        kintone.app.record.setFieldShown('Garoonメッセージ送信制御', false);

        //グループを非表示
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

        //グループの制御
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

        // スペースフィールド
        const element = kintone.app.record.getSpaceElement('send_message');
        console.warn("取得した要素の情報",element);
        element.innerHTML = '送信するを選択するとGaroonメッセージを作成';
        element.style.cssText = 'color: red; font-size: 18px; font-weight: bold;';

        //Garoonメッセージ送信制御
        record.Garoonメッセージ送信制御.value = '送信しない';

        //Garoon送信履歴入力不可
        record.Garoon送信履歴.disabled = true;

        // button_click();//追加
        
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

    //送信するメッセージの内容を作成する
    kintone.events.on([
        'app.record.edit.change.Garoonメッセージ送信制御'
        ], event => {
        var record = event.record;

        if(record.Garoonメッセージ送信制御.value == '送信する'){
            //送信するメッセージの内容を構築する(始まり)初期表示+変更があるごとに------------------------------------------------------------
            //コメントフィールド
            if(record.コメント.value == '' || record.コメント.value == undefined){
                var comment = '';
            }else {
                var comment = '\n' + 'コメント:' + record.コメント.value;
            }
            if(record.お客様とのご連絡回数.value == '1回目' && record.送信1回目フラグ.value == '未送信' && record.アンケート報告書.value == '要'){
                record.Garoon送信メッセージ内容.value = '店番：' + record.店番.value + '\n' + '店名：' + record.店名.value + comment + '\n' + 'アンケート報告書：必要';
            }else if (record.お客様とのご連絡回数.value == '1回目' && record.送信1回目フラグ.value == '未送信' && record.アンケート報告書.value == '否'){
                record.Garoon送信メッセージ内容.value = '店番：' + record.店番.value + '\n' + '店名：' + record.店名.value + comment;
            }else if(record.お客様とのご連絡回数.value == '1回目' && record.送信1回目フラグ.value == '送信済み'){
                //変化があったフィールドのみを送信する予定(一旦コメントで待機)
                record.Garoon送信メッセージ内容.value = 'コメント：' + record.コメント.value;
            }
        //送信するメッセージの内容を構築する(終わり)---------------------------------------------------------------------------------------
        }
        return event;
    });
})();
