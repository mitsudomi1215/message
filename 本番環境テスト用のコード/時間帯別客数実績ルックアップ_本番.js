// @author koguren
// 参考:https://community.cybozu.dev/t/topic/3252
// jQueryとspinnerを使います。https://cybozu.dev/ja/kintone/sdk/library/cybozu-cdn/
(function() {
  "use strict";

  // ルックアップ取得先のデータを保持したリスト。
  // これが空の場合はapi経由で全量取得し、値がある場合はここから検索する。
  const fullRecords = [];
  // ルックアップ先のアプリID【環境毎に変更が必要】
  let lookupAppId = 403;
  // コンストラクタ定義
  let LookUpSample = (function(fieldSettings){
    function LookUpSample(fieldSettings) {
      this.fieldSettings = fieldSettings;
    }
    LookUpSample.prototype = {
      createModal: function(){
        let _this = this;
        this.modal = document.createElement('div');
        this.header = document.createElement('div');
        this.header.classList.add('lookUpModalHeader');

        // 結果表示テーブル
        this.modalTable = document.createElement('table');
        this.modalTable.setAttribute("id", _this.fieldSettings.resultTableID);
        this.modalTbody = document.createElement('tbody');
        this.modal.classList.add('lookUpModal');
        this.modalTable.classList.add('lookUpModalTable');
        this.modalTable.innerHTML = (
          '<thead><tr>' +
          this.fieldSettings.viewFields.reduce(function(columns, viewField){
            return columns + '<th>' + viewField + '</th>';
          }, '') +
          '<th>取得</th>' +
          '</tr></thead>'
        );
        this.modal.addEventListener('click', function(e){
          if(e.target === _this.modal){
            _this.removeModal();
          }
        });
        this.modalTbody.addEventListener('click', function(e){
          if(e.target.classList.contains('modalGetButton')){
            _this.copyDatas(_this.records[e.target.getAttribute('data-index')]);
          }
        });
        this.modal.appendChild(this.header);
        this.modalTable.appendChild(this.modalTbody);
        this.modal.appendChild(this.modalTable);
        document.body.appendChild(this.modal);
        return this;
      },
      showModal: function(){
        let _this = this;
        this.modalTbody.innerHTML =(
          _this.records.reduce(function(rows, record, index){
            return (
              rows +
              '<tr>' +
              _this.fieldSettings.viewFields.reduce(function(columns, viewField){
                return columns + '<td>' + record[viewField].value + '</td>';
              }, '') +
              '<td><a class="modalGetButton" data-index="' + index + '">取得</a></td>' +
              '</tr>'
            )
          }, '')
        );
        this.modal.classList.add('on');

        // modal上にいくつか機能を追加
//ヘッダー------------------------------------------------------------------------------
        // // 検索結果件数の表示
        // this.header.innerHTML = ('件数：' + _this.records.length);
        
        // // 絞込み条件フィールドを追加
        // let companyCodeName = _this.fieldSettings.companyCodeID;
        // let tantouName = _this.fieldSettings.tantouNameID;
        // // 店番
        // const companyCode = document.createElement("input");
        // companyCode.setAttribute("type", "text");
        // companyCode.setAttribute("id", companyCodeName);
        // companyCode.setAttribute("placeholder", "店番");
        // companyCode.classList.add('margin3');
        // this.header.appendChild(companyCode);
        // // 店名
        // const tantou = document.createElement("input");
        // tantou.setAttribute("type", "text");
        // tantou.setAttribute("id", tantouName);
        // tantou.setAttribute("placeholder", "店名");
        // tantou.classList.add('margin3');
        // this.header.appendChild(tantou);        

        // // 検索結果の絞込みボタン処理
        // const filterButton = document.createElement('input');
        // filterButton.setAttribute("id", _this.fieldSettings.fileterButtonID);
        // filterButton.type = 'button';
        // filterButton.value = '絞込み';
        // filterButton.classList.add('margin3');
        // filterButton.addEventListener('click', function(e){
        //   let companyName, tantou, re, re2;
        //   companyName = $("#" + companyCodeName).val();
        //   tantou = $("#" + tantouName).val();
        //   re = new RegExp(companyName);
        //   re2 = new RegExp(tantou);
        
        //   $("#" + _this.fieldSettings.resultTableID + " tr").show(); //初期化
        //   $("#" + _this.fieldSettings.resultTableID + " tbody tr").each(function(){
        //     let isShow1= true;
        //     let isShow2= true;
        //     if (companyName) {
        //       let companyVal = $(this).find("td:eq(0)").text(); //1列目
        //       if(companyVal.match(re) == null){
        //         isShow1 = false;
        //       }
        //     }

        //     if (tantou) {
        //       let tantouVal = $(this).find("td:eq(1)").text(); //2列目
        //       if(tantouVal.match(re2) == null){
        //         isShow2 = false;
        //       }
        //     }

        //     if (!isShow1 || !isShow2) {
        //       $(this).hide();
        //     }
        //   });
        // });
        // this.header.appendChild(filterButton);

        // // 全て表示ボタン
        // const showAllButton = document.createElement('input');
        // showAllButton.setAttribute("id", _this.fieldSettings.showAllButtoneID);
        // showAllButton.type = 'button';
        // showAllButton.value = '全て表示';
        // showAllButton.classList.add('margin3');
        // showAllButton.addEventListener('click', function(e){
        //   $("#" + _this.fieldSettings.resultTableID + " tr").show();
        // });
        ////ヘッダーを追加
        // this.header.appendChild(showAllButton);
      },
// ヘッダーここまで-------------------------------------------------------------------------
      // modal消す処理
      removeModal: function(){
        this.modal.classList.remove('on');
      },
      // ルックアップからのデータ取得リンク
      createGetButton: function(){
        let _this = this;
        this.getButton = document.createElement('a');
        this.getButton.innerHTML = '売上速報からデータを取得';
        this.getButton.classList.add('GuestsNumberlookUpButton');
        this.getButton.addEventListener('click', function(){

          // fullRecords取得済みであればそのリストから検索、なければ取得先から取得する
          _this.event = kintone.app.record.get();
          let companyName = _this.event.record[_this.fieldSettings.companyNameFieldName].value;
          let tantouName = _this.event.record[_this.fieldSettings.tantouNameFieldName].value;
          // if (fullRecords.length > 0) {
          //     let target = [];
          //     for (let i = 0; i < fullRecords.length; i++) {
          //       let isCompanyNameExist = true;
          //       if (companyName) {
          //         if (fullRecords[i].店番.value.indexOf(companyName) === -1) { //あいまい検索するためindexOfで評価する
          //           isCompanyNameExist = false;
          //         }
          //       }

          //       let isTantouNameExist = true;
          //       if (tantouName) {
          //         if (fullRecords[i].店名.value.indexOf(tantouName) === -1) { //あいまい検索するためindexOfで評価する
          //           isTantouNameExist = false;
          //         }
          //       }

          //       if (isCompanyNameExist && isTantouNameExist) {
          //         target.push(fullRecords[i]);
          //       }

          //     }

          //     if (!target.length) {
          //         alert('データがありません。');
          //     } else {
          //         _this.records = target;
          //         _this.showModal(target);
          //     }
          // } else {
              if(_this.event.record.利用日_まとめ.value == undefined || _this.event.record.利用日_まとめ.value == ''){
                alert('発生日時フィールドを入力してください。');
              }else if(_this.event.record._1.value == undefined || _this.event.record._1.value == ''){
                alert('ST開始時間を入力してください。');
              }else{
                showSpinner(); // スピナー表示
                fetchAllRecords(0, [], companyName, tantouName,_this.event)
                .then(function(response){
                    if (!response.length) {
                        alert('データがありません。');
                    } else {
                        _this.records = response;
                        _this.showModal(response);
                    }
                  hideSpinner(); // スピナー非表示
                });
              }
          // }
        });
        return this;
      },
      createClearButton: function(){
        let _this = this;
        this.clearButton = document.createElement('a');
        this.clearButton.classList.add('GuestsNumberCliarlookUpButton');
        this.clearButton.innerHTML = 'クリア';
        this.clearButton.addEventListener('click', function(){
          _this.clearDatas();
        });
        return this.clearButton;
      },
      showButtons: function(){
        kintone.app.record.getSpaceElement(this.fieldSettings.buttonSpace).classList.add('GuestsNumberlookUpButtonSpace');
        kintone.app.record.getSpaceElement(this.fieldSettings.buttonSpace).appendChild(this.getButton);
        kintone.app.record.getSpaceElement(this.fieldSettings.buttonSpace).appendChild(this.createClearButton());
        return this;
      },
      // modalの取得をクリックした際にフィールドに値をセットする処理
      copyDatas: function(modalRecord){
        let _this = this;

        // fieldSettingsで指定したフィールドコードとmodalとの対応関係に基づいて値をセットする
        this.event.record[this.fieldSettings.copyField.to].value = modalRecord[this.fieldSettings.copyField.from].value;
        this.fieldSettings.otherCopyFields.forEach(function(otherCopyField){
          _this.event.record[otherCopyField.to].value = modalRecord[otherCopyField.from].value;
        });
        this.event.record[this.fieldSettings.recordIdField].value = modalRecord.店名.value;
        kintone.app.record.set(this.event);

        // modal削除
        this.removeModal();
      },
      // クリアクリック時の処理
      clearDatas: function(record){
        let _this = this;
        this.event = kintone.app.record.get();
        this.event.record[this.fieldSettings.copyField.to].value = [];
        this.fieldSettings.otherCopyFields.forEach(function(otherCopyField){
          _this.event.record[otherCopyField.to].value = [];
        });
        this.event.record[this.fieldSettings.recordIdField].value = [];
        kintone.app.record.set(this.event);
      },
      // 標準ルックアップのようにフィールドを非活性化する処理
      disableOtherCopyFields: function(event){
        // this.fieldSettings.otherCopyFields.forEach(function(otherCopyField){
        //   event.record[otherCopyField.to].disabled = false;
        // });
        //event.record[this.fieldSettings.recordIdField].disabled = true;
        //kintone.app.record.setFieldShown(this.fieldSettings.recordIdField, false);
        return event;
      },
      // [詳細画面]標準ルックアップのようにルックアップ先へのリンクを表示する処理
      createLink: function(event){
        kintone.app.record.getFieldElement(this.fieldSettings.copyField.to).innerHTML = (
          '<a href="../' +
          this.fieldSettings.app +
          '/show#record=' +
          event.record[this.fieldSettings.recordIdField].value +
          '" target="_blank">' +
          event.record[this.fieldSettings.copyField.to].value +
          '</a>'
        );
      },
      // [一覧画面]標準ルックアップのようにルックアップ先へのリンクを表示する処理
      createLinks: function(event){
        let _this = this;
        event.records.forEach(function(record, index){
          kintone.app.getFieldElements(_this.fieldSettings.copyField.to)[index].innerHTML = (
            '<div><a href="../' +
            _this.fieldSettings.apps[record[_this.fieldSettings.appSelectField].value] +
            '/show#record=' +
            record[_this.fieldSettings.recordIdField].value +
            '" target="_blank">' +
            record[_this.fieldSettings.copyField.to].value +
            '</a></div>'
          );
        });
      }
    }
    return LookUpSample;
  })();
  // // ここから要編集(フィールド設定)
  // let lookUpParams = {
  //   //appSelectField: '顧客会社名', 
  //   buttonSpace: 'EarningsLookUp', //ボタン設置用のスペースフィールド
  //   recordIdField: '売上速報ルックアップ', //ルックアップ先のレコード番号保存用のフィールド
  //   app: lookupAppId,
  //   copyField: {
  //     to: '売上速報ルックアップ', //自作のルックアップフィールド
  //     from: '店名' //コピー元のフィールド
  //   },
  //   //コピー先のフィールドを追加したい場合は以下に追加していく
  //   otherCopyFields: [ //ほかのフィールドのコピー
  //   {to: '売上_計画', from: '売上計画'},//変更
  //   {to: '売上_週マネ', from: '売上実績_週マネ'},//変更
  //   {to: '売上_実績', from: '売上実績'},//変更
  //   {to: '売上_達成率', from: '売上達成率'}//変更
  //   ],
  //   viewFields: ['店番', '店名','日付', '売上計画','売上実績_週マネ','売上実績','売上達成率'], //modalに表示するフィールド
  //   companyNameFieldName : '店番',
  //   tantouNameFieldName : '店名',
  //   resultTableID : 'table2',
  //   companyCodeID: 'companyCode2',
  //   tantouNameID: 'hinban2',
  //   fileterButtonID: 'filterButton2',
  //   showAllButtoneID: 'showAllButton2',
  // };

  // if(){
  //   lookUpParams.otherCopyFields.push({to: '売上_達成率', from: test});
  // }


  //他のアプリからデータを取得するためのコード
  async function fetchAllRecords(maxRecordNumber, records, companyName, tantouName,event){
      //maxRecordNumberは、取得したデータの最大レコード番号
      maxRecordNumber = maxRecordNumber || 0;
      let showRecords = records || []; //検索キーワードにヒットしたレコードのリスト
      let rec = event.record;
  
      //kintone.apiでレコード取得するためのパラメータ
      let searchLimit = 500;
      let params = {
        'app': lookupAppId, // ルックアップのデータ取得先アプリID
        'query': '店番="' + event.record.店番.value + '" and 日付 > "' + getThreeDaysBefore(event.record.利用日_まとめ.value) + '" and 日付 < "' + getThreeDaysAfter(event.record.利用日_まとめ.value) + '" order by レコード番号 asc limit ' + searchLimit,
        'totalCount': true
    };
    
    // 3日前の日付を取得する関数
    function getThreeDaysBefore(dateString) {
        const currentDate = new Date(dateString);
        currentDate.setDate(currentDate.getDate() - 2);
        return currentDate.toISOString();
    }
    
    // 3日後の日付を取得する関数
    function getThreeDaysAfter(dateString) {
        const currentDate = new Date(dateString);
        currentDate.setDate(currentDate.getDate() + 2);
        return currentDate.toISOString();
    }
    
    if(rec.利用日_まとめ.value != undefined){
      return await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', params).then(function(response){
          if (response.records.length > 0) {
              for (let i = 0; i < response.records.length; i++) {
                // 全量をキャッシュする
                fullRecords.push(response.records[i]);

                // 全量キャッシュとは別に表示対象を
                let isCompanyNameExist = true;
                if (companyName) {
                  if (response.records[i].店番.value.indexOf(companyName) === -2) { //あいまい検索するためindexOfで評価する
                    isCompanyNameExist = false;
                  }
                }

                let isTantouNameExist = true;
                if (tantouName) {
                  if (response.records[i].店名.value.indexOf(tantouName) === -2) { //あいまい検索するためindexOfで評価する
                    isTantouNameExist = false;
                  }
                }

                if (isCompanyNameExist && isTantouNameExist) {
                  showRecords.push(response.records[i]);
                }
                
              }
          }

          //取得したレコード数が上限に達していれば再帰呼び出し
          if (response.records.length === searchLimit){
              return fetchshowRecords(response.records[searchLimit - 1].レコード番号.value, showRecords, companyName, tantouName);
          } else {
              return showRecords;
          }
      });
    }
  }

  


  // 多分無理というのも
  // kintone.events.on(['app.record.create.change._1','app.record.edit.change._1'], function(event){
  //   var record = event.record;
  //   console.warn("変更後のrecord",record);
  // });
  //新規画面と編集画面で処理を行う
  // 〇現在の問題点は、画面を表示した状態のデータを取得しようとしていること
  // フィールドの変更があった際にデータを感知する必要がある。
  kintone.events.on(['app.record.create.show','app.record.edit.show','app.record.create.change._1','app.record.edit.change._1'], function(event){
    //画面を開いた際レコードの情報を取得
    var record = event.record;

    // ここから要編集(フィールド設定)
    let lookUpParams = {
      //appSelectField: '顧客会社名', 
      buttonSpace: 'GuestsNumberLookUp', //ボタン設置用のスペースフィールド
      recordIdField: '客数実績ルックアップ', //ルックアップ先のレコード番号保存用のフィールド
      app: lookupAppId,
      copyField: {
        to: '客数実績ルックアップ', //自作のルックアップフィールド
        from: '店名' //コピー元のフィールド
      },
      //コピー先のフィールドを追加したい場合は以下の変数に追加していく
      otherCopyFields: [ 
      ],
      viewFields: ['店番', '店名','日付'], //modalに表示するフィールド
      companyNameFieldName : '店番',
      tantouNameFieldName : '店名',
      resultTableID : 'table2',
      companyCodeID: 'companyCode2',
      tantouNameID: 'hinban2',
      fileterButtonID: 'filterButton2',
      showAllButtoneID: 'showAllButton2',
    };
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //以下、ST開始時間を元に、客数実績をルックアップするためのデータ作成
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //時間帯、客数実績01のフィールド
    //時間帯別の1つ目の時間を取得
    var time_period1 = record._1.value;
    // 数字が 7か8か9の場合、前に0を付け加える
    if (time_period1 == 7 || time_period1 == 8 || time_period1 == 9) {
      time_period1 = '0' + time_period1;
    }
    if (time_period1 == 1) {
      time_period1 = 25;
    }else if(time_period1 == 2){
      time_period1 = 26;
    }else if(time_period1 == 3){
      time_period1 = 27;
    }else if(time_period1 == 4){
      time_period1 = 28;
    }else if(time_period1 == 5){
      time_period1 = 29;
    }else if(time_period1 == 6){
      time_period1 = 30;
    }
    //アンケートアプリの客数実績のフィールドを、売上速報【時間帯別推移】のフィールドコードと一致する形に変更
    var time_guests_number1 = '時間帯別_客数_'+ time_period1;
    //データを取得するための情報
    lookUpParams.otherCopyFields.push({to: '客数実績01', from: time_guests_number1 });
    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //時間帯、客数実績02のフィールド
    //時間帯別の2つ目の時間を取得
    var time_period2 = record._2.value;
    // 数字が 7か8か9の場合、前に0を付け加える
    if (time_period2 == 7 || time_period2 == 8 || time_period2 == 9) {
      time_period2 = '0' + time_period2;
    }
    if (time_period2 == 1) {
      time_period2 = 25;
    }else if(time_period2 == 2){
      time_period2 = 26;
    }else if(time_period2 == 3){
      time_period2 = 27;
    }else if(time_period2 == 4){
      time_period2 = 28;
    }else if(time_period2 == 5){
      time_period2 = 29;
    }else if(time_period2 == 6){
      time_period2 = 30;
    }
    //アンケートアプリの客数実績のフィールドを、売上速報【時間帯別推移】のフィールドコードと一致する形に変更
    var time_guests_number2 = '時間帯別_客数_'+ time_period2;
    //データを取得するための情報
    lookUpParams.otherCopyFields.push({to: '客数実績02', from: time_guests_number2 });
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //時間帯、客数実績03のフィールド
    //時間帯別の3つ目の時間を取得
    var time_period3 = record._3.value;
    // 数字が 7か8か9の場合、前に0を付け加える
    if (time_period3 == 7 || time_period3 == 8 || time_period3 == 9) {
      time_period3 = '0' + time_period3;
    }
    if (time_period3 == 1) {
      time_period3 = 25;
    }else if(time_period3 == 2){
      time_period3 = 26;
    }else if(time_period3 == 3){
      time_period3 = 27;
    }else if(time_period3 == 4){
      time_period3 = 28;
    }else if(time_period3 == 5){
      time_period3 = 29;
    }else if(time_period3 == 6){
      time_period3 = 30;
    }
    //アンケートアプリの客数実績のフィールドを、売上速報【時間帯別推移】のフィールドコードと一致する形に変更
    var time_guests_number3 = '時間帯別_客数_'+ time_period3;
    //データを取得するための情報
    lookUpParams.otherCopyFields.push({to: '客数実績03', from: time_guests_number3 });
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //時間帯、客数実績04のフィールド
    //時間帯別の4つ目の時間を取得
    var time_period4 = record._4.value;
    // 数字が 7か8か9の場合、前に0を付け加える
    if (time_period4 == 7 || time_period4 == 8 || time_period4 == 9) {
      time_period4 = '0' + time_period4;
    }
    if (time_period4 == 1) {
      time_period4 = 25;
    }else if(time_period4 == 2){
      time_period4 = 26;
    }else if(time_period4 == 3){
      time_period4 = 27;
    }else if(time_period4 == 4){
      time_period4 = 28;
    }else if(time_period4 == 5){
      time_period4 = 29;
    }else if(time_period4 == 6){
      time_period4 = 30;
    }
    //アンケートアプリの客数実績のフィールドを、売上速報【時間帯別推移】のフィールドコードと一致する形に変更
    var time_guests_number4 = '時間帯別_客数_'+ time_period4;
    //データを取得するための情報
    lookUpParams.otherCopyFields.push({to: '客数実績04', from: time_guests_number4 });
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //時間帯、客数実績05のフィールド
    //時間帯別の5つ目の時間を取得
    var time_period5 = record._5.value;
    // 数字が 7か8か9の場合、前に0を付け加える
    if (time_period5 == 7 || time_period5 == 8 || time_period5 == 9) {
      time_period5 = '0' + time_period5;
    }
    if (time_period5 == 1) {
      time_period5 = 25;
    }else if(time_period5 == 2){
      time_period5 = 26;
    }else if(time_period5 == 3){
      time_period5 = 27;
    }else if(time_period5 == 4){
      time_period5 = 28;
    }else if(time_period5 == 5){
      time_period5 = 29;
    }else if(time_period5 == 6){
      time_period5 = 30;
    }
    //アンケートアプリの客数実績のフィールドを、売上速報【時間帯別推移】のフィールドコードと一致する形に変更
    var time_guests_number5 = '時間帯別_客数_'+ time_period5;
    //データを取得するための情報
    lookUpParams.otherCopyFields.push({to: '客数実績05', from: time_guests_number5 });
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //時間帯、客数実績06のフィールド
    //時間帯別の6つ目の時間を取得
    var time_period6 = record._6.value;
    // 数字が 7か8か9の場合、前に0を付け加える
    if (time_period6 == 7 || time_period6 == 8 || time_period6 == 9) {
      time_period6 = '0' + time_period6;
    }
    if (time_period6 == 1) {
      time_period6 = 25;
    }else if(time_period6 == 2){
      time_period6 = 26;
    }else if(time_period6 == 3){
      time_period6 = 27;
    }else if(time_period6 == 4){
      time_period6 = 28;
    }else if(time_period6 == 5){
      time_period6 = 29;
    }else if(time_period6 == 6){
      time_period6 = 30;
    }
    //アンケートアプリの客数実績のフィールドを、売上速報【時間帯別推移】のフィールドコードと一致する形に変更
    var time_guests_number6 = '時間帯別_客数_'+ time_period6;
    //データを取得するための情報
    lookUpParams.otherCopyFields.push({to: '客数実績06', from: time_guests_number6 });
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //時間帯、客数実績07のフィールド
    //時間帯別の7つ目の時間を取得
    var time_period7 = record._7.value;
    // 数字が 7か8か9の場合、前に0を付け加える
    if (time_period7 == 7 || time_period7 == 8 || time_period7 == 9) {
      time_period7 = '0' + time_period7;
    }
    if (time_period7 == 1) {
      time_period7 = 25;
    }else if(time_period7 == 2){
      time_period7 = 26;
    }else if(time_period7 == 3){
      time_period7 = 27;
    }else if(time_period7 == 4){
      time_period7 = 28;
    }else if(time_period7 == 5){
      time_period7 = 29;
    }else if(time_period7 == 6){
      time_period7 = 30;
    }
    //アンケートアプリの客数実績のフィールドを、売上速報【時間帯別推移】のフィールドコードと一致する形に変更
    var time_guests_number7 = '時間帯別_客数_'+ time_period7;
    //データを取得するための情報
    lookUpParams.otherCopyFields.push({to: '客数実績07', from: time_guests_number7 });
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //時間帯、客数実績08のフィールド
    //時間帯別の8つ目の時間を取得
    var time_period8 = record._8.value;
    // 数字が 7か8か9の場合、前に0を付け加える
    if (time_period8 == 7 || time_period8 == 8 || time_period8 == 9) {
      time_period8 = '0' + time_period8;
    }
    if (time_period8 == 1) {
      time_period8 = 25;
    }else if(time_period8 == 2){
      time_period8 = 26;
    }else if(time_period8 == 3){
      time_period8 = 27;
    }else if(time_period8 == 4){
      time_period8 = 28;
    }else if(time_period8 == 5){
      time_period8 = 29;
    }else if(time_period8 == 6){
      time_period8 = 30;
    }
    //アンケートアプリの客数実績のフィールドを、売上速報【時間帯別推移】のフィールドコードと一致する形に変更
    var time_guests_number8 = '時間帯別_客数_'+ time_period8;
    //データを取得するための情報
    lookUpParams.otherCopyFields.push({to: '客数実績08', from: time_guests_number8 });
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //時間帯、客数実績09のフィールド
    //時間帯別の9つ目の時間を取得
    var time_period9 = record._9.value;
    // 数字が 7か8か9の場合、前に0を付け加える
    if (time_period9 == 7 || time_period9 == 8 || time_period9 == 9) {
      time_period9 = '0' + time_period9;
    }
    if (time_period9 == 1) {
      time_period9 = 25;
    }else if(time_period9 == 2){
      time_period9 = 26;
    }else if(time_period9 == 3){
      time_period9 = 27;
    }else if(time_period9 == 4){
      time_period9 = 28;
    }else if(time_period9 == 5){
      time_period9 = 29;
    }else if(time_period9 == 6){
      time_period9 = 30;
    }
    //アンケートアプリの客数実績のフィールドを、売上速報【時間帯別推移】のフィールドコードと一致する形に変更
    var time_guests_number9 = '時間帯別_客数_'+ time_period9;
    //データを取得するための情報
    lookUpParams.otherCopyFields.push({to: '客数実績09', from: time_guests_number9 });
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //時間帯、客数実績10のフィールド
    //時間帯別の10つ目の時間を取得
    var time_period10 = record._10.value;
    // 数字が 7か8か9の場合、前に0を付け加える
    if (time_period10 == 7 || time_period10 == 8 || time_period10 == 9) {
      time_period10 = '0' + time_period10;
    }
    if (time_period10 == 1) {
      time_period10 = 25;
    }else if(time_period10 == 2){
      time_period10 = 26;
    }else if(time_period10 == 3){
      time_period10 = 27;
    }else if(time_period10 == 4){
      time_period10 = 28;
    }else if(time_period10 == 5){
      time_period10 = 29;
    }else if(time_period10 == 6){
      time_period10 = 30;
    }
    //アンケートアプリの客数実績のフィールドを、売上速報【時間帯別推移】のフィールドコードと一致する形に変更
    var time_guests_number10 = '時間帯別_客数_'+ time_period10;
    //データを取得するための情報
    lookUpParams.otherCopyFields.push({to: '客数実績10', from: time_guests_number10 });
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //時間帯、客数実績11のフィールド
    //時間帯別の11つ目の時間を取得
    var time_period11 = record._11.value;
    // 数字が 7か8か9の場合、前に0を付け加える
    if (time_period11 == 7 || time_period11 == 8 || time_period11 == 9) {
      time_period11 = '0' + time_period11;
    }
    if (time_period11 == 1) {
      time_period11 = 25;
    }else if(time_period11 == 2){
      time_period11 = 26;
    }else if(time_period11 == 3){
      time_period11 = 27;
    }else if(time_period11 == 4){
      time_period11 = 28;
    }else if(time_period11 == 5){
      time_period11 = 29;
    }else if(time_period11 == 6){
      time_period11 = 30;
    }
    //アンケートアプリの客数実績のフィールドを、売上速報【時間帯別推移】のフィールドコードと一致する形に変更
    var time_guests_number11 = '時間帯別_客数_'+ time_period11;
    //データを取得するための情報
    lookUpParams.otherCopyFields.push({to: '客数実績11', from: time_guests_number11 });
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //時間帯、客数実績12のフィールド
    //時間帯別の12つ目の時間を取得
    var time_period12 = record._12.value;
    // 数字が 7か8か9の場合、前に0を付け加える
    if (time_period12 == 7 || time_period12 == 8 || time_period12 == 9) {
      time_period12 = '0' + time_period12;
    }
    if (time_period12 == 1) {
      time_period12 = 25;
    }else if(time_period12 == 2){
      time_period12 = 26;
    }else if(time_period12 == 3){
      time_period12 = 27;
    }else if(time_period12 == 4){
      time_period12 = 28;
    }else if(time_period12 == 5){
      time_period12 = 29;
    }else if(time_period12 == 6){
      time_period12 = 30;
    }
    //アンケートアプリの客数実績のフィールドを、売上速報【時間帯別推移】のフィールドコードと一致する形に変更
    var time_guests_number12 = '時間帯別_客数_'+ time_period12;
    //データを取得するための情報
    lookUpParams.otherCopyFields.push({to: '客数実績12', from: time_guests_number12 });
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //時間帯、客数実績13のフィールド
    //時間帯別の13つ目の時間を取得
    var time_period13 = record._13.value;
    // 数字が 7か8か9の場合、前に0を付け加える
    if (time_period13 == 7 || time_period13 == 8 || time_period13 == 9) {
      time_period13 = '0' + time_period13;
    }
    if (time_period13 == 1) {
      time_period13 = 25;
    }else if(time_period13 == 2){
      time_period13 = 26;
    }else if(time_period13 == 3){
      time_period13 = 27;
    }else if(time_period13 == 4){
      time_period13 = 28;
    }else if(time_period13 == 5){
      time_period13 = 29;
    }else if(time_period13 == 6){
      time_period13 = 30;
    }
    //アンケートアプリの客数実績のフィールドを、売上速報【時間帯別推移】のフィールドコードと一致する形に変更
    var time_guests_number13 = '時間帯別_客数_'+ time_period13;
    //データを取得するための情報
    lookUpParams.otherCopyFields.push({to: '客数実績13', from: time_guests_number13 });
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //時間帯、客数実績14のフィールド
    //時間帯別の14つ目の時間を取得
    var time_period14 = record._14.value;
    // 数字が 7か8か9の場合、前に0を付け加える
    if (time_period14 == 7 || time_period14 == 8 || time_period14 == 9) {
      time_period14 = '0' + time_period14;
    }
    if (time_period14 == 1) {
      time_period14 = 25;
    }else if(time_period14 == 2){
      time_period14 = 26;
    }else if(time_period14 == 3){
      time_period14 = 27;
    }else if(time_period14 == 4){
      time_period14 = 28;
    }else if(time_period14 == 5){
      time_period14 = 29;
    }else if(time_period14 == 6){
      time_period14 = 30;
    }
    //アンケートアプリの客数実績のフィールドを、売上速報【時間帯別推移】のフィールドコードと一致する形に変更
    var time_guests_number14 = '時間帯別_客数_'+ time_period14;
    //データを取得するための情報
    lookUpParams.otherCopyFields.push({to: '客数実績14', from: time_guests_number14 });
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //時間帯、客数実績15のフィールド
    //時間帯別の15つ目の時間を取得
    var time_period15 = record._15.value;
    // 数字が 7か8か9の場合、前に0を付け加える
    if (time_period15 == 7 || time_period15 == 8 || time_period15 == 9) {
      time_period15 = '0' + time_period15;
    }
    if (time_period15 == 1) {
      time_period15 = 25;
    }else if(time_period15 == 2){
      time_period15 = 26;
    }else if(time_period15 == 3){
      time_period15 = 27;
    }else if(time_period15 == 4){
      time_period15 = 28;
    }else if(time_period15 == 5){
      time_period15 = 29;
    }else if(time_period15 == 6){
      time_period15 = 30;
    }
    //アンケートアプリの客数実績のフィールドを、売上速報【時間帯別推移】のフィールドコードと一致する形に変更
    var time_guests_number15 = '時間帯別_客数_'+ time_period15;
    //データを取得するための情報
    lookUpParams.otherCopyFields.push({to: '客数実績15', from: time_guests_number15 });
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    let lookUP = new LookUpSample(lookUpParams).createGetButton().createModal();
    lookUP.event = event;
    lookUP.showButtons().disableOtherCopyFields(event);

    //テスト------------------------------------------------------------------------------
    // 対象となる要素を取得
    var lookUpSpace = document.getElementById('user-js-GuestsNumberLookUp');

    // GuestsNumberlookUpButtonのリンクが2つ以上ある場合、1つ目を削除
    var lookUpButtons = lookUpSpace.getElementsByClassName('GuestsNumberlookUpButton');
    if (lookUpButtons.length >= 2) {
        lookUpSpace.removeChild(lookUpButtons[0]);
    }

    // GuestsNumberCliarlookUpButtonのリンクが2つ以上ある場合、1つ目を削除
    var clearButtons = lookUpSpace.getElementsByClassName('GuestsNumberCliarlookUpButton');
    if (clearButtons.length >= 2) {
        lookUpSpace.removeChild(clearButtons[0]);
    }
    //------------------------------------------------------------------------------------
    return event;
  });
})();

