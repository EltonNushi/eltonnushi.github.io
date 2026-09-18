<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

// =========================================================================
// 🔒 CRITICAL SECURITY CONFIGURATIONS
// =========================================================================
$container_id = "iCloud.com.tablemanagement.com.TableMaster2026";
$key_id       = "e06db9ceffd92a09c8f4ad05a805b15b6a20735449ee2a18e8ecb47721f40080"; // 👈 Paste your alphanumeric Key ID here
$private_key_path = __DIR__ . "/eckey.pem"; // 👈 Ensure your downloaded eckey.pem is in this exact folder

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit;
}

// Extract the incoming booking data from the form browser window
$input = json_decode(file_get_contents("php://input"), true);
if (!$input) {
    echo json_encode(["success" => false, "message" => "Empty booking payload data."]);
    exit;
}

$now_ms = round(microtime(true) * 1000);
$res_date_ms = $input['resDate'];

// 🏗️ Structure the strict JSON payload layout targeting the private SwiftData zone partition
$payload = [
    "operations" => [[
        "operationType" => "create",
        "record" => [
            "recordType" => "CD_Booking",
            "recordID" => [
                "recordName" => "WEB_BOOKING_" . $now_ms,
                "zoneID" => ["zoneName" => "com.apple.coredata.cloudkit.zone"]
            ],
            "fields" => [
                "CD_id"                   => ["value" => "WEB_" . $now_ms, "type" => "STRING"],
                "CD_restaurantID"         => ["value" => $input['restaurantID'], "type" => "STRING"],
                "CD_guestName"            => ["value" => $input['firstName'], "type" => "STRING"],
                "CD_surname"              => ["value" => $input['surname'], "type" => "STRING"],
                "CD_email"                => ["value" => $input['email'], "type" => "STRING"],
                "CD_phoneNumber"          => ["value" => $input['phone'], "type" => "STRING"],
                "CD_partySize"            => ["value" => (int)$input['partySize'], "type" => "INT64"],
                "CD_date"                 => ["value" => (float)$res_date_ms, "type" => "TIMESTAMP"],
                "CD_occasion"             => ["value" => $input['occasion'], "type" => "STRING"],
                "CD_occasionOtherDetails" => ["value" => $input['occasionDetails'], "type" => "STRING"],
                "CD_hasAllergy"           => ["value" => (int)$input['hasAllergy'], "type" => "INT64"],
                "CD_allergenNotes"        => ["value" => $input['allergenNotes'], "type" => "STRING"],
                "CD_notes"                => ["value" => $input['notes'], "type" => "STRING"],
                "CD_status"               => ["value" => "Unconfirmed", "type" => "STRING"],
                "CD_isVIP"                => ["value" => 0, "type" => "INT64"]
            ]
        ]
    ]]
];

$json_payload = json_encode($payload);

// 🖋️ COMPUTE THE CRYPTOGRAPHIC REQUEST SIGNATURE
$date_iso = gmdate('Y-m-d\TH:i:s\Z');
$payload_hash = base64_encode(hash('sha256', $json_payload, true));
$url_path = "/database/1/{$container_id}/production/private/records/modify";
$signing_string = $date_iso . ":" . $payload_hash . ":" . $url_path;

if (!file_exists($private_key_path)) {
    echo json_encode(["success" => false, "message" => "Security error: eckey.pem missing on server."]);
    exit;
}

$private_key_content = file_get_contents($private_key_path);
$pkey = openssl_pkey_get_private($private_key_content);

openssl_sign($signing_string, $signature, $pkey, OPENSSL_ALGO_SHA256);
$signature_b64 = base64_encode($signature);

// 📡 Execute the signed cURL HTTP POST payload straight to Apple's production private zone
$ch = curl_init("https://apple-cloudkit.com" . $url_path);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $json_payload);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "X-Apple-CloudKit-Request-KeyID: " . $key_id,
    "X-Apple-CloudKit-Request-ISO8601Date: " . $date_iso,
    "X-Apple-CloudKit-Request-Signature: " . $signature_b64
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code === 200) {
    echo json_encode(["success" => true, "message" => "Reservation logged successfully."]);
} else {
    echo json_encode(["success" => false, "error" => json_decode($response, true)]);
}
?>
