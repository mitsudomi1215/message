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
          url: 'https://lg6o0hese56a.cybozu.com/g/cbpapi/message/api.csp',//お試し版URL【変更】
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
            url: 'https://lg6o0hese56a.cybozu.com/g/cbpapi/message/api.csp',//お試し版URL【変更】
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
    
    //ワークフロー時のメッセージ送信処理
    kintone.events.on(['app.record.detail.process.proceed'], async (event) => {
      let rec = event.record;
      //お試し版URL【変更】
      const kntAppURL = 'https://lg6o0hese56a.cybozu.com/k/8/';
      //URLを作成
      let URL =  kntAppURL + 'show#record=' + rec.$id.value;
      //ユーザー情報を格納する変数
      let userCodes = [];
      //FCのユーザー情報を編集する変数
      let userCodes_fc = [];
      //宛先まとめる処理-----------------------------------
      // ユーザー選択のコードを変数に代入
      if(rec.コールセンター上長.value.length !== 0){
        let top_userfield = rec.コールセンター上長.value;
        userCodes.push(top_userfield[0]['code']);
      }
      if(rec.AM.value.length !== 0){
        let userfield = rec.AM.value;
        userCodes.push(userfield[0]['code']);
      }
      if(rec.部長.value.length !== 0){
        let userfield1 = rec.部長.value;
        userCodes.push(userfield1[0]['code']);
      }
      if(rec.本部長.value.length !== 0){
        let userfield2 = rec.本部長.value;
        userCodes.push(userfield2[0]['code']);
      }
      //---------------------------------------------------
      if (event.nextStatus.value == '【申請】コールセンター') {
        if(event.action.value == '申請'){
          // IDの場合は右のように指定、rec.$id.value
            const content =rec.店名.value + "【kintone】" + rec.$id.value;
            console.warn("申請処理起動");
              performCommonAction('申請', userCodes , content , URL)
              .then(function(){
                send_content_update(rec);
              });
              
            // for (const code of userCodes_fc) {
            //   await performCommonAction_fc('申請', code , content , URL);
            // }
        }else if(event.action.value == '差戻し'){
            const content ="【kintone】"+"アンケートアプリの申請が拒否されました";
            for (const code of userCodes) {
              await performCommonAction('申請', code , content , URL);
            }
        }
      } else if (event.nextStatus.value === '【確認】コールセンター上長_直営店') {
        //URLの文章を変更
        let body = rec.コメント.value + "【コールセンター】";
          // IDの場合は右のように指定、rec.$id.value
          const content =rec.店名.value + "【kintone】" + rec.$id.value;
          await performCommonAction('完了', userCodes , content , body);
          //メッセージ検索に関する処理
          await GaroonMessageUpdateDelete();

      }
      return event;
    });

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

    //Garoon送信メッセージ
    var send_body = '店番:' + rec.店番.value + '\n' +'店名:' + rec.店名.value + '\n' + 'コメント:' + rec.コメント.value;


    const body = {
      app: kintone.app.getId(),
      id: kintone.app.record.getId(),
      record: {
        Garoon送信メッセージ内容: {
          value: send_body,
        },
        Garoon送信履歴: {
          value: send_history,
        },
      },
    };

    // フィールドの値を更新する
    return kintone.api(
      kintone.api.url("/k/v1/record.json", true), "PUT", body, (resp) => {
        // 更新できたらリロード
        location.reload();
      }
    );
  }

