<?php
$config = require __DIR__ . '/config.php';

try {
  $conn = new PDO(
    "mysql:host={$config['host']};dbname={$config['name']};charset=utf8mb4",
    $config['user'],
    $config['pass']
  );
  $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
  error_log("DB connection failed: " . $e->getMessage());
  http_response_code(500);
  exit("Database connection failed");
}

function db(): PDO {
  global $conn;
  return $conn;
}


function load_tasks() {
  $conn = db();
  if (!$conn->query("SELECT 1 FROM meta WHERE k='initialized'")->fetchColumn()) {
    return null;
  }
  $rows = $conn->query("SELECT * FROM tasks ORDER BY position")->fetchAll();
  return array_map(fn($r) => [
    'id'        => $r['id'],
    'title'     => $r['title'],
    'completed' => (bool)$r['completed'],
    'dueDate'   => $r['due_date'],
    'priority'  => $r['priority'],
    'tags'      => json_decode($r['tags'] ?? '[]', true) ?: [],
    'createdAt' => $r['created_at'],
  ], $rows);
}