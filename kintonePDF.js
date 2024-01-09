//今のところPDF出力処理
(() => {
    'use strict';

    function PDFprint(record){
        // pdfmakeをロード
        var pdfMakeScript = document.createElement('script');
        pdfMakeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/pdfmake.min.js';
        pdfMakeScript.type = 'text/javascript';
        document.head.appendChild(pdfMakeScript);

        // pdfmakeがロードされたら処理を開始
        pdfMakeScript.onload = function() {
            // vfs_fontsをロード
            var vfsFontsScript = document.createElement('script');
            vfsFontsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/vfs_fonts.js';
            vfsFontsScript.type = 'text/javascript';
            document.head.appendChild(vfsFontsScript);

            // vfs_fontsがロードされたら処理を開始
            vfsFontsScript.onload = function() {

                // PDFの定義
                var docDefinition = {
                    content: [
                        'Hello 東京'
                    ]
                };

                // PDFを作成してダウンロード
                pdfMake.createPdf(docDefinition).download('output.pdf');
            };

            // vfs_fontsの読み込みに失敗した場合の処理
            vfsFontsScript.onerror = function() {
                console.error('vfs_fontsの読み込みに失敗しました。');
            };
        };

        // pdfmakeの読み込みに失敗した場合の処理
        pdfMakeScript.onerror = function() {
            console.error('pdfmakeの読み込みに失敗しました。');
        };
    }
  
    //メニュー上にボタンを配置
    kintone.events.on('app.record.detail.show', (event) => {

        var record = event.record;

        // メニューの上側の空白部分にボタンを設置
        const myIndexButton = document.createElement('button');
        myIndexButton.id = 'my_index_button';
        myIndexButton.innerText = 'PDF出力ボタン';
        myIndexButton.onclick = (record) => {
            PDFprint(record);
            
        };

        kintone.app.record.getHeaderMenuSpaceElement().appendChild(myIndexButton);
        return event;
    });

  })();