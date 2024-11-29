window.onload = function() {
    // Carregar os produtos ao iniciar a página
    fetch('http://localhost:3000/products')
      .then(response => response.json())
      .then(products => {
        const productList = document.getElementById('product-list');
        
        products.forEach(product => {
          const productDiv = document.createElement('div');
          productDiv.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p>R$ ${product.price}</p>
            <button onclick="addToCart(${product.id}, '${product.name}', ${product.price})">Adicionar ao Carrinho</button>
          `;
          productList.appendChild(productDiv);
        });
      })
      .catch(error => console.error('Erro ao carregar produtos:', error));
  };
  
  let cart = [];
  
  function addToCart(productId, productName, productPrice) {
    // Adicionar o produto ao carrinho
    cart.push({ id: productId, name: productName, price: productPrice });
    updateCart();
  }
  
  function updateCart() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    let totalPrice = 0;
    
    cart.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.innerHTML = `
        <p>${item.name}</p>
        <p>R$ ${item.price}</p>
      `;
      cartItems.appendChild(itemDiv);
      totalPrice += item.price;
    });
  
    document.getElementById('total-price').textContent = totalPrice.toFixed(2);
  }
  
  function checkout() {
    alert('Finalizando compra...');
  }
  
  // Função para carregar os produtos
async function loadProducts() {
    try {
        const response = await fetch('/api/produtos'); // Chama a API para recuperar os produtos
        const produtos = await response.json();
        
        const productList = document.getElementById('product-list');
        productList.innerHTML = ''; // Limpa a lista antes de adicionar os produtos

        produtos.forEach(produto => {
            const productCard = `
                <div class="col-md-3 mb-4">
                    <div class="product-card">
                        <img src="${produto.imagem_url}" alt="${produto.nome}" class="product-img">
                        <h5 class="mt-3">${produto.nome}</h5>
                        <p>R$ ${produto.preco}</p>
                        <a href="editar-produto.html?id=${produto.id}" class="btn btn-warning btn-block">Editar</a>
                        <button class="btn btn-danger btn-block" onclick="deleteProduct(${produto.id})">Excluir</button>
                    </div>
                </div>
            `;
            productList.innerHTML += productCard;
        });
    } catch (error) {
        console.error('Erro ao carregar os produtos:', error);
    }
}

// Função para excluir um produto
async function deleteProduct(id) {
    try {
        const response = await fetch(`/api/produtos/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Produto excluído com sucesso');
            loadProducts(); // Recarrega a lista de produtos após exclusão
        } else {
            alert('Erro ao excluir o produto');
        }
    } catch (error) {
        console.error('Erro ao excluir o produto:', error);
    }
}

// Carrega os produtos ao carregar a página
document.addEventListener('DOMContentLoaded', loadProducts);
