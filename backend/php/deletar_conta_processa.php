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
    $user_id = $_SESSION['user_id'];

    // Detectar se a requisição é AJAX/Fetch (aceita JSON)
    $isAjax = false;
    if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
        $isAjax = true;
    } elseif (!empty($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) {
        $isAjax = true;
    }

    // Helper para responder em JSON ou com script (compatibilidade)
    function respond($success, $message, $redirect = null, $isAjax = false)
    {
        if ($isAjax) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['success' => (bool)$success, 'message' => $message, 'redirect' => $redirect]);
            exit();
        } else {
            if ($success) {
                echo "<script>
                    alert('" . addslashes($message) . "');
                    // Limpar localStorage e redirecionar
                    if (typeof(Storage) !== 'undefined') {
                        localStorage.removeItem('isLoggedIn');
                        localStorage.removeItem('userEmail');
                        localStorage.removeItem('userName');
                    }
                    window.location.href = '" . addslashes($redirect ?? '../../public/index.html') . "';
                </script>";
            } else {
                echo "<script>
                    alert('" . addslashes($message) . "');
                    window.history.back();
                </script>";
            }
            exit();
        }
    }

    try {
        // Deletar usuário
        $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id = ?");

        $stmt->execute([$user_id]);
        $deletedRows = $stmt->rowCount();

        if ($deletedRows > 0) {
            // Deslogar usuário
            session_unset();
            session_destroy();

            if (ini_get("session.use_cookies")) {
                $params = session_get_cookie_params();
                setcookie(
                    session_name(),
                    '',
                    time() - 42000,
                    $params["path"],
                    $params["domain"],
                    $params["secure"],
                    $params["httponly"]
                );
            }

            // Responder baseado no tipo de requisição
            respond(true, 'Conta deletada com sucesso! Você foi deslogado.', '../../public/index.html', $isAjax);
        } else {
            respond(false, 'Erro ao deletar conta. Tente novamente.', null, $isAjax);
        }
    } catch (PDOException $e) {
        // Log de erro pode ser adicionado aqui para debug (não expor detalhes ao usuário)
        respond(false, 'Erro ao deletar conta. Tente novamente.', null, $isAjax);
    }
}
