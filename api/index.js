// const CONTAINER_ID     = "iCloud.com.tablemanagement.com.TableMaster2026"; // ✅ FIXED: Restored complete Apple ID prefix!
// const KEY_ID           = "e06db9ceffd92a09c8f4ad05a805b15b6a20735449ee2a18e8ecb47721f40080";       // 👈 Paste your exact

const Pusher = require('pusher');
const { Resend } = require('resend');

// =========================================================================
// 🔒 1. INITIALIZE REAL-TIME WEBSOCKET BROKER CONDUIT (100% EXPOSURE-PROOF)
// =========================================================================
const pusher = new Pusher({
  appId: "2201499",  // 👈 Paste your actual public App ID string here
  key: "1350da310ac3d13a9179",        // 👈 Paste your actual public Key string here
  secret: process.env.PUSHER_SECRET,   // 🛑 KEEP THIS EXACTLY AS IS (Pulls securely from Vercel)
  cluster: "eu",                       // 👈 Ensure this matches your dashboard cluster (e.g., 'eu' or 'us2')
  useTLS: true
});


// 🔒 2. Initialize Resend Email Delivery Engine
const resend = new Resend(process.env.RESEND_API_KEY);

// =========================================================================
// 📡 STATIC MULTI-TENANT EMAIL REGISTRY
// Placed globally so the handler function can access the map lookup natively!
// =========================================================================
const venueEmailRegistry = {
    "loro_di_elton": "elton_nushi@yahoo.co.uk",
    "roma_pasta_bar": "manager@romapastabar.co.uk",
    "bistro_test_venue": "eltonnushi@example.com"
};

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
            const payloadData = req.body;

            // ✅ FIXED: Variable declared FIRST before being utilized by down-stream logic targets!
            const activeVenue = (payloadData.restaurantID || "loro_di_elton").trim().toLowerCase();

            // Construct standard layout data parameters
            const firstName = payloadData.firstName || "Guest";
            const surname = payloadData.surname || "";
            const guestEmail = payloadData.email || "";
            const guestPhone = payloadData.phone || "";
            const partySize = parseInt(payloadData.partySize) || 2;
            const timeStampMs = parseFloat(payloadData.resDate) || Date.now();

            // Format an elegant date label string for text block insertion
            let bookingDateLabel = new Date(timeStampMs).toLocaleString('en-GB', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const broadcastPayload = {
                restaurantID: activeVenue,
                firstName: firstName,
                surname: surname,
                email: guestEmail,
                phone: guestPhone,
                partySize: partySize,
                resDate: timeStampMs,
                occasion: payloadData.occasion || "Standard Dining",
                allergenNotes: payloadData.allergenNotes || ""
            };

            // =========================================================================
            // 🚀 PIPELINE INTERCEPT A: TRIGGER SOCKET DATA DROPS TO THE IPAD APP
            // =========================================================================
            await pusher.trigger(`channel-${activeVenue}`, "new-booking", broadcastPayload);

            // =========================================================================
            // ✉️ PIPELINE INTERCEPT B: FIRE TRANSACTIONAL EMAIL AUTOMATIONS
            // =========================================================================
            if (guestEmail && process.env.RESEND_API_KEY) {

                // Email Pass 1: Send pristine confirmation receipt to the incoming GUEST
                await resend.emails.send({
                    from: 'TableMaster Pro <booking@swifttechmobile.co.uk>',
                    to: guestEmail,
                    subject: `Your Reservation Confirmation at ${activeVenue.replace(/_/g, ' ').toUpperCase()}`,
                    html: `
                        <div style="font-family:sans-serif; max-width:600px; margin:0 auto; padding:20px; background:#1c1c1e; color:#fff; border-radius:12px;">
                            <h2 style="color:#ff2d55;">Reservation Confirmed! 🎉</h2>
                            <p>Hello ${firstName},</p>
                            <p>Thank you for your table booking request. Your allocation details have been synced straight onto our floor plan ledger.</p>
                            <hr style="border:1px solid #2a2a35;" />
                            <p><strong>📍 Venue:</strong> ${activeVenue.replace(/_/g, ' ').toUpperCase()}</p>
                            <p><strong>📅 Date & Time:</strong> ${bookingDateLabel}</p>
                            <p><strong>👥 Table Covers:</strong> ${partySize} People</p>
                            <hr style="border:1px solid #2a2a35;" />
                            <p style="font-size:12px; color:#a1a1a6;">If you need to alter or cancel this request, please contact the front-of-house stand operator directly.</p>
                        </div>
                    `
                });

                // ✅ FIXED VALUE ALLOCATION HOOK:
                // Evaluates your multi-tenant registry map first, then drops down to the environment variable!
                const restaurantDestinationInbox = venueEmailRegistry[activeVenue] || process.env.RESTAURANT_ALERT_EMAIL || 'notification-fallback@swifttechmobile.co.uk';

                // Email Pass 2: Send internal reservation notification alert straight to the RESTAURANT
                await resend.emails.send({
                    from: 'TableMaster Network <alert@swifttechmobile.co.uk>',
                    to: restaurantDestinationInbox,
                    subject: `🚨 New Web Booking Received - ${firstName} ${surname} (Party of ${partySize})`,
                    html: `
                        <div style="font-family:sans-serif; max-width:600px; margin:0 auto; padding:20px; background:#000; color:#fff; border:1px solid #ff2d55; border-radius:12px;">
                            <h2 style="color:#ff2d55; margin-top:0;">New Web Reservation Alert 🛎️</h2>
                            <p>A fresh booking has been processed from your web widget frame and transited straight to the iPad cockpit ledger context tracks.</p>
                            <table style="width:100%; border-collapse:collapse; margin:20px 0; color:#fff;">
                                <tr><td style="padding:8px; background:#1c1c1e;"><strong>Guest Name:</strong></td><td style="padding:8px; background:#1c1c1e;">${firstName} ${surname}</td></tr>
                                <tr><td style="padding:8px;"><strong>Covers/Size:</strong></td><td style="padding:8px;">${partySize} People</td></tr>
                                <tr><td style="padding:8px; background:#1c1c1e;"><strong>Date Requested:</strong></td><td style="padding:8px; background:#1c1c1e;">${bookingDateLabel}</td></tr>
                                <tr><td style="padding:8px;"><strong>Contact Phone:</strong></td><td style="padding:8px;">${guestPhone}</td></tr>
                                <tr><td style="padding:8px; background:#1c1c1e;"><strong>Allergen Notes:</strong></td><td style="padding:8px; background:#1c1c1e; color:#ff2d55;">${broadcastPayload.allergenNotes || "None"}</td></tr>
                            </table>
                            <p style="font-size:12px; color:#a1a1a6;">TableMaster Pro Network Layer Automation.</p>
                        </div>
                    `
                });

                console.log(`✉️ Transactional emails successfully dispatched to guest and registry endpoint: ${restaurantDestinationInbox}`);
            }

            return res.status(200).json({ success: true, logged: "Real-time socket payload and confirmation emails deployed safely." });

        } catch (error) {
            console.error("❌ Backend Error:", error.message);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
};
