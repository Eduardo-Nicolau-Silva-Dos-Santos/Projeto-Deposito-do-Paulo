document.addEventListener('DOMContentLoaded', () => {
    // Buscar resumo de vendas
    fetch('/api/resumo-vendas')
        .then(response => response.json())
        .then(data => {
            const ctx = document.getElementById('vendasChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Vendas',
                        data: data.vendas,
                        backgroundColor: 'rgba(0, 123, 255, 0.2)',
                        borderColor: 'rgba(0, 123, 255, 1)',
                        borderWidth: 1
                    }]
                }
            });
        })
        .catch(error => console.error('Erro ao carregar resumo de vendas:', error));

    // Buscar produtos em estoque
    fetch('/api/estoque-produtos')
        .then(response => response.json())
        .then(data => {
            const estoqueLista = document.getElementById('estoqueLista');
            estoqueLista.innerHTML = '';
            data.forEach(produto => {
                const item = document.createElement('li');
                item.classList.add('list-group-item');
                item.textContent = `${produto.nome} - ${produto.estoque} unidades`;
                estoqueLista.appendChild(item);
            });
        })
        .catch(error => console.error('Erro ao carregar estoque de produtos:', error));

    // Buscar pedidos recentes
    fetch('/api/pedidos-recentes')
        .then(response => response.json())
        .then(data => {
            const pedidosRecentes = document.getElementById('pedidosRecentes');
            pedidosRecentes.innerHTML = '';
            data.forEach(pedido => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${pedido.id}</td>
                    <td>${pedido.usuario}</td>
                    <td>R$ ${pedido.total}</td>
                    <td>${pedido.status}</td>
                    <td>${pedido.data}</td>
                `;
                pedidosRecentes.appendChild(row);
            });
        })
        .catch(error => console.error('Erro ao carregar pedidos recentes:', error));

    // Buscar total de usuários
    fetch('/api/total-usuarios')
        .then(response => response.json())
        .then(data => {
            const totalUsuarios = document.getElementById('totalUsuarios');
            totalUsuarios.textContent = `Total de Usuários: ${data.total}`;
        })
        .catch(error => console.error('Erro ao carregar total de usuários:', error));
});
