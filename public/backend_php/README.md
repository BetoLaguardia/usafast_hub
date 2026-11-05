# Backend PHP para Sistema de Leilões Americanos (VERIZON & iPhones)

Este pacote contém todos os scripts PHP prontos para você hospedar no seu servidor (cPanel, Apache, Nginx, XAMPP ou VPS) e conectar com o frontend da aplicação.

## Arquivos inclusos:
- `db.php`: Gerenciador de conexão MySQL (PDO) com fallback automático em JSON se o MySQL não estiver configurado.
- `health.php`: Endpoint de teste e ping de latência do servidor.
- `auctions.php`: CRUD completo de leilões (GET lista, POST salva/cria, DELETE remove).
- `bids.php`: Envio de lances em tempo real e endpoint de polling (`?poll=1`).
- `import.php`: Recebe a importação em lote de planilhas (XLSX, CSV ou JSON no padrão VERIZON) e grava no banco.
- `schema.sql`: Script SQL completo para criar as tabelas no MySQL.

---

## Como instalar no seu servidor:

1. **Criar o Banco no MySQL**:
   - Abra o phpMyAdmin ou terminal MySQL.
   - Importe o arquivo `schema.sql`.

2. **Configurar as credenciais em `db.php`**:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'leiloes_iphones');
   define('DB_USER', 'seu_usuario');
   define('DB_PASS', 'sua_senha');
   ```

3. **Subir os arquivos na sua hospedagem**:
   - Envie a pasta `backend_php` para `public_html/api/` (ou onde preferir).

4. **Conectar o Frontend**:
   - No **Painel Admin** do sistema de leilões, vá em **Conexão API PHP**.
   - Coloque a URL da sua API, por exemplo:
     `https://seusite.com.br/api`
   - Clique em **Salvar & Testar Conexão**. O sistema fará um ping em `health.php` e ativará as chamadas em tempo real!
