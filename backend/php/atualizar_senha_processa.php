<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    echo "<script>
        alert('Usuário não logado.');
        window.location.href = '../../public/index.html';
    </script>";
    exit();
}

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'conexao');

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $pdo = new PDO($dsn, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "<script>
        alert('Erro de conexão com o banco.');
        window.history.back();
    </script>";
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $senha_atual = $_POST['senha_atual'] ?? '';
    $nova_senha = $_POST['nova_senha'] ?? '';
    $confirmar_senha = $_POST['confirmar_senha'] ?? '';
    $user_id = $_SESSION['user_id'];

    if (empty($senha_atual) || empty($nova_senha) || empty($confirmar_senha)) {
        echo "<script>
            alert('Preencha todos os campos.');
            window.history.back();
        </script>";
        exit();
    }

    if ($nova_senha !== $confirmar_senha) {
        echo "<script>
            alert('As senhas não coincidem.');
            window.history.back();
        </script>";
        exit();
    }

    if (strlen($nova_senha) < 6) {
        echo "<script>
            alert('A senha deve ter pelo menos 6 caracteres.');
            window.history.back();
        </script>";
        exit();
    }

    try {
        /**
         * Verificar senha atual
         */
        $stmt = $pdo->prepare("SELECT senha FROM usuarios WHERE id = ?");
        $stmt->execute([$user_id]);
        $usuario = $stmt->fetch();

        if (!$usuario) {
            echo "<script>
                alert('Usuário não encontrado.');
                window.history.back();
            </script>";
            exit();
        }

        if (!password_verify($senha_atual, $usuario['senha'])) {
            echo "<script>
                alert('Senha atual incorreta.');
                window.history.back();
            </script>";
            exit();
        }

        /**
         * Atualizar senha
         */
        $nova_senha_hash = password_hash($nova_senha, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE usuarios SET senha = ? WHERE id = ?");

        if ($stmt->execute([$nova_senha_hash, $user_id])) {
            echo "<script>
                alert('Senha atualizada com sucesso!');
                window.location.href = '../../public/index.html';
            </script>";
        } else {
            echo "<script>
                alert('Erro ao atualizar senha.');
                window.history.back();
            </script>";
        }
    } catch (PDOException $e) {
        echo "<script>
            alert('Erro ao processar solicitação.');
            window.history.back();
        </script>";
    }
}
