const SolicitacaoContato = require("../Models/Class/solicitacaoContato");


const solicitacaoContatoController = {
  enviarSolicitacaoDeAmizade: async (req,res) => {
    try{
      const {ID,Nome} = req.dataUser;
      const {IDDestinatario} = req.body;

      if(ID && IDDestinatario && typeof(IDDestinatario) === 'number') {
        const requestInvite = await SolicitacaoContato.enviarSolicitacaoDeAmizadeQuery(ID,IDDestinatario,Nome);
        return res.json(requestInvite)
      }else {
        return res.json ({error:"faltam informações para que seja feita a solicitação de amizade, por favor tente novamente"})
      }

    }
    catch(e) {
      return res.json({error:e.message})
    }
  },

  removeSolicitacaoDeAmizade: async (req,res) => {
    try{
      const {ID} = req.dataUser;
      const {inviteID} = req.body;

      if(inviteID) {
        const sendRemoveRequisition = await SolicitacaoContato.removeSolicitacaoDeAmizadeQuery(ID,inviteID);
        return res.json(sendRemoveRequisition)
      }else {
        return res.json({error:"você não especificou uma solicitação de amizade que há de ser excluida."})
      }
    }catch (e) {
      return res.json({error:e.message})
    }
  },


  minhasSolicitacoes: async(req,res) => {
    try{
      const {ID} = req.dataUser;

      if(ID) {
        const getMyInvites = await SolicitacaoContato.minhasSolicitacoesQuery(ID)
        return res.json(getMyInvites)
      }else {
        return res.json({error:"não foi identificado o registro unico do usuário (id)"})
      }
    }
    catch(e) {
      return res.json({error:e.message})
    }
  },


  aceitaSolicitacao: async(req,res) => {
    const {ID} = req.dataUser;
    const {inviteID} = req.body;
    try {
      if(ID && inviteID) {
        const acceptInviteRequest = await SolicitacaoContato.aceitaSolicitacaoQuery(ID,inviteID);
        return res.json(acceptInviteRequest)
      }else {
        return res.json({error:"faltam informações para que a solicitação de amizade desejada seja aceita"})
      }
    }catch(e) {
      return res.json({error:e.message})
    }
  }

}



module.exports = solicitacaoContatoController