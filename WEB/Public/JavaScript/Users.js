// Função para alternar a exibição das seções "Meus pets" e "Postagens"
function alternarSecao(secao) {
  // Oculta todas as seções inicialmente
  document.getElementById("meus-pets").style.display = "none";
  document.getElementById("postagens").style.display = "none";

  // Exibe a seção correspondente ao botão clicado
  document.getElementById(secao).style.display = "block";

  // Muda a aparência do indicador para a seção ativa
  const indicator = document.getElementById("indicator");
  const meusPetsLink = document.getElementById("meus-pets-link");
  const postagensLink = document.getElementById("postagens-link");

  // Define o indicador abaixo do link ativo
  if (secao === "meus-pets") {
    indicator.style.left = meusPetsLink.offsetLeft + "px";
    indicator.style.width = meusPetsLink.offsetWidth + "px";
  } else if (secao === "postagens") {
    indicator.style.left = postagensLink.offsetLeft + "px";
    indicator.style.width = postagensLink.offsetWidth + "px";
  }
}

// Função para alternar a exibição das seções "Meus pets" e "Postagens"
function alternarSecao(secao) {
  // Oculta todas as seções inicialmente
  document.getElementById("meus-pets").style.display = "none";
  document.getElementById("postagens").style.display = "none";

  // Exibe a seção correspondente ao botão clicado
  document.getElementById(secao).style.display = "block";
}


// Função para buscar dados do perfil do usuário
function buscarPerfilUsuario() {
  // Obtém o ID do cookie
  const perfilUserID = Cookies.get("perfilSendoVisto");

  if (!perfilUserID) {
    console.error("ID do usuário não encontrado no cookie.");
    return;
  }

  console.log(`Buscando perfil do usuário com ID: ${perfilUserID}`);

  // Fazer a requisição para a rota correta
  fetch(`/ProfileUser/${perfilUserID}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Erro ao buscar perfil do usuário: ${response.statusText}`
        );
      }
      return response.json();
    })
    .then((data) => {
      console.log("Dados recebidos do servidor:", data);

      const postagem = data.postagensDoUsuario || [];
      const dados = data.dadosUsuario || {};
      const pets = data.dadosPetsUsuario || [];

      // Exibir dados do usuário
      document.getElementById("nome-usuario").textContent =
        dados.Nome || "Nome não disponível";
      document.getElementById("usuario-estado").textContent =
        dados.Estado || "Estado não disponível";
      document.getElementById("usuario-cidade").textContent =
        dados.Cidade || "Cidade não disponível";

      // Exibir a imagem do usuário
      exibirImagemUsuario(perfilUserID);

      // Exibir pets
      estruturarDadosPets(pets);

      // Exibir postagens
      exibirPostagens(postagem);
    })
    .catch((error) => {
      console.error("Erro ao buscar os dados do perfil:", error);
    });
}

// Função para exibir a imagem do usuário
function exibirImagemUsuario(perfilUserID) {
  // Seleciona a imagem pelo ID
  const fotoUser = document.getElementById("foto-user");

  if (perfilUserID) {
    // Define o atributo 'src' com a URL da imagem usando o 'ID' do usuário
    fotoUser.src = `https://firebasestorage.googleapis.com/v0/b/patinhasdobem-f25f8.appspot.com/o/perfil%2F${perfilUserID}?alt=media`;
  } else {
    console.error("ID do usuário não foi fornecido.");
    fotoUser.src = "URL_DA_IMAGEM_PADRAO"; // URL para uma imagem padrão
  }
}

