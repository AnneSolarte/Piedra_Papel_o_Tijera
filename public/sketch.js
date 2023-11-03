
let socket;
let player = {
  name: "",
  score: 0,
  action: "Not selected"
}

let opponent = {
  name: "",
  score: 0,
  action: "Not selected"
}

let rockImg;
let paperImg;
let scissorImg;
const rockRect = { x: 550, y: 550, w: 100, h: 100 };
const paperRect = { x: 700, y: 550, w: 100, h: 100 };
const scissorsRect = { x: 850, y: 550, w: 100, h: 100 };
let result = "Waiting opponent";


//Timer
let startingTime = 6;// el timer empezara desde 60 segundos
let lastUpdateTime = 0;
let currentDisplayTime = startingTime; // Tiempo que se muestra actualmente 
let timeStarted = false; //indica si el temporizador ya esta activo
let timerVisible = false; // Controla la visibilidad del temporizador
//-----------------------------------------Socket-------------------------------------//


//-----------------------------------------Socket-------------------------------------//

function setup() {
  frameRate(60)
  createCanvas(1490, 750);
  
  socket = io.connect('http://localhost:3000');

  // Emite la información del jugador cuando se conecta
  socket.emit('playerConnected', player);
  
  rockImg = createImg('./images/rock.png'); 
  rockImg.position(565, 548);
  rockImg.size(70, 85);

  paperImg = createImg('./images/paper.png'); 
  paperImg.position(714, 556);
  paperImg.size(70, 85);

  scissorImg = createImg('./images/scissors.png'); 
  scissorImg.position(863, 555);
  scissorImg.size(70, 85);

  timerImg = createImg('./images/timer.png'); 
  timerImg.position(650, 0);
  timerImg.size(200, 180);

  jake = createImg('./images/jake.png'); 
  jake.position(260, 200);
  jake.size(330, 350);

  rose = createImg('./images/rose.png'); 
  rose.position(900, 200);
  rose.size(280, 350);



  socket.on('gameResult', (data) => {
    if (data.winner === "draw") {
        result = "Empate";
        console.log("Empate!");
    } else if (data.winner === player.name) { 
        // Si el ganador es el jugador local
        player.score += 1;
        result = `¡${player.name} win!`;
        console.log(`¡${player.name} win!`);
    } else if (data.winner === opponent.name) { 
        // Si el ganador es el oponente
        opponent.score += 1;
        result = `¡${opponent.name} win!`;
        console.log(`¡${opponent.name} win!`);
    } 

    setTimeout(() => {
      result = "press start to new round"
    }, 4000);
    
});

    socket.on('playersConnected', () => {
      result = "Ready? Press start"
    })

    socket.on('assignedName', (name) => {
      player.name = name;
      console.log("Nombre asignado:", player.name);
    });

    // Escucha los detalles de los jugadores del servidor
    socket.on('playersDetails', (data) => {
      if (data.player1.name === player.name) {
        player = data.player1;
        opponent = data.player2;
      } else {
        player = data.player2;
        opponent = data.player1;
      }

      console.log("Players: ", player.name, opponent.name)
    });

    socket.on('timerUpdate', (time) => {
      currentDisplayTime = time;
      if (time <= 0) {
          timeStarted = false;
      } else {
          timeStarted = true;
      }
  });

    socket.on('updatePlayerAction', (data) => {
      if (data.player === 'player1') {
          opponent.action = data.action;
      } else if (data.player === 'player2') {
          player.action = data.action;
      }
  });

  
  
}

function mousePressed() {
  if (isInside(mouseX, mouseY, rockRect)) {
      sendAction("rock");
  } else if (isInside(mouseX, mouseY, paperRect)) {
      sendAction("paper");
  } else if (isInside(mouseX, mouseY, scissorsRect)) {
      sendAction("scissor");
  }
}

function isInside(x, y, rect) {
  return x > rect.x && x < rect.x + rect.w && y > rect.y && y < rect.y + rect.h;
}

function sendAction(act) {
  player.action = act;
  socket.emit('playerAction', {
      playerName: player.name,
      action: player.action
  });
}


function draw() {
  background(10);

    let startButton = createButton('Iniciar Juego');
    startButton.position(703, 500); // Posiciona el botón en el centro inferior
    startButton.mousePressed(() => {
        socket.emit('startGame');
    });

    fill('blue');
    rect(rockRect.x, rockRect.y, rockRect.w, rockRect.h);
    fill('red');
    rect(paperRect.x, paperRect.y, paperRect.w, paperRect.h);
    fill('green');
    rect(scissorsRect.x, scissorsRect.y, scissorsRect.w, scissorsRect.h);
    
    //Player 1
    textSize(25);
    fill(255);
    text(`Player: ${player.name}`, windowWidth / 2 - 500, 60);
  
    textSize(25);
    fill(255);
    text(`Score: ${player.score}`, windowWidth / 2 - 500, 90);
  
    //Player 2
    textSize(25);
    fill(255);
    text(`Opponent: ${opponent.name}`, windowWidth / 2 + 300, 60);
  
    textSize(25);
    fill(255);
    text(`Score: ${opponent.score}`, windowWidth / 2 + 300, 90);

    //Result
    textSize(25);
    fill(255);
    text(`Result :${result}`, 600, 200);

    //Action player 1
    textSize(25);
    fill(255);
    text(`Action player:${player.action}`, 450, 300);

    //Action player 2
    textSize(25);
    fill(255);
    text(`Action opponent:${opponent.action}`, 900, 300); 

    // Timer function 
    if (timeStarted) {
      const currentTime = millis();

      //Timer
      fill(255, 230, 16);
      ellipse(windowWidth / 2, 65, 90);
      textSize(35);
      textStyle("BOLD");
      stroke(10)
      fill(0);
      const displayTime = int(currentDisplayTime);
      text(displayTime, windowWidth / 2 -10 , 77);

      result = "Playing"


    if (currentTime - lastUpdateTime >= 1000) {
      // Actualiza el contador de tiempo cada segundo
      if (currentDisplayTime > 0) {
        currentDisplayTime -= 1;
      } else {
        console.log("¡Tiempo agotado!")
        timeStarted = false; // Detiene el temporizador
        currentDisplayTime = 0; // Asegura que el tiempo sea 0
        socket.emit("timeOver");

      }
      lastUpdateTime = currentTime;
  }
}




}
