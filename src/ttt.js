const App = require('./App');

let allClients = App.allClients;
const tttLiveClients = [];
const tttQueue = [];

//Function called on ttt-connection

const Connected = (socket, player, allClients) => {
  tttLiveClients.push({socket, player});
  tttQueue.push({socket, player});
  socket.emit('ttt-connected');
  TTTTryStartGame();

  socket.on('ttt-take-turn', ({playerSelf, playerOther, coords}) => {

    takeTurn(playerSelf, playerOther, coords);
  });

  socket.on('ttt-play-again', ({playerOther}) => {
    const playerOtherClient = tttLiveClients.find(
      client => client.player.id === playerOther.id
    );
    playerOtherClient.socket.emit('ttt-playing-again');
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

};

exports.Connected = Connected;





const TTTTryStartGame = () => {
  //If no other players in queue, wait till another player joins.
  if (tttQueue.length < 2) {
    console.log(`TTT Joined queue: ${tttQueue[0].player.name} `);
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


  for (const client of clients) {
    client.socket.emit('ttt-match-found', playersData)
  }
};

//Function called when turn taken
const takeTurn = (playerSelf, playerOther, coords) => {
  const playerOtherClient = tttLiveClients.find((client) => client.player.id === playerOther.id);

  playerOtherClient.socket.emit('ttt-turn-taken', coords)
};
