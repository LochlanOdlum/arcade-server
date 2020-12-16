const PORT = process.env.PORT || 3005;
const express = require("express");
const socket = require("socket.io");
const TTT = require('./ttt.js');

const C4 = require('./C4');

//App setup
const app = express();

const server = app.listen(PORT, () => {
  console.log("Listening to requests on port 3005");
});


const allClients = [];
//TTT players in queue and in live players have socket prop.
// and 'player' prop. with name, id, value (o or x) and score.
//Socket setup
const io = socket(server);

io.origins('*:*');

io.on("connection", socket => {
  allClients.push(socket);

  socket.on('ttt-connect', (player) => {
    TTT.connected(socket, player);
  });

  socket.on('C4-connect', (player) => {
    C4.connected(socket, player);
  });

  socket.on('disconnect', () => {
    const clientIndex = allClients.findIndex(client => client.id === socket.id);
    allClients.splice(clientIndex, 1);

  })


});

