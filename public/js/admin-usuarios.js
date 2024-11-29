document.addEventListener('DOMContentLoaded', () => {
    const usuariosLista = document.getElementById('usuariosLista');
    const addUserForm = document.getElementById('addUserForm');
    const editUserForm = document.getElementById('editUserForm');
    const loggedInUserElement = document.getElementById('loggedInUser');

    // Função para buscar e exibir o nome do usuário logado
    const fetchUsuarioLogado = () => {
        fetch('/api/usuario-logado', { method: 'GET', credentials: 'same-origin' })
            .then(response => response.json())
            .then(usuario => {
                loggedInUserElement.textContent = `Usuário Logado: ${usuario.nome}`;
            })
            .catch(error => {
                console.error('Erro ao obter informações do usuário logado:', error);
                loggedInUserElement.textContent = 'Usuário Logado: Não identificado';
            });
    };

    // Função para buscar e renderizar a lista de usuários
    const fetchUsuarios = () => {
        fetch('/api/usuarios', { method: 'GET', credentials: 'same-origin' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                usuariosLista.innerHTML = '';
                data.forEach(usuario => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${usuario.id}</td>
                        <td>${usuario.nome}</td>
                        <td>${usuario.email}</td>
                        <td>${usuario.telefone}</td>
                        <td>${usuario.nivel_acesso}</td>
                        <td>
                            <button class="btn btn-warning btn-sm" onclick="editUsuario(${usuario.id})">Editar</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteUsuario(${usuario.id})">Excluir</button>
                        </td>
                    `;
                    usuariosLista.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Erro ao carregar usuários:', error);
                alert('Erro ao carregar usuários: ' + error.message);
            });
    };

    // Função para adicionar um novo usuário
    addUserForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(addUserForm);

        fetch('/api/usuarios', {
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
            if (data.success) {
                $('#addUserModal').modal('hide');
                fetchUsuarios();
            } else {
                alert('Erro ao adicionar usuário');
            }
        })
        .catch(error => {
            console.error('Erro ao adicionar usuário:', error);
            alert('Erro ao adicionar usuário: ' + error.message);
        });
    });

    // Função para editar um usuário
    window.editUsuario = (id) => {
        fetch(`/api/usuarios/${id}`, { method: 'GET', credentials: 'same-origin' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao buscar usuário');
                }
                return response.json();
            })
            .then(usuario => {
                document.getElementById('editUserId').value = usuario.id;
                document.getElementById('editUserName').value = usuario.nome;
                document.getElementById('editUserEmail').value = usuario.email;
                document.getElementById('editUserPhone').value = usuario.telefone;
                document.getElementById('editUserAccessLevel').value = usuario.nivel_acesso;

                $('#editUserModal').modal('show');
            })
            .catch(error => console.error('Erro ao buscar usuário:', error));
    };

    // Função para salvar as alterações do usuário
    editUserForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const usuarioId = document.getElementById('editUserId').value;
        const formData = new FormData(editUserForm);

        const data = {
            nome: formData.get('nome'),
            email: formData.get('email'),
            telefone: formData.get('telefone'),
            nivel_acesso: formData.get('nivel_acesso')
        };

        fetch(`/api/usuarios/${usuarioId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao atualizar o usuário: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                $('#editUserModal').modal('hide');
                fetchUsuarios();
            } else {
                alert('Erro ao salvar alterações do usuário');
            }
        })
        .catch(error => console.error('Erro ao salvar alterações do usuário:', error));
    });

    // Função para excluir um usuário
    window.deleteUsuario = (id) => {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            fetch(`/api/usuarios/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao excluir usuário');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    fetchUsuarios();
                } else {
                    alert('Erro ao excluir usuário');
                }
            })
            .catch(error => console.error('Erro ao excluir usuário:', error));
        }
    };

    // Carregar a lista de usuários e informações do usuário logado ao carregar a página
    fetchUsuarios();
    fetchUsuarioLogado();
});
