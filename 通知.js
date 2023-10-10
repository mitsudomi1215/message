/*
* Notify Garoon Sample Program
* Copyright (c) 2018 Cybozu
*
* Licensed under the MIT License
* https://opensource.org/licenses/mit-license.php
*/

(function($) {
    'use strict';
    // Garoon で設定した外部通知コード
    var grnNoticeCode = 'kintonedailyreport';
    // 通知を送信するユーザーのログイン名を取得する処理
    // var grnNoticeUser = ['光富一輝'];

    // kintone のアプリの URL
    var kntAppURL = 'https://enl8jdyuceyz.cybozu.com/k/6/';
  
    // SOAP の XML のヘッダー部分を作成する
    var makeXMLHeader = function(service, action) {
  
      var xmlns;
      if (service === 'schedule') {
        xmlns = 'schedule_services="http://wsdl.cybozu.co.jp/schedule/2008"';
      } else {
        return null;
      }
      return '<?xml version="1.0" encoding="UTF-8"?>' +
                  '<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://www.w3.org/2003/05/soap-envelope" ' +
                      'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' +
                      'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
                      'xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" ' +
                      'xmlns:' + xmlns + '>' +
                  '<SOAP-ENV:Header>' +
                      '<Action SOAP-ENV:mustUnderstand="1" ' +
                          'xmlns="http://schemas.xmlsoap.org/ws/2003/03/addressing">' + action + '</Action>' +
                      '<Timestamp SOAP-ENV:mustUnderstand="1" Id="id" ' +
                          'xmlns="http://schemas.xmlsoap.org/ws/2002/07/utility">' +
                          '<Created>2037-08-12T14:45:00Z</Created>' +
                          '<Expires>2037-08-12T14:45:00Z</Expires>' +
                      '</Timestamp>' +
                      '<Locale>jp</Locale>' +
                  '</SOAP-ENV:Header>';
  
    };
  
    // ajax を実行する
    var runajax = function(url, method, dtype, sendobj, callback) {
  
      var objajax = {type: method, url: url};
      var headers = {'X-Requested-With': 'XMLHttpRequest'};
  
      // データを xml 形式で送信する場合
      if (dtype === 'xml') {
  
        headers['Content-Type'] = 'text/xml; charset=UTF-8';
        objajax.data = sendobj;
  
        // データを json 形式で送信する場合
      } else if (dtype === 'json') {
  
        headers['Content-Type'] = 'application/json';
        objajax.contentType = 'application/json';
        objajax.data = JSON.stringify(sendobj);
        objajax.dataType = 'json';
  
      }
  
      objajax.headers = headers;
  
      // ajax を実行
      return $.ajax(
        objajax
      );
  
    };
  
    // Garoon に通知を送信
    var sendNotice = function(rec, token,ev) {

      //送信するユーザーを格納する配列
      var grnNoticeUser = [];

      var message = [];

      //送信するユーザー
      if(ev.action.value == "申請"){

        var userfield = rec.ユーザー選択.value;

        //通知メッセ―ジ
        message = "申請されました";
        
        //ＡＭに通知を送信
        grnNoticeUser.push(userfield[0]['code']);
    

      }else if(ev.action.value == "完了"){

        var userfield = rec.ユーザー選択.value;
        var top_userfield = rec.AMユーザー選択.value;

        message = "ワークフローが完了しました";
        
        //ユーザーと上長に通知を送信
        grnNoticeUser.push(userfield[0]['code']);
        grnNoticeUser.push(top_userfield[0]['code']);
        
    
      }

      var arydest = [];
  
      // 通知の送信先を配列にまとめる
      for (var i = 0; i < grnNoticeUser.length; i += 1) {
        arydest.push({'type': 'USER', 'code': grnNoticeUser[i]});
      }

      // 送信する通知の情報
      var sendobj = {
        // リクエストトークン
        '__REQUEST_TOKEN__': token,
        // Garoon で設定した外部通知コード
        'app': grnNoticeCode,
        // 通知のキー(他のレコードと重複しないこと)
        'notificationKey': kntAppURL + rec.$id.value,
        // kintone のレコードの URL
        'url': kntAppURL + 'show#record=' + rec.$id.value,
        // 通知のモード 「add: 追加, modify: 変更, remove: 削除」
        'operation': 'add',
        // 通知のタイトル ※レコードのタイトルを出力
        'title': rec.title.value,
        // 通知の本文 ※レコードの本文を出力
        'body': message,
        // 'body': rec.body.value,
        // 通知のアイコン
        'icon': 'https://static.cybozu.com/contents/k/image/icon/app/flash.png',
        // 通知の送信先
        'destinations': arydest
      };
  
      // 通知を送信
      return runajax('/g/api/v1/notification/items', 'POST', 'json', sendobj).then(function(resp) {
        return resp;
      }).catch(function(err) {
        return err;
      });
  
    };
  
    // Garoon のリクエストトークンを取得する
    var getRequestToken = function() {
  
      var xml = makeXMLHeader('schedule', 'UtilGetRequestToken') +
                    '<SOAP-ENV:Body>' +
                      '<UtilGetRequestToken></UtilGetRequestToken>' +
                    '</SOAP-ENV:Body>' +
                    '</SOAP-ENV:Envelope>',
        $resp, token;
  
      // Garoon のリクエストトークンを取得
      return runajax('/g/util_api/util/api.csp', 'POST', 'xml', xml).then(function(resp) {
        $resp = $(resp);
        // リクエストトークンの文字列部分を抽出して返す
        token = $resp.find('request_token').text();
        return token;
      }).catch(function(err) {
        return err;
      });
  
    };
  
    // レコードのプロセスが完了になった時
    kintone.events.on(['app.record.detail.process.proceed'], function(ev) {

        var rec = ev.record;

        if(ev.action.value == "申請"){
            // Garoon のリクエストトークンを取得する
            return getRequestToken().then(function(token) {
                // 通知を送信する
                return sendNotice(rec, token,ev);
                // 成功時
            }).then(function(resp) {
                return ev;
                // 失敗時
            }).catch(function(err) {
                alert(err.responseText);
                return ev;
            });
        }else if(ev.action.value == "完了"){
            // Garoon のリクエストトークンを取得する
            return getRequestToken().then(function(token) {
                // 通知を送信する
                return sendNotice(rec, token,ev);
                // 成功時
            }).then(function(resp) {
                return ev;
                // 失敗時
            }).catch(function(err) {
                alert(err.responseText);
                return ev;
            });
        }
    
        });
  
    // イベント：新規画面を開いたとき
    kintone.events.on(['app.record.create.show'], function(ev) {
      var rec = ev.record;
      // 「タイトル」フィールドにユーザー名と日付を表示する
      rec.title.value = 'アンケートアプリ: ' + '('+ rec.tempo.value +')' + ' (' + rec.date.value + ')';
      // 「本文」フィールドに日報の初期フォーマットを表示する
    //   rec.body.value = '■本日の業務\n\n\n■本日の学び・感想\n\n\n■相談・連絡';
      return ev;
    });
  
  })(jQuery.noConflict(true));