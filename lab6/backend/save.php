<?php
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!is_dir(__DIR__ . '/data')) mkdir(__DIR__ . '/data');
    $filename = __DIR__ . '/data/collapse_' . time() . '.json';
    file_put_contents($filename, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    echo json_encode(['status' => 'success', 'file' => basename($filename)]);
} else {
    echo json_encode(['status' => 'error']);
}
?>
