// var AudioContext = window.AudioContext || window.webkitAudioContext || false;
// window.onload = () => {
//   document.getElementsByClassName("containers")[0].style.visibility = "visible";
//   clearCTX();
//   resizeCanvas();
// };

// // ***可調參數區(直接修改這個區塊)*** 這三個參數
// let omitValue = 1024; // 降低音頻讀取值 (2/4/8/16...1024)(2^10) 越大讀取頻率越低(影響畫布)
// let exaggerate = 12; //震幅誇大比率 (1~10) 1是無任何比率
// let x1_speed = 256; // (2/4/8/16...1024) 影響畫布範圍(線條視覺刷新速度)  數字越大，畫布呈現範圍越大，波型越擠

// // 按鈕DOM
// let btn_start = document.getElementById("btn_start");
// let btn_continue = document.getElementById("btn_continue");
// let btn_pause = document.getElementById("btn_pause");
// let btn_long = document.getElementById("btn_long");
// let btn_short = document.getElementById("btn_short");

// // 畫圖canvas參數
// const ctx = document.getElementById("scope").getContext("2d");
// const width = 1024; // 畫布大小
// const height = 1024; // 畫布大小
// let LastPoint = 0;
// let OverToggle = 0;
// let X_now = 0;
// ctx.fillStyle = "rgb(3,59,80)";
// ctx.strokeStyle = "rgb(1,255,241)";
// ctx.lineWidth = 2;
// var background = new Image();
// background.src = "img/bg_grid.svg";
// // 頻率接收API內建參數
// var connected = false;
// var context;
// var currentStream;
// var mediaSource, mediaBuffer, remoteDestination;
// var analyser1;
// var analyser2;
// var splitter;
// var javascriptNode;
// // Dom代稱
// var body = document.getElementsByTagName("body");
// var scope = document.getElementById("scope");
// var waveH2 = document.getElementById("wave");
// // 布林
// var should_we_STOP = false; //繪圖函數是否該停止
// var Mouse_Down = false; //滑鼠/手指 是否按著螢幕
// var start = false; //是否啟動了?
// // 滑動 連帶 資料讀寫參數
// var posX_Down = 0;
// var now_at = 0;

// // 滑鼠 手指 按壓畫布事件
// scope.addEventListener("mousedown", (e) => {
//   Mouse_Down = true;
//   posX_Down = e.offsetX;
// });
// scope.addEventListener("mouseup", () => {
//   Mouse_Down = false;
// });
// scope.addEventListener("mouseout", () => {
//   Mouse_Down = false;
// });
// scope.addEventListener("mousemove", (e) => {
//   if (Mouse_Down) {
//     should_we_STOP = true;
//     let pos_move = e.offsetX;
//     if (x1_speed === 4) {
//       now_at = posX_Down - pos_move > 0 ? now_at + 1 / 8 : now_at - 1 / 8;
//     } else if (x1_speed === 2) {
//       now_at = posX_Down - pos_move > 0 ? now_at + 1 / 8 : now_at - 1 / 8;
//     } else if (x1_speed === 0.5) {
//       now_at = posX_Down - pos_move > 0 ? now_at + 1 / 4 : now_at - 1 / 4;
//     } else if (x1_speed === 1) {
//       now_at = posX_Down - pos_move > 0 ? now_at + 1 / 4 : now_at - 1 / 4;
//     } else if (x1_speed >= 4) {
//       now_at = posX_Down - pos_move > 0 ? now_at + x1_speed / 16 : now_at - x1_speed / 16;
//     } else if (x1_speed >= 64) {
//       now_at = posX_Down - pos_move > 0 ? now_at + 128 : now_at - 128;
//     }
//     posX_Down = pos_move;
//     now_at = now_at < 0 ? 0 : now_at;
//     now_at = now_at > database.length ? database.length : now_at;
//     DBDraw(Math.floor(now_at));
//   }
// });
// scope.addEventListener("touchstart", (e) => {
//   Mouse_Down = true;
//   posX_Down = e.touches[0].clientX;
// });
// scope.addEventListener("touchend", () => {
//   Mouse_Down = false;
// });
// scope.addEventListener("touchmove", (e) => {
//   if (Mouse_Down) {
//     should_we_STOP = true;
//     let pos_move = e.touches[0].clientX;
//     if (x1_speed === 4) {
//       now_at = posX_Down - pos_move > 0 ? now_at + 1 / 8 : now_at - 1 / 8;
//     } else if (x1_speed === 2) {
//       now_at = posX_Down - pos_move > 0 ? now_at + 1 / 8 : now_at - 1 / 8;
//     } else if (x1_speed === 0.5) {
//       now_at = posX_Down - pos_move > 0 ? now_at + 1 / 4 : now_at - 1 / 4;
//     } else if (x1_speed === 1) {
//       now_at = posX_Down - pos_move > 0 ? now_at + 1 / 4 : now_at - 1 / 4;
//     } else if (x1_speed >= 4) {
//       now_at = posX_Down - pos_move > 0 ? now_at + x1_speed / 16 : now_at - x1_speed / 16;
//     } else if (x1_speed >= 64) {
//       now_at = posX_Down - pos_move > 0 ? now_at + 64 : now_at - 64;
//     }
//     posX_Down = pos_move;
//     now_at = now_at < 0 ? 0 : now_at;
//     now_at = now_at > database.length ? database.length : now_at;
//     DBDraw(Math.floor(now_at));
//   }
// });

