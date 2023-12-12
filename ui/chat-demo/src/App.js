import React, { useState } from "react";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [job, setJob] = useState({ content: "" });
  const [processing, setProcessing] = useState(false);

  const onSendMessage = async () => {
    const input = document.getElementById("message-input");
    const message = input.value;
    input.value = "";
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setProcessing(true);
    // append the user message to the list of messages
    // call api and list for stream (sse)
    const response = await fetch(`http://localhost:8080/message`, {
      method: "POST",
      headers: {
        "Content-Type": "text/event-stream",
      },
      body: JSON.stringify({
        messages: [
          ...messages,
          { role: "user", content: message },
          { role: "assistant", content: "" },
        ],
      }),
    });
    const regex = /data:(.*)/gm;
    const reader = response.body
      .pipeThrough(new window.TextDecoderStream())
      .getReader();

    let fullMessage = "";
    // Wait for a message
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      let m;

      while ((m = regex.exec(value)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }

        let matchData = JSON.parse(m[1]);

        fullMessage += matchData.content;
        setJob((prev) => ({
          ...prev,
          content: prev.content + matchData.content,
        }));
      }
    }

    console.log("DONE SSE");
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: fullMessage },
    ]);
    setJob({ content: "" });
    setProcessing(false);
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "grid",
        gridTemplateRows: "auto 60px 15px",
      }}
    >
      <div>
        {messages.map((message) => {
          return (
            <div
              style={{
                display: "flex",
                gap: "10px",
                padding: "15px 0px",
                whiteSpace: "pre-wrap",
              }}
            >
              <div>
                <div className={`avatar-${message.role}`}>
                  {message.role[0].toUpperCase()}
                </div>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <div
                  style={{
                    fontWeight: "800",
                    fontSize: "12px",
                    textTransform: "uppercase",
                    color: "#CACACA",
                  }}
                >
                  {message.role}
                </div>
                <div>{message.content}</div>
              </div>
            </div>
          );
        })}
        {processing && (
          <div
            style={{
              display: "flex",
              gap: "10px",
              padding: "10px 0px",
              whiteSpace: "pre-wrap",
            }}
          >
            <div>
              <div className="avatar-assistant">A</div>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <div
                style={{
                  fontWeight: "800",
                  fontSize: "12px",
                  textTransform: "uppercase",
                  color: "#CACACA",
                }}
              >
                {job?.role}
              </div>
              <div>{job?.content}</div>
            </div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", padding: "10px 0px" }}>
        <input
          id="message-input"
          placeholder="enter message..."
          onKeyPress={(event) => {
            if (event.key === "Enter") {
              onSendMessage();
            }
          }}
          disabled={processing}
        />
        <button onClick={onSendMessage} disabled={processing}>
          &#8627;
        </button>
      </div>
      <div></div>
    </div>
  );
};

export default App;
