const mysql = require('mysql2');

// Criando a conexão com o banco de dados
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Akppsk3421@$',
  database: 'lojaonline'
});

// Função para adicionar um produto
exports.addProduct = (req, res) => {
  const { name, description, price } = req.body;
  
  const query = 'INSERT INTO produtos (name, description, price) VALUES (?, ?, ?)';
  connection.execute(query, [name, description, price], (err, results) => {
    if (err) {
      console.error('Erro ao adicionar produto: ', err);
      return res.status(500).send('Erro ao adicionar produto');
    }
    res.status(200).send('Produto adicionado com sucesso');
  });
};

// Função para listar os produtos
exports.listProducts = (req, res) => {
  const query = 'SELECT * FROM produtos';
  connection.execute(query, (err, results) => {
    if (err) {
      console.error('Erro ao listar produtos: ', err);
      return res.status(500).send('Erro ao listar produtos');
    }
    res.status(200).json(results);
  });
};
