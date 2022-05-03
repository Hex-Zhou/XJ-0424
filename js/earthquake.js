var AudioContext = window.AudioContext || window.webkitAudioContext || false;
// 跨瀏覽器
window.onload = () => {
  document.getElementsByClassName("containers")[0].style.visibility = "visible";
  clearCTX();
  resizeCanvas();
};
// 按鈕
let btn_start = document.getElementById("btn_start");
let btn_continue = document.getElementById("btn_continue");
let btn_pause = document.getElementById("btn_pause");
let btn_long = document.getElementById("btn_long");
let btn_short = document.getElementById("btn_short");
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
ctx.lineWidth = 2;
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
var scope = document.getElementById("scope");
// 布林
var should_we_STOP = false; //繪圖函數是否該停止
var Mouse_Down = false; //滑鼠是否按著
var start = false;
var posX_Down = 0;
var now_at = 0;
let timeToggle = true;
function asdc() {}

scope.addEventListener("mousedown", (e) => {
  Mouse_Down = true;
  posX_Down = e.offsetX;
});

scope.addEventListener("mouseup", () => {
  Mouse_Down = false;
});
scope.addEventListener("mouseout", () => {
  Mouse_Down = false;
});

scope.addEventListener("mousemove", (e) => {
  if (Mouse_Down) {
    should_we_STOP = true;
    // numbers = (posX_Down - e.offsetX) / scope.getBoundingClientRect().width / 3;
    // now_at = now_at + x1_speed * numbers;
    let pos_move = e.offsetX;

    if (x1_speed === 4) {
      now_at = posX_Down - pos_move > 0 ? now_at + 1 / 8 : now_at - 1 / 8;
    } else if (x1_speed === 2) {
      now_at = posX_Down - pos_move > 0 ? now_at + 1 / 8 : now_at - 1 / 8;
    } else if (x1_speed === 0.5) {
      now_at = posX_Down - pos_move > 0 ? now_at + 1 / 4 : now_at - 1 / 4;
    } else if (x1_speed === 1) {
      now_at = posX_Down - pos_move > 0 ? now_at + 1 / 4 : now_at - 1 / 4;
    } else {
      now_at = posX_Down - pos_move > 0 ? now_at + x1_speed / 32 : now_at - x1_speed / 32;
    }
    posX_Down = pos_move;
    now_at = now_at < 0 ? 0 : now_at;
    now_at = now_at > database.length ? database.length : now_at;

    DBDraw(Math.floor(now_at));
  }
});

scope.addEventListener("touchstart", (e) => {
  Mouse_Down = true;
  posX_Down = e.touches[0].clientX;
});
scope.addEventListener("touchend", () => {
  Mouse_Down = false;
});
scope.addEventListener("touchmove", (e) => {
  if (Mouse_Down) {
    should_we_STOP = true;
    let pos_move = e.touches[0].clientX;

    if (x1_speed === 4) {
      now_at = posX_Down - pos_move > 0 ? now_at + 1 / 8 : now_at - 1 / 8;
    } else if (x1_speed === 2) {
      now_at = posX_Down - pos_move > 0 ? now_at + 1 / 8 : now_at - 1 / 8;
    } else if (x1_speed === 0.5) {
      now_at = posX_Down - pos_move > 0 ? now_at + 1 / 4 : now_at - 1 / 4;
    } else if (x1_speed === 1) {
      now_at = posX_Down - pos_move > 0 ? now_at + 1 / 4 : now_at - 1 / 4;
    } else {
      now_at = posX_Down - pos_move > 0 ? now_at + x1_speed / 16 : now_at - x1_speed / 16;
    }
    posX_Down = pos_move;
    now_at = now_at < 0 ? 0 : now_at;
    now_at = now_at > database.length ? database.length : now_at;

    DBDraw(Math.floor(now_at));
  }
});
// DOM
function buttom_div_width() {
  return document.getElementById("buttom_div").getBoundingClientRect().width;
}

