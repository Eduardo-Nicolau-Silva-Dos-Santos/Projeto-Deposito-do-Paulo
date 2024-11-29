const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const connection = require('./db');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const nodemailer = require('nodemailer');
const winston = require('winston');
const multer = require('multer');

const app = express();
const port = 3000;

// Configuração do armazenamento do Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nome único com timestamp
    }
});

const upload = multer({ storage }); // Define a variável upload aqui

// Middleware de sessão
const sessionStore = new MySQLStore({}, connection);

app.use(session({
    key: 'session_cookie_name',
    secret: 'dc5b60726e58c68f0ebf99131051e476649f141f005559076f5272998c2c2888fc5548cbf48a1cfd73300cfd177ad62c5b7727320052cb1dd00e6241a1173053', // Substitua por uma chave secreta forte
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Use secure: true em produção com HTTPS
}));

// Outros middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/IMG-Base', express.static(path.join(__dirname, 'IMG-Base')));

// Middleware para verificar se o usuário é administrador
const isAdmin = (req, res, next) => {
    console.log('Verificando admin:', req.session);
    if (req.session && req.session.user && req.session.user.nivel_acesso === 'admin') {
        next();
    } else {
        res.redirect('/acesso-negado.html');
    }
};

// Rota de login do usuário
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;
    const query = 'SELECT * FROM usuarios WHERE email = ?';
    connection.query(query, [email], (err, results) => {
        if (err) {
            console.error('Erro ao buscar usuário:', err);
            return res.status(500).json({ error: 'Erro ao buscar usuário' });
        }
        if (results.length === 0) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }
        const user = results[0];
        bcrypt.compare(senha, user.senha, (err, match) => {
            if (err) {
                console.error('Erro ao comparar senhas:', err);
                return res.status(500).json({ error: 'Erro ao comparar senhas' });
            }
            if (!match) {
                return res.status(401).json({ error: 'Senha incorreta' });
            }
            req.session.user = {
                id: user.id,
                nome: user.nome,
                email: user.email,
                nivel_acesso: user.nivel_acesso
            };
            res.json({ success: true });
        });
    });
});

// Rota de logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao destruir a sessão:', err);
            return res.status(500).send('Erro ao fazer logout');
        }
        res.redirect('/login.html');
    });
});

// Rotas públicas
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/acesso-negado.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'acesso-negado.html'));
});

// Rotas protegidas
app.use('/admin-dashboard.html', isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

app.use('/admin-produtos.html', isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-produtos.html'));
});

app.use('/admin-pedidos.html', isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-pedidos.html'));
});

app.use('/admin-usuarios.html', isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-usuarios.html'));
});

// Rota para buscar todos os usuários
app.get('/api/usuarios', (req, res) => {
    const query = 'SELECT id, nome, email, telefone, nivel_acesso FROM usuarios';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar usuários:', err);
            res.status(500).json({ error: 'Erro ao buscar usuários' });
        } else {
            res.json(results);
        }
    });
});

// Rota para obter um usuário específico pelo ID
app.get('/api/usuarios/:id', isAdmin, (req, res) => {
    const userId = req.params.id;
    const query = 'SELECT id, nome, email, telefone, nivel_acesso FROM usuarios WHERE id = ?';
    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Erro ao buscar usuário:', err);
            res.status(500).send('Erro ao buscar usuário');
        } else {
            if (results.length > 0) {
                res.json(results[0]);
            } else {
                res.status(404).send('Usuário não encontrado');
            }
        }
    });
});

