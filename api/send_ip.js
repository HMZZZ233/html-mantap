export default async function handler(req, res) {
    const BOT_TOKEN = process.env.TELEGRAM_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const ua = req.headers["user-agent"] || "Unknown";
    const message = `🚨 IP Baru Icibos😹\nIP: ${ip}\nUA: ${ua}`;
    const tgUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    await fetch(tgUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message
        })
    });
    res.status(200).json({
        status: true,
        ip,
        ua
    });
}
