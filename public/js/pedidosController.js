const pedidosModel = require('../models/pedidosModel');

exports.getAllPedidos = (req, res) => {
    pedidosModel.getAll((err, pedidos) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar pedidos' });
        }
        res.json(pedidos);
    });
};

exports.getPedidoById = (req, res) => {
    const pedidoId = req.params.id;
    pedidosModel.getById(pedidoId, (err, pedido) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar pedido' });
        }
        res.json(pedido);
    });
};
