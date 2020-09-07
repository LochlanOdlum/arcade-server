const C4LiveClients = [];
const C4Queue = [];

const connected = (socket, player) => {

  C4LiveClients.push({socket, player});
  C4Queue.push({socket, player});
  socket.emit('C4-connected');
  C4TryStartGame();

  socket.on('logAll', () => {
    for (const client of C4LiveClients) {
      client.socket.emit('logAll');
    }
  });

  socket.on('C4-take-turn', ({x, playerOther}) => {
    const playerOtherClient = C4LiveClients.find((client) => client.player.id === playerOther.id);
    playerOtherClient.socket.emit('C4-turn-taken', x);
  });

  socket.on("disconnect", () => {
    const clientC4Index = C4Queue.findIndex(client => client.socket.id === socket.id);
    if (clientC4Index !== -1) {
      C4Queue.splice(clientC4Index, 1);
    }
    const liveClientC4Index = C4LiveClients.findIndex(client => client.socket.id === socket.id);
    C4LiveClients.splice(liveClientC4Index, 1);
  });
};

exports.connected = connected;

const C4TryStartGame = () => {
  //If no other players in queue, wait till another player joins.
  if (C4Queue.length < 2) {
    console.log(`C4 Joined queue: ${C4Queue[0].player.name} `);
    return;
  }
  //Pair of players formed below
  const [client1, client2] = C4Queue.splice(0, 2);

  if (Math.random() > 0.5) {
    client1.player.value = 'red';
    client2.player.value = 'yellow';
  } else {
    client1.player.value = 'yellow';
    client2.player.value = 'red';
  }

  const playersData = [client1.player, client2.player];
  const clients = [client1, client2];

  for (const client of clients) {
    client.socket.emit('C4-match-found', playersData)
  }
};


