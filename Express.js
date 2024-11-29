const express = require('express');
const app = express();

app.use(express.json());

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    // Simulação de autenticação
    const user = authenticateUser(email, password); // Função fictícia para autenticar usuário

    if (user) {
        // Suponha que o usuário retornado tenha uma propriedade 'nivel_acesso'
        res.json({
            success: true,
            nivel_acesso: user.nivel_acesso,
            nome: user.nome
        });
    } else {
        res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }
});

// Função fictícia de autenticação
const authenticateUser = (email, password) => {
    // Lógica de autenticação...
    // Retornar usuário com nível de acesso como exemplo
    return { nome: 'Exemplo', nivel_acesso: 'admin' }; // ou 'usuario'
};

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
