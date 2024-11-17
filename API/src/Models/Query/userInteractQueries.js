const {connection} = require('../../Config/db');
const Avaliacao = require('../Class/Avalicacao');
const Comentario = require('../Class/Comentario');
const Pet = require("../Class/Pet");
const Postagem = require('../Class/Postagem');

const userInteractQueries = {

 

   async profileUserQuery(usuarioASerRetornado, userID) {
    const conn = await connection(); 

    if (userID && !usuarioASerRetornado) { // se o usuário solicitou analise de algum perfil e não passou id será retornado as informações dele mesmo, caso ele passe id sera pego os dados do usuário solicitado.
      //returnDataCleaned pega os dados (que podem ser vistos) do usuário que será visto o perfil.
      const returnDataCleaned = await conn.query("select u.ID,u.Nome, u.CEP, u.Rua, u.Numero, u.Bairro, u.Estado, u.DataNasc,u.Cidade, u.Email  from usuario As u WHERE id=? ",[userID]);   
      const returnPetsUser = await Pet.petsDeUmUsuarioQuery(userID);
      const myPosts = await Postagem.postagensDeUmUsuarioQuery(userID)//

      returnDataCleaned[0].forEach (e => {
         e.UserPicture = `https://firebasestorage.googleapis.com/v0/b/patinhasdobem-f25f8.appspot.com/o/perfil%2F${e.IDUsuario}.jpg?alt=media`
      })
      if(returnDataCleaned[0].length >=1) {
        if(myPosts.postagens === undefined) {
          return {success:"retornando dados do seu perfil para uso" ,meusDados: returnDataCleaned[0][0],dadosMeusPets:returnPetsUser.dataResponse}
        } 
       const getingAnotherInfosAboutPost = await myPosts.postagens.map(async(el,index) => {
          const verifyComments = await Comentario.verComentariosDeUmPostQuery(el.ID);
          const likesQuantity = await Avaliacao.verReacoesPostagemQuery(el.ID)
          el.quantidadeDeLike = likesQuantity[0].length
          el.comentariosDoPost = verifyComments[0]
          return el
        })
       return {success:"retornando dados do seu perfil para uso" ,meusDados: returnDataCleaned[0][0],dadosMeusPets:returnPetsUser.dataResponse,minhasPostagens:await Promise.all(getingAnotherInfosAboutPost)}
      }else {
        return{error:"não foi possivel retornar dados do seu perfil, tente novamente por favor"}
      }

    } else { // se o usuário quiser ver o perfil de outra pessoa
      const returnAnotherUserProfile = await conn.query ("select u.Nome, u.Bairro, u.Estado, u.DataNasc,u.Cidade from usuario As u WHERE id=? ",[usuarioASerRetornado]);
      const returnPetsOfThisUser = await Pet.petsDeUmUsuarioQuery(usuarioASerRetornado);
      const verifyContactVinculate = await conn.query("select * from contato WHERE IDSolicitante=? AND IDDestinatario = ? OR IDSolicitante=? AND IDDestinatario=?",[userID,usuarioASerRetornado,usuarioASerRetornado,userID])
      const verifyInviteExistence = await conn.query("select * from solicitacaocontato where IDSolicitante =? AND IDDestinatario = ? OR IDDestinatario=? AND IDSolicitante = ?",[userID,usuarioASerRetornado,usuarioASerRetornado,userID])
      const userPosts = await Postagem.postagensDeUmUsuarioQuery(usuarioASerRetornado)


      let saoAmigos;
      let envioAmizadePendente;
      verifyContactVinculate[0].length >=1?saoAmigos = true:saoAmigos = false  
      verifyInviteExistence[0].length >=1?envioAmizadePendente = true:envioAmizadePendente = false
  

      if(returnAnotherUserProfile[0].length >=1) {
        if(userPosts.postagens === undefined) {
          return {success: "retornando dados de perfil do usuário solicitado", dadosUsuario:returnAnotherUserProfile[0][0], dadosPetsUsuario:returnPetsOfThisUser.dataResponse, saoAmigos:saoAmigos,envioAmizadeFoiFeito:envioAmizadePendente, postagensDoUsuario:await Promise.all(getingPostsUser)}
        }
        const getingPostsUser = await userPosts.postagens.map(async(el,index) => {
          const verifyComments = await Comentario.verComentariosDeUmPostQuery(el.ID);
          const likesQuantity = await Avaliacao.verReacoesPostagemQuery(el.ID)
          el.quantidadeDeLike = likesQuantity[0].length
          el.comentariosDoPost = verifyComments[0]
          return el
        })
        
        return {success: "retornando dados de perfil do usuário solicitado", dadosUsuario:returnAnotherUserProfile[0][0], dadosPetsUsuario:returnPetsOfThisUser.dataResponse, saoAmigos:saoAmigos,envioAmizadeFoiFeito:envioAmizadePendente, postagensDoUsuario:await Promise.all(getingPostsUser)}
      } else {
        return {error:"não foi possivel retornar dados do perfil do usuário especificado"}
      }
    }
   }

   
}

module.exports = userInteractQueries;
