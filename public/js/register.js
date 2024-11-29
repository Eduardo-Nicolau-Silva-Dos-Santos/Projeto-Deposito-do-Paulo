const express = require('express');
const connection = require('./db'); // Configuração do banco de dados
const bcrypt = require('bcrypt');

const router = express.Router();

router.post('/api/register', (req, res) => {
    const { nome, email, senha, telefone, endereco } = req.body;
    const nivel_acesso = 'usuario'; // Define o nível de acesso como "usuario" por padrão

    bcrypt.hash(senha, 10, (err, hash) => {
        if (err) {
            console.error('Erro ao criptografar senha:', err);
            res.status(500).send('Erro ao cadastrar');
        } else {
            const query = 'INSERT INTO usuarios (nome, email, senha, telefone, endereco, nivel_acesso) VALUES (?, ?, ?, ?, ?, ?)';
            connection.query(query, [nome, email, hash, telefone, endereco, nivel_acesso], (err, results) => {
                if (err) {
                    console.error('Erro ao cadastrar usuário:', err);
                    res.status(500).send('Erro ao cadastrar');
                } else {
                    res.json({ success: true });
                }
            });
        }
    });
});

module.exports = router;
