var AudioContext = window.AudioContext || window.webkitAudioContext || false;
// 跨瀏覽器
window.onload = () => {
  clearCTX();
  resizeCanvas();
};
// 畫布
const ctx = document.getElementById("scope").getContext("2d");
const width = 1024;
const height = 1024;
// 畫布x軸 0~1023
let X_now = 0;
// 速度參數 數字越大，畫布呈現範圍越大，波型越擠
let x1_speed = 16;
ctx.fillStyle = "rgb(3,59,80)";
ctx.strokeStyle = "rgb(1,255,241)";
ctx.lineWidth = 1;
var background = new Image();
background.src = "img/bg_grid.svg";
// 網頁
var connected = false;
var context;
var currentStream;
var mediaSource, mediaBuffer, remoteDestination;
var analyser1;
var analyser2;
var splitter;
var javascriptNode;

// Dom代稱
var body = document.getElementsByTagName("body");
// 布林
var should_we_STOP = false; //繪圖函數是否該停止
var Mouse_Down = false; //滑鼠是否按著
// DOM
function buttom_div_width() {
  return document.getElementById("buttom_div").getBoundingClientRect().width;
}

function buttom_div_height() {
  return document.getElementById("buttom_div").getBoundingClientRect().height;
}
function lil_ctn_real_left() {
  return (
    document.getElementById("lil_ctn").getBoundingClientRect().left -
    document.getElementById("buttom_div").getBoundingClientRect().left
  );
}

//跑流程

function connectAudioAPI() {
  if (checkScreen()) {
    try {
      context = new AudioContext();

      analyser1 = context.createAnalyser();
      analyser1.fftSize = 4096;

      analyser2 = context.createAnalyser();
      analyser2.fftSize = 4096;

      splitter = context.createChannelSplitter();

      javascriptNode = context.createScriptProcessor(2048, 1, 1);

      connectInput();
    } catch (e) {
      alert(e);
    }
  }
}

function connectInput() {
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then(function (mediaStream) {
      gotStream(mediaStream);
    })
    .catch(function (e) {
      alert("In connectInput : " + e);
    });
}

function gotStream(stream) {
  try {
    mediaSource = context.createMediaStreamSource(stream);

    mediaSource.connect(splitter);

    splitter.connect(analyser1, 0, 0);
    splitter.connect(analyser2, 1, 0);

    resizeCanvas();
    clearCTX();
    javascriptNode.connect(context.destination);
    javascriptNode.onaudioprocess = function () {
      // 接收到音頻訊號後，暫停/繼續?
      if (!should_we_STOP) {
        GetData();
      }
    };
  } catch (e) {
    alert("In gotStream : " + e);
  }
}

var database = [];

function GetData() {
  var timeData1 = new Uint8Array(analyser1.frequencyBinCount);
  // 將數據 存入 數據陣列 以備未來使用
  database.push(timeData1);
  analyser1.getByteTimeDomainData(timeData1);
  // 取得音頻數據 後 繪製最新數據
  DBDraw();
  // drawScope(timeData1);
}

window.addEventListener("resize", resizeCanvas, false);
function resizeCanvas() {
  document.getElementById("scope").style.width = window.innerWidth + "px";
  document.getElementById("scope").style.height = window.innerHeight - buttom_div_height() + "px";
}

function drawScope(a1) {
  var timeData1 = a1;

  if (X_now >= 1024) {
    X_now = 0;
    clearCTX();
  }

  ctx.beginPath();

  for (var x = 0; x < 1024; x++) {
    timeData1[x] = timeData1[x] + (timeData1[x] - 128);
    ctx.lineTo(X_now + x / x1_speed, timeData1[x] * 4);
  }
  X_now = X_now + 1024 / x1_speed;
  ctx.stroke();

  // 重點
}

function clearCTX() {
  ctx.drawImage(background, 0, 0, 1024, 1024);
}

function DBDraw() {
  if (database.length - x1_speed < 0) {
  } else {
    for (let i = database.length - x1_speed; i < database.length; i++) {
      var timeData1 = database[i];
      if (X_now >= 1024) {
        clearCTX();
        X_now = 0;
      }
      ctx.beginPath();
      for (var x = 0; x < 1024; x++) {
        ctx.lineTo(X_now + x / x1_speed, timeData1[x] * 4);
      }
      X_now = X_now + 1024 / x1_speed;
      ctx.stroke();
    }
  }
}

function btn_stop() {
  should_we_STOP = true;
}

function btn_go() {
  should_we_STOP = false;
}

function speed_fast() {
  x1_speed *= 2;
  console.log(x1_speed);
}

function speed_slow() {
  x1_speed /= 2;
  console.log(x1_speed);
}

function checkScreen() {
  let width = body[0].getBoundingClientRect().width;
  let height = body[0].getBoundingClientRect().height;
  if (height > width) {
    alert("請橫向擺放，直向我無法啟動...");
    return false;
  }
  return true;
}
