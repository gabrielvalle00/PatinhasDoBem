

document.addEventListener('click', function (event) {
  if (event.target && event.target.classList.contains('comment-button')) {
    const commentSection = event.target.closest('.feed-post').querySelector('.comment-section');
    if (commentSection.style.display === 'none' || commentSection.style.display === '') {
      commentSection.style.display = 'flex';
    } else {
      commentSection.style.display = 'none';
    }
  }
});


function showContent(menuId) {
  // Esconde todos os conteúdos
  document.getElementById('mural-content').style.display = 'none';
  document.getElementById('notifications-content').style.display = 'none';
  document.getElementById('view-animals-content').style.display = 'none';
  document.getElementById('Cadastrar-Pets').style.display = 'none'

  // Mostra o conteúdo selecionado
  if (menuId === 'mural') {
    document.getElementById('mural-content').style.display = 'block';
  }
  else if (menuId === 'notifications') {
    document.getElementById('notifications-content').style.display = 'block';
  }
  else if (menuId === 'Cadastro') {
    document.getElementById('Cadastrar-Pets').style.display = 'block'
  }
  else if (menuId === 'view-animals') {
    getingPets()
    document.getElementById('view-animals-content').style.display = 'block';
  }

}

function openPublishModal() {
  document.getElementById('publish-modal').style.display = 'block';
}

function closePublishModal() {
  document.getElementById('publish-modal').style.display = 'none';
}



const inputs = document.querySelectorAll('.animal');
const btnSalvar = document.querySelector('.btn-salvar');

inputs.forEach(input => {
  input.addEventListener('input', () => {
    btnSalvar.disabled = !Array.from(inputs).every(input => input.value.trim() !== '');
  });
});




// // Evento para o botão Comentar
// document.querySelector('.submit-comment').addEventListener('click', function () {
//   const comment = document.querySelector('.comment-input').value;
//   if (comment) {
//     document.querySelector('.comment-input').value = ''; // Limpa o campo de comentário
//   } else {
//     alert('Por favor, escreva um comentário.');
//   }
// });


// // Evento para o botão Publicar comentário
// document.querySelector('.submit-comment').addEventListener('click', function () {
//   const comment = document.querySelector('.comment-input').value;
//   if (comment) {
//     alert('Comentário enviado: ' + comment);
//     document.querySelector('.comment-input').value = ''; // Limpa o campo de comentário
//   } else {
//     alert('Por favor, escreva um comentário.');
//   }
// });



//CONSUMO DE APIS 


//MEUS DADOS
function getMyData() {
  fetch("/MyProfile", {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (myBlob) {

      if (myBlob.success) {
        Cookies.remove('usuarioLogado')
        Cookies.remove('imagemUsuario')
        Cookies.remove("usuarioID")



        Cookies.set("usuarioLogado", myBlob.meusDados.Nome)
        Cookies.set("usuarioID", myBlob.meusDados.ID)

        Cookies.set("imagemUsuario", myBlob.meusDados.UserPicture)

        document.getElementById("userImage").src = `${myBlob.meusDados.UserPicture}`
        document.getElementById("userNameContent").innerHTML = `<a href="/PerfilUser" style ="list-style:none">${myBlob.meusDados.Nome}</a>`
      } else {
        window.location("/LoginPage")
      }
    })
}



getMyData();





//CODIGO DO CHAT EM TEMPO REAL, MANUNTENÇÕES FALAR COM LUCAS.

//ENVIAR MENSAGEM E PUXAR MENSAGENS COM UM CONTATO
const socket = io();

socket.on('sendMessage', (msg) => {
  receberMensagem(msg)
})


function receberMensagem(mensagem) {
  var chatBody = document.getElementById("chat-body");
  var chatImage = document.getElementById("chat-image").files[0];

  // Adiciona a mensagem de texto ao chat

  var mensagemTexto = document.createElement("p");
  mensagemTexto.setAttribute("idmensagem", mensagem.idMensagem)



  if (mensagem.myID !== Cookies.get('usuarioID')) {
    mensagemTexto.textContent = mensagem.messageSender + ": " + mensagem.message;
    chatBody.appendChild(mensagemTexto);
  } else {
    mensagemTexto.textContent = "Você: " + mensagem.message;
    chatBody.appendChild(mensagemTexto);
  }



  // Limpa os campos de entrada após o envio
  document.getElementById("chat-input").value = "";

}


// chat
function enviarMensagem() {
  var chatBody = document.getElementById("chat-body");
  var chatInput = document.getElementById("chat-input").value;
  var chatImage = document.getElementById("chat-image").files[0];

  // Adiciona a mensagem de texto ao chat
  if (chatInput) {
    const storageContact = JSON.parse(localStorage.getItem('talkingNow'))

    fetch("/EnviaMensagem", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "IDContato": storageContact.contactID,
        "Texto": chatInput
      })
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (myBlob) {
        if (myBlob.success) {
          const dataMessage = { contatoID: storageContact.contactID, messageText: chatInput, messageSender: Cookies.get("usuarioLogado"), myID: Cookies.get("usuarioID"), idMensagem: myBlob.idMensagem }
          socket.emit('sendMessage', dataMessage)
          let mensagemTexto = document.createElement("p");
          mensagemTexto.id = myBlob.idMensagem
          chatBody.appendChild(mensagemTexto);
        } else {
          let Mensagem = { messageSender: "SERVIDOR", message: "não foi possivel enviar a mensagem solicitada" }
          receberMensagem(Mensagem)
        }

      })

  }
  // Limpa os campos de entrada após o envio
  document.getElementById("chat-input").value = "";
  // document.getElementById("chat-image").value = "";
}


