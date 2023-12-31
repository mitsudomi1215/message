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
              '<addressee user_id="${USER_ID}" name="dummy" deleted="false"></addressee> '+
              '<content body="${MAIN_TEXT}"></content> '+
            ' <folder user_id="dammy"></folder> '+
          ' </thread> '+
        ' </create_thread> '+
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

  //メッセージ実行の共通処理
  const performCommonAction = async (action, code, content , URL ) => {
    try {
      let targetUser = await fetchGaroonUserByCode(code);
      let requestToken = await getRequestToken();
  
      // 送信するメッセージパラメータを作成
      let msgAddParam = MSG_ADD_TEMPLATE;
      msgAddParam = msgAddParam.replace('${REQUEST_TOKEN}', escapeHtml(requestToken));
      msgAddParam = msgAddParam.replace('${TITTLE}', content);
      msgAddParam = msgAddParam.replace('${USER_ID}', targetUser.id); // targetUserのidを使用
      msgAddParam = msgAddParam.replace('${MAIN_TEXT}', URL); 
  
      let msgAddRequest = SOAP_TEMPLATE;
      // SOAPパラメータを完成させる
      msgAddRequest = msgAddRequest.replace('${PARAMETERS}', msgAddParam);
      // 実行処理を指定
      msgAddRequest = msgAddRequest.split('${ACTION}').join('MessageCreateThreads');
  console.log(msgAddRequest);
      // メッセージ登録の実行
      await $.ajax({
        type: 'post',
        url: 'https://enl8jdyuceyz.cybozu.com/g/cbpapi/message/api.csp',
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

    const kntAppURL = 'https://enl8jdyuceyz.cybozu.com/k/6/';

    //本文(bodyはフィールドコード)
    let URL =  kntAppURL + 'show#record=' + rec.$id.value;

    //ユーザー情報を格納する
    let userCodes = [];

    if(event.action.value === '処理開始'){

    } else if (event.action.value === '申請') {
      
      //ユーザー選択のコードを変数に代入
      let top_userfield = rec.上長ユーザー選択.value;
      userCodes.push(top_userfield[0]['code']);
      const content ="【kintone】"+"申請が届いています";

      for (const code of userCodes) {
        await performCommonAction('申請', code , content , URL);
      }

    } else if (event.action.value === '完了') {
      //ユーザー選択のコードを変数に代入
      let userfield = rec.ユーザー選択.value;
      userCodes.push(userfield[0]['code']);
      //AMのコードを変数に代入
      let top_userfield = rec.AMユーザー選択.value;
      userCodes.push(top_userfield[0]['code']);

      const content ="【kintone】"+"完了";

      for (const code of userCodes) {
        await performCommonAction('完了', code , content , URL);
      }
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

})(jQuery.noConflict(true));