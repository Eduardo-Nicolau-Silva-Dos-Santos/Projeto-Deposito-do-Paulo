const express = require('express');
const connection = require('./db');
const bcrypt = require('bcrypt');

const router = express.Router();

router.post('/api/login', (req, res) => {
    const { email, senha } = req.body;

    console.log('Recebendo login request:', { email, senha });

    const query = 'SELECT id, nome, nivel_acesso, senha FROM usuarios WHERE email = ?';
    connection.query(query, [email], (err, results) => {
        if (err) {
            console.error('Erro ao fazer login:', err);
            return res.status(500).send('Erro ao fazer login');
        }

        if (results.length === 0) {
            console.warn('Usuário não encontrado:', email);
            return res.status(401).json({ success: false, message: 'Usuário não encontrado' });
        }

        const user = results[0];
        console.log('Usuário encontrado:', user);

        bcrypt.compare(senha, user.senha, (err, match) => {
            if (err) {
                console.error('Erro ao comparar senha:', err);
                return res.status(500).send('Erro ao comparar senha');
            }

            console.log('Comparação de senha:', { match });

            if (match) {
                req.session.user = {
                    id: user.id,
                    nome: user.nome,
                    nivel_acesso: user.nivel_acesso
                };
                console.log('Senha correta, login bem-sucedido para o usuário ID:', user.id);
                return res.json({ success: true, message: 'Login bem-sucedido' });
            } else {
                console.warn('Senha incorreta para o usuário ID:', user.id);
                return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
            }
        });
    });
});

module.exports = router;
