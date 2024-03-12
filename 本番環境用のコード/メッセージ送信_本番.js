//一時的にコメントアウトしているコードがある
(function($) {
  'use strict';

    /**
     * 共通SOAPコンテンツ
     * ${XXXX}の箇所は実施処理等に合わせて置換して使用
     */
    const SOAP_TEMPLATE =
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">' +
            '<soap:Header>' +
              '<Action>${ACTION}</Action>' +
              '<Timestamp>' +
                '<Created>2023-08-12T14:45:00Z</Created>' +
                '<Expires>2037-08-12T14:45:00Z</Expires>' +
              '</Timestamp>' +
              '<Locale>jp</Locale>' +
            '</soap:Header>' +
            '<soap:Body>' +
              '<${ACTION}>' +
                '${PARAMETERS}' +
              '</${ACTION}>' +
            '</soap:Body>' +
          '</soap:Envelope>';

    /**
       * メッセージ登録パラメータテンプレート
       * ${XXXX}の箇所は入力値等で置換して使用
       */
    const MSG_ADD_TEMPLATE =
            '<parameters> '+
            '<request_token>${REQUEST_TOKEN}</request_token>' +
            '<create_thread> '+
              '<thread id="dummy" version="dummy" subject="${TITTLE}" confirm="false"> '+
                '${ADDRESSEE}' +
                '<content body="${MAIN_TEXT}"></content> '+
              ' <folder user_id="dammy"></folder> '+
            ' </thread> '+
          ' </create_thread> '+
          '</parameters>';

    /**
     * メッセージ送信先パラメータテンプレート
     * ${XXXX}の箇所は入力値等で置換して使用
     */
    const ADDRESSEE_TEMPLATE =
    '<addressee user_id="${USER_ID}" name="dummy" deleted="false"></addressee>';

    // 文字列をHTMLエスケープ
    const escapeHtml = function(str) {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

    // リクエストトークン取得
    const getRequestToken = function() {
      const defer = $.Deferred();

      // リクエストトークンの取得
      let request = SOAP_TEMPLATE;
      request = request.replace('${PARAMETERS}', '<parameters></parameters>');
      request = request.split('${ACTION}').join('UtilGetRequestToken');
      //request = request.replace('${CREATED}', luxon.DateTime.utc().startOf('second').toISO({suppressMilliseconds: true}));
      
      $.ajax({
        type: 'post',
        url: '/g/util_api/util/api.csp',
        cache: false,
        async: false,
        data: request
      })
        .then((response) => {
          defer.resolve($(response).find('request_token').text());
        });
      // 本来はエラー処理を実施
      return defer.promise();
    };

    //メッセージ実行の共通処理(ユーザーフィールド)
    const performCommonAction = async (action, code, content , URL ) => {
      try {

        //空の配列を作成
        let test = [];
        for(let iz =0;iz <code.length; iz++){
          test.push( await fetchGaroonUserByCode(code[iz]));
        }

        // 複数人への送信内容をまとめる配列
        const userParams = [];
        for (let i = 0; i < test.length; i++) {
          userParams.push(ADDRESSEE_TEMPLATE.replace('${USER_ID}', test[i].id));
        }

        // let targetUser = await fetchGaroonUserByCode(code);
        let requestToken = await getRequestToken();

        // 送信するメッセージパラメータを作成
        let msgAddParam = MSG_ADD_TEMPLATE;
        msgAddParam = msgAddParam.replace('${REQUEST_TOKEN}', escapeHtml(requestToken));
        msgAddParam = msgAddParam.replace('${TITTLE}', content);
        // msgAddParam = msgAddParam.replace('${USER_ID}', targetUser.id); // targetUserのidを使用,targetUser.id
        msgAddParam = msgAddParam.replace('${ADDRESSEE}', userParams.join(''));
        const body = URL.replace(/\n/g, '&#10;');
        msgAddParam = msgAddParam.replace('${MAIN_TEXT}', body); 
    
        let msgAddRequest = SOAP_TEMPLATE;
        // SOAPパラメータを完成させる
        msgAddRequest = msgAddRequest.replace('${PARAMETERS}', msgAddParam);

        // 実行処理を指定
        msgAddRequest = msgAddRequest.split('${ACTION}').join('MessageCreateThreads');

        // メッセージ登録の実行
        await $.ajax({
          type: 'post',
          url: 'https://watami.cybozu.com/g/cbpapi/message/api.csp',//お試し版URL【変更】
          cache: false,
          async: false,
          data: msgAddRequest,
        }).then(function(responseData) {
          console.log(responseData); // レスポンスデータをコンソールに表示
          //送信履歴をフィールドに代入
          
        });
      } catch (error) {
        console.error("エラーが発生しました:", error);
      }
    };

      // メッセージ実行の共通処理(特約店ユーザー)
      const performCommonAction_fc = async (action, code, content , URL ) => {
        try {
          let requestToken = await getRequestToken();
      
          // 送信するメッセージパラメータを作成
          let msgAddParam = MSG_ADD_TEMPLATE;
          msgAddParam = msgAddParam.replace('${REQUEST_TOKEN}', escapeHtml(requestToken));
          msgAddParam = msgAddParam.replace('${TITTLE}', content);
          msgAddParam = msgAddParam.replace('${USER_ID}', code); // targetUserのidを使用,targetUser.id
          msgAddParam = msgAddParam.replace('${MAIN_TEXT}', URL); 
      
          let msgAddRequest = SOAP_TEMPLATE;
          // SOAPパラメータを完成させる
          msgAddRequest = msgAddRequest.replace('${PARAMETERS}', msgAddParam);
          // 実行処理を指定
          msgAddRequest = msgAddRequest.split('${ACTION}').join('MessageCreateThreads');
    
          // メッセージ登録の実行
          await $.ajax({
            type: 'post',
            url: 'https://watami.cybozu.com/g/cbpapi/message/api.csp',//お試し版URL【変更】
            cache: false,
            async: false,
            data: msgAddRequest,
          }).then(function(responseData) {
            console.log(responseData); // レスポンスデータをコンソールに表示
          });
        } catch (error) {
          console.error("エラーが発生しました:", error);
        }
      };
    
    // //ワークフロー時のメッセージ送信処理
    // kintone.events.on(['app.record.detail.process.proceed'], async (event) => {
    //   let rec = event.record;
    //   //お試し版URL【変更】
    //   const kntAppURL = 'https://vlqus5oxxg9s.cybozu.com/k/8/';//【変更】
    //   //URLを作成
    //   let URL =  kntAppURL + 'show#record=' + rec.$id.value;
    //   //ユーザー情報を格納する変数
    //   let userCodes = [];
    //   //FCのユーザー情報を編集する変数
    //   let userCodes_fc = [];
    //   //宛先まとめる処理-----------------------------------
    //   // ユーザー選択のコードを変数に代入
    //   if(rec.コールセンター上長.value.length !== 0){
    //     let top_userfield = rec.コールセンター上長.value;
    //     userCodes.push(top_userfield[0]['code']);
    //   }
    //   if(rec.AM.value.length !== 0){
    //     let userfield = rec.AM.value;
    //     userCodes.push(userfield[0]['code']);
    //   }
    //   if(rec.部長.value.length !== 0){
    //     let userfield1 = rec.部長.value;
    //     userCodes.push(userfield1[0]['code']);
    //   }
    //   if(rec.本部長.value.length !== 0){
    //     let userfield2 = rec.本部長.value;
    //     userCodes.push(userfield2[0]['code']);
    //   }

    //   return event;
    // });

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //kintoneユーザーコードからGaroonのユーザー情報を取得
      const fetchGaroonUserByCode = async (code) => {
        const response = await fetch("/g/api/v1/base/users?name=" + code, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
        });
        const body = await response.json();
        const targetUser =  body.users.filter((user) => user.code === code)[0];
      return targetUser;
    };

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //詳細画面で送信に関するフィールドを更新する処理
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function send_content_update(rec){

    //Garoon送信履歴フィールド
    //送信履歴の値を保持
    var sending_time = rec.Garoon送信履歴.value;
    //現在日付を整形
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    const latest_time = `${year}年${month}月${day}日 ${hours}時${minutes}分${seconds}秒`;
    //Garoon送信履歴のフィールドに最新日時を代入
    
    if(sending_time == ''){
      var send_history = latest_time;
    }else{
      var send_history = sending_time + '\n' + latest_time;
    }

    const body = {
      app: kintone.app.getId(),
      id: kintone.app.record.getId(),
      record: {
        Garoon送信履歴: {
          value: send_history,
        }
      },
    };

    // フィールドの値を更新する
    return kintone.api(
      kintone.api.url("/k/v1/record.json", true), "PUT", body, (resp) => {
      }
    );
  }

//以下、Garoonのリンク作成 + Garoonメッセージ送信ボタン
  kintone.events.on(['app.record.detail.show'], async (event) => {
    let record = event.record;

    //----------------------------------------------------
    //詳細画面でGaroonのリンクを作成する処理
    //----------------------------------------------------
    if(record.Garoonリンク.value == ""){
      /**
       * 共通SOAPコンテンツ
       * ${XXXX}の箇所は実施処理等に合わせて置換して使用
       */
      let SOAP_TEMPLATE =
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">' +
          '<soap:Header>' +
              '<Action>${ACTION}</Action>' +
              '<Timestamp>' +
              '<Created>2023-08-12T14:45:00Z</Created>' +
              '<Expires>2037-08-12T14:45:00Z</Expires>' +
              '</Timestamp>' +
              '<Locale>jp</Locale>' +
          '</soap:Header>' +
          '<soap:Body>' +
              '<${ACTION}>' +
              '${PARAMETERS}' +
              '</${ACTION}>' +
          '</soap:Body>' +
          '</soap:Envelope>';

          /**
       * メッセージ登録パラメータテンプレート
       * ${XXXX}の箇所は入力値等で置換して使用
       */
      const MSG_SEARCH_TEMPLATE =
      '<parameters text="kintone" start="2010-07-01T00:00:00Z" end="2037-12-31T00:00:00Z" search_sub_folders="true" title_search="true" body_search="false" from_search="false" addressee_search="false" follow_search="false">' +
      '<request_token>${REQUEST_TOKEN}</request_token>' +
      '<create_thread>' +
      '</create_thread>' + 
      '</parameters>';

      // 文字列をHTMLエスケープ
      const escapeHtml = function(str) {
          return str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      };

      // リクエストトークン取得
      const getRequestToken = () => {
          try {
          const response = $.ajax({
              type: 'post',
              url: '/g/util_api/util/api.csp',
              cache: false,
              data: SOAP_TEMPLATE.replace('${PARAMETERS}', '<parameters></parameters>').split('${ACTION}').join('UtilGetRequestToken')
          });
      
          return $(response).find('request_token').text();
          } catch (error) {
          console.error("リクエストトークンの取得でエラーが発生しました:", error);
          throw error; // エラーを再スローして呼び出し元で処理できるようにする
          }
      };

      //メッセージ実行の共通処理(ユーザーフィールド)
      const GaroonCreateLink = (record) => {
        try {
            let requestToken = getRequestToken();

            // 送信するメッセージパラメータを作成
            let msgSearchParam = MSG_SEARCH_TEMPLATE;
            msgSearchParam = msgSearchParam.replace('${REQUEST_TOKEN}', escapeHtml(requestToken));
            let msgSearchRequest = SOAP_TEMPLATE;
            // SOAPパラメータを完成させる
            msgSearchRequest = msgSearchRequest.replace('${PARAMETERS}', msgSearchParam);

            // 実行処理を指定
            msgSearchRequest = msgSearchRequest.split('${ACTION}').join('MessageSearchThreads');

            // メッセージ検索の実行
            $.ajax({
                type: 'post',
                url: 'https://watami.cybozu.com/g/cbpapi/message/api.csp',//変更が必要
                cache: false,
                data: msgSearchRequest,
            }).then(function(responseData) {
                // 検索結果をXMLからテキストに変換
                let responseText = new XMLSerializer().serializeToString(responseData);

                // XML文字列をXMLドキュメントに変換
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(responseText, "text/xml");

                // thread要素のリストを取得
                let threads = xmlDoc.querySelectorAll('thread');
                // subjectごとのthreadのIDを保持するオブジェクト
                let subjectThreadIds = {};

                // 同じsubjectを持つthreadのIDを配列に追加
                threads.forEach(thread => {
                    let subjectGet = thread.getAttribute('subject');
                    if (subjectGet !== null && subjectGet !== undefined) {
                    let subject = subjectGet.replace(/.*【kintone】/, ''); // 変数の宣言と同時に初期化

                    let threadId = thread.getAttribute('id');
                    
                    if (!subjectThreadIds[subject]) {
                        subjectThreadIds[subject] = [];
                    }
                    
                    subjectThreadIds[subject].push(threadId);
                    } else {
                    }
                });

                // 重複するIDを削除
                Object.keys(subjectThreadIds).forEach(subject => {
                    subjectThreadIds[subject] = [...new Set(subjectThreadIds[subject])];
                });

                // subjectThreadIdsの連想配列内の配列のIDを昇順にソート
                Object.keys(subjectThreadIds).forEach(subject => {
                    subjectThreadIds[subject].sort((a, b) => a - b);
                });
                //配列にする
                let threadsArray = Array.from(threads);
                //空の配列を作成
                let newArray = [];
                    // 繰り返し
                    for (var key in subjectThreadIds) {
                        var subject = subjectThreadIds[key];

                        // 同じメッセージが1つ以上見つかった時
                        if (subject.length >= 1) {
                            // 1通目のメッセージIDを取得
                            let firstID = subject[0];

                            // 宛先を保持
                            // 1通目の情報を取得
                            let FirstTargetThread = threadsArray.find(thread => thread.getAttribute('id') == firstID);

                            // 1通目のDocumentオブジェクトを得る
                            const FirstXMLparser = new DOMParser();
                            const FirstXMLparserxmlDoc = FirstXMLparser.parseFromString(FirstTargetThread.outerHTML, "application/xml");

                            // 名前空間を指定してaddresseeタグのユーザーIDを抜き取る
                            const threadElementGet = FirstXMLparserxmlDoc.getElementsByTagName('thread');
                            const subjectGet = Array.from(threadElementGet).map(thread => thread.getAttribute('id'));

                            if (key == record.$id.value) {
                                
                                // record.Garoonリンク.value = "https://io8f1l5axfqn.cybozu.com/g/message/view.csp?mid=" + subjectGet + "&module_id=grn.message&br=1";
                                let GaroonLink = "https://watami.cybozu.com/g/message/view.csp?mid=" + subjectGet + "&module_id=grn.message&br=1";//変更が必要
                                
                                    // レコード更新のパラメータ設定
                                let body = {
                                    app: kintone.app.getId(),
                                    id: kintone.app.record.getId(),
                                    record: {
                                        Garoonリンク: {
                                            value: GaroonLink,
                                        },
                                    },
                                };
                                
                                // フィールドの値を更新する
                                return kintone.api(
                                    kintone.api.url("/k/v1/record.json", true), "PUT", body, (resp) => {
                                    // 更新できたらリロード
                                    if(record.Garoonリンク.value == ""){
                                      location.reload();
                                    }
                                    
                                    }
                                );
                
                            }
                            
                        }
                    }
            });
            
            } catch (error) {
            console.error("エラーが発生しました:", error);
            }
        };
      GaroonCreateLink(record);
      //詳細画面で、リンクを作成する処理はここまで
    }
  });

//----------------------------------------------------------
//新規画面で保存ボタンを押したとき、メッセージを送信する処理
//----------------------------------------------------------
// kintone.events.on(['app.record.create.submit.success'], async (event) => {
//   event.url = null;
//   let record = event.record;

//   // 文字を作成
//   // 改行で文字列を分割し、配列に変換
//   if(record.Garoon送信履歴.value != ''){
//     const dateArray =  record.Garoon送信履歴.value.split('\n');
//   }else{
//     const dateArray =  record.Garoon送信履歴.value;
//   }
//   const dateArray =  record.Garoon送信履歴.value.split('\n');

//   // 一番下の行を取得
//   const lastDateString = dateArray[dateArray.length - 1];

//   //Garoonメッセージ送信ボタンの横に最終更新日を表示
//   const adjacentText = '最終送信日時:' + lastDateString;
    

//   if (record.Garoonメッセージ送信制御.value == '送信する') {
//     //お試し版URL【変更】
//     const kntAppURL = 'https://watami.s.cybozu.com/k/822/';
//     //URLを作成
//     let URL =  kntAppURL + 'show#record=' + record.$id.value;
    
//     // メッセージの送信内容をまとめる
//     const messageContent = `〇送信内容\n${record.Garoon送信メッセージ内容.value}\n\n${adjacentText}`;
//     // メッセージの送信内容をまとめる
//       const swalResult = await window.swal({
//         title: 'メッセージを送信しますか？',
//         text: messageContent,
//         type: 'warning',
//         showCancelButton: true,
//         confirmButtonColor: '#DD6B55',
//         confirmButtonText: '送信する',
//         cancelButtonText: '送信しない',
//         closeOnConfirm: false},
//         () => {
//           // //モーダルを閉じる
//           // window.swal.close();
//           //メッセージを送信する処理
//           // お試し版URL【変更】URLとアプリID
//           const kntAppURL = 'https://watami.s.cybozu.com/k/822/';
//           // URLを作成
//           let URL = kntAppURL + 'show#record=' + record.$id.value;
//           // ユーザー情報を格納する変数
//           let userCodes = [];
//           // FCのユーザー情報を編集する変数
//           let userCodes_fc = [];
//           // 宛先まとめる処理-----------------------------------
//           // ユーザー選択のコードを変数に代入
//           if (record.コールセンター上長.value.length != 0) {
//             let top_userfield = record.コールセンター上長.value;
//             userCodes.push(top_userfield[0]['code']);
//           }
//           if (record.AM.value.length != 0) {
//             let userfield = record.AM.value;
//             userCodes.push(userfield[0]['code']);
//           }
//           if (record.部長.value.length != 0) {
//             let userfield1 = record.部長.value;
//             userCodes.push(userfield1[0]['code']);
//           }
//           if (record.本部長.value.length != 0) {
//             let userfield2 = record.本部長.value;
//             userCodes.push(userfield2[0]['code']);
//           }

//           if(record.アンケート報告書.value == '要'){
                // if(record.区分2.value == 'A報保存済'){
                //   var enquete_result = 'A報保存済';
                // }else{
                //   var enquete_result = 'A報請求済中';
                // }
//           }else{
//             var enquete_result = ''
//           }

//           const params = {
//             app: event.appId,		// アプリID
//             id: event.recordId,	// レコードID
//             record: {		        // レコード情報
//               送信1回目フラグ: { 
//                 value: '送信済み'
//               },
//               区分2: {
//                 value: enquete_result
//               },
//               Garoonメッセージ送信制御 :{
//                 value: '送信しない' 
//               }
//             }
//           };
//           kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', params).then((resp) => {
//             // PUT成功
//             return event;
//           })

//           var body = [];
//           if(record.お客様とのご連絡回数.value == '1回目' && record.送信1回目フラグ.value == '未送信' && record.アンケート報告書.value == '要'){
//             body = URL + '\n' + record.Garoon送信メッセージ内容.value;
//           }else if (record.お客様とのご連絡回数.value == '1回目' && record.送信1回目フラグ.value == '未送信' && record.アンケート報告書.value == '否'){
//             body = URL + '\n' + record.Garoon送信メッセージ内容.value;
//           }else if(record.お客様とのご連絡回数.value == '1回目' && record.送信1回目フラグ.value == '送信済み'){
//             body = record.Garoon送信メッセージ内容.value;
//           }

//           // IDの場合は右のように指定、record.$id.value
//           const content = record.店名.value + "【kintone】" + record.$id.value;
//           performCommonAction('申請', userCodes, content, body)
//             .then(function () {
//               GaroonMessageUpdateDelete();
//               //送信メッセージ内容
//               send_content_update(record);
        
//                 // setTimeout(() => {
//                 //   window.location.reload();
//                 // }, 1000);
//            })
//         }
//       );
//   }
//   return event;
// });

//-------------------------------------------------------------------------------------------------
//編集画面で保存ボタンを押したとき、メッセージを送信する処理
//-------------------------------------------------------------------------------------------------
kintone.events.on(['app.record.edit.submit.success'], async (event) => {
  let record = event.record;

  // 文字を作成
  // 改行で文字列を分割し、配列に変換
  if(record.Garoon送信履歴.value){
    const dateArray =  record.Garoon送信履歴.value.split('\n');
  }else{
    const dateArray =  record.Garoon送信履歴.value;
  }
  const dateArray =  record.Garoon送信履歴.value.split('\n');

  // 一番下の行を取得
  const lastDateString = dateArray[dateArray.length - 1];

  //Garoonメッセージ送信ボタンの横に最終更新日を表示
  const adjacentText = '最終送信日時:' + lastDateString;
    

  if (record.Garoonメッセージ送信制御.value == '送信する') {
    const appId = event.appId;
    const recordId = event.recordId;
    
    //お試し版URL【変更】
    const kntAppURL = 'https://watami.cybozu.com/k/822/';
    //URLを作成
    let URL =  kntAppURL + 'show#record=' + record.$id.value;
    
    // メッセージの送信内容をまとめる
    const messageContent = `〇送信内容\n${record.Garoon送信メッセージ内容.value}\n\n${adjacentText}`;
    // メッセージの送信内容をまとめる
      const swalResult = await window.swal({
        title: 'メッセージを送信しますか？',
        text: messageContent,
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: '送信する',
        cancelButtonText: '送信しない',
        closeOnConfirm: false},
        () => {
          //モーダルを閉じる
          window.swal.close();
          //メッセージを送信する処理
          // お試し版URL【変更】URLとアプリID
          const kntAppURL = 'https://watami.cybozu.com/k/822/';
          // URLを作成
          let URL = kntAppURL + 'show#record=' + record.$id.value;
          // ユーザー情報を格納する変数
          let userCodes = [];
          // FCのユーザー情報を編集する変数
          let userCodes_fc = [];
          //-----------------------------------------------------
          // 宛先まとめる処理
          //-----------------------------------------------------
          // ユーザー選択のコードを変数に代入
          //コールセンター
          if (record.コールセンター.value.length != 0) {
            let call_center = record.コールセンター.value;
            userCodes.push(call_center[0]['code']);
          }
          //コールセンター上長
          if (record.コールセンター上長.value.length != 0) {
            let top_userfield = record.コールセンター上長.value;
            userCodes.push(top_userfield[0]['code']);
          }
          //店舗名
          if(record.店舗名.value.length != 0){
            let store_name_field = record.店舗名.value;
            userCodes.push(store_name_field[0]['code']);
          }
          //本部長
          if (record.本部長.value.length != 0) {
            let general_manager_field = record.本部長.value;
            userCodes.push(general_manager_field[0]['code']);
          }
          //部長
          if (record.部長.value.length != 0) {
            let department_chief_field = record.部長.value;
            userCodes.push(department_chief_field[0]['code']);
          }
          //AM
          if (record.AM.value.length != 0) {
            let AM_field = record.AM.value;
            userCodes.push(AM_field[0]['code']);
          }
          //FCオーナー
          if(record.FCオーナー.value.length != 0){
            let fc_owner_field = record.FCオーナー.value;
            userCodes.push(fc_owner_field[0]['code']);
          }
          //閲覧権限追加ユーザー1
          if(record.閲覧権限ユーザー1.value.length != 0){
            let view_authority_user_1 = record.閲覧権限ユーザー1.value;
            userCodes.push(view_authority_user_1[0]['code']);
          }
          //閲覧権限追加ユーザー2
          if(record.閲覧権限ユーザー2.value.length != 0){
            let view_authority_user_2 = record.閲覧権限ユーザー2.value;
            userCodes.push(view_authority_user_2[0]['code']);
          }
          //閲覧権限追加ユーザー3
          if(record.閲覧権限ユーザー3.value.length != 0){
            let view_authority_user_3 = record.閲覧権限ユーザー3.value;
            userCodes.push(view_authority_user_3[0]['code']);
          }
          //閲覧権限追加ユーザー4
          if(record.閲覧権限ユーザー4.value.length != 0){
            let view_authority_user_4 = record.閲覧権限ユーザー4.value;
            userCodes.push(view_authority_user_4[0]['code']);
          }
          //閲覧権限追加ユーザー5
          if(record.閲覧権限ユーザー5.value.length != 0){
            let view_authority_user_5 = record.閲覧権限ユーザー5.value;
            userCodes.push(view_authority_user_5[0]['code']);
          }
          //閲覧権限追加ユーザー6
          if(record.閲覧権限ユーザー6.value.length != 0){
            let view_authority_user_6 = record.閲覧権限ユーザー6.value;
            userCodes.push(view_authority_user_6[0]['code']);
          }
          //閲覧権限追加ユーザー7
          if(record.閲覧権限ユーザー7.value.length != 0){
            let view_authority_user_7 = record.閲覧権限ユーザー7.value;
            userCodes.push(view_authority_user_7[0]['code']);
          }
          //閲覧権限追加ユーザー8
          if(record.閲覧権限ユーザー8.value.length != 0){
            let view_authority_user_8 = record.閲覧権限ユーザー8.value;
            userCodes.push(view_authority_user_8[0]['code']);
          }
          //閲覧権限追加ユーザー9
          if(record.閲覧権限ユーザー9.value.length != 0){
            let view_authority_user_9 = record.閲覧権限ユーザー9.value;
            userCodes.push(view_authority_user_9[0]['code']);
          }
          //閲覧権限追加ユーザー10
          if(record.閲覧権限ユーザー10.value.length != 0){
            let view_authority_user_10 = record.閲覧権限ユーザー10.value;
            userCodes.push(view_authority_user_10[0]['code']);
          }
          //閲覧権限追加ユーザー11
          if(record.閲覧権限ユーザー11.value.length != 0){
            let view_authority_user_11 = record.閲覧権限ユーザー11.value;
            userCodes.push(view_authority_user_11[0]['code']);
          }
          //閲覧権限追加ユーザー12
          if(record.閲覧権限ユーザー12.value.length != 0){
            let view_authority_user_12 = record.閲覧権限ユーザー12.value;
            userCodes.push(view_authority_user_12[0]['code']);
          }

          //-----------------------------------------------------
          //メッセージ送信時、区分の変更
          //-----------------------------------------------------

          if(record.アンケート報告書.value == '要'){
            if(record.区分2.value == 'A報保存済'){
              var enquete_result = 'A報保存済';
            }else{
              var enquete_result = 'A報請求済中';
            }
          }else{
            var enquete_result = ''
          }
          //-----------------------------------------------------
          //送信フラグの変更
          //-----------------------------------------------------
          //【送信2回目フラグ】1回目が送信済みであれば、2回目フラグを送信済みにする
          if((record.送信1回目フラグ.value == '送信済み' && record.ご返信内容_メール.value) || (record.送信1回目フラグ.value == '送信済み' && record.ご返信内容_口コミ.value) || record.送信2回目フラグ.value == '送信済み' ){ 
            var send_flag_second = '送信済み';
          }else{;
            var send_flag_second = '未送信';
          }

          //【送信3回目フラグ】2回目のやり取りの時、1回目の2通目フラグが'送信済み'
          if(record.お客様とのご連絡回数.value == '2回目' || record.送信3回目フラグ.value == '送信済み'){
            var send_flag_third = '送信済み';
          }else{
            var send_flag_third = '未送信';
          }

          //【送信4回目フラグ】
          if((record.お客様とのご連絡回数.value == '2回目' && record.送信3回目フラグ.value == '送信済み' && record.お客様への返答内容_コールセンター記入_2回目.value) || record.送信4回目フラグ.value == '送信済み'){
            var send_flag_four = '送信済み';
          }else{
            var send_flag_four = '未送信';
          }

          //【送信5回目フラグ】3回目のやり取りの時、2回目の2通目フラグが'送信済み'
          if(record.お客様とのご連絡回数.value == '3回目' || record.送信4回目フラグ.value == '送信済み'){
            var send_flag_five = '送信済み';
          }else{
            var send_flag_five = '未送信';
          }

          //【送信6回目フラグ】
          if((record.お客様とのご連絡回数.value == '3回目' && record.送信5回目フラグ.value == '送信済み' && record.お客様への返答内容_コールセンター記入_3回目.value) || record.送信6回目フラグ.value == '送信済み'){
            var send_flag_six = '送信済み';
          }else{
            var send_flag_six = '未送信';
          }

          //【アンケート報告書送信フラグ】
          if(record.アンケート報告書送信フラグ.value == '送信済み'){
            var send_flag_enquete_report = '送信済み';
          }else if(record.お客様対応の状況.value || record.原因.value || record.改善策_内容1.value ){
            var send_flag_enquete_report = '送信済み';
          }else{
            var send_flag_enquete_report = '未送信'; 
          }

          const params = {
            app: event.appId,		// アプリID
            id: event.recordId,	// レコードID
            record: {		        // レコード情報
              送信1回目フラグ: { 
                value: '送信済み'
              },
              送信2回目フラグ: {
                value: send_flag_second
              },
              送信3回目フラグ: {
                value: send_flag_third
              },
              送信4回目フラグ: {
                value: send_flag_four
              },
              送信5回目フラグ: {
                value: send_flag_five
              },
              送信6回目フラグ: {
                value: send_flag_six
              },
              アンケート報告書送信フラグ: {
                value: send_flag_enquete_report
              },
              区分2: {
                value: enquete_result
              },
              Garoonメッセージ送信制御 :{
                value: '送信しない' 
              }
            }
          };

          //レコードのデータ更新
          kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', params).then((resp) => {
            // PUT成功
            return event;
          })

          // 担当者からお客様に送信した場合
          if(record.お客様名_管理用.value == undefined || record.お客様名_管理用.value == '' ){
            var sent = '担当者' + '➝' + 'お客様' + '\n' + '\n';
          }else{
            var sent = '担当者' + '➝' + record.お客様名_管理用.value + '様' + '\n' + '\n';
          }

          //お客様から受信した場合
          if(record.お客様名_管理用.value == undefined || record.お客様名_管理用.value == '' ){
            var received =  'お客様' + '➝' + '担当者' + '\n' + '\n'; 
          }else{
            var received = record.お客様名_管理用.value + '様' + '➝' + '担当者' + '\n' + '\n';
          }

          //-------------------------------------------------------------------
          // Garoonに送信するテンプレートの作成
          //-------------------------------------------------------------------

          var body = [];
          if(record.お客様とのご連絡回数.value == '1回目' && record.送信1回目フラグ.value == '未送信'){
            body = '------------------------------------------------------------------' + '\n' + received + record.Garoon送信メッセージ内容.value + '\n' + '------------------------------------------------------------------' + '\n' + '\n' + 'kintoneリンク:' + URL ;
          }else if((record.お客様とのご連絡回数.value == '1回目' && record.送信1回目フラグ.value == '送信済み' && record.送信2回目フラグ.value == '未送信' && record.ご返信内容_メール.value ) ||  (record.お客様とのご連絡回数.value == '1回目' && record.送信1回目フラグ.value == '送信済み' && record.送信2回目フラグ.value == '未送信' && record.ご返信内容_口コミ.value ) || (record.お客様とのご連絡回数.value == '2回目' && record.送信3回目フラグ.value == '送信済み' && record.送信4回目フラグ.value == '未送信' && record.お客様への返答内容_コールセンター記入_2回目.value)  ||   (record.お客様とのご連絡回数.value == '3回目' && record.送信5回目フラグ.value == '送信済み' && record.送信6回目フラグ.value == '未送信' && record.お客様への返答内容_コールセンター記入_3回目.value )){//【修正後】【修正前】if((record.お客様とのご連絡回数.value == '1回目' && record.送信1回目フラグ.value == '送信済み' && record.送信2回目フラグ.value == '未送信') || (record.お客様とのご連絡回数.value == '2回目' && record.送信3回目フラグ.value == '送信済み' && record.送信4回目フラグ.value == '未送信'))
            body = '------------------------------------------------------------------' + '\n' +  sent + record.Garoon送信メッセージ内容.value + '\n' + '------------------------------------------------------------------';
          }else if((record.お客様とのご連絡回数.value == '2回目' && record.送信3回目フラグ.value == '未送信') || (record.お客様とのご連絡回数.value == '3回目' && record.送信5回目フラグ.value == '未送信') ){
            body = '------------------------------------------------------------------' + '\n' +  received + record.Garoon送信メッセージ内容.value + '\n' + '------------------------------------------------------------------';
          }
          else{
            body = '------------------------------------------------------------------' + '\n' +  record.Garoon送信メッセージ内容.value + '\n' + '------------------------------------------------------------------';
          }

          //タイトルは次のフォーマット日付　業態) 店名 受付方法 (総合評価) + "【kintone】" + record.$id.value
          //-------------------------------------------------------------------
          //メッセージのタイトル
          //-------------------------------------------------------------------
          const today = new Date();
          //現在の日付を取得
          const year = today.getFullYear().toString().slice(2);
          const month = ('0' + (today.getMonth() + 1)).slice(-2);
          const day = ('0' + today.getDate()).slice(-2);
          const formattedDate = year + month + day;

          //業態
          if(record.業態.value){
            var industry = record.業態.value;
          }else{
            var industry = '';
          }
          
          //店名
          if(record.店名.value){
            var store_name = record.店名.value;
          }else{
            var store_name = '';
          }

          //総合評価
          if(record.総合評価_まとめ.value){
            var comprehensive_evaluation = '(' + record.総合評価_まとめ.value + ')';
          }else{
            var comprehensive_evaluation = '';
          }

          //Garoonメッセージのタイトル
          const content = formattedDate + ":" + industry + ')' + store_name+ "　" + record.受付方法.value + comprehensive_evaluation + "【kintone】" + record.$id.value;

          performCommonAction('申請', userCodes, content, body)
            .then(function () {
              GaroonMessageUpdateDelete(record);
              //送信履歴フィールドを更新
              send_content_update(record);
              setTimeout(() => {
                //新規タブ(今はあきらめた)
                // window.open(`${record.Garoonリンク.value}`, '_blank');
                window.location.reload();
              }, 1200);  
          })
        }
      );
  }
  return event;
});

                // //新規タブ
                // window.open(`${record.Garoonリンク.value}`, '_blank');

                // setTimeout(() => {
                  // const urlToOpen = `${record.Garoonリンク.value}`; // ここに開きたいURLを指定
                  // // 新しいタブを開く
                  // window.open(urlToOpen, '_blank');
                // }, 2000);

