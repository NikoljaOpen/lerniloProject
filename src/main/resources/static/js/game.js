"use strict";
// получаем холст
let canvas = document.getElementById("gameCanvas");
// получаем контекст
let context = canvas.getContext("2d");
let messageBorderColor = '#b7d1d0';
let messageBackgroundColor = '#eaf9ff';
let messageFontColor = '#43616B';
let portraitOrientation = false;


// обработка изменения размеров окна
function onResize(){
  let displayWidth  = canvas.clientWidth;
  let displayHeight = canvas.clientHeight;

  // проверяем, отличается ли размер canvas
  if (canvas.width  != displayWidth || canvas.height != displayHeight) {
    // подгоняем размер буфера отрисовки под размер HTML-элемента
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }

  if(window.innerHeight > window.innerWidth) portraitOrientation = true;
  else portraitOrientation = false;
}
onResize();
window.onresize = onResize;
let imageLoadedCount = 0;
let imagesLoaded = false;
function imageOnload(){
  if(++imageLoadedCount >= images.size){
    imagesLoaded = true;
  }
}

function imageFactory(){
  let img = new Image();
  img.onload = imageOnload;
  return img;
}

let images = new Map();
images.set("кафе", imageFactory());
images.set("Валера счастлив", imageFactory());
images.set("Даша счастлива", imageFactory());
images.set("Валера обескуражен", imageFactory());
images.set("ноутбук", imageFactory());
images.set("бабушка", imageFactory());
images.set("мошенник", imageFactory());
images.set("комната бабушки", imageFactory());
images.set("Валера звонит", imageFactory());
images.set("чат", imageFactory());
images.set("дом", imageFactory());
images.set("Дима звонит", imageFactory());

images.get("кафе").src = "/images/background.png";
images.get("Валера счастлив").src = "/images/valeraHappy.png";
images.get("Даша счастлива").src = "/images/dashaHappy.png";
images.get("Валера обескуражен").src = "/images/valeraWTF.png";
images.get("ноутбук").src = "/images/notebook.png";
images.get("бабушка").src = "/images/granny.png";
images.get("мошенник").src = "/images/scammer.png";
images.get("комната бабушки").src = "/images/grannysRoom.png";
images.get("Валера звонит").src = "/images/valeraIsСalling.png";
images.get("чат").src = "/images/chat.png";
images.get("дом").src = "/images/home.png";
images.get("Дима звонит").src = "/images/dimaIsCalling.png"

// сцена
class scene {
  draw() {}
  update() {}
  onClick(x, y) {}
}

// текущая сцена
let currentScene = new scene();

// игровой цикл
function gameLoop(){
  if(!portraitOrientation){
    currentScene.update();
    currentScene.draw();
  }
  else {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let x = canvas.width * 0.05;
    let y = x;
    let width = canvas.width - x * 2;
    let height = canvas.height - x * 2;
    context.strokeStyle = messageBorderColor;
    context.fillStyle = messageBackgroundColor;
    context.fill(new Path2D(roundedRectPath(x, y, width, height, x)));
    context.stroke(new Path2D(roundedRectPath(x, y, width, height, x)));
    wrapText("Переверните экран, или растяните окно браузера", x * 2, x * 2, width - x * 4, 18);
  }
}
setInterval(gameLoop, 10);

canvas.onclick = function(event) {
  let rect = canvas.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top
  currentScene.onClick(x, y);
}

// нарисовать прямоугольник
function roundedRectPath(x,y,w,h,r){
  r = (Math.min(w,h)/2 > r)? r : Math.min(w,h)/2;
  return `M ${x + r} ${y} l ${w-2*r} 0 q ${r} 0 ${r} ${r}
      l 0 ${h-2*r} q 0 ${r} ${-r} ${r}
      l ${-w+2*r} 0 q ${-r} 0 ${-r} ${-r}
      l 0 ${-h+2*r} q 0 ${-r} ${r} ${-r}`;
}

