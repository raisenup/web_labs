<?php
header('Content-Type: application/json');
$files = glob(__DIR__ . '/data/collapse_*.json');
sort($files);
$data = [];
foreach ($files as $file) {
    $data[] = json_decode(file_get_contents($file), true);
}
echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>
