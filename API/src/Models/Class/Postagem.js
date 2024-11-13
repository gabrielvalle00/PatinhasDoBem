const { connection } = require("../../Config/db");
const Avaliacao = require("./Avalicacao");
const Comentario = require("./Comentario");


class Postagem {
  constructor (ID,Descricao,dataPublicacao,IDUsuario) {
      this.ID = ID === null? null:ID;
      this.Descricao = Descricao;
      this.dataPublicacao = dataPublicacao
      this.IDUsuario = IDUsuario
  }

  async criarPostagemQuery () {
    const conn = await connection();
    try {
      const creatingPost = await conn.query("INSERT INTO Postagem (Descricao,dataPublicacao,IDUsuario) VALUES (?,?,?)", [this.Descricao,this.dataPublicacao,this.IDUsuario])
      if(creatingPost[0].affectedRows >=1) {
        return {success:"você fez sua postagem com sucesso", idPostagem: creatingPost[0].insertId}
      } return {error:"não foi possivel criar sua postagem por favor tente novamente 404"}
    }
    catch(e) {
      return {error:e.message}
    }
  }


  async editarPostagemQuery () {
    const conn = await connection();
    try {
      const editingPost = await conn.query("UPDATE postagem SET Descricao = ? IDUsuario =? WHERE ID = ? AND IDUsuario = ?" [this.Descricao,this.IDUsuario,this.ID,this.IDUsuario])
      if(editingPost[0].affectedRows >=1) {
        return {success:"dados atualizados com sucesso"}
      }return {error:"não foi possivel atualizar os dados erro 404"}
    }catch(e) {
      return {error:e.message}
    }
  }


  static async verPostagensQuery (gapQuantity,UserID) {
    const conn = await connection();
    try{
      const verifyMyPostsDenunces = await conn.query("select * from denuncia where IDUsuario = ?",[UserID]);
      const getingPosts = await conn.query (`select p.*, u.Nome as NomeUsuario from postagem AS p JOIN Usuario AS U on U.ID = p.IDUsuario ORDER BY p.dataPublicacao DESC LIMIT 50 OFFSET ${50 * gapQuantity}`,[UserID,UserID]);

      

      const getReturnPosts = await getingPosts[0].map(async(e,index) => {
        let checkPostDenuncies = false; //variavel para verificar se o post sendo analisado já foi denunciado por mim

        const verifyLikeQuantity = await Avaliacao.verReacoesPostagemQuery(e.ID) //função para ver a quantidade de likes que tem na postagem sendo analisada
        verifyMyPostsDenunces[0].forEach((i) => { //verifica se os posts retornado não foi denunciado pelo usuário que o solicitou
          if(i.IDPostagem === e.ID) {checkPostDenuncies = true}
        })

        verifyLikeQuantity[0].forEach(x => {
          if(x.IDUsuario === UserID ) {
            e.avaliei = true
          }else {
            e.avaliei = false
          }
        })

        const verifyComments = await Comentario.verComentariosDeUmPostQuery(e.ID)
        

        //inserir aki a consulta dos comentarios dessa postagem (puxar os comentarios)

        if(checkPostDenuncies === true) {return delete getingPosts[index]} // se o usuário que está solicitando já denunciou esta postagem, não retornamos ela ao usuário que está solicitando
        e.comentariosDoPost = verifyComments[0]
        e.quantidadeDeLike = verifyLikeQuantity[0].length //define a quantidade de like
        e.UserPicture = `https://firebasestorage.googleapis.com/v0/b/patinhasdobem-f25f8.appspot.com/o/perfil%2F${e.IDUsuario}?alt=media`  //url da qual hipoteticamente deveria estar a foto de perfil do usuário
        e.PostPicture = `https://firebasestorage.googleapis.com/v0/b/patinhasdobem-f25f8.appspot.com/o/postagem%2F${e.ID}?alt=media`  //url de onde deveria estar a foto que o usuário utilizou no post/postagem.
        return e
      })
       getingPosts[0] = await Promise.all(getReturnPosts) // faz com que a função aguarde terminar todo o preenchimento/ tratamento de dados do getingPosts sendo feito dentro do for each
       console.log(getReturnPosts)
       return{success:"retornando os posts conforme o feed",posts: await getingPosts[0]}
    }catch(e) {
      return {error:e.message}
    }
  }


  static async deletarPostagemQuery (UserID,PostID,Administrator) {
    const conn = await connection();
    try {
    const receivePostToDelete = await  conn.query('SELECT * from postagem where id=?',[PostID])

    if(receivePostToDelete[0].length >= 1) {
      if(receivePostToDelete[0][0].IDUsuario === UserID) {
        const deletingPost = await conn.query('delete from postagem where id=?',[PostID])
        if(deletingPost[0].length>=1) return {success:"você deletou sua postagem com sucesso"}
        return {error:"não foi possivel deletar a postagem, houve um erro durante o processo (404)"}
      }else {
        if(Administrator === 1) {
          const deletingPost = await conn.query('delete from postagem where id=?',[PostID])
          if(deletingPost[0].affectedRows >=1) return {success:"você deletou a postagem do usuário solicitado, com sucesso"} 
          return {error:"não foi possivel deletar a postagem, houve um erro no processo (404)"}
        }else {
          return {error:"você não pode deletar a postagem de outra pessoa sem ter permissão."}
        }
      }
    }
    }catch(e) {
      return {error:e.message}
    } 
  }


  static async postagensDeUmUsuarioQuery (UserID) {  // função de uso interno, ou seja o usuário não terá acesso direto a essa funcionalidade
    const conn = await connection();
    try {
      const getingPosts = await conn.query("select * from Postagem WHERE IDUsuario =?", [UserID])
      getingPosts[0].forEach (e => {
       e.PostPicture = `https://firebasestorage.googleapis.com/v0/b/patinhasdobem-f25f8.appspot.com/o/postagem%2F${e.ID}?alt=media`
      })
      if(getingPosts[0].length >=1) return {success:"retornando postagens do usuário", postagens:getingPosts[0]}
      return {error:"não foi identificado nenhuma postagem do usuário em questão"}
    }catch(e) {
      return{error:e.message}
    }
  }
}


module.exports = Postagem