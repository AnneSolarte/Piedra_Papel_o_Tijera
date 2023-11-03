import * as http from 'http';
import express from 'express'
import cors from "cors"
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express()

const server = createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors()); 

app.use(express.static('public'))


const players = {
  player1: {
    id: 0,
    name: "",
    score: 0,
    action: ""
  },
  player2: {
    id: 0,
    name: "",
    score: 0,
    action: ""
  }
};

let gameTimer;
const timerDuration = 10000; // 10 segundos


io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);

    let assignedName = '';

    if (!players.player1.id) {
        players.player1.id = socket.id;
        players.player1.name = "Player 1";
        assignedName = players.player1.name;
    } else if (!players.player2.id) {
        players.player2.id = socket.id;
        players.player2.name = "Player 2";
        assignedName = players.player2.name;
        io.emit('start-timer');
        io.emit('playersConnected');
    }

    // Envía el nombre asignado al cliente
    console.log('assignedName', assignedName)
    socket.emit('assignedName', assignedName);


    console.log("Players: ", players.player1.id, players.player2.id)
    // Emite detalles a ambos jugadores
    io.emit('playersDetails', players);

    socket.on('startGame', () => {
        // Inicia el temporizador
        let timeLeft = timerDuration / 1000; // Convertir a segundos
        clearInterval(gameTimer);
        gameTimer = setInterval(() => {
            io.emit('timerUpdate', timeLeft);
            timeLeft--;
            if (timeLeft < 0) {
                clearInterval(gameTimer);
                // Lógica para determinar el ganador
                if (players.player1.action && players.player2.action) {
                    const winner = determineWinner(players.player1.action, players.player2.action);
                    io.emit('gameResult', { winner: winner });
                    players.player1.action = "";
                    players.player2.action = "";
                } else {
                    io.emit('gameResult', { winner: 'no-action' });
                }
            }
        }, 1000);
    });


    socket.on('playerAction', ({ playerName, action }) => {
      if (players.player1.name === playerName) {
          players.player1.action = action;
      } else if (players.player2.name === playerName) {
          players.player2.action = action;
      }
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id);
        if (players.player1.id === socket.id) players.player1.id = null;
        if (players.player2.id === socket.id) players.player2.id = null;
    });
});

function determineWinner(action1, action2) {
    if (action1 === action2) {
        return 'draw';
    } else if (
        (action1 === 'rock' && action2 === 'scissor') ||
        (action1 === 'scissor' && action2 === 'paper') ||
        (action1 === 'paper' && action2 === 'rock')
    ) {
        return 'Player 1';
    } else {
        return 'Player 2';
    }
}

server.listen(3000, () => {
    console.log('LISTENING PORT 3000')
});



