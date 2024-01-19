/*
 * ワンクリックで一括承認するプログラム
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
*/
(() => {
    'use strict';
    kintone.events.on('app.record.index.show', (event) => {
      const appId = kintone.app.getId();
      if (event.viewId !== 6446418) {//環境が変わった際に変更する一覧の
        return;
      }
      if ($('.header-contents').length !== 0) {
        return;
      }
      const el = kintone.app.getHeaderSpaceElement();
      const headerDiv = $('<div></div>', {
        class: 'header-contents'
      });
        // make a button for approval.
      const balusButton = $('<button></button>', {
        class: 'approval-button'
      })
        .html('一括承認！')
        .click(() => {
          if (event.records.length > 0) {
            window.swal({
              title: '本当に全て承認して大丈夫ですか？',
              text: '表示されているレコードを全て承認します',
              type: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#DD6B55',
              confirmButtonText: '承認！',
              cancelButtonText: 'やっぱりやめる',
              closeOnConfirm: false},
            () => {
              const records = [];
              for (let h = 0; h < event.records.length; h++) {
                const obj = {};
                obj.id = event.records[h].$id.value;
                obj.action = '【確認】コールセンター上長_直営店'; // プロセス管理で設定されたアクション名を指定
                records.push(obj);
              }
              const requestObj = {
                app: appId,
                records: records
              };
              kintone.api(kintone.api.url('/k/v1/records/status', true), 'PUT', requestObj, () => {
                window.swal({title: '承認に成功しました！',
                  text: 'お疲れ様でした。',
                  // eslint-disable-next-line max-nested-callbacks
                  type: 'success'}, () => {
                  location.reload();
                });
              });
            });
          } else {
            window.swal({
              title: '申請中のレコードがありません',
              type: 'warning'});
          }
        });
      headerDiv.append(balusButton);
      headerDiv.append($('<br />'));
      headerDiv.appendTo(el);
    });
  })();