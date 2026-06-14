import type { Response } from "express";

interface SSEClient {
  id: string;
  res: Response;
}

class SSEManager {
  private clients: SSEClient[] = [];
  private pingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startHeartbeat();
  }

  /**
   * Registers a new client connection.
   */
  public register(res: Response): string {
    const id = Math.random().toString(36).substring(2, 9);
    
    // Set headers for SSE
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    // Send initial connection event
    res.write(`event: connected\ndata: ${JSON.stringify({ id })}\n\n`);

    this.clients.push({ id, res });
    console.log(`[SSE] Client connected: ${id}. Total clients: ${this.clients.length}`);

    return id;
  }

  /**
   * Unregisters an active client connection.
   */
  public unregister(id: string): void {
    const index = this.clients.findIndex(c => c.id === id);
    if (index !== -1) {
      this.clients.splice(index, 1);
      console.log(`[SSE] Client disconnected: ${id}. Total clients: ${this.clients.length}`);
    }
  }

  /**
   * Broadcasts an event to all connected clients.
   */
  public broadcast(event: string, data: any): void {
    console.log(`[SSE] Broadcasting event "${event}" to ${this.clients.length} clients`);
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    
    this.clients.forEach(client => {
      try {
        client.res.write(message);
      } catch (err) {
        console.error(`[SSE] Error sending message to client ${client.id}:`, err);
      }
    });
  }

  /**
   * Periodically sends a ping comment to keep connections alive.
   */
  private startHeartbeat(): void {
    this.pingInterval = setInterval(() => {
      if (this.clients.length > 0) {
        this.clients.forEach(client => {
          try {
            client.res.write(": ping\n\n");
          } catch (err) {
            // Client likely closed but we haven't received close event yet
          }
        });
      }
    }, 15000); // 15 seconds
  }

  /**
   * Clean up resources on shutdown.
   */
  public destroy(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    this.clients.forEach(client => {
      try {
        client.res.end();
      } catch (err) {}
    });
    this.clients = [];
  }
}

export const sseManager = new SSEManager();
