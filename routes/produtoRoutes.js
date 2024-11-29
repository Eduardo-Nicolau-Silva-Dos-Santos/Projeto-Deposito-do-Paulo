const express = require('express');
const router = express.Router();
const connection = require('../db'); // Importa a conexão com o banco

// Rota para listar produtos
router.get('/', (req, res) => {
    const query = 'SELECT * FROM produtos'; // Consulta todos os produtos

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar produtos:', err);
            res.status(500).send('Erro ao buscar produtos');
        } else {
            res.json(results); // Retorna os produtos no formato JSON
        }
    });
});

// Rota para cadastrar produto
router.post('/', (req, res) => {
    const { nome, descricao, preco, estoque } = req.body;

    const query = 'INSERT INTO produtos (nome, descricao, preco, estoque) VALUES (?, ?, ?, ?)';
    const values = [nome, descricao, preco, estoque];

    connection.query(query, values, (err, result) => {
        if (err) {
            console.error('Erro ao cadastrar produto:', err);
            res.status(500).send('Erro ao cadastrar produto');
        } else {
            res.status(201).send('Produto cadastrado com sucesso!');
        }
    });
});

module.exports = router;