// Rota para obter informações do usuário logado
app.get('/api/usuario-logado', (req, res) => {
    const userId = req.session.user ? req.session.user.id : null;
    if (!userId) {
        return res.status(401).json({ error: 'Usuário não logado' });
    }

    const query = 'SELECT id, nome, email, nivel_acesso FROM usuarios WHERE id = ?';
    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Erro ao obter informações do usuário logado:', err);
            res.status(500).json({ error: 'Erro ao obter informações do usuário logado' });
        } else {
            if (results.length > 0) {
                res.json(results[0]);
            } else {
                res.status(404).json({ error: 'Usuário não encontrado' });
            }
        }
    });
});
// Rota para cadastrar usuário
app.post('/api/register', (req, res) => {
    console.log('Recebendo requisição de registro:', req.body);
    const { nome, email, password, telefone, endereco } = req.body;
    const nivel_acesso = 'usuario'; // Define o nível de acesso como "usuario" por padrão
    bcrypt.hash(password, 10, (err, hash) => {
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

// Rota para atualizar um usuário
app.put('/api/usuarios/:id', isAdmin, (req, res) => {
    const { nome, email, telefone, nivel_acesso } = req.body;
    const userId = req.params.id;

    if (!nome || !email || !telefone || !nivel_acesso) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    const query = 'UPDATE usuarios SET nome = ?, email = ?, telefone = ?, nivel_acesso = ? WHERE id = ?';
    connection.query(query, [nome, email, telefone, nivel_acesso, userId], (err, results) => {
        if (err) {
            console.error('Erro ao atualizar usuário:', err);
            res.status(500).send('Erro ao atualizar usuário');
        } else {
            res.json({ success: true });
        }
    });
});



// Rota para excluir um usuário
app.delete('/api/usuarios/:id', isAdmin, (req, res) => {
    const userId = req.params.id;
    const query = 'DELETE FROM usuarios WHERE id = ?';
    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Erro ao excluir usuário:', err);
            res.status(500).send('Erro ao excluir usuário');
        } else {
            res.json({ success: true });
        }
    });
});

// Rotas de Produtos
// Rota para buscar produtos em destaque
app.get('/api/produtos-destaque', (req, res) => {
    const query = 'SELECT * FROM produtos ORDER BY id LIMIT 6'; // Supondo que a tabela de produtos é "produtos"
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar produtos em destaque:', err);
            res.status(500).send('Erro ao buscar produtos em destaque');
        } else {
            res.json(results);
        }
    });
});
// Rota para buscar todos os produtos com categoria e quantidade em estoque
app.get('/api/produtos', (req, res) => {
    const queryProdutos = `
        SELECT p.id, p.nome, p.descricao, p.preco, p.imagem, p.estoque, c.nome AS categoria 
        FROM produtos p 
        LEFT JOIN categorias c ON p.categoria_id = c.id
    `;
    connection.query(queryProdutos, (err, produtos) => {
        if (err) {
            console.error('Erro ao buscar produtos:', err);
            res.status(500).send('Erro ao carregar os produtos');
        } else {
            res.json(produtos);
        }
    });
});

app.get('/api/produtos/:id', (req, res) => {
    const productId = req.params.id;
    const query = `
        SELECT p.id, p.nome, p.descricao, p.preco, p.imagem, p.estoque, p.categoria_id, c.nome AS categoria 
        FROM produtos p 
        LEFT JOIN categorias c ON p.categoria_id = c.id 
        WHERE p.id = ?
    `;
    connection.query(query, [productId], (err, results) => {
        if (err) {
            console.error('Erro ao buscar produto:', err);
            res.status(500).send('Erro ao buscar produto');
        } else {
            if (results.length > 0) {
                res.json(results[0]);
            } else {
                res.status(404).send('Produto não encontrado');
            }
        }
    });
});


// Rota para criar um novo produto com upload de imagem e quantidade em estoque
app.post('/api/produtos', upload.single('imagem'), (req, res) => {
    const { nome, descricao, preco, categoria_id, estoque } = req.body;

    if (!nome || !descricao || !preco || !categoria_id || !estoque) {
        res.status(400).send('Todos os campos são obrigatórios');
        return;
    }

    const imagem = req.file ? `/uploads/${req.file.filename}` : null; // Caminho da imagem

    const query = 'INSERT INTO produtos (nome, descricao, preco, categoria_id, imagem, estoque) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(query, [nome, descricao, preco, categoria_id, imagem, estoque], (err, results) => {
        if (err) {
            console.error('Erro ao criar produto:', err);
            res.status(500).send('Erro ao criar produto');
        } else {
            res.json({ success: true });
        }
    });
});


