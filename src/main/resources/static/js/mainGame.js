var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");
var messageSnapshot = "";
var currentMessage = "Крч, я делаю демку игры, думаю таки не будем мудрить и остановимся на визуальной новелле. Например можно сделать такой сюжет: друзья сидят в кафе и поочерёдно вспоминают кто как столкнулся с мошенничеством. Соответственно для первой сцены нужен фон кафе, и минимум два персанажа.";

setInterval(onTimerTick, 33);
function onTimerTick() {
    if(backgroundIsLoaded) drawBackground();
    if(pinkGayIsLoaded) {
        drawPinkGay();
        drawMessageBox();
    }
}
updateMessage(0);
resize(canvas);
var background = new Image();      // Новый объект
background.onload = function () {
    drawBackground();
    backgroundIsLoaded = true;
};

function updateMessage(x){
    messageSnapshot += currentMessage[x++];
    if(x < currentMessage.length) {
        setTimeout(updateMessage, 70, x);
    }
}

var pinkGayImage = new Image();
pinkGayImage.onload = function() {
    drawPinkGay();
    pinkGayIsLoaded = true;
}

window.onresize = function () {
    resize();
}

function resize(){
    var displayWidth  = canvas.clientWidth;
    var displayHeight = canvas.clientHeight;

    // проверяем, отличается ли размер canvas
    if (canvas.width  != displayWidth ||
      canvas.height != displayHeight) {

    // подгоняем размер буфера отрисовки под размер HTML-элемента
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
    }
}

background.src = '/images/background.jpg';
pinkGayImage.src = '/images/pinkGay.png';

function drawBackground(){
    const aspectRatio = background.naturalHeight / background.naturalWidth;
    height = window.innerHeight;
    width = height / aspectRatio;
    if(width < window.innerWidth){
        canvas.width = width;
    }
    else {
        canvas.width = window.innerWidth;
    }
    canvas.height = height;
    context.drawImage(background, 0, 0, width, height);
}

function drawPinkGay(){
    const aspectRatio = pinkGayImage.naturalHeight / pinkGayImage.naturalWidth;
    height = window.innerHeight * 0.6;
    width = height / aspectRatio;
    context.drawImage(pinkGayImage, canvas.width * 0.1, window.innerHeight * 0.1, width, height);
}

function drawMessageBox(){
    x = 10;
    y = window.innerHeight * 0.7;
    width = canvas.width - x * 2;
    height = window.innerHeight * 0.3 - x * 2;
    context.strokeStyle = "#594d98";
    context.fillStyle = "#50185b";
    context.fill(new Path2D(roundedRectPath(x, y, width, height, 10)));
    context.stroke(new Path2D(roundedRectPath(x, y, width, height, 16)));
    wrapText(messageSnapshot, x + 20, y + 20, width - 20, 18);
}

function roundedRectPath(x,y,w,h,r){
    r = (Math.min(w,h)/2 > r)? r : Math.min(w,h)/2;
    return `M ${x + r} ${y} l ${w-2*r} 0 q ${r} 0 ${r} ${r}
        l 0 ${h-2*r} q 0 ${r} ${-r} ${r}
        l ${-w+2*r} 0 q ${-r} 0 ${-r} ${-r}
        l 0 ${-h+2*r} q 0 ${-r} ${r} ${-r}`;
}

function wrapText(text, marginLeft, marginTop, maxWidth, lineHeight)
{
    context.font = '16px serif'
    context.fillStyle = "#ffffff";
    var words = text.split(" ");
    var countWords = words.length;
    var line = "";
    for (var n = 0; n < countWords; n++) {
        var testLine = line + words[n] + " ";
        var testWidth = context.measureText(testLine).width;
        if (testWidth > maxWidth) {
            context.fillText(line, marginLeft, marginTop);
            line = words[n] + " ";
            marginTop += lineHeight;
        }
        else {
            line = testLine;
        }
    }

    context.fillText(line, marginLeft, marginTop);
}