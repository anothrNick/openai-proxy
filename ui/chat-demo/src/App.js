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
                padding: "10px 0px",
              }}
            >
              <div>{message.role[0].toUpperCase()}</div>
              <div>{message.content}</div>
            </div>
          );
        })}
        {processing && (
          <div
            style={{
              display: "flex",
              gap: "10px",
              padding: "10px 0px",
            }}
          >
            <div>A</div>
            <div>{job?.content}</div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", padding: "10px 0px" }}>
        <input
          id="message-input"
          style={{
            width: "100%",
            fontSize: "16px",
            padding: "10px",
            borderRadius: "4px",
            borderTopRightRadius: "0px",
            borderBottomRightRadius: "0px",
            border: "none",
            outline: "none",
            boxShadow: "0px 1px 2px rgba(0,0,0,.4)",
          }}
          placeholder="enter message..."
          onKeyPress={(event) => {
            if (event.key === "Enter") {
              onSendMessage();
            }
          }}
          disabled={processing}
        />
        <button
          style={{
            fontSize: "16px",
            padding: "10px",
            borderRadius: "4px",
            borderTopLeftRadius: "0px",
            borderBottomLeftRadius: "0px",
            border: "none",
            outline: "none",
            boxShadow: "0px 1px 2px rgba(0,0,0,.4)",
            cursor: "pointer",
          }}
          onClick={onSendMessage}
          disabled={processing}
        >
          &#8627;
        </button>
      </div>
      <div></div>
    </div>
  );
};

export default App;