//以下、Garoonのリンク作成 + Garoonメッセージ送信ボタン
  kintone.events.on(['app.record.detail.show'], async (event) => {
    let record = event.record;

    //////////////////////////////////////////////////////////////////////
    //詳細画面でGaroonのリンクを作成する処理
    //////////////////////////////////////////////////////////////////////
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
        const getRequestToken = async() => {
            try {
            const response = await $.ajax({
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
        const GaroonCreateLink = async (record) => {
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
                    url: 'https://lg6o0hese56a.cybozu.com/g/cbpapi/message/api.csp',
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
                                    record.コメント.value = "コメント";
                                    
                                    // record.Garoonリンク.value = "https://io8f1l5axfqn.cybozu.com/g/message/view.csp?mid=" + subjectGet + "&module_id=grn.message&br=1";
                                    let GaroonLink = "https://lg6o0hese56a.cybozu.com/g/message/view.csp?mid=" + subjectGet + "&module_id=grn.message&br=1";
                                    
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
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //メッセージ送信処理
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //ログインユーザーの情報を取得
    var login_user = kintone.getLoginUser();
    if (login_user['id'] == 1) {
      var myIndexButtonContainer = document.getElementById('my_index_button_container');
      if (!myIndexButtonContainer) {
        // メニューの上側の空白部分にボタンと文字を設置するコンテナを作成
        const myIndexButtonContainer = document.createElement('div');
        myIndexButtonContainer.id = 'my_index_button_container';
    
        // ボタンを作成
        const myIndexButton = document.createElement('button');
        myIndexButton.id = 'my_index_button';
        myIndexButton.innerText = 'Garoonにメッセージ送信';
        myIndexButton.onclick = () => {
          window.alert('Garoonにメッセージ送信');
          let rec = event.record;
          // お試し版URL【変更】
          const kntAppURL = 'https://lg6o0hese56a.cybozu.com/k/8/';
          // URLを作成
          let URL = kntAppURL + 'show#record=' + rec.$id.value;
          // ユーザー情報を格納する変数
          let userCodes = [];
          // FCのユーザー情報を編集する変数
          let userCodes_fc = [];
          // 宛先まとめる処理-----------------------------------
          // ユーザー選択のコードを変数に代入
          if (rec.コールセンター上長.value.length != 0) {
            let top_userfield = rec.コールセンター上長.value;
            userCodes.push(top_userfield[0]['code']);
          }
          if (rec.AM.value.length != 0) {
            let userfield = rec.AM.value;
            userCodes.push(userfield[0]['code']);
          }
          if (rec.部長.value.length != 0) {
            let userfield1 = rec.部長.value;
            userCodes.push(userfield1[0]['code']);
          }
          if (rec.本部長.value.length != 0) {
            let userfield2 = rec.本部長.value;
            userCodes.push(userfield2[0]['code']);
          }
          // IDの場合は右のように指定、rec.$id.value
          const content = rec.店名.value + "【kintone】" + rec.$id.value;
          performCommonAction('申請', userCodes, content, rec.コメント.value)
            .then(function () {
              GaroonMessageUpdateDelete();
              send_content_update(rec);
            })
        };
    
        // 文字を作成
        // 改行で文字列を分割し、配列に変換
        if(record.Garoon送信履歴.value != ''){
          const dateArray =  record.Garoon送信履歴.value.split('\n');
        }else{
          const dateArray =  record.Garoon送信履歴.value;
        }
        const dateArray =  record.Garoon送信履歴.value.split('\n');

        // 一番下の行を取得
        const lastDateString = dateArray[dateArray.length - 1];

        //Garoonメッセージ送信ボタンの横に最終更新日を表示
        const adjacentText = document.createTextNode('  最終送信日時:' + lastDateString);
    
        // ボタンと文字をコンテナに追加
        myIndexButtonContainer.appendChild(myIndexButton);
        myIndexButtonContainer.appendChild(adjacentText);
    
        // コンテナをドキュメントに追加
        kintone.app.record.getHeaderMenuSpaceElement().appendChild(myIndexButtonContainer);
      }
    }        
  });

///////////////////////////////////////////////////////////////////////////////////////////////////////
//新規画面で保存ボタンを押したとき、メッセージを送信する処理
//////////////////////////////////////////////////////////////////////////////////////////////////////
kintone.events.on(['app.record.edit.submit.success'], async (event) => {
  let record = event.record;
  console.warn("新規追加保存後のデータ",record);

});

////////////////////////////////////////////////////////////////////////////////////////////////////
//編集画面で保存ボタンを押したとき、メッセージを送信する処理
////////////////////////////////////////////////////////////////////////////////////////////////////
kintone.events.on(['app.record.edit.submit.success'], async (event) => {
  let record = event.record;
  // record.コメント.value = "コメントを変更できました。";

  // 文字を作成
  // 改行で文字列を分割し、配列に変換
  if(record.Garoon送信履歴.value != ''){
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

    //お試し版URL【変更】
    const kntAppURL = 'https://lg6o0hese56a.cybozu.com/k/8/';
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
          const params = {
            app: event.appId,		// アプリID
            id: event.recordId,			// レコードID
            record: {		// レコード情報
              コメント: { 
                value: 'コメントの変更ができたよ'
              },
              区分2: {
                value: 'A報請求済中'
              }
            }
          };
          kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', params).then((resp) => {
            // PUT成功
            return event;
          })
          location.reload();
        }
      );

  
      
  }

  return event;
});
//編集画面でフィールドを編集した際に、Garoonメッセージ送信内容を作り変える。

kintone.events.on([
  'app.record.edit.change.店番',
  'app.record.edit.change.店名',
], event => {
  const record = event.record;

  console.warn("発生日時",record.発生日時.value);
  record.Garoon送信メッセージ内容.value = '店番:' + record.店番.value + '\n' +'店名:' + record.店名.value + '\n' + 'コメント:' + record.コメント.value;

  return event;
});

// 処理が終わった後に画面遷移する処理
function redirectToNewPage(URL) {
  // 画面遷移（例: Googleのトップページにリダイレクト）
  window.location.href = URL;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
//Garoonのメッセージを検索➝更新➝削除する処理
////////////////////////////////////////////////////////////////////////////////////////////////////
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
  const GaroonMessageUpdateDelete = async () => {
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
            url: 'https://lg6o0hese56a.cybozu.com/g/cbpapi/message/api.csp',
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

                  //最新メッセージのID
                  let finalArray = subjectThreadIds[subject][subjectThreadIds[subject].length - 1];

                  //最終メッセージの情報を取得
                  let FinalTargetThread = threadsArray.find(thread => thread.getAttribute('id') == finalArray);

                  //1通目のDocumentオブジェクトを得る
                  const FinalXMLparser = new DOMParser();
                  const FinalXMLparserxmlDoc = FinalXMLparser.parseFromString(FinalTargetThread.outerHTML, "application/xml");
                  
                  // 名前空間を指定してaddresseeタグのユーザーIDを抜き取る
                  const addresseeElements = FinalXMLparserxmlDoc.getElementsByTagName('th:addressee');
                  const addresseeUserIds = Array.from(addresseeElements).map(addressee => addressee.getAttribute('user_id'));

                  // subjectタグ情報を抜き取る
                  const threadElementGet= FirstXMLparserxmlDoc.getElementsByTagName('thread');
                  const subjectGet = Array.from(threadElementGet).map(thread => thread.getAttribute('subject'));

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
                      newArray.push(bodyContent);
                    }
                  });

                    // newArrayを1つの文字列にまとめる
                    let resultString = '';

                    for (let i = 0; i < newArray.length; i++) {
                      resultString += newArray[i];
                      
                      // 最後の要素でない場合、改行と "-----------" を追加
                      if (i < newArray.length - 1) {
                        resultString += '\n';
                      }
                    }

                    //メッセージ更新処理
                    MessageUpdate(firstID,resultString,subjectGet,addresseeUserIds);

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

  //---------------------------------------------------------------------------------------------------------------------------------
  //更新処理
  //---------------------------------------------------------------------------------------------------------------------------------
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
        url: 'https://lg6o0hese56a.cybozu.com/g/cbpapi/message/api.csp',
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

  //---------------------------------------------------------------------------------------------------------------------------------
  //メッセージ削除処理
  //---------------------------------------------------------------------------------------------------------------------------------
   /**
   * 共通SOAPコンテンツ
   * ${XXXX}の箇所は実施処理等に合わせて置換して使用
   */
        const SOAP_DELETE_TEMPLATE =
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">' +
        '<soap:Header>' +
        '<Action>${ACTION}</Action>' + // この行を修正
        '<Security>' +
        '<UsernameToken>' +
        '<Username>光富</Username>' +
        '<Password>km081215</Password>' +
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
        '<param xmlns="" folder_id="2" thread_id="${DELETE_ID}"></param>' +
        '</parameters>' +
        '</MessageRemoveThreads>' +
        '</soap:Body>' +
        '</soap:Envelope>';
          
    //メッセージ実行の共通処理(ユーザーフィールド)
    const MessageDelete = async (delete_id) => {
      try {
        //リクエストのテンプレート
        let msgDeleteRequest = SOAP_DELETE_TEMPLATE;
        //削除するIDを置換
        msgDeleteRequest = msgDeleteRequest.replace('${DELETE_ID}', delete_id );
  
        // 実行処理を指定
        msgDeleteRequest = msgDeleteRequest.split('${ACTION}').join('MessageRemoveThreads');
  
        // メッセージ登録の実行
        await $.ajax({
          type: 'post',
          url: 'https://lg6o0hese56a.cybozu.com/g/cbpapi/message/api.csp',//お試し版URL【変更】
          cache: false,
          data: msgDeleteRequest,
        }).then(function(responseData) {
          // console.warn("削除に成功"); // レスポンスデータをコンソールに表示
        });
      } catch (error) {
        console.error("エラーが発生しました:", error);
      }
    };
})(jQuery.noConflict(true));