// //音頻讀取流程1
// function connectAudioAPI() {
//   if (checkScreen() && !start) {
//     try {
//       start = true;
//       context = new AudioContext();
//       analyser1 = context.createAnalyser();
//       analyser1.fftSize = 4096;
//       analyser2 = context.createAnalyser();
//       analyser2.fftSize = 4096;
//       splitter = context.createChannelSplitter();
//       javascriptNode = context.createScriptProcessor(2048, 1, 1);
//       connectInput();
//     } catch (e) {
//       alert(e);
//     }
//   }
// }
// //音頻讀取流程1
// function connectInput() {
//   navigator.mediaDevices
//     .getUserMedia({ audio: true })
//     .then(function (mediaStream) {
//       gotStream(mediaStream);
//     })
//     .catch(function (e) {
//       alert("In connectInput : " + e);
//     });
// }
// //音頻讀取流程3
// function gotStream(stream) {
//   try {
//     mediaSource = context.createMediaStreamSource(stream);
//     mediaSource.connect(splitter);
//     splitter.connect(analyser1, 0, 0);
//     splitter.connect(analyser2, 1, 0);
//     resizeCanvas();
//     clearCTX();

//     javascriptNode.connect(context.destination);

//     javascriptNode.onaudioprocess = function () {
//       // 接收到音頻訊號後，暫停/繼續?
//       if (!should_we_STOP) {
//         GetData();
//       }
//     };
//   } catch (e) {
//     alert("In gotStream : " + e);
//   }
// }

// var database = [];
// function GetData() {
//   var timeData1 = new Uint8Array(analyser1.frequencyBinCount);
//   // 檢查線寬
//   ChecklineWidth();
//   // 將數據 存入 數據陣列 以備未來使用
//   database.push(timeData1);
//   analyser1.getByteTimeDomainData(timeData1);
//   // 取得音頻數據 後 繪製最新數據
//   now_at = database.length;
//   // 繪製最新讀取的點
//   ContiDraw(now_at);
// }
// // 調整螢幕大小時(拖拉瀏覽器、橫擺畫面)呼叫的函數
// window.addEventListener("resize", resizeCanvas);
// function resizeCanvas() {
//   // 作用:調整畫布長寬
//   let canvas_cnt = document.getElementsByClassName("canvas_cnt")[0];
//   document.getElementById("scope").style.width =
//     canvas_cnt.getBoundingClientRect().width - 90 + "px";
//   document.getElementById("scope").style.height = canvas_cnt.getBoundingClientRect().height + "px";
//   // 檢查直橫向
//   checkScreen();
// }
// // 清空畫布，只留背景圖
// function clearCTX() {
//   ctx.beginPath();
//   ctx.drawImage(background, 0, 0, 1024, 1024);
// }
// // 即時繪畫時的算法
// function ContiDraw(xxx) {
//   var timeData1 = database[xxx - 1];

//   if (X_now >= 1024) {
//     clearCTX();
//     X_now = 0;
//   }
//   OverToggle++;
//   if (OverToggle % 1024 == 0) {
//     ctx.lineTo(X_now, LastPoint * 4);
//   } else {
//     tmp = 128 + (timeData1[0] - 128) * exaggerate;
//     ctx.lineTo(X_now, tmp * 4);
//     for (var x = 0; x < 1024; x += omitValue) {
//       if (x % omitValue == 0) {
//         LastPoint = 128 + (timeData1[x] - 128) * exaggerate;
//         ctx.lineTo(X_now + x / x1_speed, LastPoint * 4);
//       }
//     }
//   }

