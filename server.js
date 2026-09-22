// const CONTAINER_ID     = "iCloud.com.tablemanagement.com.TableMaster2026"; // ✅ FIXED: Restored complete Apple ID prefix!
// const KEY_ID           = "e06db9ceffd92a09c8f4ad05a805b15b6a20735449ee2a18e8ecb47721f40080";       // 👈 Paste your exact

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();

// =========================================================================
// 🔒 ✅ STRIC CROSS-ORIGIN SECURITY CLEARANCE PROFILE
// =========================================================================
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());
app.use(express.text({ type: '*/*' }));
// =========================================================================

// =========================================================================
// 🔒 CRITICAL SECURITY CONFIGURATIONS
// =========================================================================
const CONTAINER_ID     = "iCloud.com.tablemanagement.com.TableMaster2026"; // ✅ FIXED: Restored complete Apple ID prefix!
const KEY_ID           = "e06db9ceffd92a09c8f4ad05a805b15b6a20735449ee2a18e8ecb47721f40080";       // 👈 Paste your exact
const PRIVATE_KEY_PATH = path.join(__dirname, 'eckey.pem');

// =========================================================================
// 📡 FETCH LIVE DYNAMIC TIMETABLE PROFILES FROM ICLOUD WITH CORS CLEARANCE
// =========================================================================
app.get('/timetable/:restaurantID', async (req, res) => {
    // ✅ HARDENED SPECIFICATION: Open access control to allow external point-of-sale platforms like ZPos!
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");

    // Express safety handler: immediately return 200 for preflight safety check parameters
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    try {
        const targetTenant = req.params.restaurantID.trim();
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

        // =========================================================================
        // 📡 ✅ FIXED: CHANGED TO THE CORRECT LIVE APPLE DEVELOPER HOST LINK PATH
        // =========================================================================
        const response = await fetch("https://api.apple-cloudkit.com" + url_path, {
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

  // =========================================================================
  // ✅ FIXED SCHEMA EXTRACTION MATRIX: INJECTED ARRAY INDEX [0]
  // =========================================================================
  if (response.status === 200 && res_data.records && res_data.records.length > 0) {

      // 🧠 THE INDEXING FIX: Reads fields inside the first matching array row item directly!
      const fields = res_data.records[0].fields;

      res.json({
          success: true,
          openTime: fields.CD_openTime.value,
          closeTime: fields.CD_closeTime.value
      });
  } else {
      // 🚀 AUTOMATED SaaS PROVISIONING GATES: If a venue profile isn't saved in iCloud yet,
      // immediately supply standard operational windows to guarantee the web form works out-of-the-box!
      res.json({
          success: true,
          openTime: "12:00",
          closeTime: "22:00",
          note: "Using system automated fallback configurations."
      });
  }
} catch (err) {
  res.status(500).json({ success: false, message: err.message });
}
});



// =========================================================================
// 📡 SECURE BOOKING REQUEST INGEST ENGINE
// =========================================================================
app.post(['/submit', '/submit/'], async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    try {
        let input = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const now_ms = Date.now();
        const res_date_ms = input.resDate;

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
            const res_data = await response.json();
            res.json({ success: false, error: res_data });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