// Rota para atualizar um produto com upload de imagem e quantidade em estoque
app.put('/api/produtos/:id', upload.single('imagem'), (req, res) => {
    const productId = req.params.id;
    const { nome, descricao, preco, categoria_id, estoque } = req.body;

    if (!nome || !descricao || !preco || !categoria_id || !estoque) {
        res.status(400).send('Todos os campos são obrigatórios');
        return;
    }

    let imagem = req.body.imagem; // Usar a imagem existente

    if (req.file) {
        imagem = `/uploads/${req.file.filename}`; // Usar a nova imagem se fornecida
    }

    const query = 'UPDATE produtos SET nome = ?, descricao = ?, preco = ?, categoria_id = ?, imagem = ?, estoque = ? WHERE id = ?';
    connection.query(query, [nome, descricao, preco, categoria_id, imagem, estoque, productId], (err, results) => {
        if (err) {
            console.error('Erro ao atualizar produto:', err);
            res.status(500).send('Erro ao atualizar produto');
        } else {
            res.json({ success: true });
        }
    });
});



// Rota para excluir um produto
app.delete('/api/produtos/:id', (req, res) => {
    const productId = req.params.id;
    const query = 'DELETE FROM produtos WHERE id = ?';
    connection.query(query, [productId], (err, results) => {
        if (err) {
            console.error('Erro ao excluir produto:', err);
            res.status(500).send('Erro ao excluir produto');
        } else {
            res.json({ success: true });
        }
    });
});

//Log de erro da API
app.put('/api/produtos/:id', upload.single('imagem'), (req, res) => {
    const productId = req.params.id;
    const { nome, descricao, preco, categoria_id, estoque } = req.body;

    // Log detalhado para depuração
    console.log('Dados recebidos no backend:');
    console.log('Nome:', nome);
    console.log('Descrição:', descricao);
    console.log('Preço:', preco);
    console.log('Categoria ID:', categoria_id);
    console.log('Estoque:', estoque);
    console.log('Imagem:', req.file ? req.file.filename : 'Nenhuma nova imagem');

    if (!nome || !descricao || !preco || !categoria_id || !estoque) {
        res.status(400).send('Todos os campos são obrigatórios');
        return;
    }

    let imagem = req.body.imagem; // Usar a imagem existente

    if (req.file) {
        imagem = `/uploads/${req.file.filename}`; // Usar a nova imagem se fornecida
    }

    const query = 'UPDATE produtos SET nome = ?, descricao = ?, preco = ?, categoria_id = ?, imagem = ?, estoque = ? WHERE id = ?';
    connection.query(query, [nome, descricao, preco, categoria_id, imagem, estoque, productId], (err, results) => {
        if (err) {
            console.error('Erro ao atualizar produto:', err);
            res.status(500).send('Erro ao atualizar produto');
        } else {
            res.json({ success: true });
        }
    });
});


//Rota de carrinho e Finalização
//Rota do Carrinho
app.post('/api/carrinho', (req, res) => {
    const { produtoId, quantidade } = req.body;
    const userId = req.session.user ? req.session.user.id : null;
    if (!userId) {
        return res.status(401).json({ error: 'Usuário não logado' });
    }
    const query = 'INSERT INTO carrinho (id_usuario, id_produto, quantidade) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantidade = quantidade + ?';
    connection.query(query, [userId, produtoId, quantidade, quantidade], (err, results) => {
        if (err) {
            console.error('Erro ao adicionar item ao carrinho:', err);
            res.status(500).json({ error: 'Erro ao adicionar item ao carrinho' });
        } else {
            res.json({ success: true });
        }
    });
});


