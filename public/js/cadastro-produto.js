document.getElementById('cadastroProdutoForm').addEventListener('submit', (event) => {
    event.preventDefault(); // Impede o envio padrão do formulário

    const nome = document.getElementById('nome').value;
    const descricao = document.getElementById('descricao').value;
    const preco = parseFloat(document.getElementById('preco').value);
    const estoque = parseInt(document.getElementById('estoque').value);

    const produto = { nome, descricao, preco, estoque };

    fetch('http://localhost:3000/api/produtos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(produto)
    })
    .then(response => response.text())
    .then(data => {
        alert(data); // Exibe a mensagem de sucesso
        window.location.href = '/'; // Redireciona para a página inicial
    })
    .catch(error => console.error('Erro ao cadastrar produto:', error));
});
