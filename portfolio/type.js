const text = document.querySelector(".content h1");
const strText = text.textContent;
const splitText = strText.split("");
text.textContent = "";

for (let i = 0; i < splitText.length; i++) {
  text.innerHTML += "<span class='letter'>" + splitText[i] + "</span>";
}

let char = 0;
let timer = setInterval(onTick, 150);

function onTick() {
  const span = text.querySelectorAll(".letter")[char];
  span.classList.add("fade");
  char++;
  if (char === splitText.length) {
    complete();
    return;
  }
}

function complete() {
  clearInterval(timer);
  timer = null;
}
