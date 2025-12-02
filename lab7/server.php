<?php
// server.php
header('Content-Type: application/json');

// Вимикаємо кешування
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

$logFile = 'data/logs.json';
$method = $_SERVER['REQUEST_METHOD'];

// === 1. ОЧИСТКА (DELETE) ===
if ($method === 'DELETE') {
    file_put_contents($logFile, json_encode([]));
    echo json_encode(['status' => 'cleared']);
    exit;
}

// === 2. ОТРИМАННЯ ДАНИХ (GET) ===
if ($method === 'GET') {
    if (file_exists($logFile)) {
        echo file_get_contents($logFile);
    } else {
        echo json_encode([]);
    }
    exit;
}

// === 3. ЗБЕРЕЖЕННЯ (POST) ===
if ($method === 'POST') {
    $inputRaw = file_get_contents('php://input');
    $input = json_decode($inputRaw, true);

    if (!$input) {
        echo json_encode(['status' => 'error', 'msg' => 'No JSON received']);
        exit;
    }

    // Підготовка часу сервера
    $microtime = microtime(true);
    // +2 години (7200 сек) до timestamp
    $serverTimestamp = round(($microtime + 7200) * 1000); 
    
    // Красивий час (+2 години)
    $t = DateTime::createFromFormat('U.u', sprintf('%.6F', $microtime));
    if ($t) {
        $t->modify('+2 hours');
        $serverTimeFormatted = $t->format("H:i:s.v");
    } else {
        $serverTimeFormatted = date("H:i:s") . ".000";
    }

    // Нормалізація вхідних даних (завжди масив)
    $incomingEvents = isset($input[0]) ? $input : [$input];

    // Завантажуємо старі дані
    $currentData = [];
    if (file_exists($logFile)) {
        $content = file_get_contents($logFile);
        if (!empty($content)) {
            $currentData = json_decode($content, true) ?? [];
        }
    }

    // Обробка нових подій (БЕЗ АМПЕРСАНДІВ)
    foreach ($incomingEvents as $event) {
        // Додаємо поля часу
        $event['server_saved_at'] = $serverTimeFormatted;
        $event['server_timestamp'] = $serverTimestamp; // Число для JS
        
        // Додаємо в загальний масив
        $currentData[] = $event;
    }

    // Зберігаємо у файл
    file_put_contents($logFile, json_encode($currentData, JSON_PRETTY_PRINT));

    echo json_encode([
        'status' => 'success', 
        'added' => count($incomingEvents),
        'debug_time' => $serverTimestamp
    ]);
    exit;
}
?>