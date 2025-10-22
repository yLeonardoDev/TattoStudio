<?php
// BANCO DE DADOS
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'conexao');
define('DB_CHARSET', 'utf8');

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $pdo = new PDO($dsn, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
} catch (PDOException $e) {
    die("Erro de conexão: " . $e->getMessage());
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $nome = $_POST['nome'] ?? '';
    $email = $_POST['email'] ?? '';
    $cpf = $_POST['cpf'] ?? '';
    $senha = $_POST['senha'] ?? '';
    $confirmar_senha = $_POST['confirmar_senha'] ?? '';

    if (empty($nome) || empty($email) || empty($cpf) || empty($senha) || empty($confirmar_senha)) {
        echo "<script>
            alert('Preencha todos os campos.');
            window.history.back();
        </script>";
        exit();
    }

    if ($senha !== $confirmar_senha) {
        echo "<script>
            alert('As senhas não conferem.');
            window.history.back();
        </script>";
        exit();
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "<script>
            alert('E-mail inválido.');
            window.history.back();
        </script>";
        exit();
    }

    /**
     * Limpar e validar CPF
     */

    $cpf_limpo = preg_replace('/[^0-9]/', '', $cpf);

    if (strlen($cpf_limpo) != 11) {
        echo "<script>
            alert('CPF inválido.');
            window.history.back();
        </script>";
        exit();
    }

    $senha_hash = password_hash($senha, PASSWORD_DEFAULT);

    try {

        // Verificar se email já existe
        $verifica_email = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
        $verifica_email->execute([$email]);

        if ($verifica_email->rowCount() > 0) {
            echo "<script>
                alert('Este e-mail já está cadastrado.');
                window.history.back();
            </script>";
            exit();
        }

        // Verificar se CPF já existe - MOSTRAR ALERTA

        $verifica_cpf = $pdo->prepare("SELECT id FROM usuarios WHERE cpf = ?");
        $verifica_cpf->execute([$cpf_limpo]);

        if ($verifica_cpf->rowCount() > 0) {
            echo "<script>
                alert('CPF já cadastrado no sistema!');
                window.history.back();
            </script>";
            exit();
        }

        // Inserir novo usuário
        
        $stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, cpf, senha) VALUES (?, ?, ?, ?)");

        if ($stmt->execute([$nome, $email, $cpf_limpo, $senha_hash])) {
            echo "<script>
                alert('Cadastro realizado com sucesso!');
                window.location.href = '../../public/index.html';
            </script>";
            exit();
        } else {
            throw new Exception("Erro ao cadastrar usuário.");
        }
    } catch (PDOException $e) {
        error_log("Erro no cadastro: " . $e->getMessage());
        echo "<script>
            alert('Erro ao processar cadastro. Tente novamente.');
            window.history.back();
        </script>";
        exit();
    } catch (Exception $e) {
        error_log("Erro no cadastro: " . $e->getMessage());
        echo "<script>
            alert('Erro ao processar cadastro. Tente novamente.');
            window.history.back();
        </script>";
        exit();
    }
}

$pdo = null;
