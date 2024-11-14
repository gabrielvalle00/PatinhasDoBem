const Contato = require("../Models/Class/Contato");
const Interesse = require("../Models/Class/Interesse");


const contatoController = {
  removeUsuarioDaListaDeContatos:async (req,res) => {
    try {
      const {ID} = req.dataUser;
      const {IDContato} = req.body;

      if(ID && IDContato) {
        const sendRequestRemoveContact = await Contato.removeUsuarioDaListaDeContatosQuery(IDContato,ID)
        return res.json(sendRequestRemoveContact)
      }else {
        return res.json({error:"não foi possivel remover o usuário da lista de contato pois não falta informações para ser feito a requisição"})
      }
    }catch(e) {
      return res.json({error:e.message})
    }
  },

  meusContatos: async (req,res) => {
    const {ID} = req.dataUser;
    try {
      if(!ID) return res.json({error:"não é possivel puxar os contatos, pois não foi especificado o Usuário"})
       const takeUsersOnMyContacts = await Contato.meusContatosQuery(ID);
       return res.json(takeUsersOnMyContacts)
    }catch(e) {
      return res.json({error:e.message})
    }
  },
}


module.exports = contatoController