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
        url: 'https://io8f1l5axfqn.cybozu.com/g/cbpapi/message/api.csp',//お試し版URL【変更】
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

    //メッセージ実行の共通処理(特約店ユーザー)
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
          url: 'https://io8f1l5axfqn.cybozu.com/g/cbpapi/message/api.csp',//お試し版URL【変更】
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
  
  //実行の条件分岐
  kintone.events.on(['app.record.detail.process.proceed'], async (event) => {

    let rec = event.record;

    //お試し版URL【変更】
    const kntAppURL = 'https://io8f1l5axfqn.cybozu.com/k/8/';

    //本文(bodyはフィールドコード)
    let URL =  kntAppURL + 'show#record=' + rec.$id.value;

    //ユーザー情報を格納する
    let userCodes = [];

    let userCodes_fc = [];

    if(event.nextStatus.value === '未処理'){
      
      if(event.action.value == '完了'){
        //コールセンターのコードを変数に代入
        let call_center = rec.コールセンター.value;
        userCodes.push(call_center[0]['code']);

        const content ="【kintone】"+"フローが全て完了しました。";

        for (const code of userCodes) {
          await performCommonAction('完了', code , content , URL);
        }

      } else if(event.action.value == '差戻し'){

        //コールセンターのコードを変数に代入
        let call_center = rec.コールセンター.value;
        userCodes.push(call_center[0]['code']);

        const content ="【kintone】"+"アンケートアプリのコールセンター上長から差戻しされました。";

        for (const code of userCodes) {
          await performCommonAction('申請', code , content , URL);
        }
      } 

    } else if (event.nextStatus.value == '【申請】コールセンター') {

      // ユーザー選択のコードを変数に代入
      let top_userfield = rec.コールセンター上長.value;
      userCodes.push(top_userfield[0]['code']);

      let userfield = rec.AM.value;
      userCodes.push(userfield[0]['code']);

      let userfield1 = rec.部長.value;
      userCodes.push(userfield1[0]['code']);

      let userfield2 = rec.本部長.value;
      userCodes.push(userfield2[0]['code']);

      if(event.action.value == '申請'){
        
        //URLの文章を変更
        let body = URL+'\n\n'+ rec.Garoon貼付用.value;

        // IDの場合は右のように指定、rec.$id.value
          const content =rec.店名.value + "【kintone】" + rec.$id.value;
            await performCommonAction('申請', userCodes , content , body);

            // setTimeout(function(){
            //   GaroonCreateLink(rec);
            // },1000);

          // for (const code of userCodes_fc) {
          //   await performCommonAction_fc('申請', code , content , URL);
          // }

      }else if(event.action.value == '差戻し'){
          const content ="【kintone】"+"アンケートアプリの申請が拒否されました";
          for (const code of userCodes) {
            await performCommonAction('申請', code , content , URL);
          }
      }
/////////////////////////////////////////////////////////////////////////////////////////////////////////
    } else if (event.nextStatus.value === '【確認】コールセンター上長_直営店') {


      // ユーザー選択のコードを変数に代入
      let top_userfield = rec.コールセンター上長.value;
      userCodes.push(top_userfield[0]['code']);

      let userfield = rec.AM.value;
      userCodes.push(userfield[0]['code']);

      let userfield1 = rec.部長.value;
      userCodes.push(userfield1[0]['code']);

      let userfield2 = rec.本部長.value;
      userCodes.push(userfield2[0]['code']);

      //URLの文章を変更
      let body = rec.コメント.value + "【コールセンター】";

        // IDの場合は右のように指定、rec.$id.value
        const content =rec.店名.value + "【kintone】" + rec.$id.value;

        await performCommonAction('完了', userCodes , content , body);
/////////////////////////////////////////////////////////////////////////////////////////////////////////
    } else if(event.nextStatus.value === '【申請中】店長'){

      //部長のコードを変数に代入
      let manager = rec.部長.value;
      userCodes.push(manager[0]['code']);
      //本部長のコードを変数に代入
      let chief = rec.本部長.value;
      userCodes.push(chief[0]['code']);

      const content ="【kintone】"+"アンケートアプリの申請が届いています";

      for (const code of userCodes) {
        await performCommonAction('完了', code , content , URL);
      }

////////////////////////////////////////////////////////////////////////////////////////////////////////
    } else if(event.nextStatus.value === '【確認済み】上長確認'){

      //コールセンターのコードを変数に代入
      let call_center = rec.コールセンター.value;
      userCodes.push(call_center[0]['code']);

      const content ="【kintone】"+"アンケートアプリの承認がおりました";

      for (const code of userCodes) {
        await performCommonAction('完了', code , content , URL);
      }
/////////////////////////////////////////////////////////////////////////////////////////////////////////
    } else if(event.nextStatus.value === '【メール送信前確認】コールセンター'){
        //コールセンター上長のコードを変数に代入
        let call_center_chief = rec.コールセンター上長.value;
        userCodes.push(call_center_chief[0]['code']);

        const content ="【kintone】"+"アンケートアプリのメール送信前申請が届きました";

      for (const code of userCodes) {
        await performCommonAction('完了', code , content , URL);
      }
/////////////////////////////////////////////////////////////////////////////////////////////////////////
    } 
  });

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////]
//Garoonのリンクを取得
//実行の条件分岐
kintone.events.on(['app.record.detail.show'], async (event) => {
  let record = event.record;
      console.warn("処理開始");
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
          '<parameters text="kintone" start="2010-07-01T00:00:00Z" end="2023-12-31T00:00:00Z" search_sub_folders="true" title_search="true" body_search="false" from_search="false" addressee_search="false" follow_search="false">' +
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
          const getRequestToken = async () => {
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
                      url: 'https://io8f1l5axfqn.cybozu.com/g/cbpapi/message/api.csp',
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
                          console.warn("subjectがnullまたはundefinedです");
                          }
                      });
                          console.warn("これを見たかった",subjectThreadIds);

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

                              
                              console.warn("key", key, "subject", subject);

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

                                  console.warn("ここまでは来て言うr","key", key, "subject", subject, "レコードID", record.$id.value, "subjectGetのげ", subjectGet);

                                  if (key == record.$id.value) {
                                      record.コメント.value = "コメント";
                                      console.warn("入ってる？");
                                      // record.Garoonリンク.value = "https://io8f1l5axfqn.cybozu.com/g/message/view.csp?mid=" + subjectGet + "&module_id=grn.message&br=1";
                                      let GaroonLink = "https://io8f1l5axfqn.cybozu.com/g/message/view.csp?mid=" + subjectGet + "&module_id=grn.message&br=1";
                                      console.warn("入ってるよ", "https://io8f1l5axfqn.cybozu.com/g/message/view.csp?mid=" + subjectGet + "&module_id=grn.message&br=1");

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
                                      console.warn("recです", record);
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
          
          
      
});

})(jQuery.noConflict(true));