//-------------------------------------------------------------------
//Garoonのメッセージを検索➝更新➝削除する処理
//-------------------------------------------------------------------
  /**
  * メッセージ登録パラメータテンプレート
  * ${XXXX}の箇所は入力値等で置換して使用
  */
  const MSG_SEARCH_TEMPLATE =
    '<parameters text="kintone" start="2010-07-01T00:00:00Z" end="2037-12-31T00:00:00Z" search_sub_folders="true" title_search="true" body_search="false" from_search="false" addressee_search="false" follow_search="false">' +
    '<request_token>${REQUEST_TOKEN}</request_token>' +
    '<create_thread>' +
    '</create_thread>' + 
    '</parameters>';

    
  //Garoonメッセージを更新削除する処理
  const GaroonMessageUpdateDelete = async (record) => {
    try {
          let requestToken = await getRequestToken();

          // 送信するメッセージパラメータを作成
          let msgSearchParam = MSG_SEARCH_TEMPLATE;
          msgSearchParam = msgSearchParam.replace('${REQUEST_TOKEN}', escapeHtml(requestToken));
          let msgSearchRequest = SOAP_TEMPLATE;
          // SOAPパラメータを完成させる
          msgSearchRequest = msgSearchRequest.replace('${PARAMETERS}', msgSearchParam);

          // 実行処理を指定
          msgSearchRequest = msgSearchRequest.split('${ACTION}').join('MessageSearchThreads');

          // メッセージ検索の実行
          await $.ajax({
            type: 'post',
            url: 'https://watami.cybozu.com/g/cbpapi/message/api.csp',//変更が必要
            cache: false,
            data: msgSearchRequest,
          }).then(function(responseData) {
              // 検索結果をXMLからテキストに変換
            let responseText = new XMLSerializer().serializeToString(responseData);
            // console.warn("検索結果です。" + responseText); // レスポンスデータをコンソールに表示

            // XML文字列をXMLドキュメントに変換
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(responseText, "text/xml");

            // thread要素のリストを取得
            let threads = xmlDoc.querySelectorAll('thread');

            // subjectごとのthreadのIDを保持するオブジェクト
            let subjectThreadIds = {};

            // 同じsubjectを持つthreadのIDを配列に追加
            threads.forEach(thread => {
              let subjectGet = thread.getAttribute('subject');
              if (subjectGet !== null && subjectGet !== undefined) {
                let subject = subjectGet.replace(/.*【kintone】/, ''); // 変数の宣言と同時に初期化

                let threadId = thread.getAttribute('id');
              
                if (!subjectThreadIds[subject]) {
                  subjectThreadIds[subject] = [];
                }
              
                subjectThreadIds[subject].push(threadId);
              }
            });

            // 重複するIDを削除
            Object.keys(subjectThreadIds).forEach(subject => {
              subjectThreadIds[subject] = [...new Set(subjectThreadIds[subject])];
            });

            // subjectThreadIdsの連想配列内の配列のIDを昇順にソート
            Object.keys(subjectThreadIds).forEach(subject => {
              subjectThreadIds[subject].sort((a, b) => a - b);
            });
            //配列にする
            let threadsArray = Array.from(threads);
            //空の配列を作成
            let newArray = [];
    // console.warn("繰り返し処理の前の配列",threadsArray);
            //繰り返し
            Object.keys(subjectThreadIds).forEach(subject => {
              //同じメッセージが2つ以上見つかった時
              if (subjectThreadIds[subject].length >= 2) {
                //1通目のメッセージIDを取得
                let firstID = subjectThreadIds[subject][0];

                //宛先を保持
                //1通目の情報を取得
                let FirstTargetThread = threadsArray.find(thread => thread.getAttribute('id') == firstID);

                //1通目のDocumentオブジェクトを得る
                const FirstXMLparser = new DOMParser();
                const FirstXMLparserxmlDoc = FirstXMLparser.parseFromString(FirstTargetThread.outerHTML, "application/xml");

                 //1通目のsubjectタグ情報を抜き取る
                 const threadElementGet= FirstXMLparserxmlDoc.getElementsByTagName('thread');
                 var subjectGet = Array.from(threadElementGet).map(thread => thread.getAttribute('subject'));

                //最新メッセージのID
                let finalArray = subjectThreadIds[subject][subjectThreadIds[subject].length - 1];

                //最終メッセージの情報を取得
                let FinalTargetThread = threadsArray.find(thread => thread.getAttribute('id') == finalArray);

                //最後メッセージののDocumentオブジェクトを得る
                const FinalXMLparser = new DOMParser();
                const FinalXMLparserxmlDoc = FinalXMLparser.parseFromString(FinalTargetThread.outerHTML, "application/xml");
                console.warn("テスト",FinalXMLparserxmlDoc);
                
                // 名前空間を指定してaddresseeタグのユーザーIDを抜き取る
                const addresseeElements = FinalXMLparserxmlDoc.getElementsByTagName('th:addressee');
                const addresseeUserIds = Array.from(addresseeElements).map(addressee => addressee.getAttribute('user_id'));

                const subjectElements = FinalXMLparserxmlDoc.getElementsByTagName('thread');
                const subjectFinalMessageArray  = Array.from(subjectElements).map(thread => thread.getAttribute('subject'));
                // 配列を文字列に結合
                const subjectFinalMessage = subjectFinalMessageArray.join(' '); 
                //::より左側の文字を取得(年月日)
                var new_send_date = subjectFinalMessage.split(":")[0];

                // subjectGetを文字列に変換
                var subjectGetMessage = subjectGet.join(' '); 
                // 数字と"再更新"という文字列を含むパターンを正規表現で検索して削除
                var subjectGetMessage = subjectGetMessage.replace(/(\d*再更新:)/, '');


                const send_subject = new_send_date + '再更新' + ':' + subjectGetMessage;


                // 名前空間を指定して「」タグのタイトルを抜き取る

                  // タイトルごとに繰り返し
                  subjectThreadIds[subject].forEach(id => {
                  // IDが一致するスレッドを取得
                  let targetThread = threadsArray.find(thread => thread.getAttribute('id') == id);

                  // XML文字列を解析してDocumentオブジェクトを得る
                  const XMLparser = new DOMParser();
                  const xmlDocResult = XMLparser.parseFromString(targetThread.outerHTML, "application/xml");

                  // th:content要素を取得
                  let contentElement = xmlDocResult.querySelector('content');
                  // th:contentのbody属性の内容を取得
                  let bodyContent = contentElement ? contentElement.getAttribute('body') : null;

                  if (bodyContent) {
                    newArray.unshift(bodyContent);
                  }
                });

                  // newArrayを1つの文字列にまとめる
                  let resultString = '';

                  for (let i = 0; i < newArray.length; i++) {

                    let replacedString = newArray[i];

                    // newArray[i]の中に【受付1(始)】があれば、置き換える
                    if (newArray[i].includes("【受付1(始)】")) {
                      if(record.受付方法.value == '電話' ){
                        var first_message_result = first_message_call(record);
                      }else if(record.受付方法.value == 'メール・ネットアンケート'){
                        var first_message_result = first_message_mail(record);
                      }else {
                        var first_message_result = first_message_review(record);
                      }
                      // 【受付1(始)】から【受付1(終)】までの文字列を置き換える
                      replacedString = replacedString.replace(/【受付1\(始\)】([\s\S]*?)【受付1\(終\)】/g, first_message_result );
                    }
                  
                    // newArray[i]の中に【回答1(始)】があれば、置き換える
                    if (newArray[i].includes("【回答1(始)】")) {
                      //2通目のコードを入力
                      if(record.受付方法.value == '電話' ){
                        // 電話対応の場合、2通目を送信する必要がないので、コメントアウト
                        // var second_message_result = second_message_call(record);
                      }else if(record.受付方法.value == 'メール・ネットアンケート'){
                        var second_message_result = second_message_mail(record);
                        // 【回答1(始)】から【回答1(終)】までの文字列を置き換える
                        replacedString = replacedString.replace(/【回答1\(始\)】([\s\S]*?)【回答1\(終\)】/g, second_message_result);
                      }else {
                        var second_message_result = second_message_review(record);
                        // 【回答1(始)】から【回答1(終)】までの文字列を置き換える
                        replacedString = replacedString.replace(/【回答1\(始\)】([\s\S]*?)【回答1\(終\)】/g, second_message_result);
                      }
                      
                    }

                    // newArray[i]の中に【受付2(始)】があれば、置き換える
                    if (newArray[i].includes("【受付2(始)】")) {
                      //3通目のコードを入力
                      var third_message_result = third_message(record);
                      // 【受付2(始)】から【受付2(終)】までの文字列を置き換える
                      replacedString = replacedString.replace(/【受付2\(始\)】([\s\S]*?)【受付2\(終\)】/g, third_message_result);
                    }

                    // newArray[i]の中に【回答2(始)】があれば、置き換える
                    if (newArray[i].includes("【回答2(始)】")) {
                      //4通目のコードを入力
                      var four_message_result = four_message(record);
                      // 【回答2(始)】から【回答2(終)】までの文字列を置き換える
                      replacedString = replacedString.replace(/【回答2\(始\)】([\s\S]*?)【回答2\(終\)】/g, four_message_result);
                    }

                    // newArray[i]の中に【受付3(始)】があれば、置き換える
                    if (newArray[i].includes("【受付3(始)】")) {
                      //  5通目のコードを入力
                      var five_message_result = five_message(record);
                      // 【受付3(始)】から【受付3(終)】までの文字列を置き換える
                      replacedString = replacedString.replace(/【受付3\(始\)】([\s\S]*?)【受付3\(終\)】/g, five_message_result);
                    }

                    // newArray[i]の中に【回答3(始)】があれば、置き換える
                    if (newArray[i].includes("【回答3(始)】")) {
                      //  6通目のコードを入力
                      var six_message_result = six_message(record);
                      // 【回答3(始)】から【回答3(終)】までの文字列を置き換える
                      replacedString = replacedString.replace(/【回答3\(始\)】([\s\S]*?)【回答3\(終\)】/g, six_message_result);
                    }

                    // // newArray[i]の中に【アンケート報告書(始)】があれば、置き換える
                    // if (newArray[i].includes("【アンケート報告書(始)】")) {
                    //   //アンケート報告書のテンプレート文を変数に代入
                    //   var enquete_report_result = enquete_report_message(record);
                    //   // 【アンケート報告書(始)】から【アンケート報告書(終)】までの文字列を置き換える
                    //   replacedString = replacedString.replace(/【アンケート報告書\(始\)】([\s\S]*?)【アンケート報告書\(終\)】/g, enquete_report_result);
                    // }
                    
                    resultString += replacedString;
                  
                    // 最後の要素でない場合、改行と "--------------------------------------------" を追加
                    if (i < newArray.length - 1) {
                      resultString += '\n';
                    }
                  }

                  //メッセージ更新処理
                  MessageUpdate(firstID,resultString,send_subject,addresseeUserIds);

                  // //1通目以外のメッセージを削除
                  let index = subjectThreadIds[subject].indexOf(firstID);
                  if (index !== -1) {
                  subjectThreadIds[subject].splice(index, 1);
                  }
                  setTimeout(function() {
                    // ここに実行したいコードを書く
                    for (const id of subjectThreadIds[subject]) {
                      // id は配列内の各数字、ここで繰り返し処理を行う
                      //削除処理
                        MessageDelete(id);
                    }
                  }, 300);
                }  
              });
          });
        } catch (error) {
          console.error("エラーが発生しました:", error);
      }
    };

  //--------------------------------------------------------------------------------
  //更新処理
  //--------------------------------------------------------------------------------
   /**
   * 共通SOAPコンテンツ
   * ${XXXX}の箇所は実施処理等に合わせて置換して使用
   */
      const SOAP_UPDATE_TEMPLATE =
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">' +
        '<soap:Header>' +
          '<Action>${ACTION}</Action>' +
          '<Timestamp>' +
            '<Created>2023-08-12T14:45:00Z</Created>' +
            '<Expires>2037-08-12T14:45:00Z</Expires>' +
          '</Timestamp>' +
          '<Locale>jp</Locale>' +
        '</soap:Header>' +
        '<soap:Body>' +
          '<${ACTION}>' +
            '${PARAMETERS}' +
          '</${ACTION}>' +
        '</soap:Body>' +
      '</soap:Envelope>';
  /**
     * メッセージ更新パラメータテンプレート
     * ${XXXX}の箇所は入力値等で置換して使用
     */
  const MSG_UPDATE_TEMPLATE =
          '<parameters>'+
          '<request_token>${REQUEST_TOKEN}</request_token>'+
          '<modify_thread>'+
            '<thread id="${MESSAGE_ID}" version="dummy" subject="${SUBJECT}" confirm="false">'+
              '${ADDRESSEE}' +
              '<content body="${MAIN_TEXT}"></content>'+
              '<folder id="dummy"></folder>'+
            '</thread>'+
          ' </modify_thread>'+
          '</parameters>';

   /**
   * メッセージ送信先パラメータテンプレート
   * ${XXXX}の箇所は入力値等で置換して使用
  //  */
  const ADDRESSEE_TEMPLATE_UPDATE =
  '<addressee user_id="${USER_ID}" name="dummy" deleted="false"></addressee>';
          
  //メッセージ実行の共通処理(ユーザーフィールド)
  const MessageUpdate = async (message_id,main_text,subjectText,addresseeUserIds) => {
    try {

      let requestTokenaaa = await getRequestToken();

      // 複数人への宛先をまとめる配列
      const userParams = [];
      for (let i = 0; i < addresseeUserIds.length; i++) {
        userParams.push(ADDRESSEE_TEMPLATE_UPDATE.replace('${USER_ID}', addresseeUserIds[i]));
      }

      // 送信するメッセージパラメータを作成
      let msgUpdataParam = MSG_UPDATE_TEMPLATE;
      msgUpdataParam = msgUpdataParam.replace('${REQUEST_TOKEN}', escapeHtml(requestTokenaaa));//トークン
      msgUpdataParam = msgUpdataParam.replace('${MESSAGE_ID}',message_id); //対象のメッセージ
      msgUpdataParam = msgUpdataParam.replace('${SUBJECT}', subjectText); //タイトル
      const mainTextWithEscapedNewlines = main_text.replace(/\n/g, '&#10;');
      msgUpdataParam = msgUpdataParam.replace('${MAIN_TEXT}', mainTextWithEscapedNewlines);
      msgUpdataParam = msgUpdataParam.replace('${ADDRESSEE}', userParams.join(''));//宛先を全員分追加

      let msgUpdateRequest = SOAP_UPDATE_TEMPLATE;
      // SOAPパラメータを完成させる
      msgUpdateRequest = msgUpdateRequest.replace('${PARAMETERS}', msgUpdataParam);
      // 実行処理を指定
      msgUpdateRequest = msgUpdateRequest.split('${ACTION}').join('MessageModifyThreads');

      // メッセージ登録の実行
      await $.ajax({
        type: 'post',
        url: 'https://watami.cybozu.com/g/cbpapi/message/api.csp',//変更が必要
        cache: false,
        async: false,
        data: msgUpdateRequest
      }).then(function(responseData) {
        // console.warn("更新に成功",responseData); // レスポンスデータをコンソールに表示
      });

    } catch (error) {
      // console.error("エラーが発生しました:", error);
    }
  };

  //-----------------------------------------------------------------------------
  //メッセージ削除処理
  //-----------------------------------------------------------------------------
   /**web認証方式
   * 共通SOAPコンテンツ
   * ${XXXX}の箇所は実施処理等に合わせて置換して使用
   */
  //変更が必要(folder_idとUser情報)
        const SOAP_DELETE_TEMPLATE =
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">' +
        '<soap:Header>' +
        '<Action>${ACTION}</Action>' + // この行を修正
        '<Security>' +
        '<UsernameToken>' +
        '<Username>watami01</Username>' +
        '<Password>wtmsus22</Password>' +
        '</UsernameToken>' +
        '</Security>' +
        '<Timestamp>' +
        '<Created>2023-08-12T14:45:00Z</Created>' +
        '<Expires>2037-08-12T14:45:00Z</Expires>' +
        '</Timestamp>' +
        '<Locale>jp</Locale>' +
        '</soap:Header>' +
        '<soap:Body>' +
        '<MessageRemoveThreads>' +
        '<parameters delete_all_inbox="true">' +
        '<param xmlns="" folder_id="107563" thread_id="${DELETE_ID}"></param>' +
        '</parameters>' +
        '</MessageRemoveThreads>' +
        '</soap:Body>' +
        '</soap:Envelope>';
          
    //メッセージ実行の共通処理(ユーザーフィールド)
    const MessageDelete = async (delete_id) => {
      try {
        //リクエストのテンプレート
        let msgDeleteRequest = SOAP_DELETE_TEMPLATE;
        // console.warn("削除処理に入ってきた。");
        //削除するIDを置換
        msgDeleteRequest = msgDeleteRequest.replace('${DELETE_ID}', delete_id );
  
        // 実行処理を指定
        msgDeleteRequest = msgDeleteRequest.split('${ACTION}').join('MessageRemoveThreads');
  
        // メッセージ登録の実行
        await $.ajax({
          type: 'post',
          url: 'https://watami.cybozu.com/g/cbpapi/message/api.csp',//お試し版URL【変更】
          cache: false,
          data: msgDeleteRequest,
        }).then(function(responseData) {
          console.warn("削除に成功"); // レスポンスデータをコンソールに表示
        });
      } catch (error) {
        console.error("エラーが発生しました:", error);
      }
    };