app.get('/api/carrinho', (req, res) => {
    const userId = req.session.user ? req.session.user.id : null;
    if (!userId) {
        return res.status(401).json({ error: 'Usuário não logado' });
    }
    const query = 'SELECT c.id_produto, p.nome, p.imagem, p.preco, c.quantidade FROM carrinho c JOIN produtos p ON c.id_produto = p.id WHERE c.id_usuario = ?';
    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Erro ao obter itens do carrinho:', err);
            res.status(500).json({ error: 'Erro ao obter itens do carrinho' });
        } else {
            res.json(results);
        }
    });
});

//Rota para limpar o carrinho
app.delete('/api/carrinho', (req, res) => {
    const userId = req.session.user ? req.session.user.id : null;
    if (!userId) {
        return res.status(401).json({ error: 'Usuário não logado' });
    }
    const query = 'DELETE FROM carrinho WHERE id_usuario = ?';
    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Erro ao limpar o carrinho:', err);
            res.status(500).json({ error: 'Erro ao limpar o carrinho' });
        } else {
            res.json({ success: true });
        }
    });
});

//Rota de pedidos
// Rota para criar um novo pedido
app.post('/api/pedidos', (req, res) => {
    const { usuario, total } = req.body;
    const userId = req.session.user ? req.session.user.id : null;

    if (!userId) {
        console.log('Erro: Usuário não logado');
        return res.status(401).json({ error: 'Usuário não logado' });
    }

    console.log('Iniciando criação de pedido para o usuário:', userId);

    const queryPedido = 'INSERT INTO pedidos (id_usuario, total, data_pedido, status) VALUES (?, ?, NOW(), "Pendente")';
    connection.query(queryPedido, [userId, total], (err, result) => {
        if (err) {
            console.error('Erro ao criar pedido:', err);
            return res.status(500).json({ error: 'Erro ao criar pedido' });
        }

        const pedidoId = result.insertId;
        console.log('Pedido criado com sucesso, ID do Pedido:', pedidoId);

        // Enviar resposta de sucesso sem inserir itens do pedido
        res.status(201).json({ success: true, pedidoId });
    });
});


// Rota para buscar resumo de vendas
app.get('/api/resumo-vendas', (req, res) => {
    const query = 'SELECT DATE(data_pedido) AS data, SUM(total) AS vendas FROM pedidos GROUP BY DATE(data_pedido)';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar resumo de vendas:', err);
            res.status(500).send('Erro ao carregar resumo de vendas');
        } else {
            const labels = results.map(row => row.data);
            const vendas = results.map(row => row.vendas);
            res.json({ labels, vendas });
        }
    });
});

// Rota para buscar produtos em estoque
app.get('/api/estoque-produtos', (req, res) => {
    const query = 'SELECT nome, estoque FROM produtos WHERE estoque <= 10';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar estoque de produtos:', err);
            res.status(500).send('Erro ao carregar estoque de produtos');
        } else {
            res.json(results);
        }
    });
});

// Rota para buscar pedidos recentes
app.get('/api/pedidos-recentes', (req, res) => {
    const query = `
        SELECT p.id, u.nome AS usuario, p.total, p.status, p.data_pedido AS data
        FROM pedidos p
        JOIN usuarios u ON p.id_usuario = u.id
        ORDER BY p.data_pedido DESC
        LIMIT 10
    `;
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar pedidos recentes:', err);
            res.status(500).send('Erro ao carregar pedidos recentes');
        } else {
            res.json(results);
        }
    });
});


// Rota para finalizar compra
app.post('/api/finalizar-compra', (req, res) => {
    const { dadosEnvio, dadosPagamento } = req.body;
    // Lógica para processar a compra, salvar dados no banco de dados, etc.
    // Aqui você pode adicionar sua lógica para processar o pagamento e salvar os dados do pedido

    res.json({ success: true });
});

