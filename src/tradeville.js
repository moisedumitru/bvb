import pkg from "websocket";
const { w3cwebsocket: WebSocket } = pkg;

let websocket;

export const startws = ({ username, password }) => {
  return new Promise((resolve, reject) => {
    console.log("▶ deschid WebSocket TradeVille");

    websocket = new WebSocket(
      "wss://api.tradeville.ro",
      ["apitv"]
    );

    websocket.onopen = () => {
      console.log("✔ WebSocket deschis");

      websocket.send(JSON.stringify({
        cmd: "login",
        prm: {
          coduser: username,
          parola: password,
          demo: false
        }
      }));
    };

    websocket.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);
      console.log("⬅ mesaj:", msg.cmd);

      if (msg.cmd === "login") {
        if (!msg.OK) {
          websocket.close();
          reject(new Error("Login TradeVille eșuat"));
        } else {
          websocket.send(JSON.stringify({
            cmd: "Portfolio",
            prm: { data: null }
          }));
        }
      }

      if (msg.cmd === "Portfolio") {
        console.log("✔ Portofoliu primit");
        websocket.close();
        resolve(msg.data);
      }
    };

    websocket.onerror = () => {
      reject(new Error("WebSocket TradeVille error"));
    };

    // timeout de siguranță
    setTimeout(() => {
      reject(new Error("TradeVille timeout"));
      try { websocket.close(); } catch {}
    }, 15000);
  });
};
