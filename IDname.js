//必要な引数を定義
const IDtext = document.getElementById('ID-text');               //任意のID
const IDnameOK = document.getElementById('IDname-ok');           //決定ボタン

//localStorageの値の数
const lS = localStorage.length;

//ID指定
IDnameOK.addEventListener('click', () => {
  if(lS != 0){
    //localStorageのOKIDキーに値がある時、値を削除
    localStorage.removeItem("OKID");
  }
  //localStorageのOKIDキーに値を保存
  localStorage.setItem('OKID', IDtext.value);
  //ページ移動
  location = "./index.html"
})
