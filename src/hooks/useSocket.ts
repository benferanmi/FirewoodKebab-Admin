import { useEffect } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

// Singleton admin socket — completely separate from the client socket
let adminSocket: Socket | null = null;
let reconnectAttempts = 0;

// Optional callback to handle forced logout (e.g. expired/invalid admin token)
type OnUnauthorized = () => void;
let onUnauthorizedCallback: OnUnauthorized | null = null;

export function useAdminSocketInit(
  token: string | null,
  onUnauthorized?: OnUnauthorized,
) {
  useEffect(() => {
    if (adminSocket?.connected) return;

    // No token at all → don't even try to connect
    if (!token) {
      console.warn("[AdminSocket] No token provided — skipping connection");
      return;
    }

    onUnauthorizedCallback = onUnauthorized ?? null;

    adminSocket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: true,
    });

    adminSocket.on("connect", () => {
      reconnectAttempts = 0;
      console.log("[AdminSocket] Connected:", adminSocket?.id);

      // Request admin dashboard room — server will verify role
      adminSocket!.emit("admin:watch-dashboard");
      console.log("[AdminSocket] Emitted admin:watch-dashboard");
    });

    adminSocket.on("ADMIN_JOINED", (data) => {
      console.log("[AdminSocket] Joined admin-dashboard room:", data);
    });

    adminSocket.on("connect_error", (error) => {
      reconnectAttempts++;
      console.error(
        `[AdminSocket] Connection error (attempt ${reconnectAttempts}):`,
        error.message,
      );

      // Server rejected with UNAUTHORIZED (invalid/expired token)
      // Stop reconnecting — redirect to login
      if (error.message === "UNAUTHORIZED") {
        console.error(
          "[AdminSocket] Invalid admin token — stopping reconnection and logging out",
        );
        disconnectAdminSocket();
        onUnauthorizedCallback?.();
        return;
      }
    });

    adminSocket.on("error", (error: any) => {
      // Server emitted a FORBIDDEN error (valid token but wrong role)
      if (error?.code === "FORBIDDEN") {
        console.error(
          "[AdminSocket] FORBIDDEN — token is valid but lacks admin role. Disconnecting.",
        );
        disconnectAdminSocket();
        onUnauthorizedCallback?.();
        return;
      }
      console.error("[AdminSocket] Socket error:", error);
    });

    adminSocket.on("disconnect", (reason) => {
      console.log("[AdminSocket] Disconnected:", reason);
      if (reason === "io server disconnect") {
        // Server explicitly kicked us — don't auto-reconnect
        console.warn(
          "[AdminSocket] Server-side disconnect — not reconnecting automatically",
        );
        disconnectAdminSocket();
        onUnauthorizedCallback?.();
      }
    });

    return () => {
      // Keep alive across admin page navigations
      // Call disconnectAdminSocket() explicitly on admin logout
    };
  }, [token, onUnauthorized]);
}

export function disconnectAdminSocket() {
  if (adminSocket) {
    adminSocket.disconnect();
    adminSocket = null;
    reconnectAttempts = 0;
    onUnauthorizedCallback = null;
    console.log("[AdminSocket] Disconnected and cleaned up");
  }
}

export function getAdminSocket(): Socket | null {
  return adminSocket;
}

export function isAdminSocketConnected(): boolean {
  return adminSocket?.connected ?? false;
}