//Rotas de pedidos
// Rota para criar um novo pedido
app.post('/api/pedidos', (req, res) => {
    const { usuario, total } = req.body;
    const userId = req.session.user ? req.session.user.id : null;

    if (!userId) {
        console.log('Erro: Usuário não logado');
        return res.status(401).json({ error: 'Usuário não logado' });
    }

    console.log('Iniciando criação de pedido para o usuário:', userId);

    const queryPedido = 'INSERT INTO pedidos (id_usuario, total, data_pedido, status) VALUES (?, ?, NOW(), "Pendente")';
    connection.query(queryPedido, [userId, total], (err, result) => {
        if (err) {
            console.error('Erro ao criar pedido:', err);
            return res.status(500).json({ error: 'Erro ao criar pedido' });
        }

        const pedidoId = result.insertId;
        console.log('Pedido criado com sucesso, ID do Pedido:', pedidoId);

        // Enviar resposta de sucesso sem inserir itens do pedido
        res.status(201).json({ success: true, pedidoId });
    });
});


// Middleware para analisar o corpo das requisições
app.use(express.json());

// Dados de exemplo
const pedidos = [
    { id: 1, cliente: 'João Silva', total: 100.00, status: 'Pendente', data: new Date(), itens: [{ nome: 'Produto 1', quantidade: 2, preco: 50.00 }] },
    // Adicione mais pedidos conforme necessário
];

// Rota para buscar todos os pedidos com filtro por status
app.get('/api/pedidos', (req, res) => {
    const { status } = req.query;
    let query = 'SELECT p.id, u.nome AS cliente, p.total, p.status, p.data_pedido FROM pedidos p JOIN usuarios u ON p.id_usuario = u.id';
    const queryParams = [];

    if (status) {
        query += ' WHERE p.status = ?';
        queryParams.push(status);
    }

    connection.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Erro ao buscar pedidos:', err);
            return res.status(500).json({ error: 'Erro ao buscar pedidos' });
        }
        res.json(results);
    });
});

// Rota para buscar detalhes de um pedido específico
app.get('/api/pedidos/:id', (req, res) => {
    const pedidoId = req.params.id;
    const queryPedido = 'SELECT p.id, u.nome AS cliente, p.total, p.status, p.data_pedido FROM pedidos p JOIN usuarios u ON p.id_usuario = u.id WHERE p.id = ?';
    const queryItens = 'SELECT i.nome, ip.quantidade, ip.preco_unitario AS preco FROM itens_pedido ip JOIN produtos i ON ip.id_produto = i.id WHERE ip.id_pedido = ?';

    connection.query(queryPedido, [pedidoId], (err, pedidoResult) => {
        if (err) {
            console.error('Erro ao buscar pedido:', err);
            return res.status(500).json({ error: 'Erro ao buscar pedido' });
        }

        if (pedidoResult.length === 0) {
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }

        connection.query(queryItens, [pedidoId], (err, itensResult) => {
            if (err) {
                console.error('Erro ao buscar itens do pedido:', err);
                return res.status(500).json({ error: 'Erro ao buscar itens do pedido' });
            }

            const pedido = pedidoResult[0];
            pedido.itens = itensResult;
            res.json(pedido);
        });
    });
});

// Rota para alterar o status de um pedido
app.put('/api/pedidos/:id/status', (req, res) => {
    const pedidoId = req.params.id;
    const { status } = req.body;

    const query = 'UPDATE pedidos SET status = ? WHERE id = ?';
    connection.query(query, [status, pedidoId], (err, result) => {
        if (err) {
            console.error('Erro ao alterar status do pedido:', err);
            return res.status(500).json({ error: 'Erro ao alterar status do pedido' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }

        res.json({ success: true });
    });
});



// Rota para obter um pedido por ID
app.get('/api/pedidos/:id', (req, res) => {
    const pedido = pedidos.find(p => p.id == req.params.id);
    if (pedido) {
        res.json(pedido);
    } else {
        res.status(404).send('Pedido não encontrado');
    }
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
