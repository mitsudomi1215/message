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
      '<parameters>' +
        '<request_token>${REQUEST_TOKEN}</request_token>' +
        '<create_thread>' +
          '<thread id="dummy" version="dummy" subject="${TITTLE}" confirm="false">' +
            '${ADDRESSEE}' +
            '<content body="${MAIN_TEXT}">' +
              '${FILE_TEMPLATES}' + // ここにファイルテンプレートを追加  追加20240419
            '</content>' +
            '<folder user_id="dammy"></folder>' +
          '</thread>' +
            '${FILE_CONTENTS}' + // ここにファイル内容を追加   追加20240419
        '</create_thread>' +
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
    const performCommonAction = async (action, code, content , URL ,record) => {
      try {

        // //空の配列を作成
        // let test = [];
        // for(let iz =0;iz <code.length; iz++){
        //   test.push( await fetchGaroonUserByCode(code[iz]));
        // }

        // 複数人への送信内容をまとめる配列
        const userParams = [];
        for (let i = 0; i < code.length; i++) {
          userParams.push(ADDRESSEE_TEMPLATE.replace('${USER_ID}', code[i]));
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

        //ファイル添付処理-追加20240419
        let file_data_summary = [];
        if(record.ファイル添付1回目.value){
          for(let i=0; i<record.ファイル添付1回目.value.length; i++){
            file_data_summary.push(record.ファイル添付1回目.value[i]);
          }
        }

        if(record.ファイル添付1回目_口コミ.value){
          for(let i=0; i<record.ファイル添付1回目_口コミ.value.length; i++){
            file_data_summary.push(record.ファイル添付1回目_口コミ.value[i]);
          }
        }

        if(record.ファイル添付2回目.value){
          for(let i=0; i<record.ファイル添付2回目.value.length; i++){
            file_data_summary.push(record.ファイル添付2回目.value[i]);
          }
        }

        if(record.ファイル添付3回目.value){
          for(let i=0; i<record.ファイル添付3回目.value.length; i++){
            file_data_summary.push(record.ファイル添付3回目.value[i]);
          }
        }

        // ファイル添付のテンプレートを作成
        let fileTemplates = '';
        let fileContents = '';

        if (file_data_summary) {
          for (let i = 0; i < file_data_summary.length; i++) {
            const { fileKey, name, contentType } = file_data_summary[i];

            const headers = {
              'X-Requested-With': 'XMLHttpRequest',
            };

            // ファイルデータを取得
            const resp = await fetch(`/k/v1/file.json?fileKey=${fileKey}`, {
              method: 'GET',
              headers,
            });

            const blob = await resp.blob();

            const base64data = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onloadend = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
              };
              reader.onerror = reject;
            });

            // テンプレートの置換を行う
          const fileTemplate = `<file id="${i}" name="${name}" mime_type="${contentType}"></file>`;
          const fileContent = `<file xmlns="" id="${i}"><content xmlns="">${base64data}</content></file>`;


            fileTemplates += fileTemplate;
            fileContents += fileContent;
          }
        }

        // テンプレートにファイル情報とファイル内容を埋め込む
        msgAddParam = msgAddParam.replace('${FILE_TEMPLATES}', fileTemplates);
        msgAddParam = msgAddParam.replace('${FILE_CONTENTS}', fileContents);
    
        let msgAddRequest = SOAP_TEMPLATE;
        // SOAPパラメータを完成させる
        msgAddRequest = msgAddRequest.replace('${PARAMETERS}', msgAddParam);

        // 実行処理を指定
        msgAddRequest = msgAddRequest.split('${ACTION}').join('MessageCreateThreads');

        // メッセージ登録の実行
        // メッセージ登録の実行
        const responseData = await $.ajax({
          type: 'post',
          url: 'https://watami.cybozu.com/g/cbpapi/message/api.csp', //変更
          cache: false,
          data: msgAddRequest,
          dataType: 'xml',  // XML 形式のレスポンスを指定
        })
        .done((response) => {
          // console.warn("サーバーレスポンス:", response);
        })
        .fail((jqXHR, textStatus, errorThrown) => {
          console.error("(送信処理)HTTPエラーが発生しました:", textStatus, errorThrown);
        });

      } catch (error) {
        console.error("エラーが発生しました:", error);
      }
    };

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
        // console.warn("ターゲットユーザー",targetUser);
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
      console.warn("リンク作成処理");
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
      '<parameters text="【kintone】" start="2010-07-01T00:00:00Z" end="2037-12-31T00:00:00Z" search_sub_folders="true" title_search="true" body_search="false" from_search="false" addressee_search="false" follow_search="false">' +
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
  const record = event.record;

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
    const kntAppURL = 'https://watami.cybozu.com/k/905/';
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
        async () => {
          //モーダルを閉じる
          window.swal.close();

          //読み込みモーダルを表示
          showLoadingModal();

          //メッセージを送信する処理
          // お試し版URL【変更】URLとアプリID
          const kntAppURL = 'https://watami.cybozu.com/k/905/';
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
          // //管理者(今だけ)
          // if (record.コールセンター.value.length != 0) {
          //   let call_center = record.コールセンター.value;
          //   let call_center_garoon_user_id = await fetchGaroonUserByCode(call_center[0]['code']);
          //   userCodes.push(call_center_garoon_user_id['id']);
          // }
          //店舗名
          if(record.Garoonのみ契約店舗のGaroonID.value  && record.ガルーン宛先に店舗を入れるor入れない.value == '入れる'){
            userCodes.push(record.Garoonのみ契約店舗のGaroonID.value);
          }else if(record.店舗名.value.length != 0 && record.ガルーン宛先に店舗を入れるor入れない.value == '入れる'){
            let store_name_field = record.店舗名.value;
            let store_name_field_garoon_user_id = await fetchGaroonUserByCode(store_name_field[0]['code']);
            userCodes.push(store_name_field_garoon_user_id['id']);
          }
          // //FCオーナー
          // if(record.FCオーナー.value.length != 0){
          //   let fc_owner_field = record.FCオーナー.value;
          //   let fc_owner_field_garoon_user_id  =  await fetchGaroonUserByCode(fc_owner_field[0]['code']);
          //   userCodes.push(fc_owner_field_garoon_user_id['id']);
          // }
          //AM
          if (record.AM.value.length != 0) {
            let AM_field = record.AM.value;
            let AM_field_garoon_user_id = await fetchGaroonUserByCode(AM_field[0]['code']);
            userCodes.push(AM_field_garoon_user_id['id']);
          }
          //本部長
          if (record.本部長.value.length != 0) {
            let general_manager_field = record.本部長.value;
            let general_manager_field_garoon_user_id = await fetchGaroonUserByCode(general_manager_field[0]['code']);
            userCodes.push(general_manager_field_garoon_user_id['id']);
          }
          //部長
          if (record.部長.value.length != 0) {
            let department_chief_field = record.部長.value;
            let department_chief_field_garoon_user_id = await fetchGaroonUserByCode(department_chief_field[0]['code']);
            userCodes.push(department_chief_field_garoon_user_id['id']);
          }
          //権限追加ユーザー1
          if(record.権限追加ユーザー1.value.length != 0){
            let view_authority_user_1 = record.権限追加ユーザー1.value;
            let view_authority_user_1_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_1[0]['code']);
            userCodes.push(view_authority_user_1_garoon_user_id['id']);
          }
          //Garoon宛先追加ユーザー1
          if(record.Garoon宛先追加ユーザー1.value){
            userCodes.push(record.Garoon宛先追加ユーザー1.value);
          }

          //権限追加ユーザー2
          if(record.権限追加ユーザー2.value.length != 0){
            let view_authority_user_2 = record.権限追加ユーザー2.value;
            let view_authority_user_2_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_2[0]['code']);
            userCodes.push(view_authority_user_2_garoon_user_id['id']);
          }
          //Garoon宛先追加ユーザー2
          if(record.Garoon宛先追加ユーザー2.value){
            userCodes.push(record.Garoon宛先追加ユーザー2.value);
          }

          //権限追加ユーザー3
          if(record.権限追加ユーザー3.value.length != 0){
            let view_authority_user_3 = record.権限追加ユーザー3.value;
            let view_authority_user3_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_3[0]['code']);
            userCodes.push(view_authority_user3_garoon_user_id['id']);
          }
          //Garoon宛先追加ユーザー3
          if(record.Garoon宛先追加ユーザー3.value){
            userCodes.push(record.Garoon宛先追加ユーザー3.value);
          }

          //権限追加ユーザー4
          if(record.権限追加ユーザー4.value.length != 0){
            let view_authority_user_4 = record.権限追加ユーザー4.value;
            let view_authority_user4_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_4[0]['code']);
            userCodes.push(view_authority_user4_garoon_user_id['id']);
          }
          //Garoon宛先追加ユーザー4
          if(record.Garoon宛先追加ユーザー4.value){
            userCodes.push(record.Garoon宛先追加ユーザー4.value);
          }

          //権限追加ユーザー5
          if(record.権限追加ユーザー5.value.length != 0){
            let view_authority_user_5 = record.権限追加ユーザー5.value;
            let view_authority_user5_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_5[0]['code']);
            userCodes.push(view_authority_user5_garoon_user_id['id']);
          }
          //Garoon宛先追加ユーザー5
          if(record.Garoon宛先追加ユーザー5.value){
            userCodes.push(record.Garoon宛先追加ユーザー5.value);
          }

          //権限追加ユーザー6
          if(record.権限追加ユーザー6.value.length != 0){
            let view_authority_user_6 = record.権限追加ユーザー6.value;
            let view_authority_user6_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_6[0]['code']);
            userCodes.push(view_authority_user6_garoon_user_id['id']);
          }
          //Garoon宛先追加ユーザー6
          if(record.Garoon宛先追加ユーザー6.value){
            userCodes.push(record.Garoon宛先追加ユーザー6.value);
          }

          //権限追加ユーザー7
          if(record.権限追加ユーザー7.value.length != 0){
            let view_authority_user_7 = record.権限追加ユーザー7.value;
            let view_authority_user7_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_7[0]['code']);
            userCodes.push(view_authority_user7_garoon_user_id['id']);
          }
          //Garoon宛先追加ユーザー7
          if(record.Garoon宛先追加ユーザー7.value){
            userCodes.push(record.Garoon宛先追加ユーザー7.value);
          }

          //権限追加ユーザー8
          if(record.権限追加ユーザー8.value.length != 0){
            let view_authority_user_8 = record.権限追加ユーザー8.value;
            let view_authority_user8_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_8[0]['code']);
            userCodes.push(view_authority_user8_garoon_user_id['id']);
          }
          //Garoon宛先追加ユーザー8
          if(record.Garoon宛先追加ユーザー8.value){
            userCodes.push(record.Garoon宛先追加ユーザー8.value);
          }

          //権限追加追加ユーザー9
          if(record.権限追加ユーザー9.value.length != 0){
            let view_authority_user_9 = record.権限追加ユーザー9.value;
            let view_authority_user9_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_9[0]['code']);
            userCodes.push(view_authority_user9_garoon_user_id['id']);
          }
          //Garoon宛先追加ユーザー9
          if(record.Garoon宛先追加ユーザー9.value){
            userCodes.push(record.Garoon宛先追加ユーザー9.value);
          }
          
          //権限追加追加ユーザー10
          if(record.権限追加ユーザー10.value.length != 0){
            let view_authority_user_10 = record.権限追加ユーザー10.value;
            let view_authority_user10_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_10[0]['code']);
            userCodes.push(view_authority_user10_garoon_user_id['id']);
          }
          //Garoon宛先追加ユーザー10
          if(record.Garoon宛先追加ユーザー10.value){
            userCodes.push(record.Garoon宛先追加ユーザー10.value);
          }
          
          //権限追加ユーザー11
          if(record.権限追加ユーザー11.value.length != 0){
            let view_authority_user_11 = record.権限追加ユーザー11.value;
            let view_authority_user11_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_11[0]['code']);
            userCodes.push(view_authority_user11_garoon_user_id['id']);
          }
          //Garoon宛先追加ユーザー11
          if(record.Garoon宛先追加ユーザー11.value){
            userCodes.push(record.Garoon宛先追加ユーザー11.value);
          }
          
          //権限追加ユーザー12
          if(record.権限追加ユーザー12.value.length != 0){
            let view_authority_user_12 = record.権限追加ユーザー12.value;
            let view_authority_user12_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_12[0]['code']);
            userCodes.push(view_authority_user12_garoon_user_id['id']);
          }
          //Garoon宛先追加ユーザー12
          if(record.Garoon宛先追加ユーザー12.value){
            userCodes.push(record.Garoon宛先追加ユーザー12.value);
          }
          
          //権限追加ユーザー13
          if(record.権限追加ユーザー13.value.length != 0){
            let view_authority_user_13 = record.権限追加ユーザー13.value;
            let view_authority_user13_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_13[0]['code']);
            userCodes.push(view_authority_user13_garoon_user_id['id']);
          }
          //Garoon宛先追加ユーザー12
          if(record.Garoon宛先追加ユーザー13.value){
            userCodes.push(record.Garoon宛先追加ユーザー13.value);
          }
          
          //権限追加ユーザー14
          if(record.権限追加ユーザー14.value.length != 0){
            let view_authority_user_14 = record.権限追加ユーザー14.value;
            let view_authority_user14_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_14[0]['code']);
            userCodes.push(view_authority_user14_garoon_user_id['id']);
          }
          //Garoon宛先追加ユーザー14
          if(record.Garoon宛先追加ユーザー14.value){
            userCodes.push(record.Garoon宛先追加ユーザー14.value);
          }
          
          //権限追加ユーザー15
          if(record.権限追加ユーザー15.value.length != 0){
            let view_authority_user_15 = record.権限追加ユーザー15.value;
            let view_authority_user15_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_15[0]['code']);
            userCodes.push(view_authority_user15_garoon_user_id['id']);
          }
          //Garoon宛先追加ユーザー15
          if(record.Garoon宛先追加ユーザー15.value){
            userCodes.push(record.Garoon宛先追加ユーザー15.value);
          }

          //権限追加ユーザー16
          if(record.権限追加ユーザー16.value.length != 0){
            let view_authority_user_16 = record.権限追加ユーザー16.value;
            let view_authority_user16_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_16[0]['code']);
            userCodes.push(view_authority_user16_garoon_user_id['id']);
          }
          //Garoon宛先追加ユーザー16
          if(record.Garoon宛先追加ユーザー16.value){
            userCodes.push(record.Garoon宛先追加ユーザー16.value);
          }

          //権限追加ユーザー17
          if(record.権限追加ユーザー17.value.length != 0){
            let view_authority_user_17 = record.権限追加ユーザー17.value;
            let view_authority_user17_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_17[0]['code']);
            userCodes.push(view_authority_user17_garoon_user_id['id']);
          }
          //Garoon宛先追加ユーザー17
          if(record.Garoon宛先追加ユーザー17.value){
            userCodes.push(record.Garoon宛先追加ユーザー17.value);
          }

          //権限追加ユーザー18
          if(record.権限追加ユーザー18.value.length != 0){
            let view_authority_user_18 = record.権限追加ユーザー18.value;
            let view_authority_user18_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_18[0]['code']);
            userCodes.push(view_authority_user18_garoon_user_id['id']);
          }
          //Garoon宛先追加ユーザー18
          if(record.Garoon宛先追加ユーザー18.value){
            userCodes.push(record.Garoon宛先追加ユーザー18.value);
          }

          //権限追加ユーザー19
          if(record.権限追加ユーザー19.value.length != 0){
            let view_authority_user_19 = record.権限追加ユーザー19.value;
            let view_authority_user19_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_19[0]['code']);
            userCodes.push(view_authority_user19_garoon_user_id['id']);
          }
          //Garoon宛先追加ユーザー19
          if(record.Garoon宛先追加ユーザー19.value){
            userCodes.push(record.Garoon宛先追加ユーザー19.value);
          }

          //権限追加ユーザー20
          if(record.権限追加ユーザー20.value.length != 0){
            let view_authority_user_20 = record.権限追加ユーザー20.value;
            let view_authority_user20_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_20[0]['code']);
            userCodes.push(view_authority_user20_garoon_user_id['id']);
          }
          //Garoon宛先追加ユーザー20
          if(record.Garoon宛先追加ユーザー20.value){
            userCodes.push(record.Garoon宛先追加ユーザー20.value);
          }

          //権限追加ユーザー21
          if(record.権限追加ユーザー21.value.length != 0){
            let view_authority_user_21 = record.権限追加ユーザー21.value;
            let view_authority_user21_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_21[0]['code']);
            userCodes.push(view_authority_user21_garoon_user_id['id']);
          }
          //Garoon宛先追加ユーザー21
          if(record.Garoon宛先追加ユーザー21.value){
            userCodes.push(record.Garoon宛先追加ユーザー21.value);
          }

          //権限追加ユーザー22
          if(record.権限追加ユーザー22.value.length != 0){
            let view_authority_user_22 = record.権限追加ユーザー22.value;
            let view_authority_user22_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_22[0]['code']);
            userCodes.push(view_authority_user22_garoon_user_id['id']);
          }
          //Garoon宛先追加ユーザー22
          if(record.Garoon宛先追加ユーザー22.value){
            userCodes.push(record.Garoon宛先追加ユーザー22.value);
          }

          //権限追加ユーザー23
          if(record.権限追加ユーザー23.value.length != 0){
            let view_authority_user_23 = record.権限追加ユーザー23.value;
            let view_authority_user23_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_23[0]['code']);
            userCodes.push(view_authority_user23_garoon_user_id['id']);
          }
          //Garoon宛先追加ユーザー23
          if(record.Garoon宛先追加ユーザー23.value){
            userCodes.push(record.Garoon宛先追加ユーザー23.value);
          }

          //権限追加ユーザー24
          if(record.権限追加ユーザー24.value.length != 0){
            let view_authority_user_24 = record.権限追加ユーザー24.value;
            let view_authority_user24_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_24[0]['code']);
            userCodes.push(view_authority_user24_garoon_user_id['id']);
          }
          //Garoon宛先追加ユーザー24
          if(record.Garoon宛先追加ユーザー24.value){
            userCodes.push(record.Garoon宛先追加ユーザー24.value);
          }

          //権限追加ユーザー25
          if(record.権限追加ユーザー25.value.length != 0){
            let view_authority_user_25 = record.権限追加ユーザー25.value;
            let view_authority_user25_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_25[0]['code']);
            userCodes.push(view_authority_user25_garoon_user_id['id']);
          }
          //Garoon宛先追加ユーザー25
          if(record.Garoon宛先追加ユーザー25.value){
            userCodes.push(record.Garoon宛先追加ユーザー25.value);
          }

          //権限追加ユーザー26
          if(record.権限追加ユーザー26.value.length != 0){
            let view_authority_user_26 = record.権限追加ユーザー26.value;
            let view_authority_user26_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_26[0]['code']);
            userCodes.push(view_authority_user26_garoon_user_id['id']);
          }
          //Garoon宛先追加ユーザー26
          if(record.Garoon宛先追加ユーザー26.value){
            userCodes.push(record.Garoon宛先追加ユーザー26.value);
          }

          //権限追加ユーザー27
          if(record.権限追加ユーザー27.value.length != 0){
            let view_authority_user_27 = record.権限追加ユーザー27.value;
            let view_authority_user27_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_27[0]['code']);
            userCodes.push(view_authority_user27_garoon_user_id['id']);
          }
          //Garoon宛先追加ユーザー27
          if(record.Garoon宛先追加ユーザー27.value){
            userCodes.push(record.Garoon宛先追加ユーザー27.value);
          }

          //権限追加ユーザー28
          if(record.権限追加ユーザー28.value.length != 0){
            let view_authority_user_28 = record.権限追加ユーザー28.value;
            let view_authority_user28_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_28[0]['code']);
            userCodes.push(view_authority_user28_garoon_user_id['id']);
          }
          //Garoon宛先追加ユーザー28
          if(record.Garoon宛先追加ユーザー28.value){
            userCodes.push(record.Garoon宛先追加ユーザー28.value);
          }

          //権限追加追加ユーザー29
          if(record.権限追加ユーザー29.value.length != 0){
            let view_authority_user_29 = record.権限追加ユーザー29.value;
            let view_authority_user29_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_29[0]['code']);
            userCodes.push(view_authority_user29_garoon_user_id['id']);
          }
          //Garoon宛先追加ユーザー29
          if(record.Garoon宛先追加ユーザー29.value){
            userCodes.push(record.Garoon宛先追加ユーザー29.value);
          }

          //権限追加ユーザー30
          if(record.権限追加ユーザー30.value.length != 0){
            let view_authority_user_30 = record.権限追加ユーザー30.value;
            let view_authority_user30_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_30[0]['code']);
            userCodes.push(view_authority_user30_garoon_user_id['id']);
          }
          //Garoon宛先追加ユーザー30
          if(record.Garoon宛先追加ユーザー30.value){
            userCodes.push(record.Garoon宛先追加ユーザー30.value);
          }

          //権限追加ユーザー31
          if(record.権限追加ユーザー31.value.length != 0){
            let view_authority_user_31 = record.権限追加ユーザー31.value;
            let view_authority_user31_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_31[0]['code']);
            userCodes.push(view_authority_user31_garoon_user_id['id']);
          }
           //Garoon宛先追加ユーザー31
           if(record.Garoon宛先追加ユーザー31.value){
            userCodes.push(record.Garoon宛先追加ユーザー31.value);
          }

          //権限追加ユーザー32
          if(record.権限追加ユーザー32.value.length != 0){
            let view_authority_user_32 = record.権限追加ユーザー32.value;
            let view_authority_user32_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_32[0]['code']);
            userCodes.push(view_authority_user32_garoon_user_id['id']);
          }
           //Garoon宛先追加ユーザー32
           if(record.Garoon宛先追加ユーザー32.value){
            userCodes.push(record.Garoon宛先追加ユーザー32.value);
          }

          //権限追加ユーザー33
          if(record.権限追加ユーザー33.value.length != 0){
            let view_authority_user_33 = record.権限追加ユーザー33.value;
            let view_authority_user33_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_33[0]['code']);
            userCodes.push(view_authority_user33_garoon_user_id['id']);
          }
           //Garoon宛先追加ユーザー33
           if(record.Garoon宛先追加ユーザー33.value){
            userCodes.push(record.Garoon宛先追加ユーザー33.value);
          }

          //権限追加ユーザー34
          if(record.権限追加ユーザー34.value.length != 0){
            let view_authority_user_34 = record.権限追加ユーザー34.value;
            let view_authority_user34_garoon_user_id = await fetchGaroonUserByCode(view_authority_user_34[0]['code']);
            userCodes.push(view_authority_user34_garoon_user_id['id']);
          }
           //Garoon宛先追加ユーザー34
           if(record.Garoon宛先追加ユーザー34.value){
            userCodes.push(record.Garoon宛先追加ユーザー34.value);
          }
          
          //-------------------------------------------------------------------------------------------------------------------------
          // 本部関連・宛先関連の情報を取得(手動取得)
          //-------------------------------------------------------------------------------------------------------------------------

          //_1権限追加ユーザー1
          if(record._1権限追加ユーザー1.value.length != 0){
            let authority_additional_user_1 = record._1権限追加ユーザー1.value;
            let authority_additional_user_1_user_id = await fetchGaroonUserByCode(authority_additional_user_1[0]['code']);
            userCodes.push(authority_additional_user_1_user_id['id']);
          }
          //_1Garoon宛先追加ユーザー1
          if(record._1Garoon宛先追加ユーザー1.value){
            userCodes.push(record._1Garoon宛先追加ユーザー1.value)
          }
          //_1権限追加ユーザー2
          if(record._1権限追加ユーザー2.value.length != 0){
            let authority_additional_user_2 = record._1権限追加ユーザー2.value;
            let authority_additional_user_2_user_id = await fetchGaroonUserByCode(authority_additional_user_2[0]['code']);
            userCodes.push(authority_additional_user_2_user_id['id']);
          }
          //_1Garoon宛先追加ユーザー2
          if(record._1Garoon宛先追加ユーザー2.value){
            userCodes.push(record._1Garoon宛先追加ユーザー2.value)
          }
          //_1権限追加ユーザー3
          if(record._1権限追加ユーザー3.value.length != 0){
            let authority_additional_user_3 = record._1権限追加ユーザー3.value;
            let authority_additional_user_3_user_id = await fetchGaroonUserByCode(authority_additional_user_3[0]['code']);
            userCodes.push(authority_additional_user_3_user_id['id']);
          }
          //_1Garoon宛先追加ユーザー3
          if(record._1Garoon宛先追加ユーザー3.value){
            userCodes.push(record._1Garoon宛先追加ユーザー3.value)
          }
           //_1権限追加ユーザー4
           if(record._1権限追加ユーザー4.value.length != 0){
            let authority_additional_user_4 = record._1権限追加ユーザー4.value;
            let authority_additional_user_4_user_id = await fetchGaroonUserByCode(authority_additional_user_4[0]['code']);
            userCodes.push(authority_additional_user_4_user_id['id']);
          }
          //_1Garoon宛先追加ユーザー4
          if(record._1Garoon宛先追加ユーザー4.value){
            userCodes.push(record._1Garoon宛先追加ユーザー4.value)
          }
          //_1権限追加ユーザー5
          if(record._1権限追加ユーザー5.value.length != 0){
            let authority_additional_user_5 = record._1権限追加ユーザー5.value;
            let authority_additional_user_5_user_id = await fetchGaroonUserByCode(authority_additional_user_5[0]['code']);
            userCodes.push(authority_additional_user_5_user_id['id']);
          }
          //_1Garoon宛先追加ユーザー5
          if(record._1Garoon宛先追加ユーザー5.value){
            userCodes.push(record._1Garoon宛先追加ユーザー5.value)
          }
          //_1権限追加ユーザー6
          if(record._1権限追加ユーザー6.value.length != 0){
            let authority_additional_user_6 = record._1権限追加ユーザー6.value;
            let authority_additional_user_6_user_id = await fetchGaroonUserByCode(authority_additional_user_6[0]['code']);
            userCodes.push(authority_additional_user_6_user_id['id']);
          }
          //_1Garoon宛先追加ユーザー6
          if(record._1Garoon宛先追加ユーザー6.value){
            userCodes.push(record._1Garoon宛先追加ユーザー6.value)
          }
          //_1権限追加ユーザー7
          if(record._1権限追加ユーザー7.value.length != 0){
            let authority_additional_user_7 = record._1権限追加ユーザー7.value;
            let authority_additional_user_7_user_id = await fetchGaroonUserByCode(authority_additional_user_7[0]['code']);
            userCodes.push(authority_additional_user_7_user_id['id']);
          }
          //_1Garoon宛先追加ユーザー7
          if(record._1Garoon宛先追加ユーザー7.value){
            userCodes.push(record._1Garoon宛先追加ユーザー7.value)
          }
          //_1権限追加ユーザー8
          if(record._1権限追加ユーザー8.value.length != 0){
            let authority_additional_user_8 = record._1権限追加ユーザー8.value;
            let authority_additional_user_8_user_id = await fetchGaroonUserByCode(authority_additional_user_8[0]['code']);
            userCodes.push(authority_additional_user_8_user_id['id']);
          }
          //_1Garoon宛先追加ユーザー8
          if(record._1Garoon宛先追加ユーザー8.value){
            userCodes.push(record._1Garoon宛先追加ユーザー8.value)
          }
          //_1権限追加ユーザー9
          if(record._1権限追加ユーザー9.value.length != 0){
            let authority_additional_user_9 = record._1権限追加ユーザー9.value;
            let authority_additional_user_9_user_id = await fetchGaroonUserByCode(authority_additional_user_9[0]['code']);
            userCodes.push(authority_additional_user_9_user_id['id']);
          }
          //_1Garoon宛先追加ユーザー9
          if(record._1Garoon宛先追加ユーザー9.value){
            userCodes.push(record._1Garoon宛先追加ユーザー9.value)
          }
          //_1権限追加ユーザー10
          if(record._1権限追加ユーザー10.value.length != 0){
            let authority_additional_user_10 = record._1権限追加ユーザー10.value;
            let authority_additional_user_10_user_id = await fetchGaroonUserByCode(authority_additional_user_10[0]['code']);
            userCodes.push(authority_additional_user_10_user_id['id']);
          }
          //_1Garoon宛先追加ユーザー10
          if(record._1Garoon宛先追加ユーザー10.value){
            userCodes.push(record._1Garoon宛先追加ユーザー10.value)
          }
          //_1権限追加ユーザー11
          if(record._1権限追加ユーザー11.value.length != 0){
            let authority_additional_user_11 = record._1権限追加ユーザー11.value;
            let authority_additional_user_11_user_id = await fetchGaroonUserByCode(authority_additional_user_11[0]['code']);
            userCodes.push(authority_additional_user_11_user_id['id']);
          }
          //_1Garoon宛先追加ユーザー11
          if(record._1Garoon宛先追加ユーザー11.value){
            userCodes.push(record._1Garoon宛先追加ユーザー11.value)
          }
          //_1権限追加ユーザー12
          if(record._1権限追加ユーザー12.value.length != 0){
            let authority_additional_user_12 = record._1権限追加ユーザー12.value;
            let authority_additional_user_12_user_id = await fetchGaroonUserByCode(authority_additional_user_12[0]['code']);
            userCodes.push(authority_additional_user_12_user_id['id']);
          }
          //_1Garoon宛先追加ユーザー12
          if(record._1Garoon宛先追加ユーザー12.value){
            userCodes.push(record._1Garoon宛先追加ユーザー12.value)
          }
          //_1権限追加ユーザー13
          if(record._1権限追加ユーザー13.value.length != 0){
            let authority_additional_user_13 = record._1権限追加ユーザー13.value;
            let authority_additional_user_13_user_id = await fetchGaroonUserByCode(authority_additional_user_13[0]['code']);
            userCodes.push(authority_additional_user_13_user_id['id']);
          }
          //_1Garoon宛先追加ユーザー13
          if(record._1Garoon宛先追加ユーザー13.value){
            userCodes.push(record._1Garoon宛先追加ユーザー13.value)
          }
          //_1権限追加ユーザー14
          if(record._1権限追加ユーザー14.value.length != 0){
            let authority_additional_user_14 = record._1権限追加ユーザー14.value;
            let authority_additional_user_14_user_id = await fetchGaroonUserByCode(authority_additional_user_14[0]['code']);
            userCodes.push(authority_additional_user_14_user_id['id']);
          }
          //_1Garoon宛先追加ユーザー14
          if(record._1Garoon宛先追加ユーザー14.value){
            userCodes.push(record._1Garoon宛先追加ユーザー14.value)
          }
          //_1権限追加ユーザー15
          if(record._1権限追加ユーザー15.value.length != 0){
            let authority_additional_user_15 = record._1権限追加ユーザー15.value;
            let authority_additional_user_15_user_id = await fetchGaroonUserByCode(authority_additional_user_15[0]['code']);
            userCodes.push(authority_additional_user_15_user_id['id']);
          }
          //_1Garoon宛先追加ユーザー15
          if(record._1Garoon宛先追加ユーザー15.value){
            userCodes.push(record._1Garoon宛先追加ユーザー15.value)
          }
          //_1権限追加ユーザー16
          if(record._1権限追加ユーザー16.value.length != 0){
            let authority_additional_user_16 = record._1権限追加ユーザー16.value;
            let authority_additional_user_16_user_id = await fetchGaroonUserByCode(authority_additional_user_16[0]['code']);
            userCodes.push(authority_additional_user_16_user_id['id']);
          }
          //_1Garoon宛先追加ユーザー16
          if(record._1Garoon宛先追加ユーザー16.value){
            userCodes.push(record._1Garoon宛先追加ユーザー16.value)
          }
          //_1権限追加ユーザー17
          if(record._1権限追加ユーザー17.value.length != 0){
            let authority_additional_user_17 = record._1権限追加ユーザー17.value;
            let authority_additional_user_17_user_id = await fetchGaroonUserByCode(authority_additional_user_17[0]['code']);
            userCodes.push(authority_additional_user_17_user_id['id']);
          }
          //_1Garoon宛先追加ユーザー17
          if(record._1Garoon宛先追加ユーザー17.value){
            userCodes.push(record._1Garoon宛先追加ユーザー17.value)
          }
          //_1権限追加ユーザー18
          if(record._1権限追加ユーザー18.value.length != 0){
            let authority_additional_user_18 = record._1権限追加ユーザー18.value;
            let authority_additional_user_18_user_id = await fetchGaroonUserByCode(authority_additional_user_18[0]['code']);
            userCodes.push(authority_additional_user_18_user_id['id']);
          }
          //_1Garoon宛先追加ユーザー18
          if(record._1Garoon宛先追加ユーザー18.value){
            userCodes.push(record._1Garoon宛先追加ユーザー18.value)
          }
          //_1権限追加ユーザー19
          if(record._1権限追加ユーザー19.value.length != 0){
            let authority_additional_user_19 = record._1権限追加ユーザー19.value;
            let authority_additional_user_19_user_id = await fetchGaroonUserByCode(authority_additional_user_19[0]['code']);
            userCodes.push(authority_additional_user_19_user_id['id']);
          }
          //_1Garoon宛先追加ユーザー19
          if(record._1Garoon宛先追加ユーザー19.value){
            userCodes.push(record._1Garoon宛先追加ユーザー19.value)
          }
          //_1権限追加ユーザー20
          if(record._1権限追加ユーザー20.value.length != 0){
            let authority_additional_user_20 = record._1権限追加ユーザー20.value;
            let authority_additional_user_20_user_id = await fetchGaroonUserByCode(authority_additional_user_20[0]['code']);
            userCodes.push(authority_additional_user_20_user_id['id']);
          }
          //_1Garoon宛先追加ユーザー20
          if(record._1Garoon宛先追加ユーザー20.value){
            userCodes.push(record._1Garoon宛先追加ユーザー20.value)
          }

          //_2権限追加ユーザー1
          if(record._2権限追加ユーザー1.value.length != 0){
            let two_authority_additional_user_1 = record._2権限追加ユーザー1.value;
            let two_authority_additional_user_1_user_id = await fetchGaroonUserByCode(two_authority_additional_user_1[0]['code']);
            userCodes.push(two_authority_additional_user_1_user_id['id']);
          }
          //_2Garoon宛先追加ユーザー1
          if(record._2Garoon宛先追加ユーザー1.value){
            userCodes.push(record._2Garoon宛先追加ユーザー1.value)
          }
          //_2権限追加ユーザー2
          if(record._2権限追加ユーザー2.value.length != 0){
            let two_authority_additional_user_2 = record._2権限追加ユーザー2.value;
            let two_authority_additional_user_2_user_id = await fetchGaroonUserByCode(two_authority_additional_user_2[0]['code']);
            userCodes.push(two_authority_additional_user_2_user_id['id']);
          }
          //_2Garoon宛先追加ユーザー2
          if(record._2Garoon宛先追加ユーザー2.value){
            userCodes.push(record._2Garoon宛先追加ユーザー2.value)
          }
          //_2権限追加ユーザー3
          if(record._2権限追加ユーザー3.value.length != 0){
            let two_authority_additional_user_3 = record._2権限追加ユーザー3.value;
            let two_authority_additional_user_3_user_id = await fetchGaroonUserByCode(two_authority_additional_user_3[0]['code']);
            userCodes.push(two_authority_additional_user_3_user_id['id']);
          }
          //_2Garoon宛先追加ユーザー3
          if(record._2Garoon宛先追加ユーザー3.value){
            userCodes.push(record._2Garoon宛先追加ユーザー3.value)
          }
          //_2権限追加ユーザー4
          if(record._2権限追加ユーザー4.value.length != 0){
            let two_authority_additional_user_4 = record._2権限追加ユーザー4.value;
            let two_authority_additional_user_4_user_id = await fetchGaroonUserByCode(two_authority_additional_user_4[0]['code']);
            userCodes.push(two_authority_additional_user_4_user_id['id']);
          }
          //_2Garoon宛先追加ユーザー4
          if(record._2Garoon宛先追加ユーザー4.value){
            userCodes.push(record._2Garoon宛先追加ユーザー4.value)
          }
          //_2権限追加ユーザー5
          if(record._2権限追加ユーザー5.value.length != 0){
            let two_authority_additional_user_5 = record._2権限追加ユーザー5.value;
            let two_authority_additional_user_5_user_id = await fetchGaroonUserByCode(two_authority_additional_user_5[0]['code']);
            userCodes.push(two_authority_additional_user_5_user_id['id']);
          }
          //_2Garoon宛先追加ユーザー5
          if(record._2Garoon宛先追加ユーザー5.value){
            userCodes.push(record._2Garoon宛先追加ユーザー5.value)
          }
          //_2権限追加ユーザー6
          if(record._2権限追加ユーザー6.value.length != 0){
            let two_authority_additional_user_6 = record._2権限追加ユーザー6.value;
            let two_authority_additional_user_6_user_id = await fetchGaroonUserByCode(two_authority_additional_user_6[0]['code']);
            userCodes.push(two_authority_additional_user_6_user_id['id']);
          }
          //_2Garoon宛先追加ユーザー6
          if(record._2Garoon宛先追加ユーザー6.value){
            userCodes.push(record._2Garoon宛先追加ユーザー6.value)
          }
          //_2権限追加ユーザー7
          if(record._2権限追加ユーザー7.value.length != 0){
            let two_authority_additional_user_7 = record._2権限追加ユーザー7.value;
            let two_authority_additional_user_7_user_id = await fetchGaroonUserByCode(two_authority_additional_user_7[0]['code']);
            userCodes.push(two_authority_additional_user_7_user_id['id']);
          }
          //_2Garoon宛先追加ユーザー7
          if(record._2Garoon宛先追加ユーザー7.value){
            userCodes.push(record._2Garoon宛先追加ユーザー7.value)
          }
          //_2権限追加ユーザー8
          if(record._2権限追加ユーザー8.value.length != 0){
            let two_authority_additional_user_8 = record._2権限追加ユーザー8.value;
            let two_authority_additional_user_8_user_id = await fetchGaroonUserByCode(two_authority_additional_user_8[0]['code']);
            userCodes.push(two_authority_additional_user_8_user_id['id']);
          }
          //_2Garoon宛先追加ユーザー8
          if(record._2Garoon宛先追加ユーザー8.value){
            userCodes.push(record._2Garoon宛先追加ユーザー8.value)
          }
          //_2権限追加ユーザー9
          if(record._2権限追加ユーザー9.value.length != 0){
            let two_authority_additional_user_9 = record._2権限追加ユーザー9.value;
            let two_authority_additional_user_9_user_id = await fetchGaroonUserByCode(two_authority_additional_user_9[0]['code']);
            userCodes.push(two_authority_additional_user_9_user_id['id']);
          }
          //_2Garoon宛先追加ユーザー9
          if(record._2Garoon宛先追加ユーザー9.value){
            userCodes.push(record._2Garoon宛先追加ユーザー9.value)
          }
          //_2権限追加ユーザー10
          if(record._2権限追加ユーザー10.value.length != 0){
            let two_authority_additional_user_10 = record._2権限追加ユーザー10.value;
            let two_authority_additional_user_10_user_id = await fetchGaroonUserByCode(two_authority_additional_user_10[0]['code']);
            userCodes.push(two_authority_additional_user_10_user_id['id']);
          }
          //_2Garoon宛先追加ユーザー10
          if(record._2Garoon宛先追加ユーザー10.value){
            userCodes.push(record._2Garoon宛先追加ユーザー10.value)
          }
          //_2権限追加ユーザー11
          if(record._2権限追加ユーザー11.value.length != 0){
            let two_authority_additional_user_11 = record._2権限追加ユーザー11.value;
            let two_authority_additional_user_11_user_id = await fetchGaroonUserByCode(two_authority_additional_user_11[0]['code']);
            userCodes.push(two_authority_additional_user_11_user_id['id']);
          }
          //_2Garoon宛先追加ユーザー11
          if(record._2Garoon宛先追加ユーザー11.value){
            userCodes.push(record._2Garoon宛先追加ユーザー11.value)
          }
           //_2権限追加ユーザー12
           if(record._2権限追加ユーザー12.value.length != 0){
            let two_authority_additional_user_12 = record._2権限追加ユーザー12.value;
            let two_authority_additional_user_12_user_id = await fetchGaroonUserByCode(two_authority_additional_user_12[0]['code']);
            userCodes.push(two_authority_additional_user_12_user_id['id']);
          }
          //_2Garoon宛先追加ユーザー12
          if(record._2Garoon宛先追加ユーザー12.value){
            userCodes.push(record._2Garoon宛先追加ユーザー12.value)
          }
          //_2権限追加ユーザー13
          if(record._2権限追加ユーザー13.value.length != 0){
            let two_authority_additional_user_13 = record._2権限追加ユーザー13.value;
            let two_authority_additional_user_13_user_id = await fetchGaroonUserByCode(two_authority_additional_user_13[0]['code']);
            userCodes.push(two_authority_additional_user_13_user_id['id']);
          }
          //_2Garoon宛先追加ユーザー13
          if(record._2Garoon宛先追加ユーザー13.value){
            userCodes.push(record._2Garoon宛先追加ユーザー13.value)
          }
          //_2権限追加ユーザー14
          if(record._2権限追加ユーザー14.value.length != 0){
            let two_authority_additional_user_14 = record._2権限追加ユーザー14.value;
            let two_authority_additional_user_14_user_id = await fetchGaroonUserByCode(two_authority_additional_user_14[0]['code']);
            userCodes.push(two_authority_additional_user_14_user_id['id']);
          }
          //_2Garoon宛先追加ユーザー14
          if(record._2Garoon宛先追加ユーザー14.value){
            userCodes.push(record._2Garoon宛先追加ユーザー14.value)
          }
          //_2権限追加ユーザー15
          if(record._2権限追加ユーザー15.value.length != 0){
            let two_authority_additional_user_15 = record._2権限追加ユーザー15.value;
            let two_authority_additional_user_15_user_id = await fetchGaroonUserByCode(two_authority_additional_user_15[0]['code']);
            userCodes.push(two_authority_additional_user_15_user_id['id']);
          }
          //_2Garoon宛先追加ユーザー15
          if(record._2Garoon宛先追加ユーザー15.value){
            userCodes.push(record._2Garoon宛先追加ユーザー15.value)
          }
          //_2権限追加ユーザー16
          if(record._2権限追加ユーザー16.value.length != 0){
            let two_authority_additional_user_16 = record._2権限追加ユーザー16.value;
            let two_authority_additional_user_16_user_id = await fetchGaroonUserByCode(two_authority_additional_user_16[0]['code']);
            userCodes.push(two_authority_additional_user_16_user_id['id']);
          }
          //_2Garoon宛先追加ユーザー16
          if(record._2Garoon宛先追加ユーザー16.value){
            userCodes.push(record._2Garoon宛先追加ユーザー16.value)
          }
          //_2権限追加ユーザー17
          if(record._2権限追加ユーザー17.value.length != 0){
            let two_authority_additional_user_17 = record._2権限追加ユーザー17.value;
            let two_authority_additional_user_17_user_id = await fetchGaroonUserByCode(two_authority_additional_user_17[0]['code']);
            userCodes.push(two_authority_additional_user_17_user_id['id']);
          }
          //_2Garoon宛先追加ユーザー17
          if(record._2Garoon宛先追加ユーザー17.value){
            userCodes.push(record._2Garoon宛先追加ユーザー17.value)
          }
          //_2権限追加ユーザー18
          if(record._2権限追加ユーザー18.value.length != 0){
            let two_authority_additional_user_18 = record._2権限追加ユーザー18.value;
            let two_authority_additional_user_18_user_id = await fetchGaroonUserByCode(two_authority_additional_user_18[0]['code']);
            userCodes.push(two_authority_additional_user_18_user_id['id']);
          }
          //_2Garoon宛先追加ユーザー18
          if(record._2Garoon宛先追加ユーザー18.value){
            userCodes.push(record._2Garoon宛先追加ユーザー18.value)
          }
          //_2権限追加ユーザー19
          if(record._2権限追加ユーザー19.value.length != 0){
            let two_authority_additional_user_19 = record._2権限追加ユーザー19.value;
            let two_authority_additional_user_19_user_id = await fetchGaroonUserByCode(two_authority_additional_user_19[0]['code']);
            userCodes.push(two_authority_additional_user_19_user_id['id']);
          }
          //_2Garoon宛先追加ユーザー19
          if(record._2Garoon宛先追加ユーザー19.value){
            userCodes.push(record._2Garoon宛先追加ユーザー19.value)
          }
          //_2権限追加ユーザー20
          if(record._2権限追加ユーザー20.value.length != 0){
            let two_authority_additional_user_20 = record._2権限追加ユーザー20.value;
            let two_authority_additional_user_20_user_id = await fetchGaroonUserByCode(two_authority_additional_user_20[0]['code']);
            userCodes.push(two_authority_additional_user_20_user_id['id']);
          }
          //_2Garoon宛先追加ユーザー20
          if(record._2Garoon宛先追加ユーザー20.value){
            userCodes.push(record._2Garoon宛先追加ユーザー20.value)
          }

          //_3権限追加ユーザー1
          if(record._3権限追加ユーザー1.value.length != 0){
            let three_authority_additional_user_1 = record._3権限追加ユーザー1.value;
            let three_authority_additional_user_1_user_id = await fetchGaroonUserByCode(three_authority_additional_user_1[0]['code']);
            userCodes.push(three_authority_additional_user_1_user_id['id']);
          }
          //_3Garoon宛先追加ユーザー1
          if(record._3Garoon宛先追加ユーザー1.value){
            userCodes.push(record._3Garoon宛先追加ユーザー1.value)
          }
          //_3権限追加ユーザー2
          if(record._3権限追加ユーザー2.value.length != 0){
            let three_authority_additional_user_2 = record._3権限追加ユーザー2.value;
            let three_authority_additional_user_2_user_id = await fetchGaroonUserByCode(three_authority_additional_user_2[0]['code']);
            userCodes.push(three_authority_additional_user_2_user_id['id']);
          }  
          //_3Garoon宛先追加ユーザー2
          if(record._3Garoon宛先追加ユーザー2.value){
            userCodes.push(record._3Garoon宛先追加ユーザー2.value)
          }
          //_3権限追加ユーザー3
          if(record._3権限追加ユーザー3.value.length != 0){
            let three_authority_additional_user_3 = record._3権限追加ユーザー3.value;
            let three_authority_additional_user_3_user_id = await fetchGaroonUserByCode(three_authority_additional_user_3[0]['code']);
            userCodes.push(three_authority_additional_user_3_user_id['id']);
          }
          //_3Garoon宛先追加ユーザー3
          if(record._3Garoon宛先追加ユーザー3.value){
            userCodes.push(record._3Garoon宛先追加ユーザー3.value)
          }
          //_3権限追加ユーザー4
          if(record._3権限追加ユーザー4.value.length != 0){
            let three_authority_additional_user_4 = record._3権限追加ユーザー4.value;
            let three_authority_additional_user_4_user_id = await fetchGaroonUserByCode(three_authority_additional_user_4[0]['code']);
            userCodes.push(three_authority_additional_user_4_user_id['id']);
          }
          //_3Garoon宛先追加ユーザー4
          if(record._3Garoon宛先追加ユーザー4.value){
            userCodes.push(record._3Garoon宛先追加ユーザー4.value)
          }    
          //_3権限追加ユーザー5
          if(record._3権限追加ユーザー5.value.length != 0){
            let three_authority_additional_user_5 = record._3権限追加ユーザー5.value;
            let three_authority_additional_user_5_user_id = await fetchGaroonUserByCode(three_authority_additional_user_5[0]['code']);
            userCodes.push(three_authority_additional_user_5_user_id['id']);
          }
          //_3Garoon宛先追加ユーザー5
          if(record._3Garoon宛先追加ユーザー5.value){
            userCodes.push(record._3Garoon宛先追加ユーザー5.value)
          }
          //_3権限追加ユーザー6
          if(record._3権限追加ユーザー6.value.length != 0){
            let three_authority_additional_user_6 = record._3権限追加ユーザー6.value;
            let three_authority_additional_user_6_user_id = await fetchGaroonUserByCode(three_authority_additional_user_6[0]['code']);
            userCodes.push(three_authority_additional_user_6_user_id['id']);
          }
          //_3Garoon宛先追加ユーザー6
          if(record._3Garoon宛先追加ユーザー6.value){
            userCodes.push(record._3Garoon宛先追加ユーザー6.value)
          }

          //_3権限追加ユーザー7
          if(record._3権限追加ユーザー7.value.length != 0){
            let three_authority_additional_user_7 = record._3権限追加ユーザー7.value;
            let three_authority_additional_user_7_user_id = await fetchGaroonUserByCode(three_authority_additional_user_7[0]['code']);
            userCodes.push(three_authority_additional_user_7_user_id['id']);
          }
          //_3Garoon宛先追加ユーザー7
          if(record._3Garoon宛先追加ユーザー7.value){
            userCodes.push(record._3Garoon宛先追加ユーザー7.value)
          }
          //_3権限追加ユーザー8
          if(record._3権限追加ユーザー8.value.length != 0){
            let three_authority_additional_user_8 = record._3権限追加ユーザー8.value;
            let three_authority_additional_user_8_user_id = await fetchGaroonUserByCode(three_authority_additional_user_8[0]['code']);
            userCodes.push(three_authority_additional_user_8_user_id['id']);
          }
          //_3Garoon宛先追加ユーザー1
          if(record._3Garoon宛先追加ユーザー8.value){
            userCodes.push(record._3Garoon宛先追加ユーザー8.value)
          }
          //_3権限追加ユーザー9
          if(record._3権限追加ユーザー9.value.length != 0){
            let three_authority_additional_user_9 = record._3権限追加ユーザー9.value;
            let three_authority_additional_user_9_user_id = await fetchGaroonUserByCode(three_authority_additional_user_9[0]['code']);
            userCodes.push(three_authority_additional_user_9_user_id['id']);
          }
          //_3Garoon宛先追加ユーザー9
          if(record._3Garoon宛先追加ユーザー9.value){
            userCodes.push(record._3Garoon宛先追加ユーザー9.value)
          }
          //_3権限追加ユーザー10
          if(record._3権限追加ユーザー10.value.length != 0){
            let three_authority_additional_user_10 = record._3権限追加ユーザー10.value;
            let three_authority_additional_user_10_user_id = await fetchGaroonUserByCode(three_authority_additional_user_10[0]['code']);
            userCodes.push(three_authority_additional_user_10_user_id['id']);
          }
          //_3Garoon宛先追加ユーザー10
          if(record._3Garoon宛先追加ユーザー10.value){
            userCodes.push(record._3Garoon宛先追加ユーザー10.value)
          }
          //_3権限追加ユーザー11
          if(record._3権限追加ユーザー11.value.length != 0){
            let three_authority_additional_user_11 = record._3権限追加ユーザー11.value;
            let three_authority_additional_user_11_user_id = await fetchGaroonUserByCode(three_authority_additional_user_11[0]['code']);
            userCodes.push(three_authority_additional_user_11_user_id['id']);
          }
          //_3Garoon宛先追加ユーザー11
          if(record._3Garoon宛先追加ユーザー11.value){
            userCodes.push(record._3Garoon宛先追加ユーザー11.value)
          }
          //_3権限追加ユーザー12
          if(record._3権限追加ユーザー12.value.length != 0){
            let three_authority_additional_user_12 = record._3権限追加ユーザー12.value;
            let three_authority_additional_user_12_user_id = await fetchGaroonUserByCode(three_authority_additional_user_12[0]['code']);
            userCodes.push(three_authority_additional_user_12_user_id['id']);
          }
          //_3Garoon宛先追加ユーザー12
          if(record._3Garoon宛先追加ユーザー12.value){
            userCodes.push(record._3Garoon宛先追加ユーザー12.value)
          }
          //_3権限追加ユーザー13
          if(record._3権限追加ユーザー13.value.length != 0){
            let three_authority_additional_user_13 = record._3権限追加ユーザー13.value;
            let three_authority_additional_user_13_user_id = await fetchGaroonUserByCode(three_authority_additional_user_13[0]['code']);
            userCodes.push(three_authority_additional_user_13_user_id['id']);
          }
          //_3Garoon宛先追加ユーザー13
          if(record._3Garoon宛先追加ユーザー13.value){
            userCodes.push(record._3Garoon宛先追加ユーザー13.value)
          }
          //_3権限追加ユーザー14
          if(record._3権限追加ユーザー14.value.length != 0){
            let three_authority_additional_user_14 = record._3権限追加ユーザー14.value;
            let three_authority_additional_user_14_user_id = await fetchGaroonUserByCode(three_authority_additional_user_14[0]['code']);
            userCodes.push(three_authority_additional_user_14_user_id['id']);
          }
          //_3Garoon宛先追加ユーザー14
          if(record._3Garoon宛先追加ユーザー14.value){
            userCodes.push(record._3Garoon宛先追加ユーザー14.value)
          }
          //_3権限追加ユーザー15
          if(record._3権限追加ユーザー15.value.length != 0){
            let three_authority_additional_user_15 = record._3権限追加ユーザー15.value;
            let three_authority_additional_user_15_user_id = await fetchGaroonUserByCode(three_authority_additional_user_15[0]['code']);
            userCodes.push(three_authority_additional_user_15_user_id['id']);
          }
          //_3Garoon宛先追加ユーザー15
          if(record._3Garoon宛先追加ユーザー15.value){
            userCodes.push(record._3Garoon宛先追加ユーザー15.value)
          }
          //_3権限追加ユーザー16
          if(record._3権限追加ユーザー16.value.length != 0){
            let three_authority_additional_user_16 = record._3権限追加ユーザー16.value;
            let three_authority_additional_user_16_user_id = await fetchGaroonUserByCode(three_authority_additional_user_16[0]['code']);
            userCodes.push(three_authority_additional_user_16_user_id['id']);
          }
          //_3Garoon宛先追加ユーザー16
          if(record._3Garoon宛先追加ユーザー16.value){
            userCodes.push(record._3Garoon宛先追加ユーザー16.value)
          }
          //_3権限追加ユーザー17
          if(record._3権限追加ユーザー17.value.length != 0){
            let three_authority_additional_user_17 = record._3権限追加ユーザー17.value;
            let three_authority_additional_user_17_user_id = await fetchGaroonUserByCode(three_authority_additional_user_17[0]['code']);
            userCodes.push(three_authority_additional_user_17_user_id['id']);
          }
          //_3Garoon宛先追加ユーザー17
          if(record._3Garoon宛先追加ユーザー17.value){
            userCodes.push(record._3Garoon宛先追加ユーザー17.value)
          }
          //_3権限追加ユーザー18
          if(record._3権限追加ユーザー18.value.length != 0){
            let three_authority_additional_user_18 = record._3権限追加ユーザー18.value;
            let three_authority_additional_user_18_user_id = await fetchGaroonUserByCode(three_authority_additional_user_18[0]['code']);
            userCodes.push(three_authority_additional_user_18_user_id['id']);
          }
          //_3Garoon宛先追加ユーザー18
          if(record._3Garoon宛先追加ユーザー18.value){
            userCodes.push(record._3Garoon宛先追加ユーザー18.value)
          }
          //_3権限追加ユーザー19
          if(record._3権限追加ユーザー19.value.length != 0){
            let three_authority_additional_user_19 = record._3権限追加ユーザー19.value;
            let three_authority_additional_user_19_user_id = await fetchGaroonUserByCode(three_authority_additional_user_19[0]['code']);
            userCodes.push(three_authority_additional_user_19_user_id['id']);
          }
          //_3Garoon宛先追加ユーザー19
          if(record._3Garoon宛先追加ユーザー19.value){
            userCodes.push(record._3Garoon宛先追加ユーザー19.value)
          }
          //_3権限追加ユーザー20
          if(record._3権限追加ユーザー20.value.length != 0){
            let three_authority_additional_user_20 = record._3権限追加ユーザー20.value;
            let three_authority_additional_user_20_user_id = await fetchGaroonUserByCode(three_authority_additional_user_20[0]['code']);
            userCodes.push(three_authority_additional_user_20_user_id['id']);
          }
          //_3Garoon宛先追加ユーザー20
          if(record._3Garoon宛先追加ユーザー20.value){
            userCodes.push(record._3Garoon宛先追加ユーザー20.value)
          }
          //コールセンター1
          if(record.コールセンター1.value.length != 0){
            let call_center_destination_1 = record.コールセンター1.value;
            let call_center_destination_1_user_id = await fetchGaroonUserByCode(call_center_destination_1[0]['code']);
            userCodes.push(call_center_destination_1_user_id['id']);
          }
          //_コールセンター_カテゴリー1
          if(record._コールセンター1.value.length != 0){
            let call_center_category_destination_1 = record._コールセンター1.value;
            let call_center_category_destination_1_user_id = await fetchGaroonUserByCode(call_center_category_destination_1[0]['code']);
            userCodes.push(call_center_category_destination_1_user_id['id']);
          }
          //コールセンター2
          if(record.コールセンター2.value.length != 0){
            let call_center_destination_2 = record.コールセンター2.value;
            let call_center_destination_2_user_id = await fetchGaroonUserByCode(call_center_destination_2[0]['code']);
            userCodes.push(call_center_destination_2_user_id['id']);
          }
          //_コールセンター_カテゴリー2
          if(record._コールセンター2.value.length != 0){
            let call_center_category_destination_2 = record._コールセンター2.value;
            let call_center_category_destination_2_user_id = await fetchGaroonUserByCode(call_center_category_destination_2[0]['code']);
            userCodes.push(call_center_category_destination_2_user_id['id']);
          }
          //コールセンター上長1
          if(record.コールセンター上長1.value.length != 0){
            let call_center_superiordestination_1 = record.コールセンター上長1.value;
            let call_center_superiordestination_1_user_id = await fetchGaroonUserByCode(call_center_superiordestination_1[0]['code']);
            userCodes.push(call_center_superiordestination_1_user_id['id']);
          }
          //_コールセンター上長_カテゴリー1
          if(record._コールセンター上長1.value.length != 0){
            let call_center_superiordestination_category_1 = record._コールセンター上長1.value;
            let call_center_superiordestination_category_1_user_id = await fetchGaroonUserByCode(call_center_superiordestination_category_1[0]['code']);
            userCodes.push(call_center_superiordestination_category_1_user_id['id']);
          }
          //コールセンター上長2
          if(record.コールセンター上長2.value.length != 0){
            let call_center_superiordestination_2 = record.コールセンター上長2.value;
            let call_center_superiordestination_2_user_id = await fetchGaroonUserByCode(call_center_superiordestination_2[0]['code']);
            userCodes.push(call_center_superiordestination_2_user_id['id']);
          }
          //_コールセンター上長_カテゴリー2
          if(record._コールセンター上長2.value.length != 0){
            let call_center_superiordestination_category_2 = record._コールセンター上長2.value;
            let call_center_superiordestination_category_2_user_id = await fetchGaroonUserByCode(call_center_superiordestination_category_2[0]['code']);
            userCodes.push(call_center_superiordestination_category_2_user_id['id']);
          }
          //コールセンター上長3
          if(record.コールセンター上長3.value.length != 0){
            let call_center_superiordestination_3 = record.コールセンター上長3.value;
            let call_center_superiordestination_3_user_id = await fetchGaroonUserByCode(call_center_superiordestination_3[0]['code']);
            userCodes.push(call_center_superiordestination_3_user_id['id']);
          }
          //_コールセンター上長_カテゴリー3
          if(record._コールセンター上長3.value.length != 0){
            let call_center_superiordestination_category_3 = record._コールセンター上長3.value;
            let call_center_superiordestination_category_3_user_id = await fetchGaroonUserByCode(call_center_superiordestination_category_3[0]['code']);
            userCodes.push(call_center_superiordestination_category_3_user_id['id']);
          }
          //コールセンター上長4
          if(record.コールセンター上長4.value.length != 0){
            let call_center_superiordestination_4 = record.コールセンター上長4.value;
            let call_center_superiordestination_4_user_id = await fetchGaroonUserByCode(call_center_superiordestination_4[0]['code']);
            userCodes.push(call_center_superiordestination_4_user_id['id']);
          }

          //userCodes変数から重複を削除
          let uniqueUserCodes = [...new Set(userCodes)];
          
          //-----------------------------------------------------
          //送信フラグ
          //-----------------------------------------------------
          //【送信2回目フラグ】1回目が送信済みであれば、2回目フラグを送信済みにする
          if((record.送信1回目フラグ.value == '送信済み' && record.ご返信内容_メール_ネットアンケート.value) || (record.送信1回目フラグ.value == '送信済み' && record.ご返信内容_口コミ.value) || record.送信2回目フラグ.value == '送信済み' ){ 
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
          //【報告済みフラグ】
          if( record.報告済みフラグ.value == '報告済み' || record.顛末済みフラグ.value == '顛末済み' || record.AM報告欄.value || record.顛末.value[0].value.内容_顛末.value){
            var reported_flag = '報告済み';
          }else{
            var reported_flag = '未送信';
          }
          //【顛末済みフラグ】
          if(record.顛末済みフラグ.value == '顛末済み' || record.総括部長コメント欄.value || record.顛末確認_部長.value == '〇'){
            var ending_flag = '顛末済み';
          }else{
            var ending_flag = '未送信';
          }

          // //【アンケート報告書送信フラグ】
          // if(record.アンケート報告書送信フラグ.value == '送信済み'){
          //   var send_flag_enquete_report = '送信済み';
          // }else if(record.お客様対応の状況.value || record.原因.value || record.改善策_内容1.value ){
          //   var send_flag_enquete_report = '送信済み';
          // }else{
          //   var send_flag_enquete_report = '未送信'; 
          // }

          //送信する添付ファイルの名前を保存
          let file_data = [];
            if(record.ファイル添付1回目.value){
              for(let i=0; i<record.ファイル添付1回目.value.length; i++){
                file_data.push(record.ファイル添付1回目.value[i]['name']);
              }
            }
            if(record.ファイル添付1回目_口コミ.value){
              for(let i=0; i<record.ファイル添付1回目_口コミ.value.length; i++){
                file_data.push(record.ファイル添付1回目_口コミ.value[i]['name']);
              }
            }
            if(record.ファイル添付2回目.value){
              for(let i=0; i<record.ファイル添付2回目.value.length; i++){
                file_data.push(record.ファイル添付2回目.value[i]['name']);
              }
            }
            if(record.ファイル添付3回目.value){
              for(let i=0; i<record.ファイル添付3回目.value.length; i++){
                file_data.push(record.ファイル添付3回目.value[i]['name']);
              }
            }
            let file_name = file_data.join(', ');


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
              報告済みフラグ: {
                value: reported_flag
              },
              顛末済みフラグ: {
                value: ending_flag
              },
              Garoonメッセージ送信制御 :{
                value: '送信しない' 
              },
              未送信フラグ :{
                value: ''
              },
              一度送信した添付ファイル名:{ //追加20240419
                value: file_name
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
            var received = record.お客様名_管理用.value + '様' + '(お客様)' + '➝' + '担当者' + '\n' + '\n';
          }

          //-------------------------------------------------------------------
          // Garoonに送信するテンプレートの作成
          //-------------------------------------------------------------------

          var body = [];
          if(record.お客様とのご連絡回数.value == '1回目' && record.送信1回目フラグ.value == '未送信'){
            body = '------------------------------------------------------------------' + '\n' + record.Garoon送信メッセージ内容.value + '\n' + '------------------------------------------------------------------' + '\n' + '\n' + 'kintoneリンク:' + URL ;
          }else if((record.お客様とのご連絡回数.value == '1回目' && record.送信1回目フラグ.value == '送信済み' && record.送信2回目フラグ.value == '未送信' && record.ご返信内容_メール_ネットアンケート.value ) ||  (record.お客様とのご連絡回数.value == '1回目' && record.送信1回目フラグ.value == '送信済み' && record.送信2回目フラグ.value == '未送信' && record.ご返信内容_口コミ.value ) || (record.お客様とのご連絡回数.value == '2回目' && record.送信3回目フラグ.value == '送信済み' && record.送信4回目フラグ.value == '未送信' && record.お客様への返答内容_コールセンター記入_2回目.value)  ||   (record.お客様とのご連絡回数.value == '3回目' && record.送信5回目フラグ.value == '送信済み' && record.送信6回目フラグ.value == '未送信' && record.お客様への返答内容_コールセンター記入_3回目.value )){//【修正後】【修正前】if((record.お客様とのご連絡回数.value == '1回目' && record.送信1回目フラグ.value == '送信済み' && record.送信2回目フラグ.value == '未送信') || (record.お客様とのご連絡回数.value == '2回目' && record.送信3回目フラグ.value == '送信済み' && record.送信4回目フラグ.value == '未送信'))
            body = '------------------------------------------------------------------' + '\n' +  sent + record.Garoon送信メッセージ内容.value + '\n' + '------------------------------------------------------------------';
          }else if((record.お客様とのご連絡回数.value == '2回目' && record.送信3回目フラグ.value == '未送信') || (record.お客様とのご連絡回数.value == '3回目' && record.送信5回目フラグ.value == '未送信') ){
            body = '------------------------------------------------------------------' + '\n' +  received + record.Garoon送信メッセージ内容.value + '\n' + '------------------------------------------------------------------';
          }else{
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
            if (record.業態.value.includes("ミライザカ")){
              var industry = 'ミ';
            }else if(record.業態.value.includes("鳥メロ")){
              var industry = 'メ';
            }else if(record.業態.value.includes("炭旬")){
              var industry = '炭旬';
            }else if(record.業態.value.includes("のれん街")){
              var industry = 'のれん';
            }else if(record.業態.value.includes("しろくまストア")){
              var industry = 'しろくま';
            }else if(record.業態.value.includes("WANG'SGARDEN")){
              var industry = 'ワンズ';
            }else if(record.業態.value.includes("TGIFRIDAYS")){
              var industry = 'TGI';
            }else if(record.業態.value.includes("TEXMEXFACTORY")){
              var industry = 'TEX';
            }else if(record.業態.value.includes("bb.qオリーブチキンカフェ")){
              var industry = 'bb.q';
            }else if(record.業態.value.includes("かみむら牧場")){
              var industry = 'かみむら';
            }else if(record.業態.value.includes("焼肉の和民")){
              var industry = '焼肉';
            }else if(record.業態.value.includes("うしメロ")){
              var industry = 'うしメロ';
            }else if(record.業態.value.includes("から揚げの天才")){
              var industry = 'から揚げ';
            }else if(record.業態.value.includes("のり弁の天才")){
              var industry = 'のり弁';
            }else if(record.業態.value.includes("すしの和")){
              var industry = 'すし';
            }else if(record.業態.value.includes("牛武")){
              var industry = '牛武';
            }else{
              var industry = record.業態.value;
            }
          }else{
            var industry = '';
          }


          //店名
          if(record.店名.value){
            if(record.店名.value.includes("ミライザカ")){
              var store_name = record.店名.value.replace(/ミライザカ/, '');
            }else if(record.店名.value.includes("鳥メロ")){
              var store_name = record.店名.value.replace(/鳥メロ/, '');
            }else if(record.店名.value.includes("しろくまストア")){
              var store_name = record.店名.value.replace(/しろくまストア/, '');
            }else if(record.店名.value.includes("から揚げの天才")){
              var store_name = record.店名.value.replace(/から揚げの天才/, '');
            }else if(record.店名.value.includes("すしの和")){
              var store_name = record.店名.value.replace(/すしの和/, '');
            }else if(record.店名.value.includes("bb.q OLIVE CHICKEN caf'e")){
              var store_name = record.店名.value.replace(/bb.q OLIVE CHICKEN caf'e/, '');
            }else if(record.店名.value.includes("TGI")){
              var store_name = record.店名.value.replace(/TGI/, '');
            }else if(record.店名.value.includes("かみむら牧場")){
              var store_name = record.店名.value.replace(/かみむら牧場/, '');
            }else if(record.店名.value.includes("焼肉の和民")){
              var store_name = record.店名.value.replace(/焼肉の和民/, '');
            }else if(record.店名.value.includes("和民のこだわりのれん街")){
              var store_name = record.店名.value.replace(/和民のこだわりのれん街/, '');
            }else{
              var store_name = record.店名.value;
            }
          }else{
            var store_name = '';
          }

          //総合評価
          if(record.総合評価_まとめ.value){
            var comprehensive_evaluation = '(' + record.総合評価_まとめ.value + ')';
          }else{
            var comprehensive_evaluation = '';
          }

          //受付方法
          if(record.受付方法.value == '電話'){
            var reception_method = 'ホットライン';
          }else if(record.受付方法.value == '口コミサイト'){
            var reception_method = 'Googleネガティブクチコミ';
          }else{
            var reception_method = record.受付方法.value;
          }

          //Garoonメッセージのタイトル
          if(record.店名.value){
            var content = formattedDate + ":"+ "　" + industry + ')' + store_name+ "　" + reception_method + comprehensive_evaluation + "【kintone】" + record.$id.value;//業態 + 店名省略バージョン
          }else if(record.本部関連_商品関連の宛先を取得1.value){
            var content = formattedDate + ":"+ "　" + industry + ')' + store_name+ "　" + reception_method + '(' + record.本部関連_商品関連の宛先を取得1.value + ')'+ comprehensive_evaluation + "【kintone】" + record.$id.value;//業態 + 店名省略バージョン
          }else{
            var content = formattedDate + ":"+ "　" + industry + ')' + store_name+ "　" + reception_method + comprehensive_evaluation + "【kintone】" + record.$id.value;//業態 + 店名省略バージョン
          }

          performCommonAction('申請', uniqueUserCodes, content, body, record)
          .then(function () {
              //Garoonのメッセージが2通以上ある場合、1通目を更新して,2通目以降を削除
              return GaroonMessageUpdateDelete(record); // Promiseを返すように修正
          })
          .then(function () {
              //送信履歴フィールドを更新
              send_content_update(record);

              setTimeout(() => {
                  //リロード
                  // window.location.reload();
              }, 3000);

              // // 1秒後にモーダルを非表示にする
              // setTimeout(function() {
              //   closeLoadingModal();
              // }, 1300);
          });
        }
      );
  }
  return event;
});

    //--------------------------------------------------
    //メッセージ送信時のモーダル
    //--------------------------------------------------
    // モーダルを作成
    var modal = document.createElement('div');
    modal.style.display = 'none';
    modal.style.position = 'fixed';
    modal.style.zIndex = '1000';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.overflow = 'auto';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';

    // モーダルコンテンツを作成
    var modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#fefefe';
    modalContent.style.margin = '15% auto';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '10px';
    modalContent.style.width = '80%';
    modalContent.style.maxWidth = '400px';
    modalContent.style.textAlign = 'center';

    // メッセージを表示する要素を作成
    var message = document.createElement('p');
    message.textContent = 'メッセージを送信中です...';
    message.style.marginBottom = '20px';

    // スピナーを表示する要素を作成
    var spinner = document.createElement('div');
    spinner.className = 'spinner-border';
    spinner.style.width = '3rem';
    spinner.style.height = '3rem';
    spinner.setAttribute('role', 'status');

    // スピナーに対する補助テキストを追加
    var spinnerText = document.createElement('span');
    spinnerText.className = 'sr-only';
    spinnerText.textContent = 'Loading...';
    spinner.appendChild(spinnerText);

    // テキストを表示する要素を作成
    var loadingText = document.createElement('p');
    loadingText.textContent = 'メッセージ送信中です...';
    loadingText.style.marginTop = '10px';
    loadingText.style.fontFamily = 'Arial, sans-serif';
    loadingText.style.fontSize = '16px';
    loadingText.style.color = '#333';

    // モーダルに要素を追加
    modalContent.appendChild(message);
    modalContent.appendChild(spinner);
    modalContent.appendChild(loadingText);
    modal.appendChild(modalContent);

    // モーダルを表示する関数
    function showLoadingModal(messageContent) {
      message.textContent = messageContent;
      spinner.style.display = 'inline-block';
      modal.style.display = 'block';
    }

    // モーダルを閉じる関数
    function closeLoadingModal() {
      spinner.style.display = 'none';
      modal.style.display = 'none';
    }

    // モーダル要素をbodyに追加
    document.body.appendChild(modal);

  //-------------------------------------------------------------------
  //Garoonのメッセージを検索➝更新➝削除する処理
  //-------------------------------------------------------------------
  /**
  * メッセージ登録パラメータテンプレート
  * ${XXXX}の箇所は入力値等で置換して使用
  */
  const MSG_SEARCH_TEMPLATE =
    '<parameters text="【kintone】" start="2010-07-01T00:00:00Z" end="2037-12-31T00:00:00Z" search_sub_folders="true" title_search="true" body_search="false" from_search="false" addressee_search="false" follow_search="false">' +
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
            var threads = xmlDoc.querySelectorAll('thread');

            // subjectごとのthreadのIDを保持するオブジェクト
            var subjectThreadIds = {};

            // 同じsubjectを持つthreadのIDを配列に追加
            threads.forEach(thread => {
              //タイトルを取得
              var subjectGet = thread.getAttribute('subject');

              if (subjectGet !== null && subjectGet !== undefined) {
                //タイトルの【kintone】から左側を全て削除し、
                var subject = subjectGet.replace(/.*【kintone】/, ''); // 変数の宣言と同時に初期化

                var threadId = thread.getAttribute('id');
              
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
            console.warn("subjectThreadIds",subjectThreadIds);
            //配列にする
            let threadsArray = Array.from(threads);
            //空の配列を作成
            let newArray = [];
              // console.warn("繰り返し処理の前の配列",threadsArray);
              
            // kintoneのレコードID   追加20240423
            let recordId = kintone.app.record.getId(); // kintoneのレコードID
            console.warn("レコードIDを取得",typeof recordId.toString());
            //繰り返し
            Object.keys(subjectThreadIds).forEach(async(subject) => {
              // console.warn("繰り返しのsubject",subject);
              //同じメッセージが2つ以上見つかった時
              if (subjectThreadIds[subject].length >= 2 && subject == recordId) {

                // console.warn("処理入ってきた?");
                  //1通目のメッセージIDを取得
                  let firstID = subjectThreadIds[subject][0];
                  // console.warn("1通目のメッセージを取得",firstID);

                  //宛先を保持
                  //1通目の情報を取得
                  let FirstTargetThread = threadsArray.find(thread => thread.getAttribute('id') == firstID);

                  //1通目のDocumentオブジェクトを得る
                  const FirstXMLparser = new DOMParser();
                  const FirstXMLparserxmlDoc = FirstXMLparser.parseFromString(FirstTargetThread.outerHTML, "application/xml");

                  // console.warn("テスト2",FirstXMLparserxmlDoc);

                  //1通目のsubjectタグ情報を抜き取る
                  const threadElementGet= FirstXMLparserxmlDoc.getElementsByTagName('thread');
                  var subjectGet = Array.from(threadElementGet).map(thread => thread.getAttribute('subject'));

                  console.warn("if文内のsubjectを取得",subject);
                  console.warn("recordId",recordId);

                  if (subject == recordId) {
                    console.warn("subjectとレコードのIDは同じです。");
                  } else {
                      console.warn("subjectとレコードのIDは異なります。");
                  }

                  //最新メッセージのID
                  let finalArray = subjectThreadIds[subject][subjectThreadIds[subject].length - 1];

                  //最終メッセージの情報を取得
                  let FinalTargetThread = threadsArray.find(thread => thread.getAttribute('id') == finalArray);

                  //最後メッセージのDocumentオブジェクトを得る
                  const FinalXMLparser = new DOMParser();
                  const FinalXMLparserxmlDoc = FinalXMLparser.parseFromString(FinalTargetThread.outerHTML, "application/xml");

                  // console.warn("テスト",FinalXMLparserxmlDoc);
                  
                  // 名前空間を指定してaddresseeタグのユーザーIDを抜き取る
                  const addresseeElements = FinalXMLparserxmlDoc.getElementsByTagName('th:addressee');
                  const addresseeUserIds = Array.from(addresseeElements).map(addressee => addressee.getAttribute('user_id'));

                  const subjectElements = FinalXMLparserxmlDoc.getElementsByTagName('thread');
                  const subjectFinalMessageArray  = Array.from(subjectElements).map(thread => thread.getAttribute('subject'));
                  // 配列を文字列に結合
                  const subjectFinalMessage = subjectFinalMessageArray.join(' '); 
                  //::より左側の文字を取得(年月日)
                  var new_send_date = subjectFinalMessage.split(":")[0];

                  // 正規表現を使用して数字+顛末の文字列を検知する
                  var pattern_tenmatsu = /\d+顛末済/;
                  var pattern_reupdate = /\d+報告済/;

                  // タイトルの編集
                  // subjectGetを文字列に変換
                  var subjectGetMessage = subjectGet.join(' '); 
                  // 数字と"再更新"という文字列を含むパターンを正規表現で検索して削除
                  var subjectGetMessage = subjectGetMessage.replace(/(\d*再更新:)/, '');
                  if (pattern_tenmatsu.test(subjectGetMessage) || record.総括部長コメント欄.value || record.顛末確認_部長.value == '〇'){
                    var subjectGetMessage = subjectGetMessage.replace(/(\d*報告済:)/, '');
                    var subjectGetMessage = subjectGetMessage.replace(/(\d*顛末済:)/, '');
                    var send_subject = new_send_date + '顛末済' + ':' + subjectGetMessage;
                  }else if (pattern_reupdate.test(subjectGetMessage) || record.AM報告欄.value || record.顛末.value[0].value.内容_顛末.value){
                    var subjectGetMessage = subjectGetMessage.replace(/(\d*報告済:)/, '');
                    var send_subject = new_send_date + '報告済' + ':' + subjectGetMessage;
                  }else if (!pattern_reupdate.test(subjectGetMessage) && !pattern_reupdate.test(subjectGetMessage)) {
                    //　新しく更新日時を追加してタイトルを更新する
                    var send_subject = new_send_date + '再更新' + ':' + subjectGetMessage;
                  }

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
                    if (newArray[i].includes("【受付1(始)】") && newArray[i].includes(record.店名.value)) {
                      if(record.受付方法.value == '電話' ){
                        var first_message_result = first_message_call(record);
                      }else if(record.受付方法.value == 'メール'||record.受付方法.value == 'ネットアンケート'){
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
                      }else if(record.受付方法.value == 'メール'||record.受付方法.value == 'ネットアンケート'){
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
                  await MessageUpdate(firstID,resultString,send_subject,addresseeUserIds,record);

                  // //1通目以外のメッセージを削除
                  let index = subjectThreadIds[subject].indexOf(firstID);
                  if (index !== -1) {
                  subjectThreadIds[subject].splice(index, 1);
                  }
                  // setTimeout(function() {
                    // ここに実行したいコードを書く
                    for (const id of subjectThreadIds[subject]) {
                      // id は配列内の各数字、ここで繰り返し処理を行う
                      //削除処理
                        await MessageDelete(id);
                    }
                  // }, 100);
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
              '<content body="${MAIN_TEXT}">' +
                '${FILE_TEMPLATES}' + // ここにファイルテンプレートを追加     追加20240419
              '</content>'+
              '<folder id="dummy"></folder>'+
            '</thread>'+
            '${FILE_CONTENTS}' + // ここにファイル内容を追加    追加20240419
          ' </modify_thread>'+
          '</parameters>';

   /**
   * メッセージ送信先パラメータテンプレート
   * ${XXXX}の箇所は入力値等で置換して使用
   */
  const ADDRESSEE_TEMPLATE_UPDATE =
  '<addressee user_id="${USER_ID}" name="dummy" deleted="false"></addressee>';
          
  //メッセージ実行の共通処理(ユーザーフィールド)
  const MessageUpdate = async (message_id,main_text,subjectText,addresseeUserIds ,record) => {
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
      /////ファイル添付処理   追加20240419/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      let file_data_summary = [];
      if(record.ファイル添付1回目.value){
        for(let i=0; i<record.ファイル添付1回目.value.length; i++){
          if(!record.一度送信した添付ファイル名.value.includes(record.ファイル添付1回目.value[i]['name'])){
            file_data_summary.push(record.ファイル添付1回目.value[i]);
          }
        }
      }
      if(record.ファイル添付1回目_口コミ.value){
        for(let i=0; i<record.ファイル添付1回目_口コミ.value.length; i++){
          if(!record.一度送信した添付ファイル名.value.includes(record.ファイル添付1回目_口コミ.value[i]['name'])){
            file_data_summary.push(record.ファイル添付1回目_口コミ.value[i]);
          }
        }
      }
      if(record.ファイル添付2回目.value){
        for(let i=0; i<record.ファイル添付2回目.value.length; i++){
          if(!record.一度送信した添付ファイル名.value.includes(record.ファイル添付2回目.value[i]['name'])){
            file_data_summary.push(record.ファイル添付2回目.value[i]);
          }
        }
      }
      if(record.ファイル添付3回目.value){
        for(let i=0; i<record.ファイル添付3回目.value.length; i++){
          if(!record.一度送信した添付ファイル名.value.includes(record.ファイル添付3回目.value[i]['name'])){
            file_data_summary.push(record.ファイル添付3回目.value[i]);
          }
        }
      }

      // ファイル添付のテンプレートを作成
      let fileTemplates = '';
      let fileContents = '';

      if (file_data_summary) {
        for (let i = 0; i < file_data_summary.length; i++) {
          const { fileKey, name, contentType } = file_data_summary[i];

          const headers = {
            'X-Requested-With': 'XMLHttpRequest',
          };

          // ファイルデータを取得
          const resp = await fetch(`/k/v1/file.json?fileKey=${fileKey}`, {
            method: 'GET',
            headers,
          });

          const blob = await resp.blob();

          const base64data = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
              const base64 = reader.result.split(',')[1];
              resolve(base64);
            };
            reader.onerror = reject;
          });

          // テンプレートの置換を行う
          const fileTemplate = `<file id="${i}" name="${name}" mime_type="${contentType}"></file>`;
          const fileContent = `<file xmlns="" id="${i}"><content xmlns="">${base64data}</content></file>`;


          fileTemplates += fileTemplate;
          fileContents += fileContent;
        }
      }
      // テンプレートにファイル情報とファイル内容を埋め込む
      msgUpdataParam = msgUpdataParam.replace('${FILE_TEMPLATES}', fileTemplates);
      msgUpdataParam = msgUpdataParam.replace('${FILE_CONTENTS}', fileContents);

      msgUpdataParam = msgUpdataParam.replace('${ADDRESSEE}', userParams.join(''));//宛先を全員分追加

      let msgUpdateRequest = SOAP_UPDATE_TEMPLATE;
      // SOAPパラメータを完成させる
      msgUpdateRequest = msgUpdateRequest.replace('${PARAMETERS}', msgUpdataParam);
      // 実行処理を指定
      msgUpdateRequest = msgUpdateRequest.split('${ACTION}').join('MessageModifyThreads');

     // メッセージ登録の実行
     const responseData = await $.ajax({
      type: 'post',
      url: 'https://watami.cybozu.com/g/cbpapi/message/api.csp',//変更が必要
      cache: false,
      data: msgUpdateRequest,
      dataType: 'xml',  // XML 形式のレスポンスを指定　　　//追20240419
    }).done((response) => {
      console.warn("更新処理に成功:", response);
    })
    .fail((jqXHR, textStatus, errorThrown) => {
      console.error("(更新処理)HTTPエラーが発生しました:", textStatus, errorThrown);
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
        '<param xmlns="" folder_id="107564" thread_id="${DELETE_ID}"></param>' +
        '</parameters>' +
        '</MessageRemoveThreads>' +
        '</soap:Body>' +
        '</soap:Envelope>';
          
    //メッセージ実行の共通処理(ユーザーフィールド)
    const MessageDelete = async (delete_id) => {
      try {
        // console.warn("メッセージ削除処理に入ってきた");
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
          // //削除に成功したら、リロード
          // window.location.reload();
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

      //受信日時 (追加20240410)
      if(record.受信日時_電話.value == '' || record.受信日時_電話.value == undefined){
        var receiving_time_call = '' ;
      }else {
          var dateTime_call = new Date(record.受信日時_電話.value);
          // const dateTime = visits_date_time_call.toISOString('ja-JP', options).split(' ')[0];

          // 年月日の取得
          var year_call = dateTime_call.getFullYear();
          var month_call = String(dateTime_call.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため、1を加え、2桁に整形
          var day_call = String(dateTime_call.getDate()).padStart(2, '0'); // 日も2桁に整形

          // 時分の取得
          var hours_call = String(dateTime_call.getHours()).padStart(2, '0');
          var minutes_call = String(dateTime_call.getMinutes()).padStart(2, '0');

          var receiving_time_call = '';
          // 受信日時
          var receiving_time_call = `${year_call}年${month_call}月${day_call}日${hours_call}時${minutes_call}分`;
      }
      //店名
      if(record.店名.value == undefined || record.店名.value == ''){
        var store_name = '';
      }else{
        var store_name = record.店名.value;
      }

      //ご来店日時を編集
      if(record.ご来店日時_電話.value == '' || record.ご来店日時_電話.value == undefined){
          var visits_date_call = '' ;
          var visits_time_call = '';
      }else {
          var dateTime = new Date(record.ご来店日時_電話.value);
          // const dateTime = visits_date_time_call.toISOString('ja-JP', options).split(' ')[0];

          // 年月日の取得
          var year = dateTime.getFullYear();
          var month = String(dateTime.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため、1を加え、2桁に整形
          var day = String(dateTime.getDate()).padStart(2, '0'); // 日も2桁に整形

          // 時分の取得
          var hours = String(dateTime.getHours()).padStart(2, '0');
          var minutes = String(dateTime.getMinutes()).padStart(2, '0');

          var visits_date_call = '';
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
      // //返信方法まとめ
      // if(record.返信方法_まとめ.value == "電話"){
      //   var reply_method = "お客様は電話での対応をご希望です。" + '\n' +'\n';
      // }else if(record.返信方法_まとめ.value == "メールでの返信"){
      //   var reply_method = "お客様はメールでの返信をご希望です。上長承認またはSV確認の上、お客様への返信文をコメントお願い致します。"+ '\n' +'\n';
      // }else if(record.返信方法_まとめ.value == "返信不要"){
      //   var reply_method = "お客様は返答をご希望されておりませんので、ご共有をお願いいたします。"+ '\n' +'\n';
      // }else {
      //   var reply_method = '';
      // }
      // //フォーム記入者まとめ
      // if(record.フォーム記入者_まとめ.value && record.フォーム記入者_まとめ.value != "0"){
      //   var form_entry_person = record.フォーム記入者_まとめ.value;
      // }else if(record.フォーム記入者_まとめ.value=="0"){
      //   var form_entry_person = '';
      // }else{
      //   var form_entry_person = '';
      // }

      var Garoon_message = '';
      //電話の場合、Garoonに送信するメッセージを作成
      if(record.アンケート報告書.value == '要'){
          Garoon_message = 
          '【受付1(始)】' + '\n' + 
          '受信日時　　:' + receiving_time_call + '\n' + //追加20240410 
          'ご利用店舗　:' + store_name + '\n' + 
          'ご来店日　　:' + visits_date_call + '\n' + 
          '来店時間　　:' + visits_time_call +'\n' + 
          '利用人数　　:' + visits_number + '\n' + 
          'お気づきの内容:'+'\n'+ opinion_detail + '\n' + '\n' + 
          '総合評価　　:' + evaluation_call + '\n' + 
          '性別　　　　:' + sex_call + '\n' + 
          '漢字氏名　　:' + name_call + '\n' + 
          'ご連絡先　　:' + contact_address_call + '\n' + '\n' +
          '※顛末（またはA報告）についてアプリへ記入後、保存ボタンをクリックお願い致します。' + '\n' +
          '【受付1(終)】' ;
      }else if (record.アンケート報告書.value == '否'){
          Garoon_message = 
          '【受付1(始)】' + '\n' + 
          '受信日時　　:' + receiving_time_call + '\n' + //追加20240410 
          'ご利用店舗　:' + store_name + '\n' + 
          'ご来店日　　:' + visits_date_call + '\n' + 
          '来店時間　　:' + visits_time_call +'\n' + 
          '利用人数　　:' + visits_number + '\n' + 
          'お気づきの内容:'+'\n'+ opinion_detail + '\n' + '\n' +
          '総合評価　　:' + evaluation_call + '\n' + 
          '性別　　　　:' + sex_call + '\n' + 
          '漢字氏名　　:' + name_call + '\n' + 
          'ご連絡先　　:' + contact_address_call + '\n' + '\n' +
          '※顛末（またはA報告）についてアプリへ記入後、保存ボタンをクリックお願い致します。' + '\n' +
          '【受付1(終)】' ;
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
      メッセージの1通目(メール_ネットアンケート)
    */
    function first_message_mail(record){
        //受信日時 (追加20240410)
        if(record.受信日時_メール_ネットアンケート.value == '' || record.受信日時_メール_ネットアンケート.value == undefined){
          var receiving_time_mail = '' ;
        }else {
            var dateTime_mail = new Date(record.受信日時_メール_ネットアンケート.value);
            // const dateTime = visits_date_time_call.toISOString('ja-JP', options).split(' ')[0];

            // 年月日の取得
            var year_mail = dateTime_mail.getFullYear();
            var month_mail = String(dateTime_mail.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため、1を加え、2桁に整形
            var day_mail = String(dateTime_mail.getDate()).padStart(2, '0'); // 日も2桁に整形

            // 時分の取得
            var hours_mail = String(dateTime_mail.getHours()).padStart(2, '0');
            var minutes_mail = String(dateTime_mail.getMinutes()).padStart(2, '0');

            var receiving_time_mail = '';
            // 受信日時
            var receiving_time_mail = `${year_mail}年${month_mail}月${day_mail}日${hours_mail}時${minutes_mail}分`;
        }

        //店名
        if(record.店名.value == undefined || record.店名.value == ''){
          var store_name = '';
        }else{
          var store_name = record.店名.value;
        }

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

        //ご利用人数_メール_ネットアンケート
        if(record.ご利用人数_メール_ネットアンケート.value == undefined || record.ご利用人数_メール_ネットアンケート.value == ''){
            var use_count = '';
        }else{
            var use_count = record.ご利用人数_メール_ネットアンケート.value;
        }

        //お気づきの内容
        if(record.お気づきの内容.value == undefined || record.お気づきの内容.value == '' ){
            var opinion_detail = '';
        }else{
            var opinion_detail = record.お気づきの内容.value;
        }

        //総合評価
        if(record.総合評価_メール_ネットアンケート.value == undefined || record.総合評価_メール_ネットアンケート.value == ''){
          var evaluation_mail = '';
        }else{
          var evaluation_mail = record.総合評価_メール_ネットアンケート.value;
        }

        //理由
        if(record.理由.value == undefined || record.理由.value == ''){
          var cause_email = '';
        }else{
          var cause_email = record.理由.value;
        }


        //性別
        if(record.性別_メール_ネットアンケート.value == undefined || record.性別_メール_ネットアンケート.value == ''){
            var sex_mail = '';
        }else{
            var sex_mail = record.性別_メール_ネットアンケート.value;
        }

        //漢字氏名
        if(record.お名前_メール_ネットアンケート.value == undefined || record.お名前_メール_ネットアンケート.value == ''){
            var name_mail = '';
        }else{
            var name_mail = record.お名前_メール_ネットアンケート.value;
        }   

        //ご連絡先
        if(record.ご連絡先_メール_ネットアンケート.value == undefined || record.ご連絡先_メール_ネットアンケート.value == ''){
            var contact_address_mail = '';
        }else{
            var contact_address_mail = record.ご連絡先_メール_ネットアンケート.value;
        }

        var Garoon_message = ''

        //Garoonに送信するメッセージを作成
        if( record.アンケート報告書.value == '要'){
            Garoon_message = 
            '【受付1(始)】' + '\n' + 
            '受信日時　　:' + receiving_time_mail + '\n' + //追加20240410
            'ご利用店舗　:' + store_name + '\n' + 
            'ご来店日　　:' + visits_date_mail_net + '\n' + 
            '来店時間　　:' + visits_time_mail_net +'\n' + 
            '利用人数　　:' + use_count + '\n' +  
            'お気づきの内容:'+ '\n' + opinion_detail + '\n' + '\n' +
            '総合評価　　:' + evaluation_mail + '\n' + 
            '理由　　　　:' + '\n' + cause_email + '\n' + '\n' +
            '性別　　　　:' + sex_mail + '\n' + 
            '漢字氏名　　:' + name_mail + '\n' + 
            'ご連絡先　　:' + contact_address_mail + '\n' + '\n' +
            '※顛末（またはA報告）についてアプリへ記入後、保存ボタンをクリックお願い致します。' + '\n' +
            '【受付1(終)】';
        }else if (record.アンケート報告書.value == '否'){
            Garoon_message =
            '【受付1(始)】' + '\n' + 
            '受信日時　　:' + receiving_time_mail + '\n' + //追加20240410
            'ご利用店舗　:' + store_name + '\n' + 
            'ご来店日　　:' + visits_date_mail_net + '\n' + 
            '来店時間　　:' + visits_time_mail_net +'\n' + 
            '利用人数　　:' + use_count + '\n' +  
            'お気づきの内容:'+ '\n' + opinion_detail + '\n' + '\n' +
            '総合評価　　:' + evaluation_mail + '\n' + 
            '理由　　　　:' + '\n' + cause_email + '\n' + '\n' +
            '性別　　　　:' + sex_mail + '\n' + 
            '漢字氏名　　:' + name_mail + '\n' + 
            'ご連絡先　　:' + contact_address_mail + '\n' + '\n' + 
            '※顛末（またはA報告）についてアプリへ記入後、保存ボタンをクリックお願い致します。' + '\n' +
            '【受付1(終)】';
        }

        return Garoon_message;
    }

    /*
      メッセージの2通目(メール・ネットアンケート)
    */
    function second_message_mail(record){
        //記入者_メール
        if(record.ご返信内容_記入者_メール_ネットアンケート.value == undefined || record.ご返信内容_記入者_メール_ネットアンケート.value == ''){
            var reply_content_entry_person_email = '';
        }else{
            var reply_content_entry_person_email = record.ご返信内容_記入者_メール_ネットアンケート.value;
        }
        //ご返信内容_メール_ネットアンケート
        if(record.ご返信内容_メール_ネットアンケート.value == undefined || record.ご返信内容_メール_ネットアンケート.value == ''){
            var reply_content_email = '';
        }else{
            var reply_content_email = record.ご返信内容_メール_ネットアンケート.value;
        }
        //ご返答日_電話
        if(record.記入日_ご返答内容_メール_ネットアンケート.value == undefined || record.記入日_ご返答内容_メール_ネットアンケート.value == ''){
            var reply_date_email = '';
        }else{
          const dateTime = new Date(record.記入日_ご返答内容_メール_ネットアンケート.value);
          // 年月日の取得
          const year = dateTime.getFullYear();
          const month = String(dateTime.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため、1を加え、2桁に整形
          const day = String(dateTime.getDate()).padStart(2, '0'); // 日も2桁に整形

          // 時分の取得
          // const hours = String(dateTime.getHours()).padStart(2, '0');
          // const minutes = String(dateTime.getMinutes()).padStart(2, '0');

        // フォーマットされた日時の生成
          var reply_date_email = `${year}年${month}月${day}日`;
        }
        
        var Garoon_message = '';

        //記入者
        Garoon_message = 
        '【回答1(始)】' + '\n' +
        '返信内容記入者:' + reply_content_entry_person_email + '\n' +
        'ご返答内容　　:' + '\n' + reply_content_email + '\n' + '\n' +
        'ご返答日　　　:' + reply_date_email + '\n' +
        '【回答1(終)】';

        return Garoon_message;
    }

    /*
      メッセージの1通目(口コミ)
    */
      function first_message_review(record){

        //受信日時 (追加20240410)
        if(record.受信日時_口コミ.value == '' || record.受信日時_口コミ.value == undefined){
          var receiving_time_review = '' ;
        }else {
            var dateTime_review = new Date(record.受信日時_口コミ.value);
            // const dateTime = visits_date_time_call.toISOString('ja-JP', options).split(' ')[0];

            // 年月日の取得
            var year_review = dateTime_review.getFullYear();
            var month_review = String(dateTime_review.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため、1を加え、2桁に整形
            var day_review = String(dateTime_review.getDate()).padStart(2, '0'); // 日も2桁に整形

            // 時分の取得
            var hours_review = String(dateTime_review.getHours()).padStart(2, '0');
            var minutes_review = String(dateTime_review.getMinutes()).padStart(2, '0');

            var receiving_time_review = '';
            // 受信日時
            var receiving_time_review = `${year_review}年${month_review}月${day_review}日${hours_review}時${minutes_review}分`;
        }

        // //冒頭文名前
        // if(record.冒頭文名前.value){
        //   var opening_sentence_name = record.冒頭文名前.value + '　' + '様' + '\n' + '\n';
        // }else{
        //   var opening_sentence_name = '';
        // }
        //店名
        if(record.店名.value == undefined || record.店名.value == ''){
          var store_name = '';
        }else{
          var store_name = record.店名.value;
        }
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

        //総合評価  追加20240410
        if(record.星_口コミの場合_口コミ.value == undefined || record.星_口コミの場合_口コミ.value == ''){
            var evaluation_review  = '';
        }else{
            var evaluation_review  = record.星_口コミの場合_口コミ.value;         
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
            '受付日時　　:' + receiving_time_review + '\n' + //追加20240410
            'ご利用店舗　:' + store_name + '\n' + 
            'ご来店日　　:' + visits_date_review + '\n' + 
            '来店時間　　:' + visits_time_review +'\n' + 
            'お気づきの内容:'+ '\n' + opinion_detail_review + '\n' + '\n' +
            '総合評価　　:' + evaluation_review + '\n' + 
            '漢字氏名　　:' + name_review + '\n' + '\n' + 
            '※顛末（またはA報告）についてアプリへ記入後、保存ボタンをクリックお願い致します。' + '\n' +
            '【受付1(終)】';
        }else if (record.アンケート報告書.value == '否'){
            Garoon_message =
            '【受付1(始)】' + '\n' + 
            '受付日時　　:' + receiving_time_review + '\n' + //追加20240410
            'ご利用店舗　:' + store_name + '\n' + 
            'ご来店日　　:' + visits_date_review + '\n' + 
            '来店時間　　:' + visits_time_review +'\n' + 
            'お気づきの内容:'+ '\n' + opinion_detail_review + '\n' + '\n' +
            '総合評価　　:' + evaluation_review + '\n' + 
            '漢字氏名　　:' + name_review + '\n' + '\n' + 
            '※顛末（またはA報告）についてアプリへ記入後、保存ボタンをクリックお願い致します。' + '\n' +
            '【受付1(終)】' ;
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
        if(record.記入日_ご返答内容_口コミ.value == undefined || record.記入日_ご返答内容_口コミ.value == ''){
            var reply_date_review  = '';
        }else{
          const dateTime = new Date(record.記入日_ご返答内容_口コミ.value);
          // 年月日の取得
          const year = dateTime.getFullYear();
          const month = String(dateTime.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため、1を加え、2桁に整形
          const day = String(dateTime.getDate()).padStart(2, '0'); // 日も2桁に整形

          // // 時分の取得
          // const hours = String(dateTime.getHours()).padStart(2, '0');
          // const minutes = String(dateTime.getMinutes()).padStart(2, '0');

        // フォーマットされた日時の生成
          var reply_date_review  = `${year}年${month}月${day}日`;
        }

        var Garoon_message = '';

        //記入者
        Garoon_message = 
        '【回答1(始)】' + '\n' +
        '返信内容記入者:' + reply_content_entry_person_review + '\n' +
        'ご返答内容　　:' + '\n' + reply_content_review + '\n' + '\n' +
        'ご返答日　　　:' + reply_date_review + '\n' +
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
      if(record.記入日_ご返答内容_コールセンター_2回目.value == undefined || record.記入日_ご返答内容_コールセンター_2回目.value == ''){
        var reply_time_second_time = '';
      }else{
        const dateTime = new Date(record.記入日_ご返答内容_コールセンター_2回目.value);
        // 年月日の取得
        const year = dateTime.getFullYear();
        const month = String(dateTime.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため、1を加え、2桁に整形
        const day = String(dateTime.getDate()).padStart(2, '0'); // 日も2桁に整形

        var reply_time_second_time = `${year}年${month}月${day}日`;
      }

      var Garoon_message = '';

      Garoon_message =
      '【回答2(始)】' + '\n' +
      '返答内容記入者:' + entry_person_second_time + '\n' +
      'ご返答内容　　:' + '\n' + reply_content_call_center_entry_second_time_to_guest + '\n' + '\n' +
      'ご返答日　　　:' + reply_time_second_time + '\n' +
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
      if(record.記入日_ご返答内容_コールセンター_3回目.value == undefined || record.記入日_ご返答内容_コールセンター_3回目.value == ''){
        var reply_time_third_time = '';
      }else{
        const dateTime = new Date(record.記入日_ご返答内容_コールセンター_3回目.value);
        // 年月日の取得
        const year = dateTime.getFullYear();
        const month = String(dateTime.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため、1を加え、2桁に整形
        const day = String(dateTime.getDate()).padStart(2, '0'); // 日も2桁に整形

        var reply_time_third_time = `${year}年${month}月${day}日`;

      }

      var Garoon_message = '';

      Garoon_message =
      '【回答3(始)】' + '\n' +
      '返答内容記入者:' + entry_person_third_time + '\n' +
      'ご返答内容　　:' + '\n' + reply_content_call_center_entry_third_time_to_guest + '\n' + '\n' +
      'ご返答日　　　:' + reply_time_third_time + '\n' +
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


      //冒頭文名前
      if(record.冒頭文名前.value){
        var opening_sentence_name = record.冒頭文名前.value + '　' + '様' + '\n' + '\n';
      }else{
        var opening_sentence_name = '';
      }

      //返信方法まとめ
      if(record.返信方法_まとめ.value == "電話"){
        var reply_method = "お客様は電話での対応をご希望です。" + '\n' +'\n';
      }else if(record.返信方法_まとめ.value == "メールでの返信"){
        var reply_method = "お客様はメールでの返信をご希望です。上長承認またはSV確認の上、お客様への返信文をコメントお願い致します。"+ '\n' +'\n';
      }else if(record.返信方法_まとめ.value == "返信不要"){
        var reply_method = "お客様は返答をご希望されておりませんので、ご共有をお願いいたします。"+ '\n' +'\n';
      }else {
        var reply_method = '';
      }
      //フォーム記入者まとめ
      if(record.フォーム記入者_まとめ.value && record.フォーム記入者_まとめ.value != "0"){
        var form_entry_person = record.フォーム記入者_まとめ.value;
      }else if(record.フォーム記入者_まとめ.value=="0"){
        var form_entry_person = '';
      }else{
        var form_entry_person = '';
      }

      //返信方法(メール・ネットアンケート)
      if(record.返信方法_メール_ネットアンケート.value == "メールでの返信"){
        var reply_in_email = "以下の通り、メールを返信いたしました。" + '\n' + '\n';
      }else{
        var reply_in_email = '';
      }

      //受付2回目
      if(record.受付方法.value == "メール"){
        var reception_method = 'お客様よりメールを頂きました。';
      }else if(record.受付方法.value == "ネットアンケート"){
        var reception_method = 'お客様よりネットアンケートを頂きました。';
      }
      //受付2回目
      if(record.電話_メール_口コミサイト_2回目.value == "メール"){
        var reception_method_email_second = "以下の通り、お客様よりメールを受信いたしました。" + '\n' + '\n';
      }else{
        var reception_method_email_second = '';
      }
      //回答2回目
      if(record.お客様へのご連絡方法_2回目.value == "メールでの返信"){
        var reply_in_email_two = "以下の通り、メールを返信いたしました。" + '\n' + '\n';
      }else{
        var reply_in_email_two = '';
      }
      //受付3回目
      if(record.電話_メール_口コミサイト_3回目.value == "メール"){
        var reception_method_email_third = "以下の通り、お客様よりメールを受信いたしました。" + '\n' + '\n';
      }else{
        var reception_method_email_third = '';
      }
      //回答3回目
      if(record.お客様へのご連絡方法_3回目.value == "メールでの返信"){
        var reply_in_email_third = "以下の通り、メールを返信いたしました。" + '\n' + '\n';
      }else{
        var reply_in_email_third = '';
      }

      if(record.Garoonメッセージ送信制御.value == '送信する'){
          if(record.受付方法.value == '電話'){
              //電話の場合、Garoonに送信するメッセージを作成
              if(record.お客様とのご連絡回数.value == '1回目' && record.送信1回目フラグ.value == '未送信'){
                  record.Garoon送信メッセージ内容.value = opening_sentence_name + 'お疲れ様です。' + '\n' + '\n' + 'お客様よりホットライン（電話）を頂きました。' + '内容をご確認頂き、ご対応よろしくお願い致します。'+ '\n' + '\n' + reply_method + "コールセンター" + "　" + form_entry_person + '\n' + '\n' +  first_message_call(record);
              }else if(record.お客様とのご連絡回数.value == '2回目' && record.送信3回目フラグ.value == '未送信' ){
                record.Garoon送信メッセージ内容.value = reception_method_email_second + third_message(record);
              }else if(record.お客様とのご連絡回数.value == '2回目' && record.送信4回目フラグ.value == '未送信' && record.お客様への返答内容_コールセンター記入_2回目.value){
                record.Garoon送信メッセージ内容.value = reply_in_email_two + four_message(record);
              }else if(record.お客様とのご連絡回数.value == '3回目' && record.送信5回目フラグ.value == '未送信'){
                record.Garoon送信メッセージ内容.value = reception_method_email_third + five_message(record);
              }else if(record.お客様とのご連絡回数.value == '3回目' && record.送信6回目フラグ.value == '未送信' && record.お客様への返答内容_コールセンター記入_3回目.value){
                record.Garoon送信メッセージ内容.value = reply_in_email_third + six_message(record);
              }else if(record.顛末済みフラグ.value == '未送信' && (record.総括部長コメント欄.value || record.顛末確認_部長.value == '〇')){
                record.Garoon送信メッセージ内容.value = '報告内容が承認されました。アプリからご確認ください。';
              }else if(record.報告済みフラグ.value == '未送信' && (record.AM報告欄.value || record.顛末.value[0].value.内容_顛末.value)){
                record.Garoon送信メッセージ内容.value = '顛末報告が記入されました。アプリからご確認ください。';
              }else{
                  record.Garoon送信メッセージ内容.value = '';
              }
              //消したコード： }else if((record.お客様とのご連絡回数.value == '2回目' && record.送信4回目フラグ.value == '未送信' && record.お客様への返答内容_コールセンター記入_2回目.value == undefined) || (record.お客様とのご連絡回数.value == '2回目' && record.送信4回目フラグ.value == '送信済み')){record.Garoon送信メッセージ内容.value = '';}
          }else if(record.受付方法.value == 'メール' || record.受付方法.value == 'ネットアンケート'){

              if(record.お客様とのご連絡回数.value == '1回目' && record.送信1回目フラグ.value == '未送信'){
                  record.Garoon送信メッセージ内容.value =  opening_sentence_name +'お疲れ様です。' + '\n' + '\n' + reception_method + '内容をご確認頂き、ご対応よろしくお願い致します。'+ '\n' + '\n' + reply_method + "コールセンター" + "　" + form_entry_person + '\n' + '\n' + first_message_mail(record);
              }else if(record.お客様とのご連絡回数.value == '1回目' && record.送信2回目フラグ.value == '未送信' && record.ご返信内容_メール_ネットアンケート.value){
                  record.Garoon送信メッセージ内容.value = reply_in_email + second_message_mail(record);
              }else if(record.お客様とのご連絡回数.value == '2回目' && record.送信3回目フラグ.value == '未送信'){
                record.Garoon送信メッセージ内容.value = reception_method_email_second + third_message(record);
              }else if(record.お客様とのご連絡回数.value == '2回目' && record.送信4回目フラグ.value == '未送信' && record.お客様への返答内容_コールセンター記入_2回目.value){
                record.Garoon送信メッセージ内容.value = reply_in_email_two + four_message(record);
              }else if(record.お客様とのご連絡回数.value == '3回目' && record.送信5回目フラグ.value == '未送信'){
                record.Garoon送信メッセージ内容.value = reception_method_email_third + five_message(record);
              }else if(record.お客様とのご連絡回数.value == '3回目' && record.送信6回目フラグ.value == '未送信' && record.お客様への返答内容_コールセンター記入_3回目.value){
                record.Garoon送信メッセージ内容.value = reply_in_email_third + six_message(record);
              }else if(record.顛末済みフラグ.value == '未送信' && (record.総括部長コメント欄.value || record.顛末確認_部長.value == '〇')){
                record.Garoon送信メッセージ内容.value = '報告内容が承認されました。アプリからご確認ください。';
              }else if(record.報告済みフラグ.value == '未送信' && (record.AM報告欄.value || record.顛末.value[0].value.内容_顛末.value)){
                record.Garoon送信メッセージ内容.value = '顛末報告が記入されました。アプリからご確認ください。';
              }else{
                  record.Garoon送信メッセージ内容.value = ''
              }
          }else if(record.受付方法.value == '口コミサイト'){
            if(record.お客様とのご連絡回数.value == '1回目' && record.送信1回目フラグ.value == '未送信'){
              record.Garoon送信メッセージ内容.value = opening_sentence_name + 'お疲れ様です。' + '\n' + '\n' + 'お客様よりGoogle口コミを頂きました。' + '内容をご確認頂き、ご対応よろしくお願い致します。'+ '\n' + '\n' + reply_method + "コールセンター" + "　" + form_entry_person + '\n' + '\n' + first_message_review(record);
            }else if(record.お客様とのご連絡回数.value == '1回目' && record.送信2回目フラグ.value == '未送信' && record.ご返信内容_口コミ.value){
                record.Garoon送信メッセージ内容.value = second_message_review(record);
            }else if(record.お客様とのご連絡回数.value == '2回目' && record.送信3回目フラグ.value == '未送信'){
              record.Garoon送信メッセージ内容.value = reception_method_email_second + third_message(record);
            }else if(record.お客様とのご連絡回数.value == '2回目' && record.送信4回目フラグ.value == '未送信' && record.お客様への返答内容_コールセンター記入_2回目.value){
              record.Garoon送信メッセージ内容.value = reply_in_email_two + four_message(record);
            }else if(record.お客様とのご連絡回数.value == '3回目' && record.送信5回目フラグ.value == '未送信'){
              record.Garoon送信メッセージ内容.value = reception_method_email_third + five_message(record);
            }else if(record.お客様とのご連絡回数.value == '3回目' && record.送信6回目フラグ.value == '未送信' && record.お客様への返答内容_コールセンター記入_3回目.value){
              record.Garoon送信メッセージ内容.value = reply_in_email_third + six_message(record);
            }else if(record.顛末済みフラグ.value == '未送信' && (record.総括部長コメント欄.value || record.顛末確認_部長.value == '〇')){
              record.Garoon送信メッセージ内容.value = '報告内容が承認されました。アプリからご確認ください。';
            }else if(record.報告済みフラグ.value == '未送信' && (record.AM報告欄.value || record.顛末.value[0].value.内容_顛末.value)){
              record.Garoon送信メッセージ内容.value = '顛末報告が記入されました。アプリからご確認ください。';
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
