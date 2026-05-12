type SyncItem = {
  id: string;
  type: "expense" | "group" | "settlement" | "account" | "contact";
  action: "create" | "update" | "delete";
  data: unknown;
  timestamp: number;
};

class SyncQueue {
  private queue: SyncItem[] = [];
  private readonly STORAGE_KEY = "syncQueue";
  private isSyncing = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.loadQueue();
      window.addEventListener("online", () => this.processQueue());
    }
  }

  private loadQueue() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load sync queue:", error);
      this.queue = [];
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error("Failed to save sync queue:", error);
    }
  }

  add(item: Omit<SyncItem, "id" | "timestamp">) {
    const syncItem: SyncItem = {
      ...item,
      id: `${item.type}-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };

    this.queue.push(syncItem);
    this.saveQueue();

    if (navigator.onLine) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.isSyncing || this.queue.length === 0 || !navigator.onLine) {
      return;
    }

    this.isSyncing = true;

    while (this.queue.length > 0 && navigator.onLine) {
      const item = this.queue[0];

      try {
        await this.syncItem(item);
        this.queue.shift();
        this.saveQueue();
      } catch (error) {
        console.error("Failed to sync item:", error);
        break;
      }
    }

    this.isSyncing = false;
  }

  private async syncItem(item: SyncItem) {
    const endpoint = `/api/${item.type}s`;
    const method = item.action === "create" ? "POST" : item.action === "update" ? "PUT" : "DELETE";

    const response = await fetch(
      item.action === "delete" ? `${endpoint}/${(item.data as { id: string }).id}` : endpoint,
      {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: item.action !== "delete" ? JSON.stringify(item.data) : undefined,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to sync ${item.type}`);
    }
  }

  getQueueSize() {
    return this.queue.length;
  }

  clear() {
    this.queue = [];
    this.saveQueue();
  }
}

export const syncQueue = new SyncQueue();
