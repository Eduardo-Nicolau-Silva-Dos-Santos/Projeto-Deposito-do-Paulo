document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/produtos')
        .then(response => response.json())
        .then(produtos => {
            const lista = document.getElementById('produtos-lista');
            const categoriaSelect = document.getElementById('categoria');
            
            // Renderizar categorias dinamicamente
            const categorias = [...new Set(produtos.map(produto => produto.categoria))];
            categoriaSelect.innerHTML = '<option value="">Todas</option>';
            categorias.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria;
                option.textContent = categoria;
                categoriaSelect.appendChild(option);
            });
            
            // Renderizar produtos dinamicamente
            lista.innerHTML = '';
            produtos.forEach(produto => {
                const produtoCard = `
                    <div class="col-md-4 mb-4 produto-card" data-nome="${produto.nome}" data-categoria="${produto.categoria}" data-preco="${produto.preco}">
                        <div class="card product-card">
                            <img src="${produto.imagem}" class="card-img-top" alt="${produto.nome}">
                            <div class="card-body">
                                <h5 class="card-title">${produto.nome}</h5>
                                <p class="card-text">${produto.descricao}</p>
                                <p class="text-primary fw-bold">R$ ${produto.preco}</p>
                                <button class="btn btn-primary w-100" onclick="addItemToCart(${produto.id}, 1)">Adicionar ao Carrinho</button>
                            </div>
                        </div>
                    </div>
                `;
                lista.insertAdjacentHTML('beforeend', produtoCard);
            });

            // Chame as funções de filtro e ordenação após renderizar os produtos
            filtrarProdutos();
            ordenarProdutos();
        })
        .catch(error => console.error('Erro ao carregar produtos:', error));
});

// Função para adicionar item ao carrinho
const addItemToCart = (idProduto, quantidade) => {
    const idUsuario = 1; // Substitua pelo ID do usuário atual
    fetch('/api/carrinho/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_usuario: idUsuario, id_produto: idProduto, quantidade }),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
    })
    .catch(error => console.error('Erro ao adicionar item ao carrinho:', error));
};

// Funções de filtro e ordenação
window.filtrarProdutos = function() {
    const search = document.getElementById('search').value.toLowerCase();
    const categoria = document.getElementById('categoria').value;
    const precoMin = parseFloat(document.getElementById('precoMin').value) || 0;
    const precoMax = parseFloat(document.getElementById('precoMax').value) || Infinity;

    const produtos = document.querySelectorAll('.produto-card');

    produtos.forEach(produto => {
        const nome = produto.dataset.nome.toLowerCase();
        const categoriaProduto = produto.dataset.categoria;
        const precoProduto = parseFloat(produto.dataset.preco);

        const exibe = 
            (!search || nome.includes(search)) && 
            (!categoria || categoriaProduto === categoria) && 
            (precoProduto >= precoMin) && 
            (precoProduto <= precoMax);

        produto.style.display = exibe ? 'block' : 'none';
    });
}

window.ordenarProdutos = function() {
    const ordem = document.getElementById('ordem').value;
    const lista = document.getElementById('produtos-lista');
    const produtos = Array.from(lista.children);

    produtos.sort((a, b) => {
        const precoA = parseFloat(a.dataset.preco);
        const precoB = parseFloat(b.dataset.preco);

        if (ordem === 'preco-asc') return precoA - precoB;
        if (ordem === 'preco-desc') return precoB - precoA;
        return 0;
    });

    produtos.forEach(produto => lista.appendChild(produto));
}
