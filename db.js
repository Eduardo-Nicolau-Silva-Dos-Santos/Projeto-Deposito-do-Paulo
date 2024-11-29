// db.js
const mysql = require('mysql2');

// Criação da conexão com o banco de dados MySQL
const connection = mysql.createConnection({
  host: 'localhost',      // Host do banco de dados
  user: 'root',           // Usuário do banco de dados
  password: 'Akppsk3421@$',           // Senha do banco de dados
  database: 'lojaonline'  // Nome do banco de dados
});

// Conectar ao banco de dados
connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados: ' + err.stack);
    return;
  }
  console.log('Conectado ao banco de dados com id ' + connection.threadId);
});

module.exports = connection;
