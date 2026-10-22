import React, { useState } from "react";

const CHATBOT_IMAGE = process.env.PUBLIC_URL ? process.env.PUBLIC_URL + "/iconnn.png" : "/iconnn.png";

const BOTPRESS_IFRAME_URL = "https://cdn.botpress.cloud/webchat/v3.2/shareable.html?configUrl=https://files.bpcontent.cloud/2025/09/17/16/20250917162103-HS0ATQ0P.json";
const FloatingBotpressChatbot = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Chatbot Button */}
      <div
        style={{
          position: "fixed",
          bottom: 30,
          right: 30,
          zIndex: 10000,
          background: "#fff",
          border: "3px solid #439a82",
          borderRadius: "50%",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          width: 60,
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          backgroundColor: "#ffe5d0"
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <img
          src={CHATBOT_IMAGE}
          alt="Chatbot"
          style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", background: '#fff' }}
          onError={e => {
            e.target.onerror = null;
            e.target.style.display = 'none';
            if (e.target.parentNode) {
              const fallback = document.createElement('span');
              fallback.style.color = '#439a82';
              fallback.style.fontWeight = 'bold';
              fallback.textContent = 'Chat';
              e.target.parentNode.appendChild(fallback);
            }
          }}
        />
      </div>
      {/* Chatbot Window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 100,
            right: 30,
            width: 350,
            height: 500,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
            display: "flex",
            flexDirection: "column",
            zIndex: 1001,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "#439a82",
              color: "#fff",
              padding: 14,
              fontSize: 18,
              fontWeight: "bold",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Chatbot
            <span
              style={{ cursor: "pointer", fontSize: 22 }}
              onClick={() => setOpen(false)}
            >
              &times;
            </span>
          </div>
          <iframe
            src={BOTPRESS_IFRAME_URL}
            title="Botpress Chatbot"
            style={{ width: "100%", height: "100%", border: "none" }}
            allow="clipboard-write"
          />
        </div>
      )}
    </>
  );
};

export default FloatingBotpressChatbot;
