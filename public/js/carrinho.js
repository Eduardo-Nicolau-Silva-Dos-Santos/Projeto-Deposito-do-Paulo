document.addEventListener('DOMContentLoaded', () => {
    const carrinhoItens = document.getElementById('cart-items');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    const frete = 10.00; // Valor fixo de frete para este exemplo
    const idUsuario = 1; // Substitua pelo ID do usuário atual

    // Função para renderizar os itens do carrinho
    const renderCarrinho = (carrinho) => {
        carrinhoItens.innerHTML = '';
        let subtotal = 0;

        carrinho.forEach(item => {
            const itemTotal = item.preco * item.quantidade;
            subtotal += itemTotal;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${item.imagem}" alt="${item.nome}" class="img-fluid"></td>
                <td>${item.descricao}</td>
                <td>R$ ${item.preco.toFixed(2).replace('.', ',')}</td>
                <td>
                    <input type="number" class="form-control quantity-input" value="${item.quantidade}" min="1" data-id="${item.id}">
                </td>
                <td>R$ ${itemTotal.toFixed(2).replace('.', ',')}</td>
                <td><span class="remove-btn" data-id="${item.id}">Remover</span></td>
            `;
            carrinhoItens.appendChild(row);
        });

        subtotalElement.innerText = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        totalElement.innerText = `R$ ${(subtotal + frete).toFixed(2).replace('.', ',')}`;

        attachEventListeners();
    };

    // Função para buscar itens do carrinho
    const fetchCarrinho = () => {
        fetch(`/api/carrinho/${idUsuario}`)
            .then(response => response.json())
            .then(data => renderCarrinho(data))
            .catch(error => console.error('Erro ao carregar itens do carrinho:', error));
    };

    // Atualizar quantidade e total
    const updateCart = (id, quantidade) => {
        fetch(`/api/carrinho/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, quantidade }),
        })
        .then(response => response.json())
        .then(data => fetchCarrinho())
        .catch(error => console.error('Erro ao atualizar quantidade:', error));
    };

    // Remover item do carrinho
    const removeItem = (id) => {
        fetch(`/api/carrinho/remove`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
        })
        .then(response => response.json())
        .then(data => fetchCarrinho())
        .catch(error => console.error('Erro ao remover item do carrinho:', error));
    };

    // Adicionar eventos
    const attachEventListeners = () => {
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', (event) => {
                const id = parseInt(event.target.dataset.id);
                const quantidade = parseInt(event.target.value);
                updateCart(id, quantidade);
            });
        });

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (event) => {
                const id = parseInt(event.target.dataset.id);
                removeItem(id);
            });
        });
    };

    // Inicializar o carrinho
    fetchCarrinho();
});
