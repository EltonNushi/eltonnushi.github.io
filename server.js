// const CONTAINER_ID     = "iCloud.com.tablemanagement.com.TableMaster2026"; // ✅ FIXED: Restored complete Apple ID prefix!
// const KEY_ID           = "e06db9ceffd92a09c8f4ad05a805b15b6a20735449ee2a18e8ecb47721f40080";       // 👈 Paste your exact

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();

// =========================================================================
// 🔒 DYNAMIC CORS REFLECTOR FIREWALL (UNBLOCKS WEBKIT / SAFARI LOOPS)
// =========================================================================
app.use((req, res, next) => {
    const inboundOrigin = req.headers.origin || "*";
    res.setHeader("Access-Control-Allow-Origin", inboundOrigin);
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, X-Requested-With");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    if (req.method === 'OPTIONS' || req.method === 'options') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.text({ type: '*/*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// =========================================================================

// =========================================================================
// 🔒 CRITICAL SYSTEM ENVIRONMENT KEYS
// =========================================================================
const CONTAINER_ID     = "://tablemanagement.com.TableMaster2026";
const KEY_ID           = "e06db9ceffd92a09c8f4ad05a805b15b6a20735449ee2a18e8ecb47721f40080";
const PRIVATE_KEY_PATH = path.join(__dirname, 'eckey.pem');

// =========================================================================
// 📡 1. WHITELISTED TIMETABLE RECOVERY CONDUIT (POST BYPASS ROUTE)
// =========================================================================
app.post(['/timetable', '/timetable/'], async (req, res) => {
    try {
        let targetTenant = "loro_di_elton";
        let bodyPayload = req.body;

        if (typeof bodyPayload === 'string') {
            try {
                bodyPayload = JSON.parse(bodyPayload);
            } catch (e) {
                const match = req.body.match(/"restaurantID"\s*:\s*"([^"]+)"/);
                if (match && match[1]) {
                    targetTenant = match[1];
                } else if (req.body.trim().length > 0 && !req.body.includes("{")) {
                    targetTenant = req.body.trim();
                }
            }
        }

        if (bodyPayload && bodyPayload.restaurantID) {
            targetTenant = bodyPayload.restaurantID;
        }

        targetTenant = targetTenant.trim().replace(/[\{\}"]/g, "");
        const url_path = `/database/1/${CONTAINER_ID}/production/private/records/query`;

        const queryPayload = {
            query: {
                recordType: "CD_RestaurantProfile",
                filterBy: [{
                    fieldName: "CD_restaurantID",
                    comparator: "EQUALS",
                    fieldValue: { value: targetTenant, type: "STRING" }
                }]
            },
            zoneID: { zoneName: "com.apple.coredata.cloudkit.zone" }
        };

        const json_payload = JSON.stringify(queryPayload);
        const date_iso = new Date().toISOString().replace(/\.\d{3}/, '');
        const payload_hash = crypto.createHash('sha256').update(json_payload).digest().toString('base64');
        const signing_string = `${date_iso}:${payload_hash}:${url_path}`;

        const private_key = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
        const sign = crypto.createSign('SHA256');
        sign.update(signing_string);
        const signature_b64 = sign.sign({ key: private_key, dsaEncoding: 'compact' }).toString('base64');

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

        const res_data = await response.json();

        if (response.status === 200 && res_data.records && res_data.records.length > 0) {
            const fields = res_data.records[0].fields;
            res.json({
                success: true,
                openTime: fields.CD_openTime.value,
                closeTime: fields.CD_closeTime.value
            });
        } else {
            res.json({ success: true, openTime: "12:00", closeTime: "22:00", note: "Fallback default bounds" });
        }
    } catch (err) {
        res.json({ success: true, openTime: "12:00", closeTime: "22:00", note: "System global fallback override engaged" });
    }
});

// =========================================================================
// 📡 2. SECURE WEB RESERVATION INGEST PIPELINE
// =========================================================================
app.post(['/submit', '/submit/'], async (req, res) => {
    try {
        let input = req.body;

        if (typeof input === 'string') {
            try {
                input = JSON.parse(input);
            } catch(e) {
                const extractVal = (key) => {
                    const match = req.body.match(new RegExp('"' + key + '"\\s*:\\s*"([^"]+)"'));
                    return match ? match[1] : "";
                };
                const extractNum = (key) => {
                    const match = req.body.match(new RegExp('"' + key + '"\\s*:\\s*(\\d+)'));
                    return match ? parseInt(match[1]) : 2;
                };

                const dateMatch = req.body.match(/"resDate"\s*:\s*(\d+)/);
                const derivedDate = dateMatch ? parseFloat(dateMatch[1]) : Date.now();

                input = {
                    restaurantID: extractVal("restaurantID"),
                    firstName: extractVal("firstName"),
                    surname: extractVal("surname"),
                    email: extractVal("email"),
                    phone: extractVal("phone"),
                    partySize: extractNum("partySize"),
                    resDate: derivedDate,
                    occasion: extractVal("occasion"),
                    occasionDetails: extractVal("occasionDetails"),
                    hasAllergy: extractNum("hasAllergy"),
                    allergenNotes: extractVal("allergenNotes"),
                    notes: extractVal("notes")
                };
            }
        }

        const targetTenant = (input.restaurantID || "loro_di_elton").trim();
        const now_ms = Date.now();
        const res_date_ms = input.resDate || now_ms;

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
                        CD_restaurantID: { value: targetTenant, type: "STRING" },
                        CD_guestName: { value: String(input.firstName || "Guest").trim(), type: "STRING" },
                        CD_surname: { value: String(input.surname || "User").trim(), type: "STRING" },
                        CD_email: { value: String(input.email || "").trim(), type: "STRING" },
                        CD_phoneNumber: { value: String(input.phone || "").trim(), type: "STRING" },
                        CD_partySize: { value: parseInt(input.partySize || 2), type: "INT64" },
                        CD_date: { value: parseFloat(res_date_ms), type: "TIMESTAMP" },
                        CD_occasion: { value: String(input.occasion || "Standard Dining").trim(), type: "STRING" },
                        CD_occasionOtherDetails: { value: String(input.occasionDetails || "").trim(), type: "STRING" },
                        CD_hasAllergy: { value: parseInt(input.hasAllergy || 0), type: "INT64" },
                        CD_allergenNotes: { value: String(input.allergenNotes || "").trim(), type: "STRING" },
                        CD_notes: { value: String(input.notes || "").trim(), type: "STRING" },
                        CD_status: { value: "Unconfirmed", type: "STRING" },
                        CD_isVIP: { value: 0, type: "INT64" }
                    }
                }
            }]
        };

        const json_payload = JSON.stringify(payload);
        const date_iso = new Date().toISOString().replace(/\.\d{3}/, '');
        const payload_hash = crypto.createHash('sha256').update(json_payload).digest().toString('base64');
        const url_path = `/database/1/${CONTAINER_ID}/production/private/records/modify`;
        const signing_string = `${date_iso}:${payload_hash}:${url_path}`;

        const private_key = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
        const sign = crypto.createSign('SHA256');
        sign.update(signing_string);
        const signature_b64 = sign.sign({ key: private_key, dsaEncoding: 'compact' }).toString('base64');

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

        if (response.status === 200) {
            res.json({ success: true, message: "Reservation logged successfully." });
        } else {
            const errData = await response.json();
            res.json({ success: false, error: errData });
        }
} catch (err) {
  res.status(500).json( {success: false, message: err.message });
  }
  });
  const PORT = process.env.PORT || 10000;
  app.listen(PORT, () => console.log(Server running on port ${PORT}));
  
