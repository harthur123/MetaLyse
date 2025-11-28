🚀 Instalação e Configuração (Passo a Passo)

Siga estes passos na ordem exata para rodar o projeto.

1. Clone e Entre na Pasta

Abra o terminal e navegue até a pasta do backend:
Bash

cd backend

2. Crie e Ative o Ambiente Virtual (venv)

Isso isola as dependências do projeto.

No Windows (PowerShell):
 PowerShell

    python -m venv venv
    
    .\venv\Scripts\Activate.ps1

No Linux/Mac:
Bash

    python3 -m venv venv
    source venv/bin/activate

3. Instale as Dependências (Esteja com o ambiente virtual ativo)

Bash

pip install -r requirements.txt



⚙️  CONFIGURAÇÕES DE AMBIENTE (.env)

Você precisa criar um arquivo chamado .env na raiz da pasta backend. Copie e cole o conteúdo abaixo dentro dele:


        # Configurações de Segurança
    
        SECRET_KEY='uma-chave-super-secreta-e-aleatoria'
        SQLALCHEMY_DATABASE_URI='sqlite:///../instance/app.db'
        
        # Configurações de E-mail (Necessário para Reset de Senha)
        MAIL_SERVER='smtp.gmail.com'
        MAIL_PORT='587'
        MAIL_USE_TLS='True'
        MAIL_USERNAME='metalyser44@gmail.com'
        # (Se for testar o envio real, use uma Senha de App do Google aqui)
        MAIL_PASSWORD='tfdg vwwu dglm lkaa'

# --- 👑 CREDENCIAIS DO ADMINISTRADOR (SEED) ---
# Estas credenciais serão usadas para criar o Admin via comando
ADMIN_EMAIL='admin@metalyse.com'
ADMIN_PASSWORD='Admin123!@'

💾 Banco de Dados e Administrador

O sistema usa SQLite. Siga estes comandos para criar o banco e o usuário Mestre.

1. Inicializar o Banco

Se existir uma pasta instance, você pode deletar o arquivo app.db dentro dela para começar limpo. O sistema criará um novo automaticamente ao iniciar.

2. Criar o Usuário Administrador (Seed)

Nós criamos um comando personalizado para "plantar" o admin configurado no .env acima.

No terminal (com o venv ativo), execute:
PowerShell

    # 1. Define o app (Apenas Windows PowerShell)
    $env:FLASK_APP = "run.py"
    
    # 2. Roda o comando de criação
    flask seed-admin

✅ Resultado Esperado: Administrador 'admin@metalyse.com' criado com sucesso.

▶️ Executando o Servidor

Agora que tudo está configurado:
PowerShell

    python run.py

O servidor iniciará em: http://127.0.0.1:5000/

🧪 Guia de Testes (Endpoints)

Você pode testar usando o Postman ou Insomnia.

1. 🔐 Autenticação
    
        Ação	                   Método	           URL	                                    Body (JSON)
        Login (Admin)	            POST	     /api/auth/login	      { "email": "admin@metalyse.com", "password": "Admin123!@" }
        Registro (Comum)	        POST	     /api/auth/register	      { "username": "teste", "email": "teste@email.com", "password": "Senha123!" }
        Logout	                    POST	     /api/auth/logout	      Authorization: Bearer <TOKEN>

    NOTA: Ao fazer Login, copie o access_token retornado. Você precisará dele para as rotas abaixo.

2. 📂 Upload e Análise (Requer Token)

Para testar a extração de metadados.

    Método: POST

    URL: /api/metadata/upload

    Header: Authorization: Bearer <SEU_TOKEN_AQUI>

    Body: Selecione form-data:

        Key: file (Tipo: File) -> Anexe um PDF ou JPG.

✅ Retorno: Um JSON contendo os metadados técnicos extraídos (GPS, Câmera, Autor, etc.).

3. 📜 Histórico (Requer Token)

    Ver Meu Histórico:

        GET /api/history/me

        Retorna apenas os arquivos que você enviou.

    Ver TODO Histórico (Só Admin):

        GET /api/history/all

        Retorna os arquivos de todos os usuários do sistema.

🛠️ Solução de Problemas Comuns

    Erro 422 Unprocessable Entity:

        Provavelmente seu Token expirou ou você esqueceu de enviar o Header Authorization. Faça login novamente.

    Erro FileNotFoundError: exiftool.exe:

        Verifique se o arquivo exiftool.exe está solto dentro da pasta backend/.

    Erro 401 Unauthorized no Login:

        Você rodou o comando flask seed-admin? Verifique se o e-mail e senha no .env batem com o que você está digitando.