//------------------------------------------------------------------------------
//メッセージのユーザー定義関数
//------------------------------------------------------------------------------
    /*
      メッセージの1通目(電話)
    */
    function first_message_call(record){
        //ご来店日時を編集
        if(record.ご来店日時_電話.value == '' || record.ご来店日時_電話.value == undefined){
            var visits_date_call = '' ;
            var visits_time_call = '';
        }else {
            const dateTime = new Date(record.ご来店日時_電話.value);
            // const dateTime = visits_date_time_call.toISOString('ja-JP', options).split(' ')[0];

            // 年月日の取得
            const year = dateTime.getFullYear();
            const month = String(dateTime.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため、1を加え、2桁に整形
            const day = String(dateTime.getDate()).padStart(2, '0'); // 日も2桁に整形

            // 時分の取得
            const hours = String(dateTime.getHours()).padStart(2, '0');
            const minutes = String(dateTime.getMinutes()).padStart(2, '0');

            // ご来店日
            var visits_date_call = `${year}年${month}月${day}日`;
            
            // 来店時間
            var visits_time_call = `${hours}時${minutes}分`;
        }

        //ご来店人数
        if(record.ご来店人数_電話.value == undefined || record.ご来店人数_電話.value == undefined ){
            var visits_number = '' ;
        }else{
            var visits_number = record.ご来店人数_電話.value;
        }

        //お気づきの内容
        if(record.ご意見詳細.value == undefined || record.ご意見詳細.value == '' ){
            var opinion_detail = '';
        }else{
            var opinion_detail = record.ご意見詳細.value;
        }

        //総合評価
        if(record.総合評価_電話.value == undefined || record.総合評価_電話.value == ''){
            var evaluation_call = '';
        }else{
            var evaluation_call = record.総合評価_電話.value;
        }

        //性別(男性)
        if(record.性別_男性_電話.value == undefined || record.性別_男性_電話.value == ''){
            var sex_man_call = '';
        }else{
            var sex_man_call = '男性' + record.性別_男性_電話.value + '人';
        }
        //性別(女性)
        if(record.性別_女性_電話.value == undefined || record.性別_女性_電話.value == ''){
          var sex_woman_call = '';
        }else{
            var sex_woman_call = '女性' + record.性別_女性_電話.value + '人';
        }
        //性別
        if(sex_man_call && sex_woman_call){
          var sex_call = sex_man_call + '、' +sex_woman_call;
        }else if(sex_man_call && sex_woman_call == ''){
          var sex_call = sex_man_call;
        }else if(sex_man_call == '' && sex_woman_call){
          var sex_call = sex_woman_call;
        }else{
          var sex_call = '';
        }

        //名前
        if(record.お名前_電話.value == undefined || record.お名前_電話.value == ''){
            var name_call = '';
        }else{
            var name_call = record.お名前_電話.value;
        }

        //ご連絡先
        if(record.ご連絡先_電話.value == undefined || record.ご連絡先_電話.value == ''){
            var contact_address_call = '';
        }else{ 
            var contact_address_call = record.ご連絡先_電話.value;
        }

        var Garoon_message = '';

        //電話の場合、Garoonに送信するメッセージを作成
        if(record.アンケート報告書.value == '要'){
            Garoon_message = 
            '【受付1(始)】' + '\n' +
            'ご利用店舗　:' + record.店名.value+ '\n' + 
            'ご来店日　　:' +  + visits_date_call + '\n' + 
            '来店日時　　:' + visits_time_call +'\n' + 
            '利用人数　　:' + visits_number + '\n' + 
            'お気づきの内容:'+'\n'+ opinion_detail + '\n' + '\n' + 
            '総合評価　　:' + evaluation_call + '\n' + 
            '性別　　　　:' + sex_call + '\n' + 
            '漢字氏名　　:' + name_call + '\n' + 
            'ご連絡先　　:' + contact_address_call + '\n' +
            'アンケート報告書：必要' + '\n'+
            '【受付1(終)】';
        }else if (record.アンケート報告書.value == '否'){
            Garoon_message = 
            '【受付1(始)】' + '\n' + 
            'ご利用店舗　:' + record.店名.value+ '\n' + 
            'ご来店日　　:' + visits_date_call + '\n' + 
            '来店日時　　:' + visits_time_call +'\n' + 
            '利用人数　　:' + visits_number + '\n' + 
            'お気づきの内容:'+'\n'+ opinion_detail + '\n' + '\n' +
            '総合評価　　:' + evaluation_call + '\n' + 
            '性別　　　　:' + sex_call + '\n' + 
            '漢字氏名　　:' + name_call + '\n' + 
            'ご連絡先　　:' + contact_address_call + '\n' + 
            '【受付1(終)】';
        }

        return Garoon_message;
    }

    // 電話対応の場合、2通目を送信する必要がないので、コメントアウト
    // /*
    //   メッセージの2通目(電話)
    // */
    // function second_message_call(record){
    //     //記入者_電話
    //     if(record.ご返答内容_記入者_電話.value == undefined || record.ご返答内容_記入者_電話.value == ''){
    //         var reply_content_entry_person_call = '';
    //     }else{
    //         var reply_content_entry_person_call = record.ご返答内容_記入者_電話.value;
    //     }
    //     //ご返答内容_電話
    //     if(record.ご返答内容_電話.value == undefined || record.ご返答内容_電話.value == ''){
    //         var reply_content_call = '';
    //     }else{
    //         var reply_content_call = record.ご返答内容_電話.value;
    //     }
    //     //ご返答日時_電話
    //     if(record.ご返答日時_電話.value == undefined || record.ご返答日時_電話.value == ''){
    //         var reply_date_call = '';
    //     }else{
    //       const dateTime = new Date(record.ご返答日時_電話.value);

    //       // 年月日の取得
    //       const year = dateTime.getFullYear();
    //       const month = String(dateTime.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため、1を加え、2桁に整形
    //       const day = String(dateTime.getDate()).padStart(2, '0'); // 日も2桁に整形

    //       // 時分の取得
    //       const hours = String(dateTime.getHours()).padStart(2, '0');
    //       const minutes = String(dateTime.getMinutes()).padStart(2, '0');

    //     // フォーマットされた日時の生成
    //       var reply_date_call = `${year}年${month}月${day}日${hours}時${minutes}分`;
    //     }

    //     var Garoon_message = '';

    //     //記入者
    //     Garoon_message = 
    //     '【回答1(始)】' + '\n' +
    //     '記入者　　:' + reply_content_entry_person_call + '\n' +
    //     'ご返答内容:' + '\n' + reply_content_call + '\n' +  '\n' +
    //     'ご返答日時:' + reply_date_call + '\n' +
    //     '【回答1(終)】';

    //     return Garoon_message;
    // }

    /*
      メッセージの1通目(メール)
    */
    function first_message_mail(record){
        //ご来店日時を編集
        if(record.ご来店日時_メール_ネットアンケート.value == '' || record.ご来店日時_メール_ネットアンケート.value == undefined){
            var visits_date_mail_net = '' ;
            var visits_time_mail_net = '';
        }else {
            var visits_date_time_mail_net = record.ご来店日時_メール_ネットアンケート.value;
            const dateTime = new Date(visits_date_time_mail_net);

            // 年月日の取得
            const year = dateTime.getFullYear();
            const month = String(dateTime.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため、1を加え、2桁に整形
            const day = String(dateTime.getDate()).padStart(2, '0'); // 日も2桁に整形

            // 時分の取得
            const hours = String(dateTime.getHours()).padStart(2, '0');
            const minutes = String(dateTime.getMinutes()).padStart(2, '0');

            // ご来店日
            var visits_date_mail_net = `${year}年${month}月${day}日`;
            
            // 来店時間
            var visits_time_mail_net = `${hours}時${minutes}分`;
        }

        //ご利用人数
        if(record.ご利用人数_メール_ネット.value == undefined || record.ご利用人数_メール_ネット.value == ''){
            var use_count = '';
        }else{
            var use_count = record.ご利用人数_メール_ネット.value;
        }

        //お気づきの内容
        if(record.お気づきの内容.value == undefined || record.お気づきの内容.value == '' ){
            var opinion_detail = '';
        }else{
            var opinion_detail = record.お気づきの内容.value;
        }

        //総合評価
        if(record.総合評価_メール.value == undefined || record.総合評価_メール.value == ''){
            var evaluation_mail = '';
        }else{
            var evaluation_mail = record.総合評価_メール.value;
        }

        //性別
        if(record.性別_メール.value == undefined || record.性別_メール.value == ''){
            var sex_mail = '';
        }else{
            var sex_mail = record.性別_メール.value;
        }

        //漢字氏名
        if(record.お名前_メール.value == undefined || record.お名前_メール.value == ''){
            var name_mail = '';
        }else{
            var name_mail = record.お名前_メール.value;
        }   

        //ご連絡先
        if(record.ご連絡先_メール.value == undefined || record.ご連絡先_メール.value == ''){
            var contact_address_mail = '';
        }else{
            var contact_address_mail = record.ご連絡先_メール.value;
        }

        var Garoon_message = ''

        //電話の場合、Garoonに送信するメッセージを作成
        if( record.アンケート報告書.value == '要'){
            Garoon_message = 
            '【受付1(始)】' + '\n' +
            'ご利用店舗　:' + record.店名.value+ '\n' + 
            'ご来店日　　:' + visits_date_mail_net + '\n' + 
            '来店日時　　:' + visits_time_mail_net +'\n' + 
            '利用人数　　:' + use_count + '\n' +  
            'お気づきの内容:'+ '\n' + opinion_detail + '\n' + '\n' +
            '総合評価　　:' + evaluation_mail + '\n' + 
            '性別　　　　:' + sex_mail + '\n' + 
            '漢字氏名　　:' + name_mail + '\n' + 
            'ご連絡先　　:' + contact_address_mail + '\n'+
            'アンケート報告書：必要' + '\n'+
            '【受付1(終)】';
        }else if (record.アンケート報告書.value == '否'){
            Garoon_message =
            '【受付1(始)】' + '\n' + 
            'ご利用店舗　:' + record.店名.value+ '\n' + 
            'ご来店日　　:' + visits_date_mail_net + '\n' + 
            '来店日時　　:' + visits_time_mail_net +'\n' + 
            '利用人数　　:' + use_count + '\n' +  
            'お気づきの内容:'+ '\n' + opinion_detail + '\n' + '\n' +
            '総合評価　　:' + evaluation_mail + '\n' + 
            '性別　　　　:' + sex_mail + '\n' + 
            '漢字氏名　　:' + name_mail + '\n' + 
            'ご連絡先　　:' + contact_address_mail + '\n' + 
            '【受付1(終)】';
        }

        return Garoon_message;
    }

    /*
      メッセージの2通目(メール)
    */
    function second_message_mail(record){
        //記入者_メール
        if(record.ご返信内容_記入者_メール.value == undefined || record.ご返信内容_記入者_メール.value == ''){
            var reply_content_entry_person_email = '';
        }else{
            var reply_content_entry_person_email = record.ご返信内容_記入者_メール.value;
        }
        //ご返信内容_メール
        if(record.ご返信内容_メール.value == undefined || record.ご返信内容_メール.value == ''){
            var reply_content_email = '';
        }else{
            var reply_content_email = record.ご返信内容_メール.value;
        }
        //ご返答日_電話
        if(record.ご返答日時_メール.value == undefined || record.ご返答日時_メール.value == ''){
            var reply_date_email = '';
        }else{
          const dateTime = new Date(record.ご返答日時_メール.value);
          // 年月日の取得
          const year = dateTime.getFullYear();
          const month = String(dateTime.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため、1を加え、2桁に整形
          const day = String(dateTime.getDate()).padStart(2, '0'); // 日も2桁に整形

          // 時分の取得
          const hours = String(dateTime.getHours()).padStart(2, '0');
          const minutes = String(dateTime.getMinutes()).padStart(2, '0');

        // フォーマットされた日時の生成
          var reply_date_email = `${year}年${month}月${day}日${hours}時${minutes}分`;
        }

        var Garoon_message = '';

        //記入者
        Garoon_message = 
        '【回答1(始)】' + '\n' +
        '返信内容記入者:' + reply_content_entry_person_email + '\n' +
        'ご返答内容　　:' + '\n' + reply_content_email + '\n' + '\n' +
        'ご返答日時　　:' + reply_date_email + '\n' +
        '【回答1(終)】';

        return Garoon_message;
    }

    /*
      メッセージの1通目(口コミ)
    */
      function first_message_review(record){
        //ご来店日時を編集
        if(record.ご来店日時_口コミ.value == '' || record.ご来店日時_口コミ.value == undefined){
            var visits_date_review = '' ;
            var visits_time_review = '';
        }else {
            var visits_date_time_review = record.ご来店日時_口コミ.value;
            const dateTime = new Date(visits_date_time_review);

            // 年月日の取得
            const year = dateTime.getFullYear();
            const month = String(dateTime.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため、1を加え、2桁に整形
            const day = String(dateTime.getDate()).padStart(2, '0'); // 日も2桁に整形

            // 時分の取得
            const hours = String(dateTime.getHours()).padStart(2, '0');
            const minutes = String(dateTime.getMinutes()).padStart(2, '0');

            // ご来店日
            var visits_date_review = `${year}年${month}月${day}日`;
            
            // 来店時間
            var visits_time_review = `${hours}時${minutes}分`;
        }

        //お気づきの内容
        if(record.お気づきの内容_口コミ.value == undefined || record.お気づきの内容_口コミ.value == '' ){
            var opinion_detail_review = '';
        }else{
            var opinion_detail_review = record.お気づきの内容_口コミ.value;
        }

        //総合評価
        if(record.総合評価_口コミ.value == undefined || record.総合評価_口コミ.value == ''){
            var evaluation_review  = '';
        }else{
            var evaluation_review  = record.総合評価_口コミ.value;
        }

        //漢字氏名
        if(record.お名前_口コミ.value == undefined || record.お名前_口コミ.value == ''){
            var name_review = '';
        }else{
            var name_review = record.お名前_口コミ.value;
        }   

        var Garoon_message = ''

        //電話の場合、Garoonに送信するメッセージを作成
        if( record.アンケート報告書.value == '要'){
            Garoon_message = 
            '【受付1(始)】' + '\n' +
            'ご利用店舗　:' + record.店名.value+ '\n' + 
            'ご来店日　　:' + visits_date_review + '\n' + 
            '来店日時　　:' + visits_time_review +'\n' + 
            'お気づきの内容:'+ '\n' + opinion_detail_review + '\n' + '\n' +
            '総合評価　　:' + evaluation_review + '\n' + 
            '漢字氏名　　:' + name_review + '\n' + 
            'アンケート報告書：必要' + '\n'+
            '【受付1(終)】';
        }else if (record.アンケート報告書.value == '否'){
            Garoon_message =
            '【受付1(始)】' + '\n' + 
            'ご利用店舗　:' + record.店名.value+ '\n' + 
            'ご来店日　　:' + visits_date_review + '\n' + 
            '来店日時　　:' + visits_time_review +'\n' + 
            'お気づきの内容:'+ '\n' + opinion_detail_review + '\n' + '\n' +
            '総合評価　　:' + evaluation_review + '\n' + 
            '漢字氏名　　:' + name_review + '\n' + 
            '【受付1(終)】';
        }

        return Garoon_message;
    }

    /*
      メッセージの2通目(口コミ)
    */
    function second_message_review(record){
        //記入者_口コミ
        if(record.ご返信内容_記入者_口コミ.value == undefined || record.ご返信内容_記入者_口コミ.value == ''){
            var reply_content_entry_person_review = '';
        }else{
            var reply_content_entry_person_review = record.ご返信内容_記入者_口コミ.value;
        }
        //ご返信内容_口コミ
        if(record.ご返信内容_口コミ.value == undefined || record.ご返信内容_口コミ.value == ''){
            var reply_content_review = '';
        }else{
            var reply_content_review = record.ご返信内容_口コミ.value;
        }
        //ご返答日_口コミ
        if(record.ご返答日時_口コミ.value == undefined || record.ご返答日時_口コミ.value == ''){
            var reply_date_review  = '';
        }else{
          const dateTime = new Date(record.ご返答日時_口コミ.value);
          // 年月日の取得
          const year = dateTime.getFullYear();
          const month = String(dateTime.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため、1を加え、2桁に整形
          const day = String(dateTime.getDate()).padStart(2, '0'); // 日も2桁に整形

          // 時分の取得
          const hours = String(dateTime.getHours()).padStart(2, '0');
          const minutes = String(dateTime.getMinutes()).padStart(2, '0');

        // フォーマットされた日時の生成
          var reply_date_review  = `${year}年${month}月${day}日${hours}時${minutes}分`;
        }

        var Garoon_message = '';

        //記入者
        Garoon_message = 
        '【回答1(始)】' + '\n' +
        '返信内容記入者:' + reply_content_entry_person_review + '\n' +
        'ご返答内容　　:' + '\n' + reply_content_review + '\n' + '\n' +
        'ご返答日時　　:' + reply_date_review + '\n' +
        '【回答1(終)】';

        return Garoon_message;
    }




    /*
      メッセージの3通目
    */
    //お客様とのやり取り3回目のメッセージ
    function third_message(record){
      
      //ご連絡希望日時
      if(record.ご連絡日時_2回目.value == undefined || record.ご連絡日時_2回目.value == '' ){
        var guest_contact_time_second_time = '';
      }else{
        const dateTime = new Date(record.ご連絡日時_2回目.value);
        // 年月日の取得
        const year = dateTime.getFullYear();
        const month = String(dateTime.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため、1を加え、2桁に整形
        const day = String(dateTime.getDate()).padStart(2, '0'); // 日も2桁に整形

        // 時分の取得
        const hours = String(dateTime.getHours()).padStart(2, '0');
        const minutes = String(dateTime.getMinutes()).padStart(2, '0');

      // フォーマットされた日時の生成
        var guest_contact_time_second_time = `${year}年${month}月${day}日${hours}時${minutes}分`;
      }
      //お客様からのご連絡内容
      if(record.お客様のご連絡内容_2回目.value == undefined || record.お客様のご連絡内容_2回目.value == '' ){
        var guest_contact_content_second_time = '';
      }else{
        var guest_contact_content_second_time = record.お客様のご連絡内容_2回目.value;
      }

      var Garoon_message = '';

      Garoon_message = 
      '【受付2(始)】' + '\n' + 
      'ご連絡日時　　　　　　:' + guest_contact_time_second_time + '\n' + 
      'お客様からのご連絡内容:' + '\n' + guest_contact_content_second_time + '\n' + 
      '【受付2(終)】' ;

      return Garoon_message;
    }

    /*
      メッセージの4通目
    */
    function four_message(record){
      //記入者
      if(record.記入者_2回目.value == undefined || record.記入者_2回目.value == ''){
        var entry_person_second_time = '';
      }else{
        var entry_person_second_time = record.記入者_2回目.value;
      }
      //お客様への返答内容(コールセンター記入)
      if(record.お客様への返答内容_コールセンター記入_2回目.value == undefined || record.お客様への返答内容_コールセンター記入_2回目.value == ''){
        var reply_content_call_center_entry_second_time_to_guest = '' ;
      }else{
        var reply_content_call_center_entry_second_time_to_guest = record.お客様への返答内容_コールセンター記入_2回目.value ;
      }
      //ご返答日時
      if(record.ご返答日時_2回目.value == undefined || record.ご返答日時_2回目.value == ''){
        var reply_time_second_time = '';
      }else{
        const dateTime = new Date(record.ご返答日時_2回目.value);
        // 年月日の取得
        const year = dateTime.getFullYear();
        const month = String(dateTime.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため、1を加え、2桁に整形
        const day = String(dateTime.getDate()).padStart(2, '0'); // 日も2桁に整形

        // 時分の取得
        const hours = String(dateTime.getHours()).padStart(2, '0');
        const minutes = String(dateTime.getMinutes()).padStart(2, '0');


        var reply_time_second_time = `${year}年${month}月${day}日${hours}時${minutes}分`;

      }

      var Garoon_message = '';

      /*
        メッセージの4通目
      */
      Garoon_message =
      '【回答2(始)】' + '\n' +
      '返答内容記入者:' + entry_person_second_time + '\n' +
      'ご返答内容　　:' + '\n' + reply_content_call_center_entry_second_time_to_guest + '\n' + '\n' +
      'ご返答日時　　:' + reply_time_second_time + '\n' +
      '【回答2(終)】';

      return Garoon_message;
    }

    /*
      メッセージの5通目
    */
    //お客様とのやり取り5回目のメッセージ
    function five_message(record){
  
    //ご連絡希望日時
    if(record.ご連絡日時_3回目.value == undefined || record.ご連絡日時_3回目.value == '' ){
      var guest_contact_time_third_time = '';
    }else{
      const dateTime = new Date(record.ご連絡日時_3回目.value);
      // 年月日の取得
      const year = dateTime.getFullYear();
      const month = String(dateTime.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため、1を加え、2桁に整形
      const day = String(dateTime.getDate()).padStart(2, '0'); // 日も2桁に整形

      // 時分の取得
      const hours = String(dateTime.getHours()).padStart(2, '0');
      const minutes = String(dateTime.getMinutes()).padStart(2, '0');

    // フォーマットされた日時の生成
      var guest_contact_time_third_time = `${year}年${month}月${day}日${hours}時${minutes}分`;
    }
    //お客様からのご連絡内容
    if(record.お客様のご連絡内容_3回目.value == undefined || record.お客様のご連絡内容_3回目.value == '' ){
      var guest_contact_content_third_time = '';
    }else{
      var guest_contact_content_third_time = record.お客様のご連絡内容_3回目.value;
    }

    var Garoon_message = '';

    Garoon_message = 
    '【受付3(始)】' + '\n' + 
    'ご連絡日時　　　　　　:' + guest_contact_time_third_time + '\n' + 
    'お客様からのご連絡内容:' + '\n' + guest_contact_content_third_time + '\n' + 
    '【受付3(終)】' ;

    return Garoon_message;
  }


    /*
      メッセージの6通目
    */
    function six_message(record){
      //記入者
      if(record.記入者_3回目.value == undefined || record.記入者_3回目.value == ''){
        var entry_person_third_time = '';
      }else{
        var entry_person_third_time = record.記入者_3回目.value;
      }
      //お客様への返答内容(コールセンター記入)
      if(record.お客様への返答内容_コールセンター記入_3回目.value == undefined || record.お客様への返答内容_コールセンター記入_3回目.value == ''){
        var reply_content_call_center_entry_third_time_to_guest = '' ;
      }else{
        var reply_content_call_center_entry_third_time_to_guest = record.お客様への返答内容_コールセンター記入_3回目.value ;
      }
      //ご返答日時
      if(record.ご返答日時_3回目.value == undefined || record.ご返答日時_3回目.value == ''){
        var reply_time_third_time = '';
      }else{
        const dateTime = new Date(record.ご返答日時_3回目.value);
        // 年月日の取得
        const year = dateTime.getFullYear();
        const month = String(dateTime.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため、1を加え、2桁に整形
        const day = String(dateTime.getDate()).padStart(2, '0'); // 日も2桁に整形

        // 時分の取得
        const hours = String(dateTime.getHours()).padStart(2, '0');
        const minutes = String(dateTime.getMinutes()).padStart(2, '0');


        var reply_time_third_time = `${year}年${month}月${day}日${hours}時${minutes}分`;

      }

      var Garoon_message = '';

      Garoon_message =
      '【回答3(始)】' + '\n' +
      '返答内容記入者:' + entry_person_third_time + '\n' +
      'ご返答内容　　:' + '\n' + reply_content_call_center_entry_third_time_to_guest + '\n' + '\n' +
      'ご返答日時　　:' + reply_time_third_time + '\n' +
      '【回答3(終)】';

      return Garoon_message;
    }

    /*
      アンケート報告書
    */
    function enquete_report_message(record){
        //お客様対応の状況
        if(record.お客様対応の状況.value == undefined || record.お客様対応の状況.value == ''){
          var guest_supported_status = '';
        }else {
          var guest_supported_status = record.お客様対応の状況.value ;
        }
        //原因
        if(record.原因.value == undefined || record.原因.value == ''){
          var cause = '';
        }else{
          var cause = record.原因.value;
        }
        //改善策
        if(record.改善策_内容1.value == undefined || record.改善策_内容1.value == ''){
          var improvement_plan_content_1 = '' ;
        }else{
          var improvement_plan_content_1 = record.改善策_内容1.value;
        }

        var enquete_report_Garoon_message = '';

        enquete_report_Garoon_message = 
        '【アンケート報告書(始)】' + '\n' +
        'お客様対応の状況:' + '\n' + guest_supported_status + '\n' +'\n' +
        '原因　　　　　　:' + '\n' + cause + '\n' +'\n' +
        '改善策　　　　　:'+ '\n' + improvement_plan_content_1 + '\n' +'\n' +
        '【アンケート報告書(終)】';

        return enquete_report_Garoon_message;
    }

    //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // 以下、メッセージ処理の修正(始まり)
    //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //送信するメッセージの内容を作成する
    kintone.events.on([
      'app.record.edit.change.Garoonメッセージ送信制御'
      ], event => {
      var record = event.record;
      const options = { timeZone: 'Asia/Tokyo' };

      if(record.Garoonメッセージ送信制御.value == '送信する'){
          if(record.受付方法.value == '電話'){
              //電話の場合、Garoonに送信するメッセージを作成
              if(record.お客様とのご連絡回数.value == '1回目' && record.送信1回目フラグ.value == '未送信'){
                  record.Garoon送信メッセージ内容.value = first_message_call(record);
              }else if(record.お客様とのご連絡回数.value == '2回目' && record.送信3回目フラグ.value == '未送信' ){
                record.Garoon送信メッセージ内容.value = third_message(record);
              }else if(record.お客様とのご連絡回数.value == '2回目' && record.送信4回目フラグ.value == '未送信' && record.お客様への返答内容_コールセンター記入_2回目.value){
                record.Garoon送信メッセージ内容.value = four_message(record);
              }else if(record.お客様とのご連絡回数.value == '3回目' && record.送信5回目フラグ.value == '未送信'){
                record.Garoon送信メッセージ内容.value = five_message(record);
              }else if(record.お客様とのご連絡回数.value == '3回目' && record.送信6回目フラグ.value == '未送信' && record.お客様への返答内容_コールセンター記入_3回目.value){
                record.Garoon送信メッセージ内容.value = six_message(record);
              }else if((record.お客様とのご連絡回数.value == '2回目' && record.送信4回目フラグ.value == '未送信' && record.お客様への返答内容_コールセンター記入_2回目.value == undefined) || (record.お客様とのご連絡回数.value == '2回目' && record.送信4回目フラグ.value == '送信済み')){
                  record.Garoon送信メッセージ内容.value = '';
              }else{
                  record.Garoon送信メッセージ内容.value = '';
              }
          }else if(record.受付方法.value == 'メール・ネットアンケート'){

              if(record.お客様とのご連絡回数.value == '1回目' && record.送信1回目フラグ.value == '未送信'){
                  record.Garoon送信メッセージ内容.value = first_message_mail(record);
              }else if(record.お客様とのご連絡回数.value == '1回目' && record.送信2回目フラグ.value == '未送信' && record.ご返信内容_メール.value){
                  record.Garoon送信メッセージ内容.value = second_message_mail(record);
              }else if(record.お客様とのご連絡回数.value == '2回目' && record.送信3回目フラグ.value == '未送信'){
                record.Garoon送信メッセージ内容.value = third_message(record);
              }else if(record.お客様とのご連絡回数.value == '2回目' && record.送信4回目フラグ.value == '未送信' && record.お客様への返答内容_コールセンター記入_2回目.value){
                record.Garoon送信メッセージ内容.value = four_message(record);
              }else if(record.お客様とのご連絡回数.value == '3回目' && record.送信5回目フラグ.value == '未送信'){
                record.Garoon送信メッセージ内容.value = five_message(record);
              }else if(record.お客様とのご連絡回数.value == '3回目' && record.送信6回目フラグ.value == '未送信' && record.お客様への返答内容_コールセンター記入_3回目.value){
                record.Garoon送信メッセージ内容.value = six_message(record);
              }else if((record.お客様とのご連絡回数.value == '1回目' && record.送信2回目フラグ.value == '未送信' && record.ご返信内容_メール.value == undefined) || (record.お客様とのご連絡回数.value == '1回目' && record.送信2回目フラグ.value == '送信済み')){
                record.Garoon送信メッセージ内容.value = '';
              }else if((record.お客様とのご連絡回数.value == '2回目' && record.送信4回目フラグ.value == '未送信' && record.お客様への返答内容_コールセンター記入_2回目.value == undefined) || (record.お客様とのご連絡回数.value == '2回目' && record.送信4回目フラグ.value == '送信済み')){
                  record.Garoon送信メッセージ内容.value = '';
              }else{
                  record.Garoon送信メッセージ内容.value = ''
              }
          }else if(record.受付方法.value == '口コミサイト'){
            if(record.お客様とのご連絡回数.value == '1回目' && record.送信1回目フラグ.value == '未送信'){
              record.Garoon送信メッセージ内容.value = first_message_review(record);
            }else if(record.お客様とのご連絡回数.value == '1回目' && record.送信2回目フラグ.value == '未送信' && record.ご返信内容_口コミ.value){
                record.Garoon送信メッセージ内容.value = second_message_review(record);
            }else if(record.お客様とのご連絡回数.value == '2回目' && record.送信3回目フラグ.value == '未送信'){
              record.Garoon送信メッセージ内容.value = third_message(record);
            }else if(record.お客様とのご連絡回数.value == '2回目' && record.送信4回目フラグ.value == '未送信' && record.お客様への返答内容_コールセンター記入_2回目.value){
              record.Garoon送信メッセージ内容.value = four_message(record);
            }else if(record.お客様とのご連絡回数.value == '3回目' && record.送信5回目フラグ.value == '未送信'){
              record.Garoon送信メッセージ内容.value = five_message(record);
            }else if(record.お客様とのご連絡回数.value == '3回目' && record.送信6回目フラグ.value == '未送信' && record.お客様への返答内容_コールセンター記入_3回目.value){
              record.Garoon送信メッセージ内容.value = six_message(record);
            }else if((record.お客様とのご連絡回数.value == '1回目' && record.送信2回目フラグ.value == '未送信' && record.ご返信内容_メール.value == undefined) || (record.お客様とのご連絡回数.value == '1回目' && record.送信2回目フラグ.value == '送信済み')){
              record.Garoon送信メッセージ内容.value = '';
            }else if((record.お客様とのご連絡回数.value == '2回目' && record.送信4回目フラグ.value == '未送信' && record.お客様への返答内容_コールセンター記入_2回目.value == undefined) || (record.お客様とのご連絡回数.value == '2回目' && record.送信4回目フラグ.value == '送信済み')){
                record.Garoon送信メッセージ内容.value = '';
            }else{
                record.Garoon送信メッセージ内容.value = ''
            }
          }
      }
      return event;
    });
    //アンケート報告書の内容をつける場合は以下のコードを参考にする

    // //アンケート報告書に記入があれば追加
    // if(record.アンケート報告書送信フラグ.value == '送信済み' ){
    // }else if(record.アンケート報告書.value == '要' && (record.お客様対応の状況.value || record.原因.value || record.改善策_内容1.value) ){
    //   record.Garoon送信メッセージ内容.value += '\n' + '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>' + '\n' + enquete_report_message(record);
    // }
  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  // 以下、メッセージ処理の修正(終わり)
  //---------------------------------------------------------------------------------------------------------------------------------------------------------

})(jQuery.noConflict(true));