// Função para estruturar e exibir os dados dos pets
function estruturarDadosPets(dadosMeusPets) {
  const petsDiv = document.getElementById("lista-pets");
  petsDiv.innerHTML = ""; // Limpa a lista antes de exibir

  // Verifica se a lista de pets está vazia
  if (!dadosMeusPets || dadosMeusPets.length === 0) {
    petsDiv.innerHTML = "<p>Não há pets registrados.</p>";
    return;
  }

  // Itera sobre cada pet e estrutura as informações
  dadosMeusPets.forEach((pets) => {
    const petElemento = document.createElement("div");
    petElemento.classList.add("pet-card");

    petElemento.innerHTML = `
      <img src="${pets.petPicture}" alt="${pets.TipoAnimal}" class="imagem-pet" style="cursor: pointer;">
      <h4>${pets.TipoAnimal}</h4>
    `;

    // Adiciona um evento de clique para abrir o modal com as informações do pet
    petElemento.querySelector("img").onclick = function () {
      openPetModal(pets);
    };

    // Adiciona o elemento de pet à lista de pets no DOM
    petsDiv.appendChild(petElemento);
  });
}

// Função para abrir o modal e mostrar as informações do pet
function openPetModal(pets) {
  const petModal = document.getElementById("petModal");
  const petInfo = document.getElementById("pet-info");

  // Preenchendo o conteúdo do modal com as informações do pet
  petInfo.innerHTML = `
    <img src="${pets.petPicture}" alt="${pets.TipoAnimal}" class="imagem-pet">
    <h4>${pets.TipoAnimal}</h4>
    <p><strong>Cor:</strong> ${pets.Cor}</p>
    <p><strong>Idade:</strong> ${pets.Idade}</p>
    <p><strong>Linhagem:</strong> ${pets.Linhagem}</p>
    <p><strong>Sexo:</strong> ${pets.Sexo}</p>
    <p><strong>Descrição:</strong> ${pets.Descricao}</p>
 
  `;

  // Exibindo o modal
  petModal.style.display = "flex";
}

// Função para fechar o modal
function closePetModal() {
  const petModal = document.getElementById("petModal");
  petModal.style.display = "none";
}

// Fechar o modal se clicar fora dele
window.onclick = function (event) {
  const petModal = document.getElementById("petModal");
  if (event.target === petModal) {
    closePetModal();
  }
};

// Função para exibir a lista de postagens do usuário
function exibirPostagens(postagensUsuario) {
  const postagensDiv = document.getElementById("lista-postagens");
  postagensDiv.innerHTML = ""; // Limpa a lista antes de exibir
  

  postagensUsuario.forEach(postagem => {
    const postagemElemento = document.createElement("div");
    postagemElemento.classList.add("postagem-card");
  
    postagemElemento.innerHTML = `
      <div class="descricao">
          <p><strong>Descrição:</strong> ${postagem.Descricao}</p>
          <p><strong>Data:</strong> ${new Date(postagem.dataPublicacao).toLocaleString()}</p>
      </div>
      <img src="https://firebasestorage.googleapis.com/v0/b/patinhasdobem-f25f8.appspot.com/o/postagem%2F${postagem.ID}?alt=media" class="imagem-post" onclick="expandirFoto(this)">
    `;
  
    postagensDiv.appendChild(postagemElemento);
  });
  
}

// Chame a função ao carregar a página
document.addEventListener("DOMContentLoaded", buscarPerfilUsuario);

// let countNewNotifies = 0;
// let notifiesOnly = 0;
// let friendInvites = 0;

// async function getMyNotifies() {
//   await fetch(`/Notificacoes`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json'
//     }
//   })
//     .then(function (response) {
//       return response.json();
//     })
//     .then(function (myBlob) {
//       console.log(myBlob)
//       if (myBlob.success) {
//         document.getElementById("bodyNotifies").innerHTML = ``
//         myBlob.notifications.forEach(e => {
//           if (e.MensagemVisualizada == "False") {
//             countNewNotifies = countNewNotifies + 1;
//             notifiesOnly = notifiesOnly + 1;
//           }

//           document.getElementById("notificationButton").innerHTML = ` <i class="fa-solid fa-bell"></i>
//           ${countNewNotifies}`

//           document.getElementById("bodyNotifies").innerHTML += ` <div class="notification">
//                 <div class="notification-icon">
//                   <i class="fas fa-comment"></i>
//                 </div>
//                 <div class="notification-content">
//                   <p><strong></strong></p>
//                   <p>${e.Texto}<a href="#"></a></p>
//                 </div>
//               </div>`

