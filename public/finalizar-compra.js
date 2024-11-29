document.addEventListener('DOMContentLoaded', () => {
    // Função para selecionar a forma de pagamento
    window.selectPayment = (method) => {
        document.querySelectorAll('.payment-details').forEach(detail => detail.style.display = 'none');
        document.querySelectorAll('.payment-option').forEach(option => option.classList.remove('active'));
        document.querySelector(`.payment-option[onclick="selectPayment('${method}')"]`).classList.add('active');
        if (method === 'pix') {
            document.getElementById('pix-details').style.display = 'block';
        } else if (method === 'cartao') {
            document.getElementById('cartao-details').style.display = 'block';
        } else if (method === 'boleto') {
            document.getElementById('boleto-details').style.display = 'block';
        }
    };

    // Função para baixar o boleto
    window.baixarBoleto = () => {
        alert('Baixando o boleto...');
        // Implementar lógica para download do boleto
    };

    // Função para carregar resumo do pedido
    const carregarResumoPedido = () => {
        fetch('/api/carrinho', { method: 'GET', credentials: 'same-origin' })
            .then(response => response.json())
            .then(itens => {
                const orderSummary = document.getElementById('order-summary');
                const totalElement = document.getElementById('order-total');
                orderSummary.innerHTML = '';
                let total = 0;
                itens.forEach(item => {
                    const precoUnitario = parseFloat(item.preco); // Convertendo para número
                    if (isNaN(precoUnitario)) {
                        console.error('Erro: precoUnitario é nulo ou inválido:', item);
                        alert('Erro: precoUnitario é nulo ou inválido. Por favor, verifique os dados do carrinho.');
                        return;
                    } else {
                        total += precoUnitario * item.quantidade;
                        const itemElement = document.createElement('div');
                        itemElement.classList.add('cart-item');
                        itemElement.innerHTML = `
                            <img src="${item.imagem}" alt="${item.nome}">
                            <div class="cart-item-info">
                                <h5>${item.nome}</h5>
                                <p>Preço: R$${precoUnitario.toFixed(2)}</p>
                                <p>Quantidade: ${item.quantidade}</p>
                            </div>
                            <div class="cart-item-total">
                                <p>Total: R$${(precoUnitario * item.quantidade).toFixed(2)}</p>
                            </div>
                        `;
                        orderSummary.appendChild(itemElement);
                    }
                });
                totalElement.textContent = total.toFixed(2);
            })
            .catch(error => console.error('Erro ao carregar resumo do pedido:', error));
    };

    // Função para finalizar a compra
    const finalizarCompra = () => {
        fetch('/api/carrinho', { method: 'DELETE', credentials: 'same-origin' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao limpar carrinho');
                }
                // Gerar o pedido no banco de dados
                return fetch('/api/pedidos', { 
                    method: 'POST', 
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        usuario: document.getElementById('loggedInUser').textContent,
                        total: document.getElementById('order-total').textContent
                    })
                });
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Redirecionar para a página de compra finalizada
                    window.location.href = 'compra-finalizada.html';
                } else {
                    throw new Error('Erro ao gerar pedido');
                }
            })
            .catch(error => console.error('Erro ao finalizar a compra:', error));
    };

    // Chamar a função ao clicar no botão de finalizar compra
    document.getElementById('finalizar-compra-btn').addEventListener('click', () => {
        finalizarCompra();
    });

    // Carregar resumo do pedido ao carregar a página
    carregarResumoPedido();
});
