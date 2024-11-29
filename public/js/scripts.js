// Função para carregar os produtos
window.onload = function() {
    fetch('/api/produtos') // API que você já configurou no backend
        .then(response => response.json())
        .then(data => {
            const productGrid = document.getElementById('productGrid');
            data.forEach(produto => {
                const productItem = document.createElement('div');
                productItem.classList.add('product-item');
                productItem.innerHTML = `
                    <img src="${produto.imagem}" alt="${produto.nome}">
                    <h3>${produto.nome}</h3>
                    <p>R$ ${produto.preco}</p>
                    <button onclick="addToCart(${produto.id})">Adicionar ao Carrinho</button>
                `;
                productGrid.appendChild(productItem);
            });
        })
        .catch(error => console.log('Erro ao carregar produtos: ', error));
}

// Função de busca de produtos
function searchProduct() {
    const query = document.getElementById('search').value;
    if (query.length > 2) {
        fetch(`/api/produtos/search?q=${query}`)
            .then(response => response.json())
            .then(data => {
                console.log(data);
            });
    }
}

// Função para adicionar ao carrinho (mock)
function addToCart(productId) {
    alert('Produto adicionado ao carrinho: ' + productId);
}