//           document.getElementById("notifyContent").innerHTML = `Notificações <span style="border-radius:50%;width:20px;height:20px;display:flex;justify-content:center;align-items:center; color:white;background-color:red">${notifiesOnly}</span>`

//         })
//       } else {
//         document.getElementById("notificationButton").innerHTML = ` <i class="fa-solid fa-bell"></i>
//           ${friendInvites}`
//         document.getElementById("notifyContent").innerHTML = `Notificações <span style="border-radius:50%;width:20px;height:20px;display:flex;justify-content:center;align-items:center; color:white;background-color:red">${notifiesOnly}</span>`
//       }
//     })
// }

// async function checkNotifies() {
//   await fetch(`/MarcarNotificacoesVisto`, {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json'
//     }
//   })
//     .then(function (response) {
//       return response.json();
//     })
//     .then(function (myBlob) {
//       if (myBlob.success) {
//         countNewNotifies = 0;
//         notifiesOnly = 0;
//         countNewNotifies = friendInvites
//         document.getElementById("notificationButton").innerHTML = ` <i class="fa-solid fa-bell"></i>
//         ${countNewNotifies}`
//       }
//     })
// }

// async function myFriendInvites() {
//   await fetch(`/MinhasSolicitacoes`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json'
//     }
//   })
//     .then(function (response) {
//       return response.json();
//     })
//     .then(function (myBlob) {
//       console.log(myBlob)
//       if (myBlob.success) {
//         countNewNotifies = countNewNotifies + myBlob.invites.length;

//         document.getElementById("notificationButton").innerHTML = ` <i class="fa-solid fa-bell"></i>
//         ${countNewNotifies}`
//         document.getElementById("friendInviter").innerHTML = `Solicitação de amizade  <span style="border-radius:50%; width:20px;height:20px;display:flex;justify-content:center;align-items:center; color:white;background-color:red">${myBlob.invites.length}</span>`
//         document.getElementById("inviteBody").innerHTML = `<div class="solicitacao-amizade">`

//         myBlob.invites.forEach(e => {

//           document.getElementById("inviteBody").innerHTML += `
//                 <div class="d-flex align-items-center">
//                   <!-- Foto de Perfil -->
//                   <img src="https://firebasestorage.googleapis.com/v0/b/patinhasdobem-f25f8.appspot.com/o/perfil%2F${e.IDSolicitante}.jpg?alt=media}" alt="Foto de Perfil" class="rounded-circle me-3">
//                   <!-- Nome do Usuário -->
//                   <div>
//                     <p class="mb-0"><strong>${e.Nome}</strong></p>
//                     ${e.Interessado === 1 ? '<small>está interessado em um de seus pets</small>' : '<small>Enviou uma Solicitação</small>'}
//                   </div>
//                 </div>
//                 <!-- Botões de Ação -->
//                 <div class="mt-3 d-flex justify-content-around">
//                   <button class="btn btn-primary btn-sm" id="${e.ID}" onclick="acceptInvite(this)">Aceitar</button>
//                   <button class="btn btn-secondary btn-sm" id="${e.ID}" onclick="rejectInvite(this)">Recusar</button>
//                 </div>
//               </div>
//               <hr>`

//         })

//       } else {
//         document.getElementById("friendInviter").innerHTML = `Solicitação de amizade <span style="border-radius:50%; width:20px;height:20px;display:flex;justify-content:center;align-items:center; color:white;background-color:red">0</span>`
//       }
//     })
// }

// async function acceptInvite(event) {
//   await fetch(`/AceitaSolicitacaoAmizade`, {
//     method: 'POST',
//     body: JSON.stringify({ "inviteID": event.id }),
//     headers: {
//       'Content-Type': 'application/json'
//     }
//   })
//     .then(function (response) {
//       return response.json();
//     })
//     .then(async function (myBlob) {
//       if (myBlob.success) {
//         alert("Solicitação de amizade aceita.")
//         await getingMyContacts()
//         await friendInvites()
//       }
//     })
// }