//   X_now = X_now + 1024 / x1_speed;
//   ctx.stroke();
// }
// // 拖拉螢幕的畫圖算法
// function DBDraw(xxx) {
//   if (xxx - x1_speed < 0) {
//   } else {
//     X_now = 1024;
//     for (let i = xxx - x1_speed; i < xxx; i++) {
//       var timeData1 = database[Math.floor(i)];
//       if (X_now >= 1024) {
//         clearCTX();
//         X_now = 0;
//       }
//       OverToggle++;
//       if (OverToggle % 1024 == 0) {
//         ctx.lineTo(X_now, LastPoint * 4);
//       } else {
//         tmp = 128 + (timeData1[0] - 128) * exaggerate;
//         ctx.lineTo(X_now, tmp * 4);
//         for (var x = 0; x < 1024; x += omitValue) {
//           if (x % omitValue == 0) {
//             LastPoint = 128 + (timeData1[x] - 128) * exaggerate;
//             ctx.lineTo(X_now + x / x1_speed, LastPoint * 4);
//           }
//         }
//       }
//       X_now = X_now + 1024 / x1_speed;
//       ctx.stroke();
//     }
//   }
// }
// // 停止按鈕 函數
// function btn_stop() {
//   should_we_STOP = true;
// }
// // 啟動按鈕 函數
// function btn_go() {
//   should_we_STOP = false;
//   if (!start) {
//     connectAudioAPI();
//   }
// }
// // 加速按鈕 函數
// function speed_fast() {
//   if (x1_speed * 2 < 512) {
//     x1_speed *= 2;
//     console.log(x1_speed);
//   }
//   ChecklineWidth();
//   DBDraw(Math.floor(now_at));
// }
// // 減速按鈕 功能
// function speed_slow() {
//   // 最低限速 0.5
//   if (x1_speed / 2 > 1 / 4) {
//     x1_speed /= 2;
//     console.log(x1_speed);
//   }
//   // 檢查線寬
//   ChecklineWidth();
//   // 畫 非即時圖
//   DBDraw(Math.floor(now_at));
// }
// // 判別 螢幕 直向 or 橫向
// function checkScreen() {
//   // 檢查直橫向 > 直向隱藏畫布 橫向展示畫布>刷新畫布以符合視窗大小
//   let width = body[0].getBoundingClientRect().width;
//   let height = body[0].getBoundingClientRect().height;
//   if (height > width) {
//     document.getElementsByClassName("containers")[0].style.visibility = "hidden";
//     alert("請橫向擺放，直向我無法啟動...");
//     return false;
//   }
//   document.getElementsByClassName("containers")[0].style.visibility = "visible";
//   clearCTX();
//   return true;
// }
// // 初始化 設定DOM
// setTimeout(() => {
//   btn_little = document.getElementById("btn_little");
//   btn_big = document.getElementById("btn_big");
//   btn_start = document.getElementById("btn_start");
//   btn_continue = document.getElementById("btn_continue");
//   btn_pause = document.getElementById("btn_pause");
//   btn_long = document.getElementById("btn_long");
//   btn_short = document.getElementById("btn_short");
//   waveH2.innerHTML = "強度:" + exaggerate;
//   btn_start.addEventListener("click", (e) => {
//     connectAudioAPI();
//   });
//   btn_continue.addEventListener("click", (e) => {
//     btn_go();
//   });
//   btn_pause.addEventListener("click", (e) => {
//     btn_stop();
//   });
//   btn_long.addEventListener("click", (e) => {
//     speed_fast();
//   });
//   btn_short.addEventListener("click", (e) => {
//     speed_slow();
//   });
//   btn_big.addEventListener("click", (e) => {
//     exaggerate += 0.5;
//     exaggerate = exaggerate >= 50 ? 50 : exaggerate;
//     waveH2.innerHTML = "強度:" + exaggerate;
//     console.log(exaggerate);
//   });
//   btn_little.addEventListener("click", (e) => {
//     exaggerate -= 0.5;
//     exaggerate = exaggerate <= 1 ? 1 : exaggerate;
//     waveH2.innerHTML = "強度:" + exaggerate;
//     console.log(exaggerate);
//   });
//   checkScreen();
// }, 1000);

// // 修改線條粗細 速度128(低速)時候 線條會過粗，將線條調細
// function ChecklineWidth() {
//   if (x1_speed >= 128) {
//     ctx.lineWidth = 1.5;
//   }
//   if (x1_speed < 128) {
//     ctx.lineWidth = 3;
//   }
// }
