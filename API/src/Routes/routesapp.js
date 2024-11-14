require("dotenv-safe").config();
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const UsuarioController = require ('../Controllers/UsuarioController');
const petManagement = require("../Controllers/petController");
const userInteractController = require("../Controllers/userInteractController");
const solicitacaoContatoController = require("../Controllers/solicitacaoContatoController");
const interesseController = require("../Controllers/interesseController");
const contatoController = require("../Controllers/ContatoController");
const mensagemController = require("../Controllers/mensagemController");
const notificacaoController = require("../Controllers/notificacaoController");
const UsuariosBloqueadosController = require("../Controllers/UsuariosBloqueadosController");
const denunciaController = require("../Controllers/denunciaController");
const postagemController = require("../Controllers/postagemController");

const { join } = require('node:path');
const path = require('node:path');
const avaliacaoController = require("../Controllers/avaliacaoController");
const comentarioController = require("../Controllers/comentarioController");


const newDirName = path.resolve(__dirname, '..','..', '..' ,'WEB', 'View','Pages');


function verificadorDoToken(req, res, next){
  let token;

  if(req.headers.authorization) {
    token = req.headers['authorization'];
  }else if (req.cookies.token) {
    token = req.cookies.token;
  }


  
  if (!token) return res.status(401).json({ auth: false, message: 'Não foi informado nenhum token.' });
  
  jwt.verify(token, process.env.SECRET, function(err, decoded) {
    if (err) return res.status(500).json({ auth: false, message: 'Falha ao tentar autenticar o token.' });
    
    // se tudo estiver ok, salva no request para uso posterior
    req.dataUser = {ID:decoded.ID,Nome:decoded.Nome, CEP:decoded.CEP,Rua: decoded.Rua,
      Numero: decoded.Numero,
      Bairro: decoded.Bairro,
      Estado: decoded.Estado,
      DataNasc: decoded.DataNasc,
      Email: decoded.Email,
      Administrador: decoded.Administrador,
      Cidade: decoded.Cidade};
    next();
  });
}


router.get('/', (req, res) => {
  res.sendFile(path.join(newDirName, 'home.html'));
});

router.get('/Home', (req, res) => {
  res.sendFile(path.join(newDirName, 'home.html'));
});


router.get('/LoginPage', (req, res) => {
  res.sendFile(path.join(newDirName, 'Login.html'));
});


router.get('/FeedDeNoticias',verificadorDoToken, (req, res) => {
  res.sendFile(path.join(newDirName, 'Feed.html'));
});

router.get('/MeuPerfil',verificadorDoToken, (req, res) => {
  res.sendFile(path.join(newDirName, 'Perfil.html'));
});


router.get('/PerfilUser',verificadorDoToken, (req, res) => {
  res.sendFile(path.join(newDirName, 'Perfil.html'));
});



router.get("/Out", verificadorDoToken, (req, res) => {
 res.cookie('token', undefined, {
  secure: true, // O cookie só será enviado em conexões HTTP
  httpOnly: true, // O cookie não será acessível via JavaScript no navegador
  maxAge: 3600000 // Tempo de vida do cookie em milissegundos (1 hora)
  })
 res.end()
})


// rota para o usuário fazer um cadastro no site.
router.post("/Cadastro",UsuarioController.cadastraUsuario)


//Rota para o usuário logar no site (será retornado um token ao mesmo)
 router.post('/Login' ,UsuarioController.autenticaUsuario) 


