// @author koguren
// 参考:https://community.cybozu.dev/t/topic/3252
// jQueryとspinnerを使います。https://cybozu.dev/ja/kintone/sdk/library/cybozu-cdn/
(function() {
    "use strict";
    // ルックアップ取得先のデータを保持したリスト。
    // これが空の場合はapi経由で全量取得し、値がある場合はここから検索する。
    const fullRecords = [];
    // ルックアップ先のアプリID【環境毎に編集が必要】
    let lookupAppId = 19;
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
          this.getButton.classList.add('saleslookUpButton');
          this.getButton.addEventListener('click', function(){
  
            // fullRecords取得済みであればそのリストから検索、なければ取得先から取得する
            _this.event = kintone.app.record.get();
            let companyName = _this.event.record[_this.fieldSettings.companyNameFieldName].value;
            let tantouName = _this.event.record[_this.fieldSettings.tantouNameFieldName].value;
            if (fullRecords.length > 0) {
                let target = [];
                for (let i = 0; i < fullRecords.length; i++) {
                  let isCompanyNameExist = true;
                  if (companyName) {
                    if (fullRecords[i].店番.value.indexOf(companyName) === -1) { //あいまい検索するためindexOfで評価する
                      isCompanyNameExist = false;
                    }
                  }
  
                  let isTantouNameExist = true;
                  if (tantouName) {
                    if (fullRecords[i].店名.value.indexOf(tantouName) === -1) { //あいまい検索するためindexOfで評価する
                      isTantouNameExist = false;
                    }
                  }
  
                  if (isCompanyNameExist && isTantouNameExist) {
                    target.push(fullRecords[i]);
                  }
  
                }
  
                if (!target.length) {
                    alert('データがありません。');
                } else {
                    _this.records = target;
                    _this.showModal(target);
                }
            } else {
            
                if(_this.event.record.日付_発生日時.value != undefined){
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
                }else{
                  alert('発生日時フィールドを入力してください。');
                }
                
            }
  
          });
          return this;
        },
        createClearButton: function(){
          let _this = this;
          this.clearButton = document.createElement('a');
          this.clearButton.classList.add('saleslookUpButton');
          this.clearButton.innerHTML = 'クリア';
          this.clearButton.addEventListener('click', function(){
            _this.clearDatas();
          });
          return this.clearButton;
        },
        showButtons: function(){
          kintone.app.record.getSpaceElement(this.fieldSettings.buttonSpace).classList.add('lookUpButtonSpace');
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
    // ここから要編集(フィールド設定)
    let lookUpParams = {
      //appSelectField: '顧客会社名', 
      buttonSpace: 'EarningsLookUp', //ボタン設置用のスペースフィールド
      recordIdField: '売上速報ルックアップ', //ルックアップ先のレコード番号保存用のフィールド
      app: lookupAppId,
      copyField: {
        to: '売上速報ルックアップ', //自作のルックアップフィールド
        from: '店名' //コピー元のフィールド
      },
      //コピー先のフィールドを追加したい場合は以下に追加していく
      otherCopyFields: [ //ほかのフィールドのコピー
      {to: '売上_計画', from: '売上計画'},//変更
      {to: '売上_週マネ', from: '売上実績_週マネ'},//変更
      {to: '売上_実績', from: '売上実績'},//変更
      {to: '売上_達成率', from: '売上達成率'},//変更
      ],
      viewFields: ['店番', '店名','日付', '売上計画','売上実績_週マネ','売上実績','売上達成率'], //modalに表示するフィールド
      companyNameFieldName : '店番',
      tantouNameFieldName : '店名',
      resultTableID : 'table2',
      companyCodeID: 'companyCode2',
      tantouNameID: 'hinban2',
      fileterButtonID: 'filterButton2',
      showAllButtoneID: 'showAllButton2',
    };
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
          'query': '店番="' + event.record.店番.value + '" and 日付 > "' + getThreeDaysBefore(event.record.日付_発生日時.value) + '" and 日付 < "' + getThreeDaysAfter(event.record.日付_発生日時.value) + '" order by 日付 desc limit ' + searchLimit,
          'totalCount': true
      };
      
      // 3日前の日付を取得する関数
      function getThreeDaysBefore(dateString) {
          const currentDate = new Date(dateString);
          currentDate.setDate(currentDate.getDate() - 3);
          return currentDate.toISOString();
      }
      
      // 3日後の日付を取得する関数
      function getThreeDaysAfter(dateString) {
          const currentDate = new Date(dateString);
          currentDate.setDate(currentDate.getDate() + 3);
          return currentDate.toISOString();
      }
      
      if(rec.日付_発生日時.value != undefined){
        return await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', params).then(function(response){
            if (response.records.length > 0) {
                for (let i = 0; i < response.records.length; i++) {
                  // 全量をキャッシュする
                  fullRecords.push(response.records[i]);
  
                  // 全量キャッシュとは別に表示対象を
                  let isCompanyNameExist = true;
                  if (companyName) {
                    if (response.records[i].店番.value.indexOf(companyName) === -1) { //あいまい検索するためindexOfで評価する
                      isCompanyNameExist = false;
                    }
                  }
  
                  let isTantouNameExist = true;
                  if (tantouName) {
                    if (response.records[i].店名.value.indexOf(tantouName) === -1) { //あいまい検索するためindexOfで評価する
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
  
    let lookUP = new LookUpSample(lookUpParams).createGetButton().createModal();
    kintone.events.on(['app.record.index.show'], function(event){
      // return lookUP.createLinks(event); //割愛
      return event;
    });
    //詳細画面ルックアップのリンクを作成
    kintone.events.on(['app.record.detail.show'], function(event){
      return lookUP.createLink(event);
    });
    //新規画面と編集画面で処理を行う
    kintone.events.on(['app.record.create.show','app.record.edit.show'], function(event){
      lookUP.event = event;
      lookUP.showButtons().disableOtherCopyFields(event);
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
  