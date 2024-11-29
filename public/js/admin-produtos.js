document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('productList');
    const editProductForm = document.getElementById('editProductForm');

    // Verificação para garantir que os elementos foram encontrados no DOM
    if (!productList || !editProductForm) {
        console.error('Erro ao encontrar um ou mais elementos no DOM.');
        return;
    }

    // Função para buscar e renderizar a lista de produtos
    const fetchProducts = () => {
        console.log('Fetching products...');
        fetch('/api/produtos', { method: 'GET', credentials: 'same-origin' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                console.log('Products fetched successfully:', data);
                productList.innerHTML = '';
                data.forEach(product => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${product.id}</td>
                        <td>${product.nome}</td>
                        <td>${product.descricao}</td>
                        <td>${product.preco}</td>
                        <td>${product.categoria || 'Sem Categoria'}</td>
                        <td><img src="${product.imagem}" alt="${product.nome}" width="50"></td>
                        <td>${product.estoque}</td>
                        <td>
                            <button class="btn btn-warning btn-sm" onclick="editProduct(${product.id})">Editar</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">Excluir</button>
                        </td>
                    `;
                    productList.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Erro ao carregar produtos:', error);
                alert('Erro ao carregar produtos: ' + error.message);
            });
    };

    // Função para editar um produto
    window.editProduct = (id) => {
        fetch(`/api/produtos/${id}`, { method: 'GET', credentials: 'same-origin' })
            .then(response => response.json())
            .then(product => {
                document.getElementById('editProductId').value = product.id;
                document.getElementById('editProductName').value = product.nome;
                document.getElementById('editProductDescription').value = product.descricao;
                document.getElementById('editProductPrice').value = product.preco;
                document.getElementById('editProductCategory').value = product.categoria_id; // Seleciona a categoria correta no modal de edição
                document.getElementById('editProductQuantity').value = product.estoque;

                // Armazena o caminho atual da imagem para ser usado no envio, se necessário
                const imageInput = document.getElementById('editProductImage');
                imageInput.dataset.currentImagePath = product.imagem;

                $('#editProductModal').modal('show');
            })
            .catch(error => console.error('Erro ao buscar produto:', error));
    };

    // Função para salvar as alterações do produto
    editProductForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const productId = document.getElementById('editProductId').value;
        const formData = new FormData(editProductForm);

        // Verificação para garantir que todos os campos necessários foram preenchidos
        if (!formData.get('nome') || !formData.get('descricao') || !formData.get('preco') || !formData.get('categoria_id') || !formData.get('estoque')) {
            alert('Todos os campos são obrigatórios');
            return;
        }

        // Adicione o caminho da imagem existente ao formData se nenhuma nova imagem for selecionada
        const currentImagePath = document.getElementById('editProductImage').dataset.currentImagePath;
        const imageFile = formData.get('imagem');
        if (!imageFile || imageFile.size === 0) {
            formData.set('imagem', currentImagePath);
        }

        fetch(`/api/produtos/${productId}`, {
            method: 'PUT',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao atualizar o produto: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                $('#editProductModal').modal('hide');
                fetchProducts();
            } else {
                alert('Erro ao salvar alterações do produto');
            }
        })
        .catch(error => console.error('Erro ao salvar alterações do produto:', error));
    });

    // Função para excluir um produto
    window.deleteProduct = (id) => {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            fetch(`/api/produtos/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    fetchProducts();
                } else {
                    alert('Erro ao excluir produto');
                }
            })
            .catch(error => console.error('Erro ao excluir produto:', error));
        }
    };

    // Carregar a lista de produtos ao carregar a página
    fetchProducts();
});