//Rota para cadastrar os dados de um novo pet 
 router.post ("/CadastraPet",verificadorDoToken,petManagement.cadastraPet);


  //Rota para Editar informações de um pet já cadastrado.
 router.put("/EditaPetInfo", verificadorDoToken,petManagement.editaPetInfo);


 //remove um pet da adoção ou inativa (obs: todos registros com status 1 está para adoção, todos registros com status 0 é por que foram doados graças a rede e só inativamos o registro).
 router.delete ("/RetiraPetAdocao",verificadorDoToken,petManagement.removePetDaAdocao)



  //puxa todos animais de um usuário especifico.
  router.get("/PetsUser/:UserID", verificadorDoToken, petManagement.petsDeUmUsuario)


  //puxa todos animais que estão para adoção no mesmo estado da pessoa.
  router.post("/PetsAdocao", verificadorDoToken, petManagement.petsParaAdocao)


  //Rota que pode-se demonstrar interesse em um pet
  router.post ("/DemonstrarInteressePet", verificadorDoToken, interesseController.demonstrarInteresseEmPet)


  //Rota para ver todos animais que eu demonstrei interesse
  router.get ("/InteressadosMeuPet/:MeuPetID", verificadorDoToken, interesseController.interessadosMeuPet)


  //Rota para ver os pets no qual eu demonstrei interesse
  router.get ("/MeusInteresses", verificadorDoToken, interesseController.meusInteresses)


  //Rota para tirar interesse em algum pet
  router.delete ("/RemoverInteressePet", verificadorDoToken, interesseController.removerInteressePet);


  //Rota para Solicitar amizade de um usuário sem que haja interesse em algum de seus pets.

  router.post ("/SolicitaAmizade", verificadorDoToken, solicitacaoContatoController.enviarSolicitacaoDeAmizade)


  //Rota para remover uma solicitação de amizade que enviamos a algum usuário.
  router.delete ("/RemoveSolicitacao", verificadorDoToken, solicitacaoContatoController.removeSolicitacaoDeAmizade)

 //Rota para ver solicitações de amizades enviadas para mim
  router.get("/MinhasSolicitacoes",verificadorDoToken,solicitacaoContatoController.minhasSolicitacoes);

  //Rota para aceitar uma solicitação de amizade enviada para o usuário logado
  router.post("/AceitaSolicitacaoAmizade",verificadorDoToken,solicitacaoContatoController.aceitaSolicitacao)

  //Rota para tirar um outro usuário da lista de contatos do usuário logado.
  router.delete("/RemoveUsuarioDaListaDeContatos",verificadorDoToken,contatoController.removeUsuarioDaListaDeContatos)

  //Rota para obter dados de perfil de usuários do site (chamar quando quiser ver o perfil de um usuário, ou ver o seu próprio perfil).
  router.get("/ProfileUser/:userBeReturnedID",verificadorDoToken,userInteractController.profileUser);

  //Rota para trazer meus proprios dados de perfil
  router.get("/MyProfile",verificadorDoToken,userInteractController.profileUser);

  //Rota para o ADM Remover um usuário do sistema, ou o próprio usuário se remover do sistema permanentemente
  router.delete("/RemoveDadosUsuario",verificadorDoToken,UsuarioController.removeDadosUsuario);

  //Rota para o Usuário conseguir alterar seus dados cadastrais
  router.put("/EditaDados",verificadorDoToken, UsuarioController.editaDadosCadastrais);


  //Rota para puxar dados de todos em minha lista de contato
  router.get("/MeusContatos",verificadorDoToken, contatoController.meusContatos)

  //Rota para puxar as mensagens que tiveram entre o contato selecionado.
  router.get("/MensagensContato/:IDContato",verificadorDoToken,mensagemController.mensagensContato);


  //Rota para enviar uma mensagem para o contato selecionado
  router.post("/EnviaMensagem",verificadorDoToken,mensagemController.enviaMensagem);

  //Rota para deletar/inativar uma mensagem enviada, para que não seja mais demonstrada ao outro usuário.
  router.put("/DeletaMensagemEnviada", verificadorDoToken,mensagemController.deletaMensagemEnviada)

  // rota para receber nossas notificações
  router.get ("/Notificacoes", verificadorDoToken, notificacaoController.MinhasNotificacoes  )

  //rota para marcar todas visualizações do usuário como vistas.
  router.put("/MarcarNotificacoesVisto", verificadorDoToken, notificacaoController.marcarNotificacoesComoVisualizadas)

  //rota para o ADM BLOQUEAR UM USUÁRIO DO SISTEMA
  router.post ("/BloquearUsuario", verificadorDoToken, UsuariosBloqueadosController.bloquearUmUsuario)

  // rota para qualquer usuário denunciar uma postagem
  router.post ("/DenunciarPostagem", verificadorDoToken, denunciaController.denunciarPostagem)

  //Rota para criar um novo post
  router.post ("/CriarPostagem", verificadorDoToken, postagemController.criaPostagem)

  //Rota para editar os dados da postagem que o usuário fez.
  router.put ("/EditarPostagem", verificadorDoToken, postagemController.editarPostagem)

  //Rota para puxar as ultimas 50 postagens feitas por usuarios, (solicita de 50 em 50)
  router.post ("/VerPostagens", verificadorDoToken, postagemController.verPostagens)

  //Rota para reagir/avaliar uma postagem com "like", "uau" ou "amei"
  router.post ("/ReagirPostagem", verificadorDoToken, avaliacaoController.reagirPostagem)

  //rota para retirar uma reação de uma postagem
  router.delete ("/RemoverReacao/:IDPostagem", verificadorDoToken, avaliacaoController.removerReacao)

  //rota para efetuar um comentário em algum post
  router.post ("/comentarPost", verificadorDoToken, comentarioController.comentarEmUmPost)

  //

module.exports = router;