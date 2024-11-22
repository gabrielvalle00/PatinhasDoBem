const express = require("express");
const router = require('./src/Routes/routesapp');
const cors = require("cors");
const { createServer } = require('node:http');
const path = require ('node:path')
const { Server } = require("socket.io");


const app = express();

const newDirName = path.resolve(__dirname, '..','WEB');;
app.use(express.static(newDirName))

const server = createServer(app);
const io = new Server(server);

require("dotenv-safe").config();
const cookieParser = require('cookie-parser');


app.use(cors())

const port= process.env.PORT !== undefined? process.env.PORT:3000;



io.on('connection', (socket) => {
  // Verifique o token aqui, se necessário
  socket.on('chatInject', (contatoID) => {
    if (contatoID) {
      socket.join(`${contatoID}Message`); 
    }
  })

  socket.on('sendMessage', (dataMessage) => {
    console.log(dataMessage)
    if (dataMessage.contatoID) {
      io.to(`${dataMessage.contatoID}Message`).emit('sendMessage', {messageSender: dataMessage.myName, message: dataMessage.messageText, idMensagem: dataMessage.idMensagem, myID: dataMessage.myID} ); 
    }
  })
})



app.use(cookieParser());
app.use(express.json());


// const corsOptions = {
//   origin: 'http://192.168.2.253:5000',
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   preflightContinue: false,
//   optionsSuccessStatus: 204
// }

app.use((req,res,next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    next()
  })
 app.use('/', router)


server.listen(port , () => {
    console.log(`Servidor respondendo na porta ${port}`);
});

module.exports = server