// async function rejectInvite(event) {
//   await fetch(`/RemoveSolicitacao`, {
//     method: 'DELETE',
//     body: JSON.stringify({ "inviteID": event.id }),
//     headers: {
//       'Content-Type': 'application/json'
//     }
//   })
//     .then(function (response) {
//       return response.json();
//     })
//     .then(async function (myBlob) {
//       if (myBlob.success) {
//         await myFriendInvites()

//       }
//     })
// }

// Evento de clique para exibir a seção "Meus pets"
document
  .getElementById("meus-pets-link")
  .addEventListener("click", function (event) {
    event.preventDefault();
    alternarSecao("meus-pets");
  });

// Evento de clique para exibir a seção "Postagens"
document
  .getElementById("postagens-link")
  .addEventListener("click", function (event) {
    event.preventDefault();
    alternarSecao("postagens");
  });

// Botão "Início" redireciona para a página inicial
// document.getElementById('inicio-button').addEventListener('click', function () {
//     window.location.href = 'index.html'; // Altere para a URL desejada
// });

function showContent(menuId) {
  // Esconde todos os conteúdos
  document.getElementById("mural-content").style.display = "none";
  document.getElementById("notifications-content").style.display = "none";
  document.getElementById("view-animals-content").style.display = "none";
  document.getElementById("Cadastrar-Pets").style.display = "none";

  // Mostra o conteúdo selecionado
  if (menuId === "mural") {
    document.getElementById("mural-content").style.display = "block";
  } else if (menuId === "notifications") {
    document.getElementById("notifications-content").style.display = "block";
  } else if (menuId === "Cadastro") {
    document.getElementById("Cadastrar-Pets").style.display = "block";
  } else if (menuId === "view-animals") {
    document.getElementById("view-animals-content").style.display = "block";
  }
}

// Função para abrir o modal
function openModal(modalId) {
  var modal = new bootstrap.Modal(document.getElementById(modalId));
  modal.show();

  // Fechar o modal quando clicar no fundo cinza
  document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
    backdrop.addEventListener("click", () => {
      modal.hide();
    });
  });
}

// Função para abrir o modal
function abrirModal() {
  document.getElementById("modal-editar").style.display = "flex";
}

// Função para fechar o modal
function fecharModal() {
  document.getElementById("modal-editar").style.display = "none";
}

// Função para salvar a edição (adapte conforme a lógica do seu site)
function salvarEdicao() {
  const novoValor = document.getElementById("input-editar").value;
  if (novoValor) {
    // Atualize o conteúdo do item aqui
    alert("Novo valor salvo: " + novoValor);
    fecharModal();
  } else {
    alert("Por favor, insira um valor.");
  }
}

// Função para excluir o item
function excluirItem() {
  // Exemplo de confirmação antes de excluir
  const confirmacao = confirm("Tem certeza de que deseja excluir este Animal?");

  if (confirmacao) {
    // Lógica para remover o elemento ou item
    // Exemplo: remove um elemento do DOM
    const elementoParaRemover = document.getElementById("idDoElemento");
    elementoParaRemover.remove();
    alert("Item excluído com sucesso!");
  }
}






function definirImagemPadrao() {
  const fotoUser = document.getElementById("foto-user");
  const urlPadrao = "https://via.placeholder.com/150";
  
  if (!fotoUser.src || fotoUser.src === window.location.href) {
    fotoUser.src = urlPadrao;
  }
}


document.addEventListener('DOMContentLoaded', () => {
  // Exibir "Meus pets" por padrão
  alternarSecao('meus-pets');
  buscarPerfilUsuario();
});




function expandirFoto(imgElement) {
  const modal = document.getElementById("modal-imagem");
  const imagemExpandida = document.getElementById("imagem-expandida");

  // Define o src da imagem expandida para a imagem clicada
  imagemExpandida.src = imgElement.src;

  // Exibe o modal
  modal.style.display = "flex";
}

function fecharModal() {
  const modal = document.getElementById("modal-imagem");

  // Oculta o modal
  modal.style.display = "none";
}
