
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
  const getRequestToken = function() {
    const defer = $.Deferred();

    // リクエストトークンの取得
    let request = SOAP_TEMPLATE;
    request = request.replace('${PARAMETERS}', '<parameters></parameters>');
    request = request.split('${ACTION}').join('UtilGetRequestToken');
    
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
      url: 'https://io8f1l5axfqn.cybozu.com/g/cbpapi/message/api.csp',
      cache: false,
      async: false,
      data: msgSearchRequest,
    }).then(function(responseData) {
      // 検索結果をXMLからテキストに変換
let responseText = new XMLSerializer().serializeToString(responseData);
      console.warn("検索結果です。" + responseText); // レスポンスデータをコンソールに表示
// ----------------------------------------------------------------------------------------------------------------------

// XML文字列をXMLドキュメントに変換
let parser = new DOMParser();
let xmlDoc = parser.parseFromString(responseText, "text/xml");

// thread要素のリストを取得
let threads = xmlDoc.querySelectorAll('thread');
// console.warn("threadsの中身",threads);

// subjectごとのthreadのIDを保持するオブジェクト
let subjectThreadIds = {};
// 同じsubjectを持つthreadのIDを配列に追加
threads.forEach(thread => {
  let subject = thread.getAttribute('subject');
  let threadId = thread.getAttribute('id');

  if (!subjectThreadIds[subject]) {
    subjectThreadIds[subject] = [];
  }

  subjectThreadIds[subject].push(threadId);
});

// 重複するIDを削除
Object.keys(subjectThreadIds).forEach(subject => {
  subjectThreadIds[subject] = [...new Set(subjectThreadIds[subject])];
});

// subjectThreadIdsの連想配列内の配列のIDを昇順にソート
Object.keys(subjectThreadIds).forEach(subject => {
  subjectThreadIds[subject].sort((a, b) => a - b);
});


//------------------------------------------------------------------------------------------------------------------------

let threadsArray = Array.from(threads);

let newArray = [];

Object.keys(subjectThreadIds).forEach(subject => {
  if (subjectThreadIds[subject].length >= 2) {
      let firstID = subjectThreadIds[subject][0];
      subjectThreadIds[subject].forEach(id => {

        // IDが一致するスレッドを取得
        let targetThread = threadsArray.find(thread => thread.getAttribute('id') == id);
        // XML文字列を解析してDocumentオブジェクトを得る
        let XMLparser = new DOMParser();
        let xmlDocResult = XMLparser.parseFromString(targetThread.outerHTML, "application/xml");

        // th:content要素を取得
        let contentElement = xmlDocResult.querySelector('content');

        // th:contentのbody属性の内容を取得
        let bodyContent = contentElement ? contentElement.getAttribute('body') : null;

        if (bodyContent) {
          newArray.push(bodyContent);
        }
      });

      // newArrayを1つの文字列にまとめる
      let resultString = newArray.join(',');
      console.warn("なんで～",resultString);

      // 改行と-------------------------を追加
      resultString = resultString.replace(/,/g, ',\n--------------------------------------------------\n');

      // 出力
      console.warn("りり\n" + resultString);


      //以下に更新処理を記入する
          console.warn("更新するべきIDはこれです。",firstID);
          console.warn("更新したい本文はこれです。",resultString);
          let index = subjectThreadIds[subject].indexOf(firstID);
          if (index !== -1) {
          subjectThreadIds[subject].splice(index, 1);
          }
      //以下に削除処理を記入する
          console.warn("削除するべきIDはこれです。",subjectThreadIds[subject]);

  }
});
//---------------------------------------------------------------------------------------------------------------------
    });
    } catch (error) {
      console.error("エラーが発生しました:", error);
    }
  };

  //
  performCommonAction();
    
})(jQuery.noConflict(true));