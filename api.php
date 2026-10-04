<?php
require __DIR__ . '/database.php';
header('Content-Type: application/json');

$tasks = json_decode(file_get_contents('php://input'), true);
if (!is_array($tasks)) {
    http_response_code(400);
    exit('{"error":"Bad request"}');
}

$pdo = db();
try {
    $pdo->beginTransaction();
    $pdo->exec("DELETE FROM tasks");
    $st = $pdo->prepare(
        "INSERT INTO tasks (id, position, title, completed, due_date, priority, tags, created_at)
         VALUES (?,?,?,?,?,?,?,?)"
    );
    foreach (array_values($tasks) as $i => $t) {
        $priority = in_array($t['priority'] ?? '', ['low','medium','high']) ? $t['priority'] : 'medium';
        $st->execute([
            substr((string)($t['id'] ?? uniqid()), 0, 40),
            $i,
            (string)($t['title'] ?? ''),
            !empty($t['completed']) ? 1 : 0,
            $t['dueDate'] ?? null,
            $priority,
            json_encode($t['tags'] ?? []),
            $t['createdAt'] ?? null,
        ]);
    }
    $pdo->exec("INSERT IGNORE INTO meta (k) VALUES ('initialized')");
    $pdo->commit();
    echo '{"ok":true}';
} catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo '{"error":"Server error"}';
}