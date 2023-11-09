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

        //アンケート報告書を非表示にする
        kintone.app.record.setFieldShown('アンケート報告書',false);
    });

    //(編集画面)(グループ)
    kintone.events.on("app.record.create.change.受付方法", event => {
        const record = event.record;
        if(record.受付方法.value == "電話"){
            kintone.app.record.setFieldShown('メール・口コミサイト受付', false);
            kintone.app.record.setFieldShown('電話受付', true);
            
        }else if(record.受付方法.value == "メール・口コミサイト"){
            kintone.app.record.setFieldShown('メール・口コミサイト受付', true);
            kintone.app.record.setFieldShown('電話受付', false);

        }else{
            kintone.app.record.setFieldShown('メール・口コミサイト受付', true);
            kintone.app.record.setFieldShown('電話受付', true);
        }
    });

    //(編集画面)(アンケート報告書)メールの評価
    kintone.events.on("app.record.create.change.総合評価_メール", event => {
        const record = event.record;
        if(record.総合評価_メール.value == "利用したくない"){
            kintone.app.record.setFieldShown('アンケート報告書',true);
        }else{
            kintone.app.record.setFieldShown('アンケート報告書',false);
        }
    });

    //(編集画面)(アンケート報告書)電話での評価
    kintone.events.on("app.record.create.change.総合評価", event => {
        const record = event.record;
        if(record.総合評価.value == "利用したくない"){
        kintone.app.record.setFieldShown('アンケート報告書',true);
        }else{
        kintone.app.record.setFieldShown('アンケート報告書',false);
        }
    });



//以下、詳細画面//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //(詳細画面)表示したとき
    kintone.events.on("app.record.detail.show", event => {
        const record = event.record;
            if(record.総合評価_メール.value == "利用したくない"|| record.総合評価.value == "利用したくない"){
                kintone.app.record.setFieldShown('アンケート報告書',true);
            }else{
                kintone.app.record.setFieldShown('アンケート報告書',false);
            }  
    });
          

//以下、編集画面/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //(編集画面)表示したとき
    kintone.events.on("app.record.edit.show", event => {
        const record = event.record;
        if(record.総合評価_メール.value == "利用したくない"|| record.総合評価.value == "利用したくない"){
            kintone.app.record.setFieldShown('アンケート報告書',true);
        }else{
            kintone.app.record.setFieldShown('アンケート報告書',false);
        }  
    });

    //(編集画面)(グループ)
    kintone.events.on("app.record.edit.change.受付方法", event => {
        const record = event.record;
        if(record.受付方法.value == "電話"){
            kintone.app.record.setFieldShown('メール・口コミサイト受付', false);
            kintone.app.record.setFieldShown('電話受付', true);
            
        }else if(record.受付方法.value == "メール・口コミサイト"){
            kintone.app.record.setFieldShown('メール・口コミサイト受付', true);
            kintone.app.record.setFieldShown('電話受付', false);

        }else{
            kintone.app.record.setFieldShown('メール・口コミサイト受付', true);
            kintone.app.record.setFieldShown('電話受付', true);
        }
    });

    //(編集画面)(アンケート報告書)メールの評価
    kintone.events.on("app.record.edit.change.総合評価_メール", event => {
        const record = event.record;
        if(record.総合評価_メール.value == "利用したくない"){
            kintone.app.record.setFieldShown('アンケート報告書',true);
        }else{
            kintone.app.record.setFieldShown('アンケート報告書',false);
        }
    });

    //(編集画面)(アンケート報告書)電話での評価
    kintone.events.on("app.record.edit.change.総合評価", event => {
      const record = event.record;
      if(record.総合評価.value == "利用したくない"){
        kintone.app.record.setFieldShown('アンケート報告書',true);
      }else{
        kintone.app.record.setFieldShown('アンケート報告書',false);
      }
    });
})();
