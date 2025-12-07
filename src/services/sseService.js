class SseService {
  constructor() {
    this.eventSource = null;
    this.listeners = {};
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.isManuallyDisconnected = false;
  }

  connect(token) {
    if (this.eventSource) {
      console.log('SSE already connected');
      return;
    }

    this.isManuallyDisconnected = false;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/notifications/stream?token=${encodeURIComponent(token)}`;

    console.log('🔌 [SSE] Connecting to:', url);
    console.log('🔑 [SSE] Token length:', token ? token.length : 'no token');

    this.eventSource = new EventSource(url);

    // Handle connection opened
    this.eventSource.onopen = () => {
      console.log('✅ [SSE] Connection opened successfully');
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      this.emit('connect');
    };

    // Handle incoming messages
    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('SSE message received:', data);
        this.emit('message', data);
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    // Handle connection errors
    this.eventSource.onerror = (error) => {
      console.error('❌ [SSE] Connection error:', error);
      console.log('📊 [SSE] ReadyState:', this.eventSource?.readyState);

      if (this.eventSource?.readyState === EventSource.CLOSED) {
        console.log('🔴 [SSE] Connection closed');
        this.eventSource = null;
        this.emit('disconnect', 'Connection closed');

        // Attempt to reconnect if not manually disconnected
        if (!this.isManuallyDisconnected && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`🔄 [SSE] Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

          setTimeout(() => {
            if (!this.isManuallyDisconnected) {
              this.connect(token);
            }
          }, this.reconnectDelay);

          // Exponential backoff
          this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('⛔ [SSE] Max reconnection attempts reached');
          this.emit('connect_error', new Error('Max reconnection attempts reached'));
        }
      }
    };

    // Listen for specific event types
    this.eventSource.addEventListener('connected', (event) => {
      const data = JSON.parse(event.data);
      console.log('🎉 [SSE] Connected event received:', data);
    });

    this.eventSource.addEventListener('notification', (event) => {
      const data = JSON.parse(event.data);
      console.log('🔔 [SSE] New notification received:', data);
      this.emit('new_notification', data);
    });

    this.eventSource.addEventListener('unread_count', (event) => {
      const data = JSON.parse(event.data);
      console.log('📬 [SSE] Unread count update:', data);
      this.emit('unread_count', data.count);
    });
  }

  disconnect() {
    this.isManuallyDisconnected = true;
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.listeners = {};
      console.log('SSE disconnected');
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;

    if (callback) {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    } else {
      delete this.listeners[event];
    }
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach((callback) => callback(data));
  }

  isConnected() {
    return this.eventSource?.readyState === EventSource.OPEN;
  }
}

// Export singleton instance
const sseService = new SseService();
export default sseService;
