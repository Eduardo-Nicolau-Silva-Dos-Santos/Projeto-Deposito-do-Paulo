const db = require('../db');

exports.getAll = (callback) => {
    const query = 'SELECT * FROM pedidos';
    db.query(query, (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
};

exports.getById = (id, callback) => {
    const query = 'SELECT * FROM pedidos WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results[0]);
    });
};