function buttom_div_height() {
  return document.getElementById("buttom_div").getBoundingClientRect().height;
}
function lil_ctn_real_left() {
  return document.getElementById("lil_ctn").getBoundingClientRect().left - document.getElementById("buttom_div").getBoundingClientRect().left;
}

//跑流程

function connectAudioAPI() {
  if (checkScreen() && !start) {
    try {
      start = true;
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
      if (!should_we_STOP && timeToggle) {
        GetData();
      }
    };
  } catch (e) {
    alert("In gotStream : " + e);
  }
}

setInterval(() => {
  // timeToggle = !timeToggle;
  timeToggle = true;
}, 10);

var database = [];

function GetData() {
  var timeData1 = new Uint8Array(analyser1.frequencyBinCount);
  // 將數據 存入 數據陣列 以備未來使用

  database.push(timeData1);
  analyser1.getByteTimeDomainData(timeData1);
  // 取得音頻數據 後 繪製最新數據
  now_at = database.length;
  ContiDraw(now_at);
}

window.addEventListener("resize", resizeCanvas);
function resizeCanvas() {
  let canvas_cnt = document.getElementsByClassName("canvas_cnt")[0];
  document.getElementById("scope").style.width = canvas_cnt.getBoundingClientRect().width - 90 + "px";
  document.getElementById("scope").style.height = canvas_cnt.getBoundingClientRect().height + "px";
  checkScreen();
}

function clearCTX() {
  ctx.drawImage(background, 0, 0, 1024, 1024);
}

function ContiDraw(xxx) {
  if (xxx % 4 != 0) {
    return;
  }
  var timeData1 = database[xxx - 1];

  if (X_now >= 1024) {
    clearCTX();
    X_now = 0;
  }
  ctx.beginPath();

  for (var x = 0; x < 1024; x++) {
    if (x % 4 != 0) {
      ctx.lineTo(X_now + x / x1_speed, timeData1[x] * 4);
    }
  }
  X_now = X_now + 1024 / x1_speed;
  ctx.stroke();
}

function DBDraw(xxx) {
  if (xxx - x1_speed < 0) {
  } else {
    X_now = 1024;
    for (let i = xxx - x1_speed; i < xxx; i++) {
      var timeData1 = database[Math.floor(i)];
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
  if (!start) {
    connectAudioAPI();
  }
}

function speed_fast() {
  if (x1_speed * 2 < 512) {
    x1_speed *= 2;
    console.log(x1_speed);
  }

  DBDraw(Math.floor(now_at));
}

function speed_slow() {
  if (x1_speed / 2 > 1 / 4) {
    x1_speed /= 2;
    console.log(x1_speed);
  }

  DBDraw(Math.floor(now_at));
}

function checkScreen() {
  let width = body[0].getBoundingClientRect().width;
  let height = body[0].getBoundingClientRect().height;
  if (height > width) {
    document.getElementsByClassName("containers")[0].style.visibility = "hidden";
    alert("請橫向擺放，直向我無法啟動...");
    return false;
  }
  document.getElementsByClassName("containers")[0].style.visibility = "visible";
  clearCTX();

  return true;
}

setTimeout(() => {
  btn_start = document.getElementById("btn_start");
  btn_continue = document.getElementById("btn_continue");
  btn_pause = document.getElementById("btn_pause");
  btn_long = document.getElementById("btn_long");
  btn_short = document.getElementById("btn_short");
  btn_start.addEventListener("click", (e) => {
    connectAudioAPI();
  });
  btn_continue.addEventListener("click", (e) => {
    btn_go();
  });
  btn_pause.addEventListener("click", (e) => {
    btn_stop();
  });
  btn_long.addEventListener("click", (e) => {
    speed_fast();
  });
  btn_short.addEventListener("click", (e) => {
    speed_slow();
  });
  checkScreen();
}, 1000);
