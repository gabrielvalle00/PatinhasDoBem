-- MySQL Script generated by MySQL Workbench
-- Corrections made
-- Model: DB_PatinhasDoBem    Version: 1.0

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';


-- -----------------------------------------------------
-- Schema DB_PatinhasDoBem
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `DB_PatinhasDoBem` DEFAULT CHARACTER SET utf8;
USE `DB_PatinhasDoBem`;

-- -----------------------------------------------------
-- Table `DB_PatinhasDoBem`.`Postagem`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Postagem` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `Descricao` VARCHAR(500) NOT NULL,
  `dataPublicacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_PatinhasDoBem`.`Usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Usuario` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `Nome` VARCHAR(200) NOT NULL,
  `CEP` VARCHAR(45) NOT NULL,
  `Rua` VARCHAR(45) NOT NULL,
  `Numero` INT NOT NULL,
  `Bairro` VARCHAR(145) NOT NULL,
  `Estado` VARCHAR(45) NOT NULL,
  `DataNasc` DATE NOT NULL,
  `Email` VARCHAR(300) NOT NULL,
  `Senha` VARCHAR(300) NOT NULL,
  `Administrador` TINYINT NOT NULL DEFAULT 0, -- Atributo para indicar se o usuário é administrador
  `Cidade` varchar(70),
  PRIMARY KEY (`ID`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_PatinhasDoBem`.`Avaliacao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Avaliacao` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `tipo` VARCHAR(20) NOT NULL,
  `IDPostagem` INT NOT NULL,
  `IDUsuario` INT NOT NULL,
  PRIMARY KEY (`ID`),
  FOREIGN KEY (`IDPostagem`) REFERENCES `Postagem` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`IDUsuario`) REFERENCES `Usuario` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_PatinhasDoBem`.`Comentario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Comentario` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `Texto` VARCHAR(500) NOT NULL,
  `Data` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `IDPostagem` INT NOT NULL,
  `IDUsuario` INT NOT NULL,
  PRIMARY KEY (`ID`),
  FOREIGN KEY (`IDPostagem`) REFERENCES `Postagem` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`IDUsuario`) REFERENCES `Usuario` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_PatinhasDoBem`.`Denuncia`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Denuncia` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `Causa` VARCHAR(300) NOT NULL,
  `IDUsuario` INT NOT NULL,
  `IDPostagem` INT NOT NULL,
  PRIMARY KEY (`ID`),
  FOREIGN KEY (`IDUsuario`) REFERENCES `Usuario` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`IDPostagem`) REFERENCES `Postagem` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_PatinhasDoBem`.`UsuariosBloqueados`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `UsuariosBloqueados` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `dataBloqueio` DATE NOT NULL,
  `IDBloqueado` INT NOT NULL,
  `IDBloqueador` INT NOT NULL,
  PRIMARY KEY (`ID`),
  FOREIGN KEY (`IDBloqueador`) REFERENCES `Usuario` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_PatinhasDoBem`.`Notificacao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Notificacao` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `Texto` VARCHAR(100) NOT NULL,
  `IDDestinatario` INT NOT NULL,
  `IDComentario` INT,
  `IDPostagem` INT,
  `Recebimento` TINYINT NOT NULL DEFAULT 0, -- Atributo para indicar se o usuário viu a notificação
  PRIMARY KEY (`ID`),
  FOREIGN KEY (`IDDestinatario`) REFERENCES `Usuario` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`IDComentario`) REFERENCES `Comentario` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_PatinhasDoBem`.`Pet`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Pet` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `dataRegistro` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `TipoAnimal` VARCHAR(45) NOT NULL,
  `Linhagem` VARCHAR(45) NOT NULL,
  `Status` TINYINT NOT NULL,
  `Idade` VARCHAR(3) NOT NULL,
  `Sexo` VARCHAR(1) NOT NULL,
  `Cor` VARCHAR(45) NOT NULL,
  `Descricao` VARCHAR(500), -- Atributo para a descrição do pet
  `IDDoador` INT NOT NULL,
  PRIMARY KEY (`ID`),
  FOREIGN KEY (`IDDoador`) REFERENCES `Usuario` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_PatinhasDoBem`.`Interesse`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Interesse` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `IDInteressado` INT NOT NULL,
  `IDPet` INT NOT NULL,
  PRIMARY KEY (`ID`),
  FOREIGN KEY (`IDInteressado`) REFERENCES `Usuario` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`IDPet`) REFERENCES `Pet` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_PatinhasDoBem`.`SolicitacaoContato`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `SolicitacaoContato` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `IDSolicitante` INT NOT NULL,
  `Interessado` INT NOT NULL,
  `IDDestinatario` INT NOT NULL,
  PRIMARY KEY (`ID`),
  FOREIGN KEY (`IDSolicitante`) REFERENCES `Usuario` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_PatinhasDoBem`.`Contato`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Contato` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `Data` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `IDSolicitante` INT NOT NULL,
  `Interessado` INT NOT NULL,
  `IDDestinatario` INT NOT NULL,
  PRIMARY KEY (`ID`),
  FOREIGN KEY (`IDSolicitante`) REFERENCES `Usuario` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`IDPetInteressado`) REFERENCES `Pet` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `DB_PatinhasDoBem`.`Mensagem`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Mensagem` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `DataDeEnvio` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `IDRemetente` INT NOT NULL,
  `IDContato` INT NOT NULL,
  `Remocao` int NOT NULL,
  `Texto` varchar (500) NOT NULL,
  PRIMARY KEY (`ID`),
  FOREIGN KEY (`IDRemetente`) REFERENCES `Usuario` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`IDContato`) REFERENCES `Contato` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;


INSERT INTO `Usuario` (`Nome`, `CEP`, `Rua`, `Numero`, `Bairro`, `Estado`, `DataNasc`, `Email`, `Senha`, `Administrador`,`Cidade`) 
VALUES 
('João Silva', '12345-678', 'Rua A', 123, 'Centro', 'SP', '1990-05-15', 'joao.silva@gmail.com', 'senha123', 0, 'Sumaré'),
('Maria Souza', '87654-321', 'Rua B', 456, 'Jardim', 'RJ', '1985-08-20', 'maria.souza@gmail.com', 'senha456', 'Brasil', 0),
('Carlos Pereira', '45678-123', 'Rua C', 789, 'Norte', 'MG', '1992-11-30', 'carlos.pereira@gmail.com', 'senha789', 'Brasil', 0),
('Ana Oliveira', '98765-432', 'Rua D', 101, 'Sul', 'SP', '1988-02-17', 'ana.oliveira@gmail.com', 'senha101', 'Brasil', 1);


INSERT INTO `Postagem` (`Descricao`, `dataPublicacao`)
VALUES ('Postagem sobre adoção de cães', NOW()),
       ('Postagem sobre resgate de gatos', NOW()),
       ('Evento de conscientização sobre adoção', NOW());
       
INSERT INTO `Avaliacao` (`tipo`, `IDPostagem`, `IDUsuario`)
VALUES ('like', 1, 1),
       ('dislike', 2, 2),
       ('like', 3, 3);

INSERT INTO `Comentario` (`Texto`, `Data`, `IDPostagem`, `IDUsuario`)
VALUES ('Excelente postagem!', NOW(), 1, 1),
       ('Concordo com tudo que foi dito', NOW(), 2, 2),
       ('Muito importante essa discussão', NOW(), 3, 3);

INSERT INTO `Denuncia` (`Causa`, `IDUsuario`, `IDPostagem`)
VALUES ('Conteúdo inadequado', 1, 1),
       ('Spam', 2, 2),
       ('Informações falsas', 3, 3);

INSERT INTO `UsuariosBloqueados` (`dataBloqueio`, `IDBloqueado`, `IDBloqueador`)
VALUES (CURDATE(), 2, 1),
       (CURDATE(), 3, 2);

INSERT INTO `Notificacao` (`Texto`, `IDDestinatario`, `IDComentario`, `IDPostagem`)
VALUES ('Você recebeu um novo comentário', 1, 1, 1),
       ('Sua postagem recebeu uma nova avaliação', 2, NULL, 2),
       ('Você foi mencionado em um comentário', 3, 3, NULL);

INSERT INTO `Pet` (`dataRegistro`, `TipoAnimal`, `Linhagem`, `Status`, `Idade`, `Sexo`, `Cor`, `IDDoador`)
VALUES (NOW(), 'Cachorro', 'SRD', 0, '3', 'M', 'Preto', 1),
       (NOW(), 'Gato', 'Angorá', 1, '2', 'F', 'Branco', 2),
       (NOW(), 'Cachorro', 'Pitbull', 0, '1', 'M', 'Marrom', 3);

INSERT INTO `Interesse` (`Status`, `IDInteressado`, `IDPet`)
VALUES (1, 1, 1),
       (0, 2, 2),
       (1, 3, 3);

INSERT INTO `SolicitacaoContato` (`IDSolicitante`, `IDPetInteressado`, `IDDestinatario`)
VALUES (1, 1, 2),
       (2, 2, 3),
       (3, 3, 1);

INSERT INTO `Contato` (`Interessado`, `Data`, `IDSolicitante`, `IDPetInteressado`, `IDDestinatario`)
VALUES (1, NOW(), 1, 1, 2),
       (0, NOW(), 2, 2, 3),
       (1, NOW(), 3, 3, 1);

INSERT INTO `Mensagem` (`DataDeEnvio`, `IDRemetente`, `IDContato`)
VALUES (NOW(), 1, 1),
       (NOW(), 2, 2),
       (NOW(), 3, 3);

