(function() {
    'use strict';

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//以下、共通処理(新規・詳細・編集・印刷画面)
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
kintone.events.on(["app.record.create.show","app.record.detail.show","app.record.edit.show"], event => {
    const record = event.record;

    var GetLoginUser = kintone.getLoginUser()
    // console.warn("ログインユーザー情報",GetLoginUser);

    //【変更】ログインユーザーが1以外のユーザーにはフィールドを隠す処理(環境が変わった際は、メッセージの更新・削除を行うユーザーにしてください。)
    if(GetLoginUser.id != 5790){
        kintone.app.record.setFieldShown('Garoonメッセージ送信制御', false);
        kintone.app.record.setFieldShown('Garoon送信メッセージ内容', false);
        kintone.app.record.setFieldShown('Garoon送信履歴', false);
    }

    //アンケート報告書
    if(record.アンケート報告書.value == "要"){
        kintone.app.record.setFieldShown('アンケート報告書_グループ',true);
        kintone.app.record.setGroupFieldOpen('アンケート報告書_グループ', true);

        //顛末を表示
        kintone.app.record.setFieldShown('顛末', false);
        //部長顛末確認を非表示
        kintone.app.record.setFieldShown('顛末確認_部長', false);
        //コールセンター顛末確認、確認日時を非表示
        kintone.app.record.setFieldShown('顛末確認者_顛末', false);
        kintone.app.record.setFieldShown('確認日時_顛末', false);
        //コールセンターメモ_顛末を表示
        kintone.app.record.setFieldShown('コールセンターメモ_顛末', false);

        //顛末という文字を削除
        const tenmatsuField = kintone.app.record.getSpaceElement('tenmatsu');
        if (tenmatsuField) {
            tenmatsuField.style.display = 'none';
        }

        //顛末の部長という文字を削除
        const managerField = kintone.app.record.getSpaceElement('manager');
        if (managerField) {
            managerField.style.display = 'none';
        }
        
        //顛末のコールセンターという文字を削除
        const callCenterField = kintone.app.record.getSpaceElement('call_center');
        if (callCenterField) {
            callCenterField.style.display = 'none';
        }
    }else{
        //アンケート報告書のグループを非表示
        kintone.app.record.setFieldShown('アンケート報告書_グループ',false);

        //顛末を表示
        kintone.app.record.setFieldShown('顛末', true);
        //部長顛末確認を表示
        kintone.app.record.setFieldShown('顛末確認_部長', true);
        //コールセンター顛末確認、確認日時を表示
        kintone.app.record.setFieldShown('顛末確認者_顛末', true);
        kintone.app.record.setFieldShown('確認日時_顛末', true);
        //コールセンターメモ_顛末を表示
        kintone.app.record.setFieldShown('コールセンターメモ_顛末', true);
        // スペースフィールド
        const tenmatsu_field = kintone.app.record.getSpaceElement('tenmatsu');
        if (tenmatsu_field) {
            tenmatsu_field.innerHTML = '顛末';
            tenmatsu_field.style.cssText = 'font-size: 26px; font-weight: bold; margin-left:15px; background-color: rgb(255, 242, 204);';
        }
        // スペースフィールド
        const manager_field = kintone.app.record.getSpaceElement('manager');
        if (manager_field) {
            manager_field.innerHTML = '部長';
            manager_field.style.cssText = 'font-size: 18px; font-weight: bold; width: 140px; margin-left:15px; background-color: rgb(255, 242, 204);';
        }
        // スペースフィールド
        const call_center_field = kintone.app.record.getSpaceElement('call_center');
        if (call_center_field) {
            call_center_field.innerHTML = 'コールセンター';
            call_center_field.style.cssText = 'font-size: 18px; font-weight: bold; width: 140px; margin-left:15px; background-color: rgb(255, 242, 204);';
        } 
    }

    if(record.ガルーン宛先に店舗を入れるor入れない.value == '入れない'){
        record.店舗名.value = [];
    }

    //システム管理者用グループを非表示にする
    kintone.app.record.setFieldShown('システム管理者用',false); 

    return event;
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
kintone.events.on(["app.record.create.change.受信日時_電話","app.record.edit.change.受信日時_電話","app.record.create.change.受信日時_メール_ネットアンケート","app.record.edit.change.受信日時_メール_ネットアンケート","app.record.create.change.受信日時_口コミ","app.record.edit.change.受信日時_口コミ"], event => {
    const record = event.record;
    if(record.受付方法.value == "電話"){
        if(record.受信日時_電話.value == undefined || record.受信日時_電話.value == ''){

        }else{
            record.受信日時_まとめ.value  = record.受信日時_電話.value;
        }
    }else if(record.受付方法.value == "口コミサイト"){
        if(record.受信日時_口コミ.value == undefined || record.受信日時_口コミ.value == ''){

        }else{
            record.受信日時_まとめ.value  = record.受信日時_口コミ.value;
        }
    }else{
        if(record.受信日時_メール_ネットアンケート.value == undefined || record.受信日時_メール_ネットアンケート.value == ''){

        }else{
            record.受信日時_まとめ.value  = record.受信日時_メール_ネットアンケート.value;
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
    }else if(record.受付方法.value == "メール"||record.受付方法.value == "ネットアンケート"){
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

        //顛末を表示
        kintone.app.record.setFieldShown('顛末', false);
        //部長顛末確認を表示
        kintone.app.record.setFieldShown('顛末確認_部長', false);
        //コールセンター顛末確認、確認日時を表示
        kintone.app.record.setFieldShown('顛末確認者_顛末', false);
        kintone.app.record.setFieldShown('確認日時_顛末', false);
        //コールセンターメモ_顛末を表示
        kintone.app.record.setFieldShown('コールセンターメモ_顛末', false);

        //顛末という文字を削除
        const tenmatsuField = kintone.app.record.getSpaceElement('tenmatsu');
        if (tenmatsuField) {
            tenmatsuField.style.display = 'none';
        }

        //顛末の部長という文字を削除
        const managerField = kintone.app.record.getSpaceElement('manager');
        if (managerField) {
            managerField.style.display = 'none';
        }

        //顛末のコールセンターという文字を削除
        const callCenterField = kintone.app.record.getSpaceElement('call_center');
        if (callCenterField) {
            callCenterField.style.display = 'none';
        }

        const cautionStatementField = kintone.app.record.getSpaceElement('caution_statement');
        if(cautionStatementField){
            cautionStatementField.style.display = 'none';
        }

    }else{
        //アンケート報告書のグループを非表示
        kintone.app.record.setFieldShown('アンケート報告書_グループ',false);

        //顛末を表示
        kintone.app.record.setFieldShown('顛末', true);
        //部長顛末確認を表示
        kintone.app.record.setFieldShown('顛末確認_部長', true);
        //コールセンター顛末確認、確認日時を表示
        kintone.app.record.setFieldShown('顛末確認者_顛末', true);
        //コールセンターメモを表示
        kintone.app.record.setFieldShown('確認日時_顛末', true);
        //コールセンターメモ_顛末を表示
        kintone.app.record.setFieldShown('コールセンターメモ_顛末', true);
        // スペースフィールド
        const tenmatsu_field = kintone.app.record.getSpaceElement('tenmatsu');
        if (tenmatsu_field) {
            tenmatsu_field.innerHTML = '顛末';
            tenmatsu_field.style.cssText = 'font-size: 26px; font-weight: bold; margin-left:15px; background-color: rgb(255, 242, 204);';
        }
        // スペースフィールド
        const manager_field = kintone.app.record.getSpaceElement('manager');
        if (manager_field) {
            manager_field.innerHTML = '部長';
            manager_field.style.cssText = 'font-size: 18px; font-weight: bold; width: 140px; margin-left:15px; background-color: rgb(255, 242, 204);';
        }
        // スペースフィールド
        const call_center_field = kintone.app.record.getSpaceElement('call_center');
        if (call_center_field) {
            call_center_field.innerHTML = 'コールセンター';
            call_center_field.style.cssText = 'font-size: 18px; font-weight: bold; width: 140px; margin-left:15px; background-color: rgb(255, 242, 204);';
        } 

        // スペースフィールド
        const caution_statement = kintone.app.record.getSpaceElement('caution_statement');
        if(caution_statement){
            caution_statement.innerHTML = '▼追加報告';
            caution_statement.style.cssText = 'color:red; font-size: 18px; font-weight: bold; position: relative; left: 1128px; top: 100px;';
        }
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
kintone.events.on([ 'app.record.edit.change.ご利用人数_メール_ネットアンケート', 'app.record.create.change.ご利用人数_メール_ネットアンケート'], event => {
    const rec = event.record;

    rec.ご利用人数.value = rec.ご利用人数_メール_ネットアンケート.value;

    return event;
});

//メール・ネットアンケートの総合評価が利用したくないの時
kintone.events.on([ 'app.record.edit.change.総合評価_メール_ネットアンケート', 'app.record.create.change.総合評価_メール_ネットアンケート'], event => {
    const rec = event.record;
    if (rec.総合評価_メール_ネットアンケート.value == '利用したくない') {
        rec.アンケート報告書_メール_ネットアンケート.value = '要';
    }else{
        rec.アンケート報告書_メール_ネットアンケート.value = '否';
    }

    if(rec.総合評価_メール_ネットアンケート.value == 'ー' ){
        rec.内容.value = '未記入、その他';
    }else{
        rec.内容.value = rec.総合評価_メール_ネットアンケート.value;
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
    }else if(record.受付方法.value == "メール"||record.受付方法.value == "ネットアンケート"){
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
        kintone.app.record.setGroupFieldOpen('電話受付', true);
        kintone.app.record.setGroupFieldOpen('メール・ネットアンケート受付', true);
        kintone.app.record.setGroupFieldOpen('口コミサイト受付', true)
        kintone.app.record.setGroupFieldOpen('アンケート報告書_グループ', true);

        //グループの表示
        kintone.app.record.setFieldShown('お客様とのご連絡詳細_2回目_',false);
        kintone.app.record.setFieldShown('お客様とのご連絡詳細_3回目_',false);
    }else if(record.お客様とのご連絡回数.value == "2回目"){
        //グループの開閉
        kintone.app.record.setGroupFieldOpen('電話受付', false)
        kintone.app.record.setGroupFieldOpen('メール・ネットアンケート受付', false);
        kintone.app.record.setGroupFieldOpen('口コミサイト受付', false)
        kintone.app.record.setGroupFieldOpen('お客様とのご連絡詳細_2回目_', true);

        //グループの表示
        kintone.app.record.setFieldShown('お客様とのご連絡詳細_2回目_',true);
        kintone.app.record.setFieldShown('お客様とのご連絡詳細_3回目_',false);
    }else if(record.お客様とのご連絡回数.value == "3回目"){

        //グループの開閉
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
        if(GetLoginUser.id == 5790){
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

        // if(record.受付方法.value == "電話" || record.受付方法.value == "メール・ネットアンケート" ||record.受付方法.value == "口コミサイト"){
        //     // スペースフィールド
        //     const caution_statement = kintone.app.record.getSpaceElement('caution_statement');
        //     caution_statement.innerHTML = '▼追加報告';
        //     caution_statement.style.cssText = 'color:red; font-size: 18px; font-weight: bold; position: relative; left: 1128px; top: 100px;';
        // }

        return event;
    });

    kintone.events.on("app.record.edit.submit", event => {
        const record = event.record;
    
        // 
        if((record.顛末済みフラグ.value == '未送信' && record.総括部長コメント欄.value) || (record.顛末済みフラグ.value == '未送信' && record.顛末確認_部長.value == '〇')){
            record.顛末報告状況.value = "顛末承認済みのため、メッセージ送信が必要";
        }else if((record.報告済みフラグ.value == '未送信' && record.AM報告欄.value) || (record.報告済みフラグ.value == '未送信' && record.顛末.value[0].value.内容_顛末.value)){
            record.顛末報告状況.value = "顛末記入済みのため、メッセージ送信が必要";
    
        }else{
            record.顛末報告状況.value = '';
        }

        //コールセンターメモ_まとめ
        if(record.コールセンターメモ_顛末.value){
            record.コールセンターメモ_まとめ.value = record.コールセンターメモ_顛末.value;

        }else if(record.コールセンターメモ_アンケート.value){
            record.コールセンターメモ_まとめ.value = record.コールセンターメモ_アンケート.value;

        }else{
            record.コールセンターメモ_まとめ.value = '';
        }
    
        return event;
    });

    //(編集画面)(グループ)
    kintone.events.on("app.record.edit.change.お客様とのご連絡回数", event => {
        const record = event.record;


        if(record.お客様とのご連絡回数.value == "1回目"){
            //グループの開閉
            kintone.app.record.setGroupFieldOpen('電話受付', true)
            kintone.app.record.setGroupFieldOpen('メール・ネットアンケート受付', true);
            kintone.app.record.setGroupFieldOpen('口コミサイト受付', true);
            kintone.app.record.setGroupFieldOpen('アンケート報告書_グループ', true);

            //グループの表示
            kintone.app.record.setFieldShown('お客様とのご連絡詳細_2回目_',false);
            kintone.app.record.setFieldShown('お客様とのご連絡詳細_3回目_',false);

        }else if(record.お客様とのご連絡回数.value == "2回目"){
            //グループの開閉
            kintone.app.record.setGroupFieldOpen('電話受付', false)
            kintone.app.record.setGroupFieldOpen('メール・ネットアンケート受付', false);
            kintone.app.record.setGroupFieldOpen('口コミサイト受付', false);
            kintone.app.record.setGroupFieldOpen('お客様とのご連絡詳細_2回目_', true);

            //グループの表示
            kintone.app.record.setFieldShown('お客様とのご連絡詳細_2回目_',true);
            kintone.app.record.setFieldShown('お客様とのご連絡詳細_3回目_',false);

        }else if(record.お客様とのご連絡回数.value == "3回目"){

            //グループの開閉
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


    //----------------------------------------------------------------------------------
    // 宛先に関する処理
    //----------------------------------------------------------------------------------
    //ページを表示させた時
    kintone.events.on(["app.record.create.show","app.record.detail.show","app.record.edit.show","app.record.print.show","app.record.create.change.グループカテゴリ_いくつ_","app.record.edit.change.グループカテゴリ_いくつ_"], event => {
        const record = event.record;
        if(record.グループカテゴリ_いくつ_.value == '1つ'){

            const call_center_category_field = kintone.app.record.getSpaceElement('call_center_category');   //スペースを取得
            call_center_category_field.innerHTML = '■コールセンター関連宛先';      //文字を挿入
            call_center_category_field.style.cssText = 'font-size: xx-large; color: rgb(180, 95, 6); font-weight: bold;';

            //1つ目のカテゴリーを表示
            kintone.app.record.setFieldShown('本部関連_商品関連の宛先を取得1',true);//表示
            const category_one_field = kintone.app.record.getSpaceElement('category_one');   //スペースを取得
            category_one_field.innerHTML = '■カテゴリー1つ目のユーザーグループ';      //文字を挿入
            category_one_field.style.cssText = 'font-size: xx-large; color: rgb(180, 95, 6); font-weight: bold;';

            //2つ目のカテゴリーを非表示にする時 second
            kintone.app.record.setFieldShown('本部関連_商品関連の宛先を取得2',false);//非表示
            const category_second_field_none = kintone.app.record.getSpaceElement('category_second');
            category_second_field_none.style.display = 'none';

            //3つ目のカテゴリーを非表示にする時 third
            kintone.app.record.setFieldShown('本部関連_商品関連の宛先を取得3',false);//非表示
            const category_third_field_none = kintone.app.record.getSpaceElement('category_third');
            category_third_field_none.style.display = 'none';

            kintone.app.record.setFieldShown('_コールセンター1',true);
            kintone.app.record.setFieldShown('_コールセンター2',true);
            kintone.app.record.setFieldShown('_コールセンター上長1',true);
            kintone.app.record.setFieldShown('_コールセンター上長2',true);
            kintone.app.record.setFieldShown('_コールセンター上長3',true);
            kintone.app.record.setFieldShown('_コールセンター上長4',true);

            kintone.app.record.setFieldShown('_1権限追加ユーザー1',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー2',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー3',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー4',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー5',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー6',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー7',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー8',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー9',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー10',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー11',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー12',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー13',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー14',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー15',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー16',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー17',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー18',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー19',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー20',true);
            //Garoonのみユーザー
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー1',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー2',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー3',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー4',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー5',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー6',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー7',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー8',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー9',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー10',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー11',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー12',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー13',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー14',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー15',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー16',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー17',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー18',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー19',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー20',true);


            kintone.app.record.setFieldShown('_2権限追加ユーザー1',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー2',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー3',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー4',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー5',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー6',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー7',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー8',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー9',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー10',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー11',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー12',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー13',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー14',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー15',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー16',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー17',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー18',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー19',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー20',false);
            //Garoonのみユーザー
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー1',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー2',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー3',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー4',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー5',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー6',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー7',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー8',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー9',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー10',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー11',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー12',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー13',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー14',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー15',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー16',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー17',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー18',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー19',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー20',false);

            //3つめ
            kintone.app.record.setFieldShown('_3権限追加ユーザー1',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー2',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー3',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー4',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー5',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー6',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー7',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー8',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー9',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー10',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー11',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー12',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー13',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー14',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー15',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー16',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー17',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー18',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー19',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー20',false);
            //Garoonのみユーザー
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー1',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー2',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー3',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー4',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー5',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー6',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー7',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー8',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー9',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー10',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー11',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー12',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー13',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー14',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー15',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー16',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー17',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー18',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー19',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー20',false);

        }else if(record.グループカテゴリ_いくつ_.value == '2つ'){

            const call_center_category_field = kintone.app.record.getSpaceElement('call_center_category');   //スペースを取得
            call_center_category_field.innerHTML = '■コールセンター関連宛先';      //文字を挿入
            call_center_category_field.style.cssText = 'font-size: xx-large; color: rgb(180, 95, 6); font-weight: bold;';

            //1つ目のカテゴリーを表示
            kintone.app.record.setFieldShown('本部関連_商品関連の宛先を取得1',true);//表示
            const category_one_field = kintone.app.record.getSpaceElement('category_one');   //スペースを取得
            category_one_field.innerHTML = '■カテゴリー1つ目のユーザーグループ';      //文字を挿入
            category_one_field.style.cssText = 'font-size: xx-large; color: rgb(180, 95, 6); font-weight: bold;';

            //2つ目のカテゴリーを表示
            kintone.app.record.setFieldShown('本部関連_商品関連の宛先を取得2',true);//表示
            const category_second_field = kintone.app.record.getSpaceElement('category_second');   //スペースを取得
            category_second_field.innerHTML = '■カテゴリー2つ目のユーザーグループ';      //文字を挿入
            category_second_field.style.cssText = 'font-size: xx-large; color: rgb(180, 95, 6); font-weight: bold;';

            //3つ目のカテゴリーを非表示
            kintone.app.record.setFieldShown('本部関連_商品関連の宛先を取得3',false);//非表示
            const category_third_field_none = kintone.app.record.getSpaceElement('category_third');
            category_third_field_none.style.display = 'none';

            kintone.app.record.setFieldShown('_コールセンター1',true);
            kintone.app.record.setFieldShown('_コールセンター2',true);
            kintone.app.record.setFieldShown('_コールセンター上長1',true);
            kintone.app.record.setFieldShown('_コールセンター上長2',true);
            kintone.app.record.setFieldShown('_コールセンター上長3',true);
            kintone.app.record.setFieldShown('_コールセンター上長4',true);

            kintone.app.record.setFieldShown('_1権限追加ユーザー1',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー2',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー3',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー4',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー5',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー6',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー7',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー8',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー9',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー10',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー11',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー12',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー13',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー14',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー15',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー16',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー17',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー18',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー19',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー20',true);
            //Garoonのみユーザー
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー1',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー2',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー3',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー4',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー5',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー6',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー7',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー8',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー9',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー10',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー11',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー12',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー13',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー14',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー15',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー16',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー17',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー18',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー19',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー20',true);

            kintone.app.record.setFieldShown('_2権限追加ユーザー1',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー2',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー3',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー4',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー5',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー6',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー7',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー8',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー9',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー10',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー11',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー12',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー13',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー14',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー15',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー16',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー17',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー18',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー19',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー20',true);
            //Garoonのみユーザー
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー1',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー2',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー3',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー4',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー5',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー6',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー7',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー8',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー9',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー10',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー11',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー12',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー13',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー14',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー15',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー16',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー17',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー18',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー19',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー20',true);

            //3つめ
            kintone.app.record.setFieldShown('_3権限追加ユーザー1',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー2',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー3',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー4',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー5',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー6',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー7',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー8',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー9',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー10',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー11',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー12',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー13',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー14',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー15',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー16',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー17',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー18',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー19',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー20',false);
            //Garoonのみユーザー
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー1',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー2',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー3',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー4',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー5',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー6',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー7',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー8',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー9',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー10',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー11',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー12',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー13',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー14',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー15',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー16',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー17',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー18',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー19',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー20',false);
        }else if(record.グループカテゴリ_いくつ_.value == '3つ'){
            const call_center_category_field = kintone.app.record.getSpaceElement('call_center_category');   //スペースを取得
            call_center_category_field.innerHTML = '■コールセンター関連宛先';      //文字を挿入
            call_center_category_field.style.cssText = 'font-size: xx-large; color: rgb(180, 95, 6); font-weight: bold;';

            //1つ目のカテゴリーを表示
            kintone.app.record.setFieldShown('本部関連_商品関連の宛先を取得1',true);//表示
            const category_one_field = kintone.app.record.getSpaceElement('category_one');   //スペースを取得
            category_one_field.innerHTML = '■カテゴリー1つ目のユーザーグループ';      //文字を挿入
            category_one_field.style.cssText = 'font-size: xx-large; color: rgb(180, 95, 6); font-weight: bold;';

            //2つ目のカテゴリーを表示
            kintone.app.record.setFieldShown('本部関連_商品関連の宛先を取得2',true);//表示
            const category_second_field = kintone.app.record.getSpaceElement('category_second');   //スペースを取得
            category_second_field.innerHTML = '■カテゴリー2つ目のユーザーグループ';      //文字を挿入
            category_second_field.style.cssText = 'font-size: xx-large; color: rgb(180, 95, 6); font-weight: bold;';
            
            //3つ目のカテゴリーを表示
            kintone.app.record.setFieldShown('本部関連_商品関連の宛先を取得3',true);//表示
            const category_third_field = kintone.app.record.getSpaceElement('category_third');   //スペースを取得
            category_third_field.innerHTML = '■カテゴリー3つ目のユーザーグループ';      //文字を挿入
            category_third_field.style.cssText = 'font-size: xx-large; color: rgb(180, 95, 6); font-weight: bold;';

            kintone.app.record.setFieldShown('_コールセンター1',true);
            kintone.app.record.setFieldShown('_コールセンター2',true);
            kintone.app.record.setFieldShown('_コールセンター上長1',true);
            kintone.app.record.setFieldShown('_コールセンター上長2',true);
            kintone.app.record.setFieldShown('_コールセンター上長3',true);
            kintone.app.record.setFieldShown('_コールセンター上長4',true);

            kintone.app.record.setFieldShown('_1権限追加ユーザー1',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー2',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー3',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー4',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー5',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー6',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー7',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー8',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー9',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー10',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー11',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー12',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー13',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー14',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー15',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー16',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー17',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー18',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー19',true);
            kintone.app.record.setFieldShown('_1権限追加ユーザー20',true);
            //Garoonのみユーザー
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー1',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー2',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー3',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー4',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー5',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー6',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー7',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー8',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー9',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー10',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー11',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー12',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー13',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー14',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー15',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー16',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー17',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー18',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー19',true);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー20',true);
            
            //2つ目のカテゴリー
            kintone.app.record.setFieldShown('_2権限追加ユーザー1',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー2',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー3',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー4',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー5',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー6',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー7',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー8',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー9',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー10',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー11',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー12',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー13',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー14',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー15',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー16',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー17',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー18',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー19',true);
            kintone.app.record.setFieldShown('_2権限追加ユーザー20',true);
            //Garoonのみユーザー
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー1',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー2',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー3',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー4',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー5',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー6',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー7',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー8',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー9',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー10',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー11',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー12',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー13',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー14',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー15',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー16',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー17',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー18',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー19',true);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー20',true);

            //3つ目のカテゴリー
            kintone.app.record.setFieldShown('_3権限追加ユーザー1',true);
            kintone.app.record.setFieldShown('_3権限追加ユーザー2',true);
            kintone.app.record.setFieldShown('_3権限追加ユーザー3',true);
            kintone.app.record.setFieldShown('_3権限追加ユーザー4',true);
            kintone.app.record.setFieldShown('_3権限追加ユーザー5',true);
            kintone.app.record.setFieldShown('_3権限追加ユーザー6',true);
            kintone.app.record.setFieldShown('_3権限追加ユーザー7',true);
            kintone.app.record.setFieldShown('_3権限追加ユーザー8',true);
            kintone.app.record.setFieldShown('_3権限追加ユーザー9',true);
            kintone.app.record.setFieldShown('_3権限追加ユーザー10',true);
            kintone.app.record.setFieldShown('_3権限追加ユーザー11',true);
            kintone.app.record.setFieldShown('_3権限追加ユーザー12',true);
            kintone.app.record.setFieldShown('_3権限追加ユーザー13',true);
            kintone.app.record.setFieldShown('_3権限追加ユーザー14',true);
            kintone.app.record.setFieldShown('_3権限追加ユーザー15',true);
            kintone.app.record.setFieldShown('_3権限追加ユーザー16',true);
            kintone.app.record.setFieldShown('_3権限追加ユーザー17',true);
            kintone.app.record.setFieldShown('_3権限追加ユーザー18',true);
            kintone.app.record.setFieldShown('_3権限追加ユーザー19',true);
            kintone.app.record.setFieldShown('_3権限追加ユーザー20',true);
            //Garoonのみユーザー
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー1',true);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー2',true);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー3',true);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー4',true);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー5',true);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー6',true);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー7',true);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー8',true);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー9',true);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー10',true);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー11',true);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー12',true);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー13',true);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー14',true);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー15',true);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー16',true);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー17',true);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー18',true);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー19',true);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー20',true);
        }else{

            const call_center_category_field_none = kintone.app.record.getSpaceElement('call_center_category');
            call_center_category_field_none.style.display = 'none';

            //1つ目のカテゴリーを非表示にする時 second
            kintone.app.record.setFieldShown('本部関連_商品関連の宛先を取得1',false);//非表示
            const category_one_field_none = kintone.app.record.getSpaceElement('category_one');
            category_one_field_none.style.display = 'none';

            //2つ目のカテゴリーを非表示にする時 second
            kintone.app.record.setFieldShown('本部関連_商品関連の宛先を取得2',false);//非表示
            const category_second_field_none = kintone.app.record.getSpaceElement('category_second');
            category_second_field_none.style.display = 'none';

            //3つ目のカテゴリーを非表示にする時 third
            kintone.app.record.setFieldShown('本部関連_商品関連の宛先を取得3',false);//非表示
            const category_third_field_none = kintone.app.record.getSpaceElement('category_third');
            category_third_field_none.style.display = 'none';

            kintone.app.record.setFieldShown('_コールセンター1',false);
            kintone.app.record.setFieldShown('_コールセンター2',false);
            kintone.app.record.setFieldShown('_コールセンター上長1',false);
            kintone.app.record.setFieldShown('_コールセンター上長2',false);
            kintone.app.record.setFieldShown('_コールセンター上長3',false);
            kintone.app.record.setFieldShown('_コールセンター上長4',false);

            kintone.app.record.setFieldShown('_1権限追加ユーザー1',false);
            kintone.app.record.setFieldShown('_1権限追加ユーザー2',false);
            kintone.app.record.setFieldShown('_1権限追加ユーザー3',false);
            kintone.app.record.setFieldShown('_1権限追加ユーザー4',false);
            kintone.app.record.setFieldShown('_1権限追加ユーザー5',false);
            kintone.app.record.setFieldShown('_1権限追加ユーザー6',false);
            kintone.app.record.setFieldShown('_1権限追加ユーザー7',false);
            kintone.app.record.setFieldShown('_1権限追加ユーザー8',false);
            kintone.app.record.setFieldShown('_1権限追加ユーザー9',false);
            kintone.app.record.setFieldShown('_1権限追加ユーザー10',false);
            kintone.app.record.setFieldShown('_1権限追加ユーザー11',false);
            kintone.app.record.setFieldShown('_1権限追加ユーザー12',false);
            kintone.app.record.setFieldShown('_1権限追加ユーザー13',false);
            kintone.app.record.setFieldShown('_1権限追加ユーザー14',false);
            kintone.app.record.setFieldShown('_1権限追加ユーザー15',false);
            kintone.app.record.setFieldShown('_1権限追加ユーザー16',false);
            kintone.app.record.setFieldShown('_1権限追加ユーザー17',false);
            kintone.app.record.setFieldShown('_1権限追加ユーザー18',false);
            kintone.app.record.setFieldShown('_1権限追加ユーザー19',false);
            kintone.app.record.setFieldShown('_1権限追加ユーザー20',false);
            //Garoonのみユーザー
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー1',false);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー2',false);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー3',false);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー4',false);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー5',false);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー6',false);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー7',false);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー8',false);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー9',false);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー10',false);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー11',false);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー12',false);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー13',false);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー14',false);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー15',false);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー16',false);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー17',false);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー18',false);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー19',false);
            kintone.app.record.setFieldShown('_1Garoon宛先追加ユーザー20',false);

            kintone.app.record.setFieldShown('_2権限追加ユーザー1',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー2',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー3',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー4',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー5',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー6',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー7',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー8',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー9',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー10',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー11',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー12',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー13',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー14',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー15',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー16',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー17',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー18',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー19',false);
            kintone.app.record.setFieldShown('_2権限追加ユーザー20',false);
            //Garoonのみユーザー
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー1',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー2',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー3',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー4',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー5',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー6',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー7',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー8',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー9',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー10',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー11',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー12',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー13',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー14',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー15',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー16',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー17',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー18',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー19',false);
            kintone.app.record.setFieldShown('_2Garoon宛先追加ユーザー20',false);

            //3つめ
            kintone.app.record.setFieldShown('_3権限追加ユーザー1',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー2',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー3',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー4',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー5',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー6',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー7',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー8',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー9',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー10',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー11',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー12',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー13',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー14',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー15',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー16',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー17',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー18',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー19',false);
            kintone.app.record.setFieldShown('_3権限追加ユーザー20',false);
            //Garoonのみユーザー
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー1',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー2',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー3',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー4',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー5',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー6',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー7',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー8',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー9',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー10',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー11',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー12',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー13',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー14',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー15',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー16',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー17',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー18',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー19',false);
            kintone.app.record.setFieldShown('_3Garoon宛先追加ユーザー20',false);
        }
        return event;
    });

    kintone.events.on(["app.record.create.show","app.record.edit.show"], event => {
        const record = event.record;

        //カテゴリーつ目のグループ
        //コールセンター関連
        event.record["_コールセンター1"].disabled = false;
        event.record["_コールセンター2"].disabled = false;
        event.record["_コールセンター上長1"].disabled = false;
        event.record["_コールセンター上長2"].disabled = false;
        event.record["_コールセンター上長3"].disabled = false;
        event.record["_コールセンター上長4"].disabled = false;
        //kintoneとGaroonに宛先があるユーザー(1つめ)
        event.record["_1権限追加ユーザー1"].disabled = false;
        event.record["_1権限追加ユーザー2"].disabled = false;
        event.record["_1権限追加ユーザー3"].disabled = false;
        event.record["_1権限追加ユーザー4"].disabled = false;
        event.record["_1権限追加ユーザー5"].disabled = false;
        event.record["_1権限追加ユーザー6"].disabled = false;
        event.record["_1権限追加ユーザー7"].disabled = false;
        event.record["_1権限追加ユーザー8"].disabled = false;
        event.record["_1権限追加ユーザー9"].disabled = false;
        event.record["_1権限追加ユーザー10"].disabled = false;
        event.record["_1権限追加ユーザー11"].disabled = false;
        event.record["_1権限追加ユーザー12"].disabled = false;
        event.record["_1権限追加ユーザー13"].disabled = false;
        event.record["_1権限追加ユーザー14"].disabled = false;
        event.record["_1権限追加ユーザー15"].disabled = false;
        event.record["_1権限追加ユーザー16"].disabled = false;
        event.record["_1権限追加ユーザー17"].disabled = false;
        event.record["_1権限追加ユーザー18"].disabled = false;
        event.record["_1権限追加ユーザー19"].disabled = false;
        event.record["_1権限追加ユーザー20"].disabled = false;
        //Garoonに宛先があるユーザー(1つめ)
        event.record["_1Garoon宛先追加ユーザー1"].disabled = false;
        event.record["_1Garoon宛先追加ユーザー2"].disabled = false;
        event.record["_1Garoon宛先追加ユーザー3"].disabled = false;
        event.record["_1Garoon宛先追加ユーザー4"].disabled = false;
        event.record["_1Garoon宛先追加ユーザー5"].disabled = false;
        event.record["_1Garoon宛先追加ユーザー6"].disabled = false;
        event.record["_1Garoon宛先追加ユーザー7"].disabled = false;
        event.record["_1Garoon宛先追加ユーザー8"].disabled = false;
        event.record["_1Garoon宛先追加ユーザー9"].disabled = false;
        event.record["_1Garoon宛先追加ユーザー10"].disabled = false;
        event.record["_1Garoon宛先追加ユーザー11"].disabled = false;
        event.record["_1Garoon宛先追加ユーザー12"].disabled = false;
        event.record["_1Garoon宛先追加ユーザー13"].disabled = false;
        event.record["_1Garoon宛先追加ユーザー14"].disabled = false;
        event.record["_1Garoon宛先追加ユーザー15"].disabled = false;
        event.record["_1Garoon宛先追加ユーザー16"].disabled = false;
        event.record["_1Garoon宛先追加ユーザー17"].disabled = false;
        event.record["_1Garoon宛先追加ユーザー18"].disabled = false;
        event.record["_1Garoon宛先追加ユーザー19"].disabled = false;
        event.record["_1Garoon宛先追加ユーザー20"].disabled = false;

        //カテゴリ二つ目のグループ
        //kintoneとGaroonに宛先があるユーザー(2つめ)
        event.record["_2権限追加ユーザー1"].disabled = false;
        event.record["_2権限追加ユーザー2"].disabled = false;
        event.record["_2権限追加ユーザー3"].disabled = false;
        event.record["_2権限追加ユーザー4"].disabled = false;
        event.record["_2権限追加ユーザー5"].disabled = false;
        event.record["_2権限追加ユーザー6"].disabled = false;
        event.record["_2権限追加ユーザー7"].disabled = false;
        event.record["_2権限追加ユーザー8"].disabled = false;
        event.record["_2権限追加ユーザー9"].disabled = false;
        event.record["_2権限追加ユーザー10"].disabled = false;
        event.record["_2権限追加ユーザー11"].disabled = false;
        event.record["_2権限追加ユーザー12"].disabled = false;
        event.record["_2権限追加ユーザー13"].disabled = false;
        event.record["_2権限追加ユーザー14"].disabled = false;
        event.record["_2権限追加ユーザー15"].disabled = false;
        event.record["_2権限追加ユーザー16"].disabled = false;
        event.record["_2権限追加ユーザー17"].disabled = false;
        event.record["_2権限追加ユーザー18"].disabled = false;
        event.record["_2権限追加ユーザー19"].disabled = false;
        event.record["_2権限追加ユーザー20"].disabled = false;
        //Garoonに宛先があるユーザー(2つめ)
        event.record["_2Garoon宛先追加ユーザー1"].disabled = false;
        event.record["_2Garoon宛先追加ユーザー2"].disabled = false;
        event.record["_2Garoon宛先追加ユーザー3"].disabled = false;
        event.record["_2Garoon宛先追加ユーザー4"].disabled = false;
        event.record["_2Garoon宛先追加ユーザー5"].disabled = false;
        event.record["_2Garoon宛先追加ユーザー6"].disabled = false;
        event.record["_2Garoon宛先追加ユーザー7"].disabled = false;
        event.record["_2Garoon宛先追加ユーザー8"].disabled = false;
        event.record["_2Garoon宛先追加ユーザー9"].disabled = false;
        event.record["_2Garoon宛先追加ユーザー10"].disabled = false;
        event.record["_2Garoon宛先追加ユーザー11"].disabled = false;
        event.record["_2Garoon宛先追加ユーザー12"].disabled = false;
        event.record["_2Garoon宛先追加ユーザー13"].disabled = false;
        event.record["_2Garoon宛先追加ユーザー14"].disabled = false;
        event.record["_2Garoon宛先追加ユーザー15"].disabled = false;
        event.record["_2Garoon宛先追加ユーザー16"].disabled = false;
        event.record["_2Garoon宛先追加ユーザー17"].disabled = false;
        event.record["_2Garoon宛先追加ユーザー18"].disabled = false;
        event.record["_2Garoon宛先追加ユーザー19"].disabled = false;
        event.record["_2Garoon宛先追加ユーザー20"].disabled = false;

        //カテゴリ三つ目のグループ
        //kintoneとGaroonに宛先があるユーザー(3つめ)
        event.record["_3権限追加ユーザー1"].disabled = false;
        event.record["_3権限追加ユーザー2"].disabled = false;
        event.record["_3権限追加ユーザー3"].disabled = false;
        event.record["_3権限追加ユーザー4"].disabled = false;
        event.record["_3権限追加ユーザー5"].disabled = false;
        event.record["_3権限追加ユーザー6"].disabled = false;
        event.record["_3権限追加ユーザー7"].disabled = false;
        event.record["_3権限追加ユーザー8"].disabled = false;
        event.record["_3権限追加ユーザー9"].disabled = false;
        event.record["_3権限追加ユーザー10"].disabled = false;
        event.record["_3権限追加ユーザー11"].disabled = false;
        event.record["_3権限追加ユーザー12"].disabled = false;
        event.record["_3権限追加ユーザー13"].disabled = false;
        event.record["_3権限追加ユーザー14"].disabled = false;
        event.record["_3権限追加ユーザー15"].disabled = false;
        event.record["_3権限追加ユーザー16"].disabled = false;
        event.record["_3権限追加ユーザー17"].disabled = false;
        event.record["_3権限追加ユーザー18"].disabled = false;
        event.record["_3権限追加ユーザー19"].disabled = false;
        event.record["_3権限追加ユーザー20"].disabled = false;
        //Garoonに宛先があるユーザー(3つめ)
        event.record["_3Garoon宛先追加ユーザー1"].disabled = false;
        event.record["_3Garoon宛先追加ユーザー2"].disabled = false;
        event.record["_3Garoon宛先追加ユーザー3"].disabled = false;
        event.record["_3Garoon宛先追加ユーザー4"].disabled = false;
        event.record["_3Garoon宛先追加ユーザー5"].disabled = false;
        event.record["_3Garoon宛先追加ユーザー6"].disabled = false;
        event.record["_3Garoon宛先追加ユーザー7"].disabled = false;
        event.record["_3Garoon宛先追加ユーザー8"].disabled = false;
        event.record["_3Garoon宛先追加ユーザー9"].disabled = false;
        event.record["_3Garoon宛先追加ユーザー10"].disabled = false;
        event.record["_3Garoon宛先追加ユーザー11"].disabled = false;
        event.record["_3Garoon宛先追加ユーザー12"].disabled = false;
        event.record["_3Garoon宛先追加ユーザー13"].disabled = false;
        event.record["_3Garoon宛先追加ユーザー14"].disabled = false;
        event.record["_3Garoon宛先追加ユーザー15"].disabled = false;
        event.record["_3Garoon宛先追加ユーザー16"].disabled = false;
        event.record["_3Garoon宛先追加ユーザー17"].disabled = false;
        event.record["_3Garoon宛先追加ユーザー18"].disabled = false;
        event.record["_3Garoon宛先追加ユーザー19"].disabled = false;
        event.record["_3Garoon宛先追加ユーザー20"].disabled = false;

        return event;
    });

    

})();