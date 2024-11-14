const Pet = require("../Models/Class/Pet")

const petManagement = {
  cadastraPet: async (req, res) => {
  try {
    const IDDoador = req.dataUser.ID; // Certifique-se de que o middleware de autenticação está preenchendo req.dataUser
    const { TipoAnimal, Linhagem, Idade, Sexo, Cor, Descricao } = req.body;

    if (TipoAnimal && Linhagem && Idade && Sexo && Cor && Descricao) {
      const createPetForm = new Pet(new Date(), TipoAnimal, Linhagem, null, Idade, Sexo, Cor, Descricao, IDDoador);
      const newPetCreate = await createPetForm.cadastraPetQuery();
     return res.json(newPetCreate);
    } else {
     return res.json({ error: "Não foi possível fazer o cadastro do pet, faltam informações a respeito do pet." });
    }
  } catch (e) {
    return res.status(500).json({ error: "Erro ao cadastrar pet." });
  }
},


  editaPetInfo: async(req,res) => {
    try{
      const IDDoador = req.dataUser.ID
      const {TipoAnimal,Linhagem,Status,Idade,Sexo,Cor,Descricao,PetID} = req.body;
      if(TipoAnimal,Linhagem,Status,Idade,Sexo,Cor,Descricao,IDDoador,PetID) {
        const petFormDataEdit = new Pet (new Date(),TipoAnimal,Linhagem,Status,Idade,Sexo,Cor,Descricao,IDDoador,PetID);
        const editDataPet = await petFormDataEdit.editPetInfoQuery(petFormDataEdit)

       return res.json (editDataPet)
      }else {
       return res.json({error:"faltou dados para que seja feita a edição correta das informações do pet"})
      }
    }
    catch(e) {
     return res.json ({error:e.message})
    }
  },

  removePetDaAdocao: async(req,res) => {
    try {
      const IDDoador = req.dataUser.ID
      const {PetID,VerifyForm} = req.body

      if(IDDoador,PetID,VerifyForm) {
        const sendValidations = await Pet.removePetDaAdocaoQuery(IDDoador,PetID,VerifyForm)
       return res.json(sendValidations)
      } else {
       return res.json({error:"está faltando informações para a remoção do pet da adoção."})
      }
    }
    catch(e) {
     return res.json({error:e.message})
    }
  },

  petsDeUmUsuario: async (req,res) => {
    const {UserID} = req.params //ATENTE-SE O USERID ESTÁ SENDO PASSADO NO PARAMS NESSA REQUISIÇÃO
    try {
       
      if(UserID) {
        const callBackRequisition = await Pet.petsDeUmUsuarioQuery(UserID)
        return res.json(callBackRequisition)
      }
      return res.json({error:"você não passou os dados necessários para ver o pet de um usuário"})
    }
    catch (e) {
      res.json({error:e.message})
    }
  },

  petsParaAdocao: async (req,res) => {
    try {
      const {ID,Estado} = req.dataUser;
      const {gapQuantity} = req.body;


      if(Estado,ID) {
        const receivePets = await Pet.petsParaAdocaoQuery(Estado,ID,gapQuantity);
        return res.json(receivePets)
      }
      else {
        return res.json({error:"não foi possivel identificar a localidade do usuário para puxar pets da proximidade"})
      }

    }
    catch (e) {
      return res.json({error:e.message})
    }
  },

  
}


module.exports = petManagement