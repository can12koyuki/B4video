// 必要な引数を定義
const messages = document.getElementById('js-messages');         //メッセージ表示
const localText = document.getElementById('js-local-text');      //送信する文章
const Voice = document.getElementById('voice-word');             //音声入力ボタン

//音声認識で文字起こし (Web Speech APIを使用)
SpeechRecognition = webkitSpeechRecognition || SpeechRecognition;
var recognition = new SpeechRecognition();
recognition.lang = 'ja-JP';
    
//聞き取った音声を文字に変換してチャットボックスに表示
recognition.onresult = (event) => {
  for(let i = event.resultIndex; i < event.results.length; i++) {
    let voiceword = event.results[i][0].transcript;
    localText.value = voiceword;
  }
  voiceword = '';
  recognition.stop();
}

//音声入力ボタンを押すと音声認識開始
Voice.addEventListener('click', () => {
  recognition.start();
  //音声入力ができないときはアラートを表示
  if ('SpeechRecognition' in window) {
    console.log("音声入力可能");
  } else {
    alert("このブラウザでは音声入力ができません");
  }
});