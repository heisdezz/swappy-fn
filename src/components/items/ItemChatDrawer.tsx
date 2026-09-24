import { Send, MessageSquare, X, ShieldAlert, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { pb } from "../../client/pb";

interface MessageItem {
  id: string;
  chatroom: string;
  sender: string;
  recipient?: string;
  text: string;
  read?: boolean;
  created?: string;
}

interface ItemChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  itemIdentifier: string;
  itemTitle: string;
  sellerName?: string;
  sellerId?: string;
}

export function ItemChatDrawer({
  isOpen,
  onClose,
  itemIdentifier,
  itemTitle,
  sellerName = "Seller",
  sellerId,
}: ItemChatDrawerProps) {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = pb.authStore.record?.id;
  const isAuthenticated = pb.authStore.isValid && !!currentUserId;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch messages from GET /api/chat/:identifier/messages
  const fetchMessages = async () => {
    if (!isAuthenticated || !itemIdentifier) return;
    setLoading(true);
    try {
      const backendUrl =
        import.meta.env.VITE_POCKETBASE_URL || "http://127.0.0.1:8090";
      const token = pb.authStore.token;

      const res = await fetch(
        `${backendUrl}/api/chat/${encodeURIComponent(itemIdentifier)}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.warn("Could not fetch chat messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchMessages();

      // Realtime subscription via PocketBase SDK
      const unsubscribePromise = pb.collection("messages").subscribe("*", (e) => {
        if (
          e.action === "create" &&
          (e.record.chatroom === itemIdentifier ||
            e.record.item === itemIdentifier)
        ) {
          const raw = e.record as unknown as Record<string, any>;
          setMessages((prev) => [
            ...prev,
            {
              id: raw.id,
              chatroom: raw.chatroom,
              sender: raw.sender,
              recipient: raw.recipient,
              text: raw.text,
              read: raw.read,
              created: raw.created,
            },
          ]);
        }
      });

      return () => {
        unsubscribePromise
          .then((unsub) => unsub())
          .catch(() => pb.collection("messages").unsubscribe("*"));
      };
    }
  }, [isOpen, itemIdentifier, isAuthenticated]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending || !isAuthenticated) return;

    setSending(true);
    const textToSend = inputText.trim();

    try {
      const backendUrl =
        import.meta.env.VITE_POCKETBASE_URL || "http://127.0.0.1:8090";
      const token = pb.authStore.token;

      const res = await fetch(
        `${backendUrl}/api/chat/${encodeURIComponent(itemIdentifier)}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            text: textToSend,
            recipient: sellerId,
          }),
        },
      );

      if (res.ok) {
        setInputText("");
        // Fallback optimistic display if SSE is delayed
        const data = await res.json();
        if (data.record && !messages.some((m) => m.id === data.record.id)) {
          setMessages((prev) => [
            ...prev,
            {
              id: data.record.id,
              chatroom: data.record.chatroom,
              sender: data.record.sender,
              recipient: data.record.recipient,
              text: data.record.text,
              read: data.record.read,
              created: data.record.created,
            },
          ]);
        }
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-base-100 h-full shadow-2xl flex flex-col border-l border-base-300">
        {/* Header */}
        <div className="p-4 border-b border-base-200 flex items-center justify-between bg-base-100 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm sm:text-base text-base-content truncate">
                Chat with {sellerName}
              </h3>
              <p className="text-[11px] text-base-content/60 truncate">
                {itemTitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-warning/10 text-warning flex items-center justify-center">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-base text-base-content">
                Sign in to chat
              </h4>
              <p className="text-xs text-base-content/70 max-w-xs">
                In-app messaging connects you directly to the verified seller while protecting your identity and trade history.
              </p>
            </div>
            <a
              href={`/app/auth/login?redirect=/items/${encodeURIComponent(itemIdentifier)}`}
              className="btn btn-primary rounded-xl btn-sm font-bold px-6"
            >
              Sign In to Swappy
            </a>
          </div>
        ) : (
          <>
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-base-200/30">
              {loading && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-xs text-base-content/50">
                  Loading chat history...
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-base-200 flex items-center justify-center text-base-content/40">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="font-bold text-sm text-base-content">
                    Direct conversation started
                  </div>
                  <p className="text-xs text-base-content/60 max-w-xs">
                    Ask questions about device battery health, camera condition, or schedule an in-person handover.
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.sender === currentUserId;
                  return (
                    <div
                      key={m.id}
                      className={`chat ${isMe ? "chat-end" : "chat-start"}`}
                    >
                      <div
                        className={`chat-bubble text-xs sm:text-sm font-medium leading-relaxed ${
                          isMe
                            ? "chat-bubble-primary text-primary-content"
                            : "chat-bubble-neutral bg-base-100 text-base-content border border-base-300"
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <form
              onSubmit={handleSend}
              className="p-3 border-t border-base-200 bg-base-100 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about inspection or condition..."
                className="input input-sm input-bordered flex-1 rounded-xl text-xs bg-base-100"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                className="btn btn-sm btn-primary rounded-xl px-3 inline-flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
