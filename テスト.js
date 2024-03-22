(function() {
    'use strict';
    //--------------------------------------------------------------------------------
    //以下、印刷画面の制御
    //--------------------------------------------------------------------------------
    //(詳細画面)表示したとき
    kintone.events.on("app.record.edit.show", event => {
        const record = event.record;

console.warn("ミライザカ西日暮里駅前店",fetchGaroonUserByCode("T00203"));
console.warn("から揚げの天才イオンモール新利府 北館店",fetchGaroonUserByCode("T01562"));
// console.warn("",fetchGaroonUserByCode(""));
// console.warn("",fetchGaroonUserByCode(""));
// console.warn("",fetchGaroonUserByCode(""));
// console.warn("",fetchGaroonUserByCode(""));
// console.warn("",fetchGaroonUserByCode(""));
// console.warn("",fetchGaroonUserByCode(""));
// console.warn("",fetchGaroonUserByCode(""));
// console.warn("",fetchGaroonUserByCode(""));
// console.warn("",fetchGaroonUserByCode(""));
// console.warn("",fetchGaroonUserByCode(""));
// console.warn("",fetchGaroonUserByCode(""));
// console.warn("",fetchGaroonUserByCode(""));
// console.warn("",fetchGaroonUserByCode(""));
// console.warn("",fetchGaroonUserByCode(""));
// console.warn("",fetchGaroonUserByCode(""));

        return event;
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
        // console.warn("ターゲットユーザー",targetUser);
        return targetUser;
    };


})();