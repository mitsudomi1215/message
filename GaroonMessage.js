
(function($) {
    'use strict';

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
  const performCommonAction = async () => {
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
                  console.warn("検索結果です。" + responseText); // レスポンスデータをコンソールに表示

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

                  // 名前空間を指定してaddresseeタグのユーザーIDを抜き取る
                  const addresseeElements = FirstXMLparserxmlDoc.getElementsByTagName('th:addressee');
                  const addresseeUserIds = Array.from(addresseeElements).map(addressee => addressee.getAttribute('user_id'));


                  // 名前空間を指定してaddresseeタグのユーザーIDを抜き取る
                  const threadElementGet= FirstXMLparserxmlDoc.getElementsByTagName('thread');
                  const subjectGet = Array.from(threadElementGet).map(thread => thread.getAttribute('subject'));
                    //タイトルごとに繰り返し
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
        console.warn("更新に成功",responseData); // レスポンスデータをコンソールに表示
      });

    } catch (error) {
      console.error("エラーが発生しました:", error);
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
          console.warn(responseData); // レスポンスデータをコンソールに表示
        });
      } catch (error) {
        console.error("エラーが発生しました:", error);
      }
    };

  //メッセージ検索に関する処理
  performCommonAction();
    
})(jQuery.noConflict(true));