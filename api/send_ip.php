<?php
$botToken = getenv("TELEGRAM_TOKEN");
$chatId = getenv("TELEGRAM_CHAT_ID");
$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'];
$ua = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
$message = "🚨 IP Baru Icibos😹\nIP: $ip\nUA: $ua";
$url = "https://api.telegram.org/bot$botToken/sendMessage";
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    "chat_id" => $chatId,
    "text" => $message
]));
$response = curl_exec($ch);
curl_close($ch);
header("Content-Type: application/json");
echo json_encode([
    "status" => true,
    "ip" => $ip,
    "ua" => $ua,
    "telegram_response" => $response
]);
