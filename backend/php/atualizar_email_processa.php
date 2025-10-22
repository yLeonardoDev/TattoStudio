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
    $novo_email = $_POST['novo_email'] ?? '';
    $confirmar_email = $_POST['confirmar_email'] ?? '';
    $senha_atual = $_POST['senha_atual'] ?? '';
    $user_id = $_SESSION['user_id'];

    if (empty($novo_email) || empty($confirmar_email) || empty($senha_atual)) {
        echo "<script>
            alert('Preencha todos os campos.');
            window.history.back();
        </script>";
        exit();
    }

    if ($novo_email !== $confirmar_email) {
        echo "<script>
            alert('Os e-mails não coincidem.');
            window.history.back();
        </script>";
        exit();
    }

    if (!filter_var($novo_email, FILTER_VALIDATE_EMAIL)) {
        echo "<script>
            alert('E-mail inválido.');
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
         * Verificar se email já existe
         */
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ? AND id != ?");
        $stmt->execute([$novo_email, $user_id]);

        if ($stmt->rowCount() > 0) {
            echo "<script>
                alert('Este e-mail já está em uso.');
                window.history.back();
            </script>";
            exit();
        }

        /**
         * Atualizar email
         */
        $stmt = $pdo->prepare("UPDATE usuarios SET email = ? WHERE id = ?");

        if ($stmt->execute([$novo_email, $user_id])) {
            $_SESSION['usuario'] = $novo_email;
            echo "<script>
                alert('E-mail atualizado com sucesso!');
                window.location.href = '../../public/index.html';
            </script>";
        } else {
            echo "<script>
                alert('Erro ao atualizar e-mail.');
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
