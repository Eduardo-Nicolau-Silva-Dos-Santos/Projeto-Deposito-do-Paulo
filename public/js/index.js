document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/produtos')
        .then(response => response.json())
        .then(produtos => {
            const featuredProducts = document.getElementById('featured-products');
            featuredProducts.innerHTML = '';
            
            // Supondo que os produtos em destaque sejam os primeiros 6 produtos
            const destaque = produtos.slice(0, 6);

            destaque.forEach(produto => {
                const produtoCard = `
                    <div class="col-md-4 mb-4">
                        <div class="card product-card">
                            <img src="${produto.imagem}" class="card-img-top" alt="${produto.nome}">
                            <div class="card-body">
                                <h5 class="card-title">${produto.nome}</h5>
                                <p class="card-text">${produto.descricao}</p>
                                <p class="text-primary fw-bold">R$ ${produto.preco}</p>
                                <a href="produto.html?id=${produto.id}" class="btn btn-primary">Ver Mais</a>
                            </div>
                        </div>
                    </div>
                `;
                featuredProducts.insertAdjacentHTML('beforeend', produtoCard);
            });
        })
        .catch(error => console.error('Erro ao carregar produtos:', error));
});
