import { MessageSquare, Send, ShieldAlert, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { pb } from "../../client/pb";

interface ItemChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
  sellerName?: string;
  itemId?: string;
  itemTitle?: string;
  itemIdentifier: string;
}

interface ChatMessage {
  id: string;
  chatroom: string;
  sender: string;
  recipient: string;
  text: string;
  read: boolean;
  created: string;
}

export function ItemChatDrawer({
  isOpen,
  onClose,
  sellerId,
  sellerName = "Seller",
  itemId,
  itemTitle = "iPhone Listing",
  itemIdentifier,
}: ItemChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [chatroomId, setChatroomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = pb.authStore.isValid;
  const currentUserId = pb.authStore.record?.id;

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Find or create chatroom
  useEffect(() => {
    if (!isOpen || !isAuthenticated || !currentUserId || !sellerId) return;

    let isSubscribed = true;

    async function initChat() {
      setLoading(true);
      try {
        const filter = `(buyer = "${currentUserId}" && seller = "${sellerId}") || (buyer = "${sellerId}" && seller = "${currentUserId}")`;
        let room = null;

        try {
          const existing = await pb.collection("chatrooms").getList(1, 1, {
            filter,
            requestKey: null,
          });
          if (existing.items.length > 0) {
            room = existing.items[0];
          }
        } catch (e) {
          console.warn("Could not query existing chatroom:", e);
        }

        if (!room) {
          room = await pb.collection("chatrooms").create({
            buyer: currentUserId,
            seller: sellerId,
            item: itemId || null,
            last_message: "Chat started",
            unread_count_buyer: 0,
            unread_count_seller: 0,
          });
        }

        if (isSubscribed && room) {
          setChatroomId(room.id);

          const history = await pb.collection("messages").getList(1, 50, {
            filter: `chatroom = "${room.id}"`,
            sort: "created",
            requestKey: null,
          });

          setMessages(
            history.items.map((m: any) => ({
              id: m.id,
              chatroom: m.chatroom,
              sender: m.sender,
              recipient: m.recipient,
              text: m.text,
              read: m.read,
              created: m.created || "",
            })),
          );

          pb.collection("messages").subscribe(
            "*",
            function (e) {
              if (e.action === "create" && e.record.chatroom === room.id) {
                setMessages((prev) => {
                  if (prev.some((msg) => msg.id === e.record.id)) return prev;
                  return [
                    ...prev,
                    {
                      id: e.record.id,
                      chatroom: e.record.chatroom,
                      sender: e.record.sender,
                      recipient: e.record.recipient,
                      text: e.record.text,
                      read: e.record.read,
                      created: (e.record as any).created || "",
                    },
                  ];
                });
              }
            },
            { filter: `chatroom = "${room.id}"` },
          );
        }
      } catch (err) {
        console.error("Failed to initialize chatroom:", err);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    }

    initChat();

    return () => {
      isSubscribed = false;
      pb.collection("messages").unsubscribe("*");
    };
  }, [isOpen, isAuthenticated, currentUserId, sellerId, itemId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !chatroomId || !currentUserId || sending) return;

    const textToSend = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      const recipientId = currentUserId === sellerId ? currentUserId : sellerId;

      const createdMsg = await pb.collection("messages").create({
        chatroom: chatroomId,
        sender: currentUserId,
        recipient: recipientId,
        text: textToSend,
        read: false,
      });

      await pb.collection("chatrooms").update(chatroomId, {
        last_message: textToSend,
      });

      if (createdMsg) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === createdMsg.id)) return prev;
          return [
            ...prev,
            {
              id: createdMsg.id,
              chatroom: createdMsg.chatroom,
              sender: createdMsg.sender,
              recipient: createdMsg.recipient,
              text: createdMsg.text,
              read: createdMsg.read,
              created: (createdMsg as any).created || "",
            },
          ];
        });
      }
    } catch (err) {
      console.warn("Direct PocketBase send failed, trying API fallback:", err);
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatroomId,
          senderId: currentUserId,
          recipientId: sellerId,
          text: textToSend,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.record) {
          setMessages((prev) => [
            ...prev,
            {
              id: data.record.id,
              chatroom: data.record.chatroom,
              sender: data.record.sender,
              recipient: data.record.recipient,
              text: data.record.text,
              read: data.record.read,
              created: data.record.created || "",
            },
          ]);
        }
      }
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="drawer drawer-end fixed inset-0 z-50">
      <input
        id="item-chat-drawer-toggle"
        type="checkbox"
        className="drawer-toggle"
        checked={isOpen}
        onChange={(e) => {
          if (!e.target.checked) onClose();
        }}
      />
      <div className="drawer-side">
        <label
          htmlFor="item-chat-drawer-toggle"
          aria-label="close chat"
          className="drawer-overlay"
          onClick={onClose}
        />
        <div className="w-full sm:w-96 max-w-full bg-base-100 min-h-full flex flex-col shadow-2xl border-l border-base-300">
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
              className="btn btn-ghost btn-sm btn-circle cursor-pointer"
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
                  In-app messaging connects you directly to the verified seller
                  while protecting your identity and trade history.
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
                      Ask questions about device battery health, camera
                      condition, or schedule an in-person handover.
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
                  className="btn btn-sm btn-primary rounded-xl px-3 inline-flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