// отрисовать текст с переносом
function wrapText(text, marginLeft, marginTop, maxWidth, lineHeight)
{
  context.font = '20px serif'
  context.fillStyle = messageFontColor;
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

// реплика
class line {
  constructor(heroImage, message, isOnRight = false){
    this.heroImage = heroImage;
    this.message = message;
    this.isOnRight = isOnRight;
  }
}

class gameButton {
  constructor(y, message){
    this.color = messageBackgroundColor;
    this.borderColor = messageBorderColor;
    this.y = y;
    this.message = message;
  }
}

class gameAnswer {
  constructor(text, comment, nextScene, isCorrect){
    this.text = text;
    this.comment = comment;
    this.nextScene = nextScene;
    this.isCorrect = isCorrect;
  }
}

// базовый класс сцены
class sceneBase extends scene {
  constructor(background){
    super();
    // фон
    this.background = background;
  }

  // отрисовать фон
  drawBackground(){
    if(this.background == null) return;
    const aspectRatio = this.background.naturalHeight / this.background.naturalWidth;
    let height = window.innerHeight;
    let width = height / aspectRatio;
    if(width < canvas.width){
        //canvas.width = width;
    }
    else {
      canvas.width = width;
    }
    canvas.height = height;
    context.drawImage(this.background, 0, 0, width, height);
  }
}

// сцена - монолог
class monologueScene extends sceneBase{
  constructor(background, monolog){
    super(background);
    // набор реплик монолога
    this.monolog = monolog;
    // следующая сцена
    this.nextScene = new scene();
    // подсчёт реплик персонажей
    this.lineCount = 0;
    // подсчёт символов в реплике (для плавного, посимвольного отображения реплики)
    this.charCount = 0;
    // "снимок" реплики персонажа (для плавного, посимвольного отображения реплики)
    this.lineSnapshot = "";
    // счётчик игровых тиков
    this.gameTickCount = 0;
    // флаг конца реплики
    this.lineIsOver = false;
    // флаг сцена закончена
    this.sceneIsOver = false;
  }

  // отрисовать реплику
  drawLine(){
    let x = window.innerWidth * 0.01;
    let y = canvas.height * 0.8;
    let width = canvas.width - x * 2;
    let height = canvas.height * 0.2 - x;
    context.strokeStyle = messageBorderColor;
    context.fillStyle = messageBackgroundColor;
    context.fill(new Path2D(roundedRectPath(x, y, width, height, 10)));
    context.stroke(new Path2D(roundedRectPath(x, y, width, height, 10)));
    wrapText(this.lineSnapshot, x + 20, y + 20, width - 20, 18);
  }

  draw(){
    this.drawBackground();
    this.drawLine();
  }

  // обновление состояния сцены
  update() {
    if(this.gameTickCount < 6) this.gameTickCount++;
    else if(this.charCount < this.monolog[this.lineCount].length){
      this.lineSnapshot += this.monolog[this.lineCount][this.charCount++];
      this.gameTickCount = 0;
    }
    else if (this.lineCount + 1 < this.monolog.length) {
      this.lineIsOver = true;
    }
    else{
      this.sceneIsOver = true;
    }
  }

  // обработка клика
  onClick(x, y) {
    if(this.lineIsOver) {
      this.lineCount++;
      this.lineSnapshot = "";
      this.charCount = 0;
      this.lineIsOver = false;
    }
    else if(!this.sceneIsOver && !this.lineIsOver){
      this.charCount = this.monolog[this.lineCount].length;
      this.lineSnapshot = this.monolog[this.lineCount];
      if (this.lineCount + 1 < this.monolog.length) {
        this.lineIsOver = true;
      }
      else{
        this.sceneIsOver = true;
      }
    }
    else if(this.sceneIsOver && this.nextScene != null){
      currentScene = this.nextScene;
    }
  }
}

class questionScene extends sceneBase{
  constructor(background, answers){
    super(background);
    // вопросы
    this.answers = answers;

    this.padding = window.innerWidth * 0.05;

    this.distanceBetweenButtons = window.innerWidth * 0.01;
    
    this.buttonsWidth = canvas.width - this.padding * 2;
    
    this.buttonsPadding = window.innerWidth * 0.01;

    this.buttonsHeight = this.buttonsPadding * 2 + 18 * 2;

    this.buttons = new Array();
    this.buttons[0] = new gameButton(this.padding, answers[0].text);
    for(let i = 1; i < answers.length; i++){
      this.buttons[i] = new gameButton(this.distanceBetweenButtons + this.buttons[i-1].y + this.buttonsHeight, answers[i].text);
    }

    this.answerIsSelected = false;
    this.selectedAnswerNumber = -1;
    this.answerIsCorrect = false;
    this.sceneIsOver = false;
  }

  drawButtons(){
    for(let i = 0; i < this.buttons.length; i++){
      this.drawButton(this.buttons[i]);
    }
  }

  drawButton(button){
    let padding = this.buttonsPadding;
    context.strokeStyle = button.borderColor;
    context.fillStyle = button.color;
    context.fill(new Path2D(roundedRectPath(this.padding, button.y, this.buttonsWidth, this.buttonsHeight, 10)));
    context.stroke(new Path2D(roundedRectPath(this.padding, button.y, this.buttonsWidth, this.buttonsHeight, 10)));
    wrapText(button.message, this.padding + padding, button.y + padding + 18, this.buttonsWidth - padding, 18);
  }

  drawComment(){
    if(this.answerIsSelected){
      let comment = this.answers[this.selectedAnswerNumber].comment;
      let x = window.innerWidth * 0.01;
      let y = canvas.height * 0.8;
      let width = canvas.width - x * 2;
      let height = canvas.height * 0.2 - x;
      context.strokeStyle = messageBorderColor;
      context.fillStyle = messageBackgroundColor;
      context.fill(new Path2D(roundedRectPath(x, y, width, height, 10)));
      context.stroke(new Path2D(roundedRectPath(x, y, width, height, 10)));
      wrapText(comment, x + 20, y + 20, width - 20, 18);
      this.sceneIsOver = true;
    }
  }

  draw(){
    this.drawBackground();
    this.drawButtons();
    this.drawComment();
  }

  onClick(x, y){
    if(this.sceneIsOver) {
      currentScene = this.answers[this.selectedAnswerNumber].nextScene;
      return;
    }
    
    if(this.answerIsSelected) return;

    for(let i = 0; i < this.buttons.length; i++){
      if(y >= this.buttons[i].y && y <= this.buttons[i].y + this.buttonsHeight){
        this.answerIsSelected = true;
        this.selectedAnswerNumber = i;
        this.answerIsCorrect = this.answers[i].isCorrect;
      }
    }
    if(this.answerIsSelected){
      if(this.answerIsCorrect){
        this.buttons[this.selectedAnswerNumber].color = '#AEC09A';
        this.buttons[this.selectedAnswerNumber].borderColor = '#1A2902';
      }
      else{
        this.buttons[this.selectedAnswerNumber].color = '#BD613C';
        this.buttons[this.selectedAnswerNumber].borderColor = '#AA1803';
      }
    }
  }
}

// диалог - сцена
class dialogueScene extends sceneBase {
  constructor(background, dialogue, nextScene = null){
    super(background);
    // диалог
    this.dialogue = dialogue;
    // следующая сцена
    this.nextScene = nextScene;
    // подсчёт реплик персонажей
    this.lineCount = 0;
    // подсчёт символов в реплике (для плавного, посимвольного отображения реплики)
    this.charCount = 0;
    // "снимок" реплики персонажа (для плавного, посимвольного отображения реплики)
    this.lineSnapshot = "";
    // счётчик игровых тиков
    this.gameTickCount = 0;
    // флаг конца реплики
    this.lineIsOver = false;
    // флаг сцена закончена
    this.sceneIsOver = false;
  }

  // нарисовать персонажа
  drawHero(){
    let hero = this.dialogue[this.lineCount].heroImage;
    if(hero == null) return;
    const aspectRatio = hero.naturalWidth / hero.naturalHeight;
    let width = canvas.width * 0.4;
    let height = width / aspectRatio;
    if(this.dialogue[this.lineCount].isOnRight){
      context.drawImage(hero, canvas.width - width, canvas.height - height, width, height);
    } else{
      context.drawImage(hero, 0, canvas.height - height, width, height);
    }
  }

  // нарисовать сообщение
  drawMessage(){
    
    context.strokeStyle = messageBorderColor;
    context.fillStyle = messageBackgroundColor;

    if(this.dialogue[this.lineCount].isOnRight){
      let marginRight = canvas.width * 0.4;
      let marginButtom = 10;
      let x = 10;
      let y = canvas.height * 0.7;
      let width = canvas.width - x - marginRight;
      let height = canvas.height * 0.3 - marginButtom;
      context.fill(new Path2D(roundedRectPath(x, y, width, height, 10)));
      context.stroke(new Path2D(roundedRectPath(x, y, width, height, 10)));
      wrapText(this.lineSnapshot, x + 20, y + 20, width - 20, 18);
    } else{
      let marginRight = 10;
      let marginButtom = 10;
      let x = canvas.width * 0.4;
      let y = canvas.height * 0.7;
      let width = canvas.width - x - marginRight;
      let height = canvas.height * 0.3 - marginButtom;
      context.fill(new Path2D(roundedRectPath(x, y, width, height, 10)));
      context.stroke(new Path2D(roundedRectPath(x, y, width, height, 10)));
      wrapText(this.lineSnapshot, x + 20, y + 20, width - 20, 18);
    }


  }

  // отрисовка игрового кадра
  draw(){
    if(!imagesLoaded) return;
    this.drawBackground();
    this.drawHero();
    this.drawMessage();
  }

  // обновление состояния сцены
  update() {
    if(this.gameTickCount < 6) this.gameTickCount++;
    else if(this.charCount < this.dialogue[this.lineCount].message.length){
      this.lineSnapshot += this.dialogue[this.lineCount].message[this.charCount++];
      this.gameTickCount = 0;
    }
    else if (this.lineCount + 1 < this.dialogue.length) {
      this.lineIsOver = true;
    }
    else{
      this.sceneIsOver = true;
    }
  }

  // обработка клика
  onClick(x, y) {
    if(this.lineIsOver) {
      this.lineCount++;
      this.lineSnapshot = "";
      this.charCount = 0;
      this.lineIsOver = false;
    }
    else if(!this.sceneIsOver && !this.lineIsOver){
      this.charCount = this.dialogue[this.lineCount].message.length;
      this.lineSnapshot = this.dialogue[this.lineCount].message;
      if (this.lineCount + 1 < this.dialogue.length) {
        this.lineIsOver = true;
      }
      else{
        this.sceneIsOver = true;
      }
    }
    else if(this.sceneIsOver && this.nextScene != null){
      currentScene = this.nextScene;
    }
  }
}

class startScene extends sceneBase {
  constructor(){
    super(images.get('кафе'));
    // реплики
    this.characterMessage = ["Как-то раз, два закодычных друга, Валера и Боря решили встретится"]
    // счётчик реплик
    this.messageCount = 0;
    // "снимок" реплики персонажа для посимвольной анимации
    this.messageSnapshot = "";
    // счётчик игровых тиков
    this.gameTickCount = 0;
    // счётчик символов
    this.charCount = 0;
    // флаг конца реплики
    this.messageIsOver = false;
    // флаг конца сцены
    this.sceneIsOver = true;
  }

  drawMessage(){
    let x = 10;
    let y = canvas.height * 0.7;
    let width = canvas.width - x * 2;
    let height = canvas.height * 0.3 - x;
    context.strokeStyle = messageBorderColor;
    context.fillStyle = messageBackgroundColor;
    context.fill(new Path2D(roundedRectPath(x, y, width, height, 10)));
    context.stroke(new Path2D(roundedRectPath(x, y, width, height, 10)));
    wrapText(this.messageSnapshot, x + 20, y + 20, width - 20, 18);
  }

  draw(){
    if(!imagesLoaded) return;
    this.drawBackground();
    this.drawMessage();
  }

  update() {
    if(this.gameTickCount < 6) this.gameTickCount++;
    else if(this.charCount < this.characterMessage[this.messageCount].length){
      this.messageSnapshot += this.characterMessage[this.messageCount][this.charCount++];
      this.gameTickCount = 0;
    }
    else if (this.messageCount + 1 < this.characterMessage.length) {
      this.messageIsOver = true;
    }
    else{
      this.sceneIsOver = true;
    }
  }

  onClick(x, y) {
    if(this.messageIsOver) {
      this.messageCount++;
      this.messageSnapshot = "";
      this.charCount = 0;
      this.messageIsOver = false;
    }
    else if(this.sceneIsOver){
      let startDialogue = new Array();
      startDialogue[0] = new line(images.get('Валера счастлив'), 'Привет,что нового у тебя случилось на этой неделе?');
      startDialogue[1] = new line(images.get('Даша счастлива'), 'Мне написали письмо мошенники, представляешь?!', true);
      startDialogue[2] = new line(images.get('Валера обескуражен'), 'Ого! Как это случилось?');

      // история о письме (из банка)
      let storyOfTheLetter = new Array();
      storyOfTheLetter[0] = "Я открыл свой ноутбук";
      storyOfTheLetter[1] = "Решил проверить почту";
      storyOfTheLetter[2] = "А там письмо из банка: ";
      storyOfTheLetter[3] = "Ваш аккаунт был взломан!";
      storyOfTheLetter[4] = "Срочно пройдите по ссылке и восстановите пароль!";
      let storyOfTheLetterScene = new monologueScene(images.get('ноутбук'), storyOfTheLetter);

      let dialogue2positive = new Array();
      dialogue2positive[0] = new line(images.get('Валера счастлив'), "Ты молодец! Грамотно поступил!");
      dialogue2positive[1] = new line(images.get('Даша счастлива'), "Спасибо!", true);
      dialogue2positive[2] = new line(images.get('Валера счастлив'), "У моей бабушки был тоже случай...");
      dialogue2positive[3] = new line(images.get('Валера обескуражен'), "Ей позвонил мошенник");

      let dialogue3negative = new Array();
      dialogue3negative[0] = new line(images.get('Даша счастлива'), "Жалко бабушку ((", true);
      let dialogue3negativeScene = new dialogueScene(images.get('кафе'), dialogue3negative);

      let dialogue3positive = new Array();
      dialogue3positive[0] = new line(images.get('Даша счастлива'), "Ого! Твоя бабушка крутая!!", true);
      let dialogue3positiveScene = new dialogueScene(images.get('кафе'), dialogue3positive);

      let storyAboutGrannyAnswers = new Array();
      storyAboutGrannyAnswers[0] = new gameAnswer('Перевести деньги на указанный счёт', 'Мошенник сбросил трубку, деньги украдены', dialogue3negativeScene, false);
      storyAboutGrannyAnswers[1] = new gameAnswer('Сбросить трубку и позвонить в сбербанк, уточнить информацию', 'В сбербанке ответили что со счётом всё впорядке, это был мошенник', dialogue3positiveScene, true);
      let storyAboutGrannyQuestionScene = new questionScene(images.get('комната бабушки'), storyAboutGrannyAnswers);

      let storyAboutGranny = new Array();
      storyAboutGranny[0] = new line(images.get('бабушка'), 'Алло!');
      storyAboutGranny[1] = new line(images.get('мошенник'), 'Светлана Сергеевна? Добрый день! Вас беспокоит сбербанк', true);
      storyAboutGranny[2] = new line(images.get('мошенник'), 'К нам поступила информация о попытке взлома вашего счёта', true);
      storyAboutGranny[3] = new line(images.get('мошенник'), 'Чтобы предотвратить кражу денег необходимо срочно перевести их на другой счёт', true);
      storyAboutGranny[4] = new line(images.get('бабушка'), 'Ох батюшки! Сейчас, сейчас...');
      let storyAboutGrannyScene = new dialogueScene(images.get('комната бабушки'), storyAboutGranny, storyAboutGrannyQuestionScene);

      let dialogue2negative= new Array();
      dialogue2negative[0] = new line(images.get('Валера обескуражен'), "Сочуствую...");
      dialogue2negative[1] = new line(images.get('Даша счастлива'), "Ничего страшного, буду по внимательнее", true);
      dialogue2negative[2] = new line(images.get('Валера обескуражен'), "У моей бабушки был тоже случай...");
      dialogue2negative[3] = new line(images.get('Валера обескуражен'), "Ей позвонил мошенник");

      let storyOfTheLetterAnswers = new Array();
      storyOfTheLetterAnswers[0] = new gameAnswer("Перейти по ссылке, ввести учетные данные, поменять пароль", "С вас снято 100500 миллионов", new dialogueScene(images.get('кафе'), dialogue2negative, storyAboutGrannyScene), false);
      storyOfTheLetterAnswers[1] = new gameAnswer("Позвонить в банк и уточнить о произошедшем", "Оператор банка ответил что аккаунт в безопасности, это мошенники!", new dialogueScene(images.get('кафе'), dialogue2positive, storyAboutGrannyScene), true);
      storyOfTheLetterAnswers[2] = new gameAnswer("Ничего не делать", "...", new dialogueScene(images.get('кафе'), dialogue2positive, storyAboutGrannyScene), true);
      let testQuestion = new  questionScene(images.get('ноутбук'), storyOfTheLetterAnswers);
      storyOfTheLetterScene.nextScene = testQuestion;

      currentScene = new dialogueScene(images.get('кафе'), startDialogue, storyOfTheLetterScene);
    }
  }
}

currentScene = new startScene();