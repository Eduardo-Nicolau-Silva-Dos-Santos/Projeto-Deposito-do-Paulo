document.addEventListener('DOMContentLoaded', () => {
    const addProductForm = document.getElementById('addProductForm');

    // Verificação para garantir que o formulário foi encontrado no DOM
    if (!addProductForm) {
        console.error('Erro ao encontrar o formulário de cadastro no DOM.');
        return;
    }

    addProductForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(addProductForm);

        // Verificação para garantir que todos os campos necessários foram preenchidos
        if (!formData.get('nome') || !formData.get('descricao') || !formData.get('preco') || !formData.get('categoria_id') || !formData.get('estoque')) {
            alert('Todos os campos são obrigatórios');
            return;
        }

        fetch('/api/produtos', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na rede: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Produto cadastrado com sucesso:', data);
            alert('Produto cadastrado com sucesso!');
            window.location.href = 'admin-produtos.html';
        })
        .catch(error => {
            console.error('Erro ao cadastrar produto:', error);
            alert('Erro ao cadastrar produto: ' + error.message);
        });
    });
});