function toggleList(list) {
  const amigosList = document.getElementById('listContent');
  const interessadosList = document.getElementById('interestedContent');

  if (list === 'amigos') {
    amigosList.style = `display:block`
    interessadosList.style = `display:none`
  } else {
    amigosList.style = `display:none`
    interessadosList.style = `display:block`
  }
}

function abrirChat(dataUsers) {
  console.log(dataUsers)
  document.getElementById('chat-body').innerHTML = ''
  localStorage.clear('talkingNow')

  localStorage.setItem('talkingNow', JSON.stringify({ contactID: dataUsers.id, nameUser: dataUsers.className }))
  fetch(`/MensagensContato/${dataUsers.id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (myBlob) {
      console.log(myBlob)
      let mensagem = {}
      if (myBlob.success) {
        myBlob.messages.forEach(e => {
          if (e.quemEnviouAMensagem === 'Enviado pelo contato') {
            mensagem.messageSender = dataUsers.className
            mensagem.message = e.Texto
            mensagem.idMensagem = e.IDMensagem
          } else {
            mensagem.messageSender = 'Você'
            mensagem.message = e.Texto
            mensagem.idMensagem = e.IDMensagem
          }
          receberMensagem(mensagem)
        })
        document.getElementById('chat-nome').innerText = dataUsers.className;
        document.getElementById('chat-box').style.display = 'block';
        const contactID = myBlob.contactID
        socket.emit('chatInject', contactID)
      } else if (myBlob.error === "não possui nenhuma mensagem com o contato especificado") {
        document.getElementById('chat-nome').innerText = dataUsers.className;
        document.getElementById('chat-box').style.display = 'block';
        const contactID = myBlob.contactID
        socket.emit('chatInject', contactID)
      } else {
        mensagem.message = "Você não pode ver mensagens deste contato, tente novamente"
        mensagem.messageSender = "Servidor"
        receberMensagem(mensagem)
      }
    });

}

function fecharChat() {
  localStorage.clear('talkingNow')
  document.getElementById('chat-box').style.display = 'none';
}





// PUXANDO ANIMAIS QUE ESTÃO PARA ADOÇÃO.

let petGap = 0;
let postGap = 0;
let PetGapUpgrade = true;

async function getingPets() {
  await fetch(`/PetsAdocao`, {
    method: 'POST',
    body: JSON.stringify({ 'gapQuantity': petGap }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (myBlob) {
      if (myBlob.success) {
        document.getElementById('view-animals-content').innerHTML = `<h2>Animais para adoção</h2> 
          <button style="padding: 10px; border: 1px solid; background-color:#4A5C6A ; color:white" onclick="getMyInterests()"><i class="fa-regular fa-heart"></i>  Meus Interesses</button>`
        myBlob.dataResponse.forEach(e => {


          document.getElementById('view-animals-content').innerHTML += `
          <div class="post"">
            <div class="user-info">
              <div class="titulo-pet">
                <p>Informações do pet</p>
              </div>
  
              <div class="formulario-do-pet">
                <p class="descrição"><strong>Tipo de Animal:</strong> ${e.TipoAnimal}</p>
                <p class="descrição"><strong>Linhagem:</strong> ${e.Linhagem}</p>
                <p class="descrição"><strong>Idade:</strong>  ${e.Idade}</p>
                <p class="descrição"><strong>Sexo:</strong> ${e.Sexo}</p>
                <p class="descrição"><strong>Cor:</strong> ${e.Cor}</p>
                <p class="descrição"><strong>Local:</strong> ${e.Cidade} - ${e.Estado}</p>
                <p class="descrição"><strong>Descrição:</strong> ${e.Descricao}</p>
              </div>
              ${e.demonstrouInteresse === true ? `<button class="btn-interesse" style = "background-color: red" id="${e.petID}" onclick = "removeInterest(this)">Remover interesse</button>` : ` <button class="btn-interesse" style = "background-color:#11212D; color:white" id="${e.petID}" onclick = "showInterestOnPet(this)">Tenho Interesse</button>`}
             
            </div>
            <div class="animal-post">
              <img src="${e.petPicture}" alt="Imagem do animal" class="animal-photo">
            </div>
          </div>
      `
        })

      } else {
        document.getElementById('view-animals-content').innerHTML = `
              <h2>Pets para adoção</h2> 
                <button style="padding: 10px; border: 1px solid; background-color:#4A5C6A ; color:white" onclick="getMyInterests()">Meus Interesses</button>
                <h5>não foi identificado pets nas proximidades</h5> 
               `
      }

    })
}







//função para demonstrar interesse em um pet

async function showInterestOnPet(PetID) {
  console.log(PetID.id)
  fetch(`/DemonstrarInteressePet`, {
    method: 'POST',
    body: JSON.stringify({ 'PetID': PetID.id }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (myBlob) {
      if (myBlob.success) {
        getingPets()
        return alert(myBlob.success)
      } else if (myBlob.error) {
        alert(myBlob.error)
      }

    })
}


// função para pegar meus contatos

async function getingMyContacts() {
  await fetch(`/MeusContatos`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (myBlob) {
      if (myBlob.success) {
        if (myBlob.contatosDeInteresses.length >= 1) {
          document.getElementById('interestedContent').innerHTML = ``
          myBlob.contatosDeInteresses.forEach(e => {
            document.getElementById('interestedContent').innerHTML += `
           <li id="${e.contatoID}" class="${e.Nome}" onclick="abrirChat(this)" style = "display:flex; align-items:center; gap:5px; cursor:pointer">
              <div class="img1"><img src="https://firebasestorage.googleapis.com/v0/b/patinhasdobem-f25f8.appspot.com/o/perfil%2F${e.IDUsuario}.jpg?alt=media" alt=""></div>
             ${e.Nome}
            </li>`
          })
        }
        document.getElementById('listContent').innerHTML = ``
        if (myBlob.contatosSemInteresses.length >= 1)
          myBlob.contatosSemInteresses.forEach(e => {
            document.getElementById('listContent').innerHTML += `
          <li id="${e.contatoID}" class="${e.Nome}" onclick="abrirChat(this)" style = "display:flex; align-items:center; gap:5px; cursor:pointer">
             <img class="img1" src="https://firebasestorage.googleapis.com/v0/b/patinhasdobem-f25f8.appspot.com/o/perfil%2F${e.IDUsuario}.jpg?alt=media" alt="">
            ${e.Nome}
           </li>`
          })
      } else if (myBlob.error) {
        console.error(myBlob.error)
      }
    })
}


// função para pegar pets que demonstrei interesse

async function getMyInterests() {
  await fetch(`/MeusInteresses`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (myBlob) {
      if (myBlob.success) {
        myBlob.myInterests.forEach(e => {
          console.log(myBlob)
          document.getElementById('view-animals-content').innerHTML = `
          <h2>Animais que você demonstrou interesse</h2> 
            <button style="padding: 10px; border: 1px solid;background-color:white" onclick="getingPets()"><i class="fa-solid fa-paw"></i> Animais para adoção</button>
              <div class="post"">
                <div class="user-info">
                  <div class="titulo-pet">
                    <p>Você demonstrou interesse</p>
                  </div>
      
                  <div class="formulario-do-pet">
                    <p class="descrição" onclick="perfilUser(${e.IDDoador})"><strong>Dono do pet:</strong> <img src ="https://firebasestorage.googleapis.com/v0/b/patinhasdobem-f25f8.appspot.com/o/perfil%2F${e.IDDoador}.jpg?alt=media" style="border-radius:50%; width:30px;heigth:30px" alt="">"</img>  <a href ="/UserPerfil"> ${e.NomeDoDono} </a></p>
                    <p class="descrição"><strong>Tipo de Animal:</strong> ${e.TipoAnimal}</p>
                    <p class="descrição"><strong>Linhagem:</strong> ${e.Linhagem}</p>
                    <p class="descrição"><strong>Idade:</strong>  ${e.Idade}</p>
                    <p class="descrição"><strong>Sexo:</strong> ${e.Sexo}</p>
                    <p class="descrição"><strong>Cor:</strong> ${e.Cor}</p>
                    <p class="descrição"><strong>Local:</strong> ${e.Cidade} - ${e.Estado}</p>
                    <p class="descrição"><strong>Descrição:</strong> ${e.Descricao}</p>
                  </div>
                 '<button class="btn-interesse" style = "background-color:red" id="${e.ID}" onclick = "removeInterest(this)">Remover Interesse no pet</button>'
                </div>
                <div class="animal-post">
                  <img src="https://firebasestorage.googleapis.com/v0/b/patinhasdobem-f25f8.appspot.com/o/pets%2F${e.ID}.jpg?alt=media" alt="Imagem do animal" class="animal-photo">
                </div>
              </div>
            `

        })
      } else {
        document.getElementById('view-animals-content').innerHTML = `
           <h2>Seus Interesses</h2> 
           <button style="padding: 10px; border: 1px solid" onclick="getingPets()">Ver Animais para adoção</button>
            <h5>Você não demonstrou interesse em nenhum pet.</h5> 
           `
      }
    })
}


// função para salvar o id de quem eu estou tentando ver o perfil, para conseguir acessar na tela meu perfil
function perfilUser(userID) {
  Cookies.remove("perfilSendoVisto")
  Cookies.set("perfilSendoVisto", userID)
}




// função para remover o interesse em algum pet do qual ja demonstrei interesse
async function removeInterest(event) {
  console.log("clicou")
  await fetch(`/RemoverInteressePet`, {
    method: 'DELETE',
    body: JSON.stringify({ "PetID": event.id }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (myBlob) {
      if (myBlob.success) {
        getingPets()
        alert("retirado interesse em pet com sucesso")
      } else {
        alert(myBlob.error)
      }
    })
}



let countNewNotifies = 0;
let notifiesOnly = 0;
let friendInvites = 0;

async function getMyNotifies() {
  await fetch(`/Notificacoes`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (myBlob) {
      console.log(myBlob)
      if (myBlob.success) {
        document.getElementById("bodyNotifies").innerHTML = ``
        myBlob.notifications.forEach(e => {
          if (e.MensagemVisualizada == "False") {
            countNewNotifies = countNewNotifies + 1;
            notifiesOnly = notifiesOnly + 1;
          }

          document.getElementById("notificationButton").innerHTML = ` <i class="fa-solid fa-bell"></i>
          ${countNewNotifies}`

    

          document.getElementById("bodyNotifies").innerHTML += ` <div class="notification">
                <div class="notification-icon">
                  <i class="fas fa-comment"></i>
                </div>
                <div class="notification-content">
                  <p><strong></strong></p>
                  <p>${e.Texto}<a href="#"></a></p>
                </div>
              </div>`

          document.getElementById("notifyContent").innerHTML = `Notificações <span style="border-radius:50%;width:20px;height:20px;display:flex;justify-content:center;align-items:center; color:white;background-color:red">${notifiesOnly}</span>`

        })
      } else {
        document.getElementById("notificationButton").innerHTML = ` <i class="fa-solid fa-bell"></i>
          ${friendInvites}`
        document.getElementById("notifyContent").innerHTML = `Notificações <span style="border-radius:50%;width:20px;height:20px;display:flex;justify-content:center;align-items:center; color:white;background-color:red">${notifiesOnly}</span>`
      }
    })
}


async function checkNotifies() {
  await fetch(`/MarcarNotificacoesVisto`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (myBlob) {
      if (myBlob.success) {
        countNewNotifies = 0;
        notifiesOnly = 0;
        countNewNotifies = friendInvites
        document.getElementById("notificationButton").innerHTML = ` <i class="fa-solid fa-bell"></i>
        ${countNewNotifies}`
      }
    })
}


async function myFriendInvites() {
  await fetch(`/MinhasSolicitacoes`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (myBlob) {
      console.log(myBlob)
      if (myBlob.success) {
        countNewNotifies = countNewNotifies + myBlob.invites.length;

        document.getElementById("notificationButton").innerHTML = ` <i class="fa-solid fa-bell"></i>
        ${countNewNotifies}`
        document.getElementById("friendInviter").innerHTML = `Solicitação de amizade  <span style="border-radius:50%; width:20px;height:20px;display:flex;justify-content:center;align-items:center; color:white;background-color:red">${myBlob.invites.length}</span>`
        document.getElementById("inviteBody").innerHTML = `<div class="solicitacao-amizade">`

        myBlob.invites.forEach(e => {

          document.getElementById("inviteBody").innerHTML += `
                <div class="d-flex align-items-center">
                  <!-- Foto de Perfil -->
                  <img src="https://firebasestorage.googleapis.com/v0/b/patinhasdobem-f25f8.appspot.com/o/perfil%2F${e.IDSolicitante}.jpg?alt=media}" alt="Foto de Perfil" class="rounded-circle me-3">
                  <!-- Nome do Usuário -->
                  <div>
                    <p class="mb-0"><strong>${e.Nome}</strong></p>
                    ${e.Interessado === 1 ? '<small>está interessado em um de seus pets</small>' : '<small>Enviou uma Solicitação</small>'}
                  </div>
                </div>
                <!-- Botões de Ação -->
                <div class="mt-3 d-flex justify-content-around">
                  <button class="btn btn-primary btn-sm" id="${e.ID}" onclick="acceptInvite(this)">Aceitar</button>
                  <button class="btn btn-secondary btn-sm" id="${e.ID}" onclick="rejectInvite(this)">Recusar</button>
                </div>
              </div>
              <hr>`

        })

      } else {
        document.getElementById("friendInviter").innerHTML = `Solicitação de amizade <span style="border-radius:50%; width:20px;height:20px;display:flex;justify-content:center;align-items:center; color:white;background-color:red">0</span>`
      }
    })
}


async function acceptInvite(event) {
  await fetch(`/AceitaSolicitacaoAmizade`, {
    method: 'POST',
    body: JSON.stringify({ "inviteID": event.id }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(function (response) {
      return response.json();
    })
    .then(async function (myBlob) {
      if (myBlob.success) {
        alert("Solicitação de amizade aceita.")
        await getingMyContacts()
        await friendInvites()
      }
    })
}




async function rejectInvite(event) {
  await fetch(`/RemoveSolicitacao`, {
    method: 'DELETE',
    body: JSON.stringify({ "inviteID": event.id }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(function (response) {
      return response.json();
    })
    .then(async function (myBlob) {
      if (myBlob.success) {
        await myFriendInvites()

      }
    })
}



async function getMostRecentPosts() {
  await fetch(`/VerPostagens`, {
    method: 'POST',
    body: JSON.stringify({ "gapQuantity": postGap }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(function (response) {
      return response.json();
    })
    .then(async function (myBlob) {

      if (myBlob.success) {
        document.getElementById("mural-content").innerHTML = `
                <!-- Botão para abrir o modal -->
        <button id="open-modal" class="btn btn-primary" onclick="openPublishModal()">Criar
        Publicação</button>
        <!-- Modal para criar uma publicação -->
        <div id="publish-modal" class="modal" style="display:none;">
          <div class="modal-content">
            <span class="close" onclick="closePublishModal()">&times;</span>
            <h2>Criar Publicação</h2>
            <textarea id="post-content" placeholder="Conteúdo da Postagem" required></textarea>
            <input type="file" id="post-image" accept="image/*"> <!-- Campo para imagem -->
             <label for="post-image" class="upload-icon">
                            <img src="../../Public/Image/simbolo-de-interface-de-camera-fotografica-para-botao.png"
                                alt="Upload" class="icon">
                        </label>
            <button onclick="createNewPost()">Publicar</button>
          </div>
        </div>
        `
        myBlob.posts.forEach(e => {

          if (e === true) { return }

          const dataObj = new Date(e.dataPublicacao)
          const dataAmigavel = dataObj.toLocaleString('pt-BR');


          document.getElementById("mural-content").innerHTML += `
          <div class="feed-post" >
            <div class="post-header">
              <div class="user-avatar">
                <a>
                  <img class="user-photo" src="${e.UserPicture}" alt="">
                </a>
              </div>

              <div class="user-info">
                 <a href="/PerfilUsuario" onclick="perfilUser(${e.IDUsuario})" class="user-name">${e.NomeUsuario}</a> 
                <p class="post-date">${dataAmigavel}</p>
              </div>

              <div class="post-options">
                <div class="three-dots">
                  <button class="dots-button" onclick="toggleMenu(event)">&#8230;</button>
                  <div class="menu" style="display: none;">
                    <button class="report-button" onclick="reportPost()">Denunciar Postagem</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="post-content">
              <p class="post-text">${e.Descricao}</p>
              <img class="post-image" src="${e.PostPicture}" alt="">
            </div>

            <div class="post-actions" id="interactContent-${e.ID}">
              <div class="reaction-section" >
                <button class="reaction-button like-button" onclick="likePost(${e.ID},this)"> ${e.avaliei === true ? `<i class="fa-solid fa-thumbs-up" id="fa-like-${e.ID}"></i>` : `<i class="fa-regular fa-thumbs-up" id="fa-like-${e.ID}"></i>`} <div id="manyLikes-${e.ID}">${e.quantidadeDeLike ? `${e.quantidadeDeLike}</div>` : ''} </button>
                <button class="reaction-button comment-button"><i class="fas fa-comment"></i> Comentarios </button>
              </div>
            </div>
          </div >
            `

          e.comentariosDoPost.forEach(y => {
            const data = new Date (y.Data)
            

            document.getElementById(`interactContent-${e.ID}`).innerHTML += `
              <div>
                <div class = "userCommentContent" style="display:flex; align-items:center; gap:5px">
                  <img style ="border-radius:50%;width:30px;height:30px" src = "https://firebasestorage.googleapis.com/v0/b/patinhasdobem-f25f8.appspot.com/o/perfil%2F${y.IDUsuario}.jpg?alt=media"
                  <div> <a href="perfilUser(${y.IDUsuario})" style="text-decoration:none; font-size:13px">${y.Nome}</a></div> 
                </div>
               <p style=" display:flex;flex-direction:column"><p style="font-size:14px;color:#808080;">${y.Texto}</<p><p style="font-size:10px">${data.toLocaleString('pt-BR')}</<p></p> 
              <hr>
              </div > `
          })

          document.getElementById(`interactContent-${e.ID}`).innerHTML += `
               <div class="comment-section" style = "display: flex;">
                <textarea class="comment-input" id="inputComment-${e.ID}" placeholder="Escreva um comentário..."></textarea>
                <button class="submit-comment" onclick="sendComment(${e.ID})">Comentar</button>
              </div> `

        })
      } else {
        document.getElementById("mural-content").innerHTML = `
            < !--Botão para abrir o modal-- >
          <button id="open-modal" class="btn btn-primary" onclick="openPublishModal()">Criar
          Publicação</button>
          <!--Modal para criar uma publicação-- >
            <div id="publish-modal" class="modal" style="display:none;">
              <div class="modal-content">
                <span class="close" onclick="closePublishModal()">&times;</span>
                <h2>Criar Publicação</h2>
                <input type="text" id="post-title" placeholder="Título da Postagem" required>
                  <textarea id="post-content" placeholder="Conteúdo da Postagem" required></textarea>
                  <input type="file" id="post-image" accept="image/*"> <!-- Campo para imagem -->
                     <label for="post-image" class="upload-icon">
                            <img src="../../Public/Image/simbolo-de-interface-de-camera-fotografica-para-botao.png"
                                alt="Upload" class="icon">
                        </label>
                  <button onclick="publishPost()">Publicar</button>
                  </div>
              </div>
              `
      }
    })
}


async function createNewPost() {
  await fetch(`/CriarPostagem`, {
    method: 'POST',
    body: JSON.stringify({ 
      "Descricao": document.getElementById(`post-content`).value
     }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(function (response) {
      return response.json();
    })
    .then(async function (myBlob) {
      console.log("retorno",myBlob)
      if (myBlob.success) {
        const file = document.getElementById("post-image").files[0];
        if (file) {
          const storageRef = storage.ref().child(`postagem/${myBlob.idPostagem}`);
          return storageRef.put(file)
            .then((snapshot) => {
              console.log("Upload concluído com sucesso!", snapshot);
              alert("Cadastro realizado com sucesso e imagem enviada!");
            })
          }
      }
    })
}



async function sendComment (postID) {
  console.log("chegou")
  console.log(document.getElementById(`inputComment-${postID}`).textContent)
  await fetch(`/comentarPost`, {
    method: 'POST',
    body: JSON.stringify({ "IDPostagem": postID,
      "Texto": document.getElementById(`inputComment-${postID}`).value
     }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(function (response) {
      return response.json();
    })
    .then(async function (myBlob) {
      console.log("retorno",myBlob)
      if (myBlob.success) {
        document.getElementById(`inputComment-${postID}`).value = ""
        alert("comentario efetuado com sucesso")
      }
    })
}




async function likePost(postID) {
  await fetch(`/ReagirPostagem`, {
    method: 'POST',
    body: JSON.stringify({ "IDPostagem": postID, "tipo": "like" }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(function (response) {
      return response.json();
    })
    .then(async function (myBlob) {
      let numManyLikes;
      if (myBlob.success) {
        document.getElementById(`fa-like-${postID}`).classList = []
        document.getElementById(`fa-like-${postID}`).classList = ["fa-solid fa-thumbs-up"]
        numManyLikes = await parseInt(document.getElementById(`manyLikes-${postID}`).textContent) + 1
        document.getElementById(`manyLikes-${postID}`).innerHTML = numManyLikes
        console.log("manylikes")
      } else if (myBlob.error === "você já avaliou este post") {
        numManyLikes = await parseInt(document.getElementById(`manyLikes-${postID}`).textContent) - 1
        document.getElementById(`manyLikes-${postID}`).innerHTML = numManyLikes
        document.getElementById(`fa-like-${postID}`).classList = ["fa-solid fa-thumbs-up"]
        removeLikePost(postID)
      } else {
        console.error(myBlob.error)
      }
    })
}


async function removeLikePost(PostID) {
  await fetch(`/RemoverReacao/${PostID}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(function (response) {
      return response.json();
    })
    .then(async function (myBlob) {
      if (myBlob.success) {
        document.getElementById(`fa-like-${PostID}`).classList = ["fa-regular fa-thumbs-up"]
      }
    })
}



async function finalSession() {
  await fetch(`/Out`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(e => {
    console.log(e)
    alert("você deslogou com sucesso")
  })
}



getMostRecentPosts()
myFriendInvites()
getMyNotifies()
getingMyContacts()

