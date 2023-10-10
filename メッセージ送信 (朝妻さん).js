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
    '<thread id="dummy" version="dummy" subject="朝妻テスト" confirm="false"> '+
      '<addressee user_id="3" name="dummy" deleted="false"></addressee> '+
      '<content body="${MAIN_TEXT}"></content> '+
     ' <folder id="dummy"></folder> '+
   ' </thread> '+
 ' </create_thread> '+
'</parameters>';

  /**
   * メッセージ送信先パラメータテンプレート
   * ${XXXX}の箇所は入力値等で置換して使用
   */
  const ADDRESSEE_TEMPLATE =
        '<addressee user_id="${USER_ID}" name="dummy" deleted="false"></addressee>';

  /**
   * ファイル定義
   * ${XXXX}の箇所は入力値等で置換して使用
   */
  const FILE_DEF_TEMPLATE =
        '<file id="${INDEX}" name="${FILE_NAME}" mime_type="${FILE_MIME_TYPE}"></file>';

  /**
   * ファイルコンテンツ
   * ${XXXX}の箇所は入力値等で置換して使用
   */
  const FILE_CONTENT_TEMPLATE =
        '<file xmlns="" id="${INDEX}">' +
          '<content xmlns="">${FILE_CONTENT}</content>' +
        '</file>';


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

  // ワークフロー承認イベントで起動する
  // 申請内容をメッセージに登録する
//  garoon.events.on('workflow.request.approve.submit.success', (event) => {

    kintone.events.on('app.record.edit.submit', (event) => {
        // 申請内容を取得する
        const request = event.request;


        getRequestToken().then((requestToken) => {
            console.log(requestToken);
          // 送信するメッセージパラメータを作成
          let msgAddParam = MSG_ADD_TEMPLATE;
          msgAddParam = msgAddParam.replace('${REQUEST_TOKEN}', escapeHtml(requestToken));
          msgAddParam = msgAddParam.replace('${REQUEST_TOKEN}', escapeHtml(requestToken));
          msgAddParam = msgAddParam.replace('${MAIN_TEXT}', '本文テスト１１１');


          let msgAddRequest = SOAP_TEMPLATE;
          // SOAPパラメータを完成させる
          msgAddRequest = msgAddRequest.replace('${PARAMETERS}', msgAddParam);
          // 実行処理を指定
          msgAddRequest = msgAddRequest.split('${ACTION}').join('MessageCreateThreads');
          //msgAddRequest = msgAddRequest.replace('${CREATED}', luxon.DateTime.utc().startOf('second').toISO({suppressMilliseconds: true}));

          //console.log(msgAddRequest);
            // メッセージ登録の実行
            $.ajax({
            type: 'post',
            url: 'https://fuhhlvvugx3f.cybozu.com/g/cbpapi/message/api.csp',
            cache: false,
            async: false,
            data: msgAddRequest
            });
        });


    });

    const code = "asazuma";
   
    const fetchGaroonUserByCode = async (code) => {
      const response = await fetch("/g/api/v1/base/users?name=" + code, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });
      const body = await response.json();
      console.log(body);
      const targetUser = body.users.filter((user) => user.code === code)[0];
      console.log(targetUser);
    return targetUser;

    };
    const targetUser = fetchGaroonUserByCode(code);


})(jQuery.noConflict(true));