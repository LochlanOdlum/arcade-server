const PORT = process.env.PORT || 3005;
const express = require("express");
const socket = require("socket.io");
const cors = require('cors');

//App setup
const app = express();
app.use(cors());

const server = app.listen(PORT, () => {
  console.log("Listening to requests on port 3000");
});


const allClients = [];
//TTT players in queue and in live players have socket prop.
// and 'player' prop. with name, id, value (o or x)

const tttLiveClients = [];
const tttQueue = [];

//Socket setup
const io = socket(server);
io.set('origins', '*:*');

io.on("connection", socket => {
  allClients.push(socket);
  console.log(`Connected to client, id: ${socket.id}`);
  console.log(`${allClients.length} client(s) currently connected`);

  socket.on('ttt-connect', (player) => {
    tttLiveClients.push({socket, player});
    tttQueue.push({socket, player});
    socket.emit('ttt-connected');
    TTTTryStartGame();
  });

  socket.on('take-turn', ({playerSelf, playerOther, coords}) => {

    takeTurn(playerSelf, playerOther, coords);
  });



  socket.on("disconnect", () => {
    const clientIndex = allClients.findIndex(client => client.id === socket.id);
    allClients.splice(clientIndex, 1);
    const clientTTTIndex = tttQueue.findIndex(client => client.socket.id === socket.id);
    if (clientTTTIndex !== -1) {
      tttQueue.splice(clientTTTIndex, 1);
    }
    const liveClientTTTIndex = tttLiveClients.findIndex(client => client.socket.id === socket.id);
      tttQueue.splice(liveClientTTTIndex, 1);

    console.log(`Disconnected from client, id: ${socket.id}`);
    console.log(`${allClients.length} client(s) currently connected`);
  });
});

//Function called to first start game between two players
const TTTTryStartGame = () => {
  //If no other players in queue, wait till another player joins.
  if (tttQueue.length < 2) {
    console.log(`Joined queue: ${tttQueue[0].player.name} `);
    return;
  }
  //Pair of players formed below
  const [client1, client2] = tttQueue.splice(0, 2);

  if (Math.random() > 0.5) {
    client1.player.value = 'x';
    client2.player.value = 'o';
} else {
    client1.player.value = 'o';
    client2.player.value = 'x';
  }

  const playersData = [client1.player, client2.player];
  const clients = [client1, client2];

  // for (const client of clients) {
  //   const tttLiveClient = tttLiveClients.find((tttClient) => tttClient.player.id === client.player.id);
  //
  // }

  for (const client of clients) {
    client.socket.emit('match-found', playersData)
  }
};

//Function called when turn taken
const takeTurn = (playerSelf, playerOther, coords) => {
  const playerOtherClient = tttLiveClients.find((client) => client.player.id === playerOther.id);

  playerOtherClient.socket.emit('turn-taken', coords)
};