// スピナー起動関数
function showSpinner() {
  if ($('.kintone-spinner').length == 0) {
      // スピナー設置用要素と背景要素の作成
      let spin_div = $('<div id ="kintone-spin" class="kintone-spinner"></div>');
      let spin_bg_div = $('<div id ="kintone-spin-bg" class="kintone-spinner"></div>');

      // スピナー用要素をbodyにappend
      $(document.body).append(spin_div, spin_bg_div);

      // スピナー動作に伴うスタイル設定
      $(spin_div).css({
          'position': 'fixed',
          'top': '50%',
          'left': '50%',
          'z-index': '510',
          'background-color': '#fff',
          'padding': '26px',
          '-moz-border-radius': '4px',
          '-webkit-border-radius': '4px',
          'border-radius': '4px'
      });

      $(spin_bg_div).css({
          'position': 'fixed',
          'top': '0px',
          'left': '0px',
          'z-index': '500',
          'width': '100%',
          'height': '200%',
          'background-color': '#000',
          'opacity': '0.5',
          'filter': 'alpha(opacity=50)',
          '-ms-filter': "alpha(opacity=50)"
      });

      // スピナーに対するオプション設定
      let opts = {
          'color': '#000'
      };

      // スピナーを作動
      new Spinner(opts).spin(document.getElementById('kintone-spin'));
  }

  // スピナー始動（表示）
  $('.kintone-spinner').show();
}

// スピナー停止関数
function hideSpinner() {
  $('.kintone-spinner').hide();
}

