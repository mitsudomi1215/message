
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
     * ${XXXX}の箇所は入力値等で置換して使用   version="1702277220"
     */
    const MSG_ADD_TEMPLATE =
    '<parameters> '+
    '<request_token>${REQUEST_TOKEN}</request_token>' +
    '<modify_thread> '+
      '<thread id="7"version="dummy" subject="テスト成功" confirm="false"> '+
        '<addressee user_id="4" name="dummy" deleted="false"></addressee>' +
        '<addressee user_id="5" name="dummy" deleted="false"></addressee>' +
        '<addressee user_id="2" name="dummy" deleted="false"></addressee>' +
        '<addressee user_id="7" name="dummy" deleted="false"></addressee>' +
        '<content body="機能に失敗しました。"></content>  '+
      ' <folder id="dammy"></folder> '+
    ' </thread> '+
  ' </modify_thread> '+
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

      // let targetUser = await fetchGaroonUserByCode(code);
      let requestToken = await getRequestToken();

      // 送信するメッセージパラメータを作成
      let msgAddParam = MSG_ADD_TEMPLATE;
      msgAddParam = msgAddParam.replace('${REQUEST_TOKEN}', escapeHtml(requestToken));
  
      let msgAddRequest = SOAP_TEMPLATE;
      // SOAPパラメータを完成させる
      msgAddRequest = msgAddRequest.replace('${PARAMETERS}', msgAddParam);

      // 実行処理を指定
      // 実行処理を指定
      msgAddRequest = msgAddRequest.split('${ACTION}').join('MessageModifyThreads');
      msgAddRequest = msgAddRequest.replace('<${ACTION}>', '<MessageModifyThreads>');
      msgAddRequest = msgAddRequest.replace('</${ACTION}>', '</MessageModifyThreads>');


      // メッセージ登録の実行
      await $.ajax({
        type: 'post',
        url: 'https://io8f1l5axfqn.cybozu.com/g/cbpapi/message/api.csp',//お試し版URL【変更】
        cache: false,
        async: false,
        data: msgAddRequest,
      }).then(function(responseData) {
        console.warn("メッセージの更新に成功したよ",responseData); // レスポンスデータをコンソールに表示
      });
    } catch (error) {
      console.error("エラーが発生しました:", error);
    }
  };

  performCommonAction();

})(jQuery.noConflict(true));