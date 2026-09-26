// const CONTAINER_ID     = "iCloud.com.tablemanagement.com.TableMaster2026"; // ✅ FIXED: Restored complete Apple ID prefix!
// const KEY_ID           = "e06db9ceffd92a09c8f4ad05a805b15b6a20735449ee2a18e8ecb47721f40080";       // 👈 Paste your exact

const path = require('path');
const fs = require('fs');

// =========================================================================
// 🔒 CRITICAL SYSTEM ENVIRONMENT KEYS (PRODUCTION HARDENED OVERRIDES)
// =========================================================================
const CONTAINER_ID     = "iCloud.com.tablemanagement.com.TableMaster2026";
const KEY_ID           = "e06db9ceffd92a09c8f4ad05a805b15b6a20735449ee2a18e8ecb47721f40080";
const PRIVATE_KEY_PATH = path.join(__dirname, 'eckey.pem'); // 👈 References your exact eckey.pem file natively!

// Global connections pool to track active iPad socket hooks
let activeAppListeners = [];

module.exports = async (req, res) => {
    // Enable Global CORS clearance natively
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // =========================================================================
    // ⚡ 1. GET HANDSHAKE PROTOCOL: Connects the iPad App background listener task
    // =========================================================================
    if (req.method === 'GET') {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Add this specific hardware device channel connection to the listener pool
        activeAppListeners.push(res);
        console.log(`📡 New iPad connection established. Active app listeners pool count: ${activeAppListeners.length}`);

        req.on('close', () => {
            activeAppListeners = activeAppListeners.filter(connection => connection !== res);
            console.log(`🔕 iPad disconnected. Active app listeners pool count: ${activeAppListeners.length}`);
        });
        return;
    }

    // =========================================================================
    // 📡 2. POST HANDSHAKE PROTOCOL: Ingests reservations sent from your website widget
    // =========================================================================
    if (req.method === 'POST') {
        try {
            // Read incoming parameters from request stream body frames
            const payloadData = req.body;

            console.log("📥 Inbound reservation parameters received from web widget:", payloadData);

            // Construct standard unified JSON data string parameters layout package
            const broadcastPayloadString = JSON.stringify({
                restaurantID: payloadData.restaurantID || "loro_di_elton",
                firstName: payloadData.firstName || "",
                surname: payloadData.surname || "",
                email: payloadData.email || "",
                phone: payloadData.phone || "",
                partySize: parseInt(payloadData.partySize) || 2,
                resDate: parseFloat(payloadData.resDate) || Date.now(),
                occasion: payloadData.occasion || "Standard Dining",
                allergenNotes: payloadData.allergenNotes || ""
            });

            // Dispatch message down into all active iPad connection socket nodes simultaneously
            if (activeAppListeners.length > 0) {
                activeAppListeners.forEach(clientChannel => {
                    clientChannel.write(`data: ${broadcastPayloadString}\n\n`);
                });
                console.log(`⚡ Real-time packet successfully broadcast to ${activeAppListeners.length} active apps.`);
            } else {
                console.log("⚠️ Broadcast Warning: No active iPad listeners are currently logged online.");
            }

            // Return pristine structural success validation confirmation back to browser widget
            return res.status(200).json({ success: true, logged: "WebSocket Broadcast Dispatched via index.js." });

        } catch (error) {
            console.error("❌ Backend Script Error:", error.message);
            return res.status(500).json({ success: false, error: error.message });
        }
    }
};
