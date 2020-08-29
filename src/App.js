const PORT = process.env.PORT || 3005;
const express = require("express");
const socket = require("socket.io");
const TTT = require('./ttt');

//App setup
const app = express();

//Pass as argument to cors
// let corsOptions = {
//   origin: 'http://example.com',
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// }


const server = app.listen(PORT, () => {
  console.log("Listening to requests on port 3005");
});


const allClients = [];
//TTT players in queue and in live players have socket prop.
// and 'player' prop. with name, id, value (o or x) and score.

const tttLiveClients = [];
const tttQueue = [];

//Socket setup
const io = socket(server);

io.origins('*:*');

io.on("connection", socket => {
  allClients.push(socket);
  console.log(`Connected to client, id: ${socket.id}`);
  console.log(`${allClients.length} client(s) currently connected`);

  socket.on('ttt-connect', (player) => {
    console.log('ttt-connected');
    TTT.Connected(socket, player, allClients);
  });

  socket.on('C4-connect', (player) => {
    console.log('C4-connected');
  });



});

exports.allClients = allClients;

