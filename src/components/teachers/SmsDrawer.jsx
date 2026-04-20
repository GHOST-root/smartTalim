import { useState } from "react";

function SmsDrawer({ teacher, onClose }) {
  const [message, setMessage] = useState("");

  if (!teacher) return null;

  const smsCount = Math.ceil(message.length / 160) || 1;

  return (
    <div className="drawer-overlay">
      <div className="drawer">

        {/* HEADER */}
        <div className="drawer-header">
          <h3>O‘qituvchiga SMS yuboring</h3>
          <span className="close" onClick={onClose}>✕</span>
        </div>

        {/* BODY */}
        <div className="drawer-body">

          <div className="sms-from">
            <b>Yuboruvchi:</b> MODME
          </div>

          <textarea
            placeholder="Xabarni kiriting"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div className="sms-info">
            <span>{message.length} ta belgi – {smsCount} SMS</span>
            <span className="sms-name">{teacher.name}</span>
          </div>

          <button className="send-btn">
            SMS yuborish
          </button>

        </div>
      </div>
    </div>
  );
}

export default SmsDrawer;