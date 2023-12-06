import { RFAMessage } from "./MessageDefinitions";
import { RFARequestHandler } from "./MessageHandlers";
import { SnackbarEvents } from "../ui/React/Snackbar";
import { ToastVariant } from "@enums";

export class Remote {
  connection?: any;
  static protocol = "ws";
  ipaddr: string;
  port: number;

  constructor(ip: string, port: number) {
    this.ipaddr = ip;
    this.port = port;
  }

  public stopConnection(): void {
    this.connection?.close();
  }

  private setupConnection() {
    assertExists(this.connection);
    const address = this.connection.url;
    this.connection.addEventListener("error", (e: Event) =>
      SnackbarEvents.emit(`Error with websocket ${address}, details: ${JSON.stringify(e)}`, ToastVariant.ERROR, 5000),
    );
    this.connection.addEventListener("message", handleMessageEvent);
    this.connection.addEventListener("open", () =>
      SnackbarEvents.emit(
        `Remote API connection established on ${this.ipaddr}:${this.port}`,
        ToastVariant.SUCCESS,
        2000,
      ),
    );
    this.connection.addEventListener("close", () =>
      SnackbarEvents.emit("Remote API connection closed", ToastVariant.WARNING, 2000),
    );
  }

  public startConnection(): void {
    const address = Remote.protocol + "://" + this.ipaddr + ":" + this.port;
    if (process.env.RUNTIME_NODE) {
      import("ws").then(ws => {
        this.connection = new ws.WebSocket(address);
        this.setupConnection();
      });
    } else {
      this.connection = new WebSocket(address);
      this.setupConnection();
    }
  }
}

function handleMessageEvent(this: WebSocket, e: MessageEvent): void {
  const msg: RFAMessage = JSON.parse(e.data);

  if (!msg.method || !RFARequestHandler[msg.method]) {
    const response = new RFAMessage({ error: "Unknown message received", id: msg.id });
    sendMessage(this, response);
    return;
  }
  const response = RFARequestHandler[msg.method](msg);
  if (!response) return;
  sendMessage(this, response);
}

function sendMessage(websocket: WebSocket, message: any) {
  try {
    if (websocket.readyState !== 1) {
      return;
    }
    websocket.send(JSON.stringify(message));
  } catch (e) {
    console.log(e);
  }
}

function assertExists<T>(value: T): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error(`${value} doesn't exist`);
  }
}
