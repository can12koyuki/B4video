(async function main() {
  // 必要な引数を定義
  const localVideo = document.getElementById('my-video');          // 発信者側のビデオ情報
  const localId = document.getElementById('my-id');                // 発信者側のID
  const remoteVideo = document.getElementById('their-video');      // 相手側のビデオ情報
  const remoteId = document.getElementById('their-id');            // 相手側のID
  const callTrigger = document.getElementById('make-call');        // 発信ボタン
  const closeTrigger = document.getElementById('call-end');        // 通話終了ボタン
  const mutebtn = document.getElementById('mute');                 // ミュート切り替えボタン
  const yesbtn = document.getElementById('yes');                   //「はい」ボタン
  const sosobtn = document.getElementById('soso');                 //「わからない」ボタン
  const nobtn = document.getElementById('no');                     //「いいえ」ボタン
  const sendTrigger = document.getElementById('js-send-trigger');  // チャット送信ボタン
  const messages = document.getElementById('js-messages');         // メッセージ表示
  const localText = document.getElementById('js-local-text');      // 送信する文章
  const modal = document.getElementById('callModal');              // 着信処理モーダルウィンドウ
  const CallY = document.getElementById('call-yes');               // 着信処理モーダルウィンドウの「はい」ボタン
  const Calln = document.getElementById('call-no');                // 着信処理モーダルウィンドウの「いいえ」ボタン
  const selectId = document.getElementById('select-id');           // ID選択ボタン
  const Smodal = document.getElementById('selectModal');           // ID選択モーダルウィンドウ
  const Sret = document.getElementById('ret');                     // ID選択モーダルウィンドウの「もどる」ボタン

  // カメラとマイク情報取得
  const localStream = await navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
  .catch(console.error);

  // 通話終了後のブラウザ更新用タイマー(5秒後ブラウザ更新)
  function reloadTimer() {
    setTimeout( function() {
      document.location.reload();
    } , 5000 );
  }

  // 通話時間の表示
  function VideoTimerset(){
    var Timer = setInterval(function(){
      VideoTimer();
      // ビデオ映像切れたらタイマー停止
      if(remoteVideo.srcObject == null){
        clearInterval(Timer);
      }
    }, 1000);
  }
  var totalSeconds = 0;
  function VideoTimer(){
    ++totalSeconds;
    var hour = Math.floor(totalSeconds / 3600);
    var minute = Math.floor((totalSeconds - hour * 3600) / 60);
    var seconds = totalSeconds - (hour * 3600 + minute * 60);
    document.getElementById("Vtimer").innerHTML = hour + ":" + minute + ":" + seconds;
  }

  // localStorageのOKIDキーの値を取り出す
  const Pid = localStorage.getItem("OKID");
  // 値がない場合はID設定を促すアラート表示
  if(!Pid){
    alert("IDが設定されていません。IDを設定してください");
    return;
  }

  // Peer作成(SkyWayに接続)
  const peer = new Peer( Pid, {
    key: window.__SKYWAY_KEY__,     // "key.js"から参照
    debug: 3
  });

  // ID一覧を表示
  peer.once('open', id => (localId.textContent = id));
  peer.once("open", () => {
    peer.listAllPeers((peers) => {
      const ID = Array.from(peers);
      for(var i=0; i<ID.length; i++){
        if(localId.textContent != ID[i]){
          var radiobox = document.createElement('input');  //ラジオボックス作成
          var label = document.createElement('label');     //ラベル作成
          var br = document.createElement('br');           //改行

          // ラジオボックスの各要素の定義
          radiobox.type = 'radio';
          radiobox.id = 'their-id-text' + i;
          radiobox.name = 'radio';
          radiobox.value = ID[i];
          label.setAttribute("for", radiobox.id);
          label.textContent = radiobox.value;
          
          remoteId.appendChild(br);                        //改行追加
          remoteId.appendChild(radiobox);                  //チェックボックス追加
          remoteId.appendChild(label);                     //ラベル追加
        }
      }
    });
  });

  //ID選択前は「IDを選択」と表示
  var str = 'IDを選択'
  document.getElementById("Stitle").innerHTML = str;
  //ID選択ボタン
  selectId.addEventListener('click', () => {
    //ラジオボタンの値を取得
    function radioset(){
      const radio = document.getElementsByName('radio');
      let setId = radio.length;
      for (let i = 0; i < setId; i++){
        console.log(i,radio.item(i).id)
        if (radio.item(i).checked){
          remoteId.value = radio.item(i).value;
        }
      }
    }
    Smodal.style.display = 'block';
    //ID選択モーダルの「もどる」ボタンを押したらID選択ボタンに選択したIDを表示
    Sret.addEventListener('click', () => {
      radioset();
      Smodal.style.display = 'none';
      if(remoteId.value == undefined){
        document.getElementById("Stitle").innerHTML = str;
      }else{
        document.getElementById("Stitle").innerHTML = remoteId.value;
      }
    });
  });

  //IDを取得失敗したらアラートを表示
  peer.on('error', () => {
    alert("「" + Pid + "」 このIDは既に存在します。IDを変更してください");
    console.error;
  });

  //ミュート切り替えボタン
  function mute(){
    mutebtn.addEventListener('click', () => {
      const audioTrack = localStream.getAudioTracks()[0];
      if(audioTrack.enabled == true){
        //マイクオフ
        audioTrack.enabled = false;
        mutebtn.textContent = "マイクオフ";
      }else{
        //マイクオン
        audioTrack.enabled = true;
        mutebtn.textContent = "マイクオン";
      }
    });
  }

  //発信者側
  callTrigger.addEventListener('click', () => {
    if (!peer.open) {
      return;
    }
    const mediaConnection = peer.call(remoteId.value, localStream);
    const dataConnection = peer.connect(remoteId.value);

    //待機音
    const music = new Audio('./callend.mp3');
    music.loop = true;
    music.play();

    messages.textContent += remoteId.value + 'さんに発信中...\n';

    dataConnection.once('close', () => {
      //拒否されたことをチャットで知らせる
      messages.textContent += '通話を開始できませんでした\n';
      messages.scrollTo(0, messages.scrollHeight);
      music.pause();
      reloadTimer();
    })

    mediaConnection.on('stream', async stream => {
      music.pause();
      messages.textContent += '=== 通話を開始しました ===\n';
      messages.scrollTo(0, messages.scrollHeight);
      //相手のビデオ映像を再生
      remoteVideo.srcObject = stream;
      remoteVideo.playsInline = true;
      await remoteVideo.play().catch(console.error);
      //自分のビデオ映像を再生
      localVideo.srcObject = localStream;
      localVideo.playsInline = true;
      await localVideo.play().catch(console.error);
      VideoTimerset();
    });

    mediaConnection.once('close', () => {
      //相手との接続が切れたら相手のビデオ映像を消す
      remoteVideo.srcObject.getTracks().forEach(track => track.stop());
      remoteVideo.srcObject = null;
      //自分のビデオ映像を消す
      localVideo.srcObject.getTracks().forEach(track => track.stop());
      localVideo.srcObject = null;
      // 終了したことをチャットで表示
      messages.textContent += '=== 通話を終了しました ===\n';
      messages.scrollTo(0, messages.scrollHeight);
      reloadTimer();
    });
    //通話終了ボタンを押したら閉じる
    closeTrigger.addEventListener('click', () => {
      mediaConnection.close(true);
    });

    //発信者側チャット
    dataConnection.once('open', async () => {
      onClickSend();
      sendTrigger.addEventListener('click', onClickSend);
      // 各リアクションボタンを押したらチャット送信
      yesbtn.addEventListener('click', () => {
        localText.value = "はい";
        onClickSend();
      });
      sosobtn.addEventListener('click', () => {
        localText.value = "わからない";
        onClickSend();
      });
      nobtn.addEventListener('click', () => {
        localText.value = "いいえ";
        onClickSend();
      });
    });
    //相手側からのチャット文章を表示
    dataConnection.on('data', data => {
      messages.textContent += remoteId.value + ': ' + data + '\n';
      messages.scrollTo(0, messages.scrollHeight);
    });
    //送信した文章を自分側のチャットに表示
    function onClickSend() {
      const data = {
        name: localId.textContent,    //発信者ID
        msg: localText.value,         //メッセージ内容
      };
      dataConnection.send(data);
      //ビデオ通話をはじめたときにはチャットしない
      if(localText.value != ''){
        messages.textContent += 'あなた: ' + localText.value + '\n';
        localText.value = '';
      }
      messages.scrollTo(0, messages.scrollHeight);
    }
    mute();
  });

  //受信者側
  peer.on('call', mediaConnection => {
    const music = new Audio('./call.mp3');
    music.loop = true;
    music.play();

    //着信が来たら着信処理モーダルウィンドウを表示
    modal.style.display = 'block';
    //着信処理モーダルの「いいえ」が押されたとき
    Calln.addEventListener('click', modalClose);
    function modalClose() {
      modal.style.display = 'none';
      peer.destroy();
      //拒否したことをチャットで知らせる
      messages.textContent += '通話を開始しませんでした\n';
      messages.scrollTo(0, messages.scrollHeight);
      music.pause();
      reloadTimer();
    }
    //着信処理モーダルの「はい」を押したらビデオ通話開始
    CallY.addEventListener('click', () => {
      modal.style.display = 'none';
      music.pause();
      mediaConnection.answer(localStream);
    });

    mediaConnection.on('stream', async stream => {
      messages.textContent += '=== 通話を開始しました ===\n';
      messages.scrollTo(0, messages.scrollHeight);
      // 相手のビデオ映像を再生
      remoteVideo.srcObject = stream;
      remoteVideo.playsInline = true;
      await remoteVideo.play().catch(console.error);
      //自分のビデオ映像を再生
      localVideo.srcObject = localStream;
      localVideo.playsInline = true;
      await localVideo.play().catch(console.error);
      VideoTimerset();
    });

    mediaConnection.once('close', () => {
      //相手との接続が切れたら相手のビデオ映像を消す
      remoteVideo.srcObject.getTracks().forEach(track => track.stop());
      remoteVideo.srcObject = null;
      //自分のビデオ映像を消す
      localVideo.srcObject.getTracks().forEach(track => track.stop());
      localVideo.srcObject = null;
      messages.textContent += '=== 通話を終了しました ===\n';
      messages.scrollTo(0, messages.scrollHeight);
      reloadTimer();
    });
    //通話終了ボタンを押したら閉じる
    closeTrigger.addEventListener('click', () => {
      mediaConnection.close(true);
    });
  });

  //相手側のチャット
  peer.on('connection', dataConnection => {
    dataConnection.once('open', async () => {
      sendTrigger.addEventListener('click', onClickSend);
      //各リアクションボタンを押したらチャット送信
      yesbtn.addEventListener('click', () => {
        localText.value = "はい";
        onClickSend();
      });
      sosobtn.addEventListener('click', () => {
        localText.value = "わからない";
        onClickSend();
      });
      nobtn.addEventListener('click', () => {
        localText.value = "いいえ";
        onClickSend();
      });
    });
    //発信者側のIDとチャットメッセージを受け取る
    dataConnection.on('data', ({name, msg}) => {
      //着信時にチャット表示
      if(msg == ''){
        messages.textContent += name + 'さんから着信がありました。\n';
        messages.scrollTo(0, messages.scrollHeight);
        var str = name + "さんから着信が来ました！"
        document.getElementById("mtitle").innerHTML = str;
      }else{
        //発信者側からのチャット表示
        messages.textContent += name + ': ' + msg + '\n';
        messages.scrollTo(0, messages.scrollHeight);
      }
    });
    //送信した文章を自分側のチャットに表示
    function onClickSend() {
      const data = localText.value;
      dataConnection.send(data);
      messages.textContent += 'あなた: ' + data + '\n';
      localText.value = '';
      messages.scrollTo(0, messages.scrollHeight);
    }
    mute();
  });
})();