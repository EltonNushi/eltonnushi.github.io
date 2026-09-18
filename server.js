const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

// =========================================================================
// 🔒 CRITICAL SECURITY CONFIGURATIONS
// =========================================================================
const CONTAINER_ID     = "://tablemanagement.com.TableMaster2026";
const KEY_ID           = "YOUR_CLOUDKIT_SERVER_TO_SERVER_KEY_ID_HERE"; // 👈 Paste your alphanumeric Key ID here
const PRIVATE_KEY_PATH = path.join(__dirname, 'eckey.pem');            // 👈 Your eckey.pem is already in this repo

// ✅ TO THIS (Accepts both /submit and /submit/ to stop the 307 redirect dead!):
app.post(['/submit', '/submit/'], async (req, res) => {
    try {
        const input = req.body;
        const now_ms = Date.now();
        const res_date_ms = input.resDate;

        // 🏗️ Structure the strict JSON payload layout targeting the private SwiftData zone partition
        const payload = {
            operations: [{
                operationType: "create",
                record: {
                    recordType: "CD_Booking",
                    recordID: {
                        recordName: "WEB_BOOKING_" + now_ms,
                        zoneID: { zoneName: "com.apple.coredata.cloudkit.zone" }
                    },
                    fields: {
                        CD_id: { value: "WEB_" + now_ms, type: "STRING" },
                        CD_restaurantID: { value: input.restaurantID.trim(), type: "STRING" },
                        CD_guestName: { value: input.firstName.trim(), type: "STRING" },
                        CD_surname: { value: input.surname.trim(), type: "STRING" },
                        CD_email: { value: input.email.trim(), type: "STRING" },
                        CD_phoneNumber: { value: input.phone.trim(), type: "STRING" },
                        CD_partySize: { value: parseInt(input.partySize), type: "INT64" },
                        CD_date: { value: parseFloat(res_date_ms), type: "TIMESTAMP" },
                        CD_occasion: { value: input.occasion.trim(), type: "STRING" },
                        CD_occasionOtherDetails: { value: input.occasionDetails.trim(), type: "STRING" },
                        CD_hasAllergy: { value: parseInt(input.hasAllergy), type: "INT64" },
                        CD_allergenNotes: { value: input.allergenNotes.trim(), type: "STRING" },
                        CD_notes: { value: input.notes.trim(), type: "STRING" },
                        CD_status: { value: "Unconfirmed", type: "STRING" },
                        CD_isVIP: { value: 0, type: "INT64" }
                    }
                }
            }]
        };

        const json_payload = JSON.stringify(payload);
        const date_iso = new Date().toISOString().replace(/\.\d{3}/, ''); // Formats precisely to Y-m-dTH:i:sZ

        const hash = crypto.createHash('sha256').update(json_payload).digest();
        const payload_hash = hash.toString('base64');

        const url_path = `/database/1/${CONTAINER_ID}/production/private/records/modify`;
        const signing_string = `${date_iso}:${payload_hash}:${url_path}`;

        if (!fs.existsSync(PRIVATE_KEY_PATH)) {
            return res.status(500).json({ success: false, message: "Security error: eckey.pem missing on server." });
        }

        const private_key = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');

        // 🖋️ COMPUTE CRYPTOGRAPHIC SIGNATURE (IEEE P1363 raw format required natively by Apple CloudKit)
        const sign = crypto.createSign('SHA256');
        sign.update(signing_string);
        const raw_signature = sign.sign({
            key: private_key,
            dsaEncoding: 'compact' // 🧠 Forces raw R+S packing to eliminate pattern mismatch errors entirely!
        });
        const signature_b64 = raw_signature.toString('base64');

        // 📡 Forward the signed transaction straight through to Apple's API production private zone
        const response = await fetch("https://apple-cloudkit.com" + url_path, {
            method: 'POST',
            body: json_payload,
            headers: {
                "Content-Type": "application/json",
                "X-Apple-CloudKit-Request-KeyID": KEY_ID.trim(),
                "X-Apple-CloudKit-Request-ISO8601Date": date_iso,
                "X-Apple-CloudKit-Request-Signature": signature_b64
            }
        });

        const http_code = response.status;
        const res_data = await response.json();

        if (http_code === 200) {
            res.json({ success: true, message: "Reservation logged successfully." });
        } else {
            res.json({
                success: false,
                message: "Apple Server Firewall Rejected Transmittal Entry.",
                error: res_data,
                http_status_code: http_code
            });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
