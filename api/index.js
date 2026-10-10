// const CONTAINER_ID     = "iCloud.com.tablemanagement.com.TableMaster2026"; // ✅ FIXED: Restored complete Apple ID prefix!
// const KEY_ID           = "e06db9ceffd92a09c8f4ad05a805b15b6a20735449ee2a18e8ecb47721f40080";       // 👈 Paste your exact

const Pusher = require('pusher');

// =========================================================================
// 🔒 INITIALIZE REAL-TIME BROKER CONDUIT (ZERO CLOUDKIT CLOUD KEY DEPENDENCY)
// Paste your exact unique text credentials from your Pusher App Keys tab!
// =========================================================================
const pusher = new Pusher({
  appId: "2201499",
  key: "56736f02064b5a079245",
  secret: "1a7a47e3e7021837fe99",
  cluster: "eu",
  useTLS: true
});

module.exports = async (req, res) => {
    // Enable Global CORS clearance natively
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        try {
            // Read incoming parameters from your website widget
            const payloadData = req.body;
            console.log("📥 Inbound reservation parameters received:", payloadData);

            const activeVenue = (payloadData.restaurantID || "loro_di_elton").trim().toLowerCase();

            // Construct standardized unified JSON data package matching your iPad parameters
            const broadcastPayload = {
                restaurantID: activeVenue,
                firstName: payloadData.firstName || "",
                surname: payloadData.surname || "",
                email: payloadData.email || "",
                phone: payloadData.phone || "",
                partySize: parseInt(payloadData.partySize) || 2,
                resDate: parseFloat(payloadData.resDate) || Date.now(),
                occasion: payloadData.occasion || "Standard Dining",
                allergenNotes: payloadData.allergenNotes || ""
            };

            // =========================================================================
            // 🚀 FIRE HIGH-SPEED REAL-TIME BROADCAST PAYLOAD
            // Triggers an instant websocket push isolated down to the venue's custom channel!
            // =========================================================================
            await pusher.trigger(`channel-${activeVenue}`, "new-booking", broadcastPayload);

            return res.status(200).json({ success: true, logged: "Real-time stream pushed successfully via Pusher." });

        } catch (error) {
            console.error("❌ Backend Error:", error.message);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
};
