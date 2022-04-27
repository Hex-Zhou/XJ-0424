let btn_start = document.getElementById("btn_start");
let btn_continue = document.getElementById("btn_continue");
let btn_pause = document.getElementById("btn_pause");
let btn_long = document.getElementById("btn_long");
let btn_short = document.getElementById("btn_short");

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
}, 100);
