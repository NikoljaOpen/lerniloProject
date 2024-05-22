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
  constructor(text, comment, isCorrect = false){
    this.text = text;
    this.comment = comment;
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
  constructor(background){
    super(background);
    // набор реплик монолога
    this.monolog = new Array();
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

  AddLine(message){
    this.monolog.push(message);
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
  constructor(background){
    super(background);
    // вопросы
    this.answers = new Array();

    this.padding = window.innerWidth * 0.05;

    this.distanceBetweenButtons = window.innerWidth * 0.01;
    
    this.buttonsWidth = canvas.width - this.padding * 2;
    
    this.buttonsPadding = window.innerWidth * 0.01;

    this.buttonsHeight = this.buttonsPadding * 2 + 18 * 2;

    this.nextPositiveScene = null;
    this.nextNegativeScene = null;

    this.buttons = new Array();
    this.answerIsSelected = false;
    this.selectedAnswerNumber = -1;
    this.answerIsCorrect = false;
    this.sceneIsOver = false;
  }

  AddAnswer(text, comment, isCorrect = false){
    this.answers.push(new gameAnswer(text, comment, isCorrect));
    if(this.answers.length == 1)
      this.buttons.push(new gameButton(this.padding, this.answers[0].text));
    else{
      let i = this.answers.length - 1;
      this.buttons.push(new gameButton(this.distanceBetweenButtons + this.buttons[i-1].y + this.buttonsHeight, this.answers[i].text));
    }
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
      //currentScene = this.answers[this.selectedAnswerNumber].nextScene;
      if(this.answers[this.selectedAnswerNumber].isCorrect)
        currentScene = this.nextPositiveScene;
      else
        currentScene = this.nextNegativeScene;
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
  constructor(background){
    super(background);
    // диалог
    this.dialogue = new Array();
    // следующая сцена
    this.nextScene = null;
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

  AddLine(image, message, isOnRight = false){
    this.dialogue.push(new line(images.get(image), message, isOnRight));
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
      let startScene = new dialogueScene(images.get('кафе'));
      startScene.AddLine('Валера счастлив', 'Привет,что нового у тебя случилось на этой неделе?');
      startScene.AddLine('Даша счастлива', 'Мне написали письмо мошенники, представляешь?!', true);
      startScene.AddLine('Валера обескуражен', 'Ого! Как это случилось?');
      
      let storyOfTheLetterScene = new monologueScene(images.get('ноутбук'));
      startScene.nextScene = storyOfTheLetterScene;
      storyOfTheLetterScene.AddLine("Я открыл свой ноутбук");
      storyOfTheLetterScene.AddLine("Решил проверить почту");
      storyOfTheLetterScene.AddLine("А там письмо из банка: ");
      storyOfTheLetterScene.AddLine("Ваш аккаунт был взломан!");
      storyOfTheLetterScene.AddLine("Срочно пройдите по ссылке и восстановите пароль!");

      let storyOfTheLetterQuestions = new  questionScene(images.get('ноутбук'));
      storyOfTheLetterScene.nextScene = storyOfTheLetterQuestions;
      storyOfTheLetterQuestions.AddAnswer("Перейти по ссылке, ввести учетные данные, поменять пароль", "С вас снято 100500 миллионов");
      storyOfTheLetterQuestions.AddAnswer("Позвонить в банк и уточнить о произошедшем", "Оператор банка ответил что аккаунт в безопасности, это мошенники!", true);
      storyOfTheLetterQuestions.AddAnswer("Ничего не делать", "...", true);

      let storyOfTheLetterNegative = new dialogueScene(images.get('кафе'));
      storyOfTheLetterQuestions.nextNegativeScene = storyOfTheLetterNegative;
      storyOfTheLetterNegative.AddLine('Валера обескуражен', "Сочуствую...");
      storyOfTheLetterNegative.AddLine('Даша счастлива', "Ничего страшного, буду по внимательнее", true);
      storyOfTheLetterNegative.AddLine('Валера обескуражен', "У моей бабушки был тоже случай...");
      storyOfTheLetterNegative.AddLine('Валера обескуражен', "Ей позвонил мошенник");

      let storyOfTheLetterPositive = new dialogueScene(images.get('кафе'));
      storyOfTheLetterQuestions.nextPositiveScene = storyOfTheLetterPositive;
      storyOfTheLetterPositive.AddLine('Валера счастлив', "Ты молодец! Грамотно поступил!");
      storyOfTheLetterPositive.AddLine('Даша счастлива', "Спасибо!", true);
      storyOfTheLetterPositive.AddLine('Валера счастлив', "У моей бабушки был тоже случай...");
      storyOfTheLetterPositive.AddLine('Валера обескуражен', "Ей позвонил мошенник");

      let storyAboutGranny = new dialogueScene(images.get('комната бабушки'));
      storyOfTheLetterNegative.nextScene = storyAboutGranny;
      storyOfTheLetterPositive.nextScene = storyAboutGranny;
      storyAboutGranny.AddLine('бабушка', 'Алло!');
      storyAboutGranny.AddLine('мошенник', 'Светлана Сергеевна? Добрый день! Вас беспокоит сбербанк', true);
      storyAboutGranny.AddLine('мошенник', 'К нам поступила информация о попытке взлома вашего счёта', true);
      storyAboutGranny.AddLine('мошенник', 'Чтобы предотвратить кражу денег необходимо срочно перевести их на другой счёт', true);
      storyAboutGranny.AddLine('бабушка', 'Ох батюшки! Сейчас, сейчас...');

      let storyAboutGrannyQuestions = new questionScene(images.get('комната бабушки'));
      storyAboutGranny.nextScene = storyAboutGrannyQuestions;
      storyAboutGrannyQuestions.AddAnswer('Перевести деньги на указанный счёт', 'Мошенник сбросил трубку, деньги украдены', false);
      storyAboutGrannyQuestions.AddAnswer('Сбросить трубку и позвонить в сбербанк, уточнить информацию', 'В сбербанке ответили что со счётом всё впорядке, это был мошенник', true);

      let storyAboutGrannyPositive = new dialogueScene(images.get('кафе'));
      storyAboutGrannyQuestions.nextPositiveScene = storyAboutGrannyPositive;
      storyAboutGrannyPositive.AddLine('Даша счастлива', "Ого! Твоя бабушка крутая!!", true);
      storyAboutGrannyPositive.AddLine('Даша счастлива', "У моего друга была похожая ситуация на днях", true);

      let storyAboutGrannyNegative = new dialogueScene(images.get('кафе'));
      storyAboutGrannyQuestions.nextNegativeScene = storyAboutGrannyNegative;
      storyAboutGrannyNegative.AddLine('Даша счастлива', "Жалко бабушку ((", true);
      storyAboutGrannyNegative.AddLine('Даша счастлива', "У моего друга была похожая ситуация на днях", true);

      let storyFriendInNeed = new monologueScene(images.get('чат'));
      storyAboutGrannyNegative.nextScene = storyFriendInNeed;
      storyAboutGrannyPositive.nextScene = storyFriendInNeed;
      storyFriendInNeed.AddLine("Мне написал друг с просьбой о помощи");

      let storyFriendInNeedQuestions = new questionScene(images.get('чат'));
      storyFriendInNeed.nextScene = storyFriendInNeedQuestions;
      storyFriendInNeedQuestions.AddAnswer('Отправить деньги другу', 'Друга взломали, вы отправили деньги мошеннику');
      storyFriendInNeedQuestions.AddAnswer('Позвонить другу и уточнить, он ли это', 'Друг сказал что его взломали, он восстанавливает доступ', true);
      storyFriendInNeedQuestions.AddAnswer('Распросить друга и отправить деньги', 'Друга взломали, вы отправили деньги мошеннику');

      let storyFriendInNeedPositive = new dialogueScene(images.get('кафе'));
      storyFriendInNeedQuestions.nextPositiveScene =  storyFriendInNeedPositive;
      storyFriendInNeedPositive.AddLine('Валера счастлив', 'Твоего друга не проведёш!');
      storyFriendInNeedPositive.AddLine('Валера счастлив', 'Моему другу недавно предложили инвестировать');

      let storyFriendInNeedNegative = new dialogueScene(images.get('кафе'));
      storyFriendInNeedQuestions.nextNegativeScene = storyFriendInNeedNegative;
      storyFriendInNeedNegative.AddLine('Валера обескуражен', 'Бывает...');
      storyFriendInNeedNegative.AddLine('Валера счастлив', 'Моему другу недавно предложили инвестировать');

      let investmentStory = new dialogueScene(images.get('дом'));
      storyFriendInNeedNegative.nextScene = investmentStory;
      storyFriendInNeedPositive.nextScene = investmentStory;
      investmentStory.AddLine('Дима звонит', 'Здравствуйте! Хотим вам предложить проинвестировать в нашь проект с доходностью 200%');
      investmentStory.AddLine('Дима звонит', 'Мы быстро растём, нашь зароботок складывается за счёт уникальной системы рекламы');
      investmentStory.AddLine('Дима звонит', 'Список инвесторов ограничен, успейте вложиться!');

      let investmentStoryQuestions = new questionScene(images.get('дом'));
      investmentStory.nextScene = investmentStoryQuestions;
      investmentStoryQuestions.AddAnswer('Нельзя упускать такую возможность, вложу сразу все деньги!', 'Этой компании не существует, вложенные деньги не вернут');
      investmentStoryQuestions.AddAnswer('Это подозрительная компания, вложу немного, вдруг заработаю', 'Этой компании не существует, вложенные деньги не вернут');
      investmentStoryQuestions.AddAnswer('Доходность в 200% явная ложь, сообщу компетентным службам!', 'Вы спасли себя и других людей от мошенников!', true);


      currentScene = startScene;
    }
  }
}

currentScene = new startScene();