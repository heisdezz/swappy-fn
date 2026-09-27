import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  CheckCheck,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { pb } from "../../client/pb";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { getItemCardImageUrl } from "../../helpers/images";

export const Route = createFileRoute("/dashboard/messages")({
  ssr: false,
  component: DashboardMessagesPage,
});

interface MessageRecord {
  id: string;
  chatroom: string;
  sender: string;
  recipient?: string;
  item?: string;
  text: string;
  read?: boolean;
  created: string;
  updated: string;
  expand?: {
    sender?: {
      id: string;
      name?: string;
      username?: string;
      email?: string;
      avatar?: string;
    };
    recipient?: {
      id: string;
      name?: string;
      username?: string;
      email?: string;
      avatar?: string;
    };
    item?: {
      id: string;
      title: string;
      model?: string;
      price: number;
      images?: string[];
      slug?: string;
      battery_health?: number;
      storage?: string;
      color?: string;
      condition?: string;
      collectionId?: string;
      collectionName?: string;
    };
  };
}

interface ConversationGroup {
  key: string;
  chatroom: string;
  otherUserId: string;
  otherUserName: string;
  otherUserEmail: string;
  item?: NonNullable<MessageRecord["expand"]>["item"];
  messages: MessageRecord[];
  lastMessage: MessageRecord;
  unreadCount: number;
}

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 45) return "just now";
  if (diffSec < 3600) return `${Math.max(1, Math.floor(diffSec / 60))}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 172800) return "Yesterday";
  return date.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}

function formatCurrency(amount?: number): string {
  if (typeof amount !== "number") return "₦0";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function DashboardMessagesPage() {
  const queryClient = useQueryClient();
  const currentUserId = pb.authStore.record?.id;
  const isAuthenticated = pb.authStore.isValid && !!currentUserId;

  const [activeConversationKey, setActiveConversationKey] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "unread">("all");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all messages involving the current user
  const {
    data: rawMessages = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["dashboard-messages", currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];
      const records = await pb
        .collection("messages")
        .getFullList<MessageRecord>({
          filter: `recipient = "${currentUserId}" || sender = "${currentUserId}"`,
          expand: "sender,recipient,item",
          sort: "created",
          requestKey: null,
        });
      return records;
    },
    enabled: isAuthenticated,
    staleTime: 10 * 1000,
  });

  // Realtime subscription via PocketBase SDK
  useEffect(() => {
    if (!isAuthenticated || !currentUserId) return;

    const unsubPromise = pb.collection("messages").subscribe("*", (e) => {
      const rec = e.record as unknown as Record<string, any>;
      if (rec.recipient === currentUserId || rec.sender === currentUserId) {
        queryClient.invalidateQueries({
          queryKey: ["dashboard-messages", currentUserId],
        });
      }
    });

    return () => {
      unsubPromise
        .then((unsub) => unsub())
        .catch(() => {
          try {
            pb.collection("messages").unsubscribe("*");
          } catch {
            // ignore
          }
        });
    };
  }, [isAuthenticated, currentUserId, queryClient]);

  // Group messages into distinct conversations
  const conversations: ConversationGroup[] = useMemo(() => {
    if (!rawMessages || rawMessages.length === 0 || !currentUserId) return [];

    const groupMap = new Map<string, ConversationGroup>();

    for (const msg of rawMessages) {
      const isSender = msg.sender === currentUserId;
      const otherUserId = isSender
        ? msg.recipient || "unknown-buyer"
        : msg.sender;

      const otherUser = isSender ? msg.expand?.recipient : msg.expand?.sender;
      const chatroom =
        msg.chatroom ||
        (msg.expand?.item?.slug as string) ||
        (msg.expand?.item?.id as string) ||
        msg.item ||
        "general";

      const key = `${chatroom}__${otherUserId}`;

      if (!groupMap.has(key)) {
        const otherUserName =
          otherUser?.name ||
          (otherUser?.username
            ? `@${otherUser.username}`
            : "Prospective Buyer");
        const otherUserEmail = otherUser?.email || "";

        groupMap.set(key, {
          key,
          chatroom,
          otherUserId,
          otherUserName,
          otherUserEmail,
          item: msg.expand?.item,
          messages: [],
          lastMessage: msg,
          unreadCount: 0,
        });
      }

      const conv = groupMap.get(key)!;
      conv.messages.push(msg);
      conv.lastMessage = msg;

      // Item reference could be attached to later messages if missing initially
      if (!conv.item && msg.expand?.item) {
        conv.item = msg.expand.item;
      }

      // Increment unread count for incoming messages not yet read
      if (!isSender && msg.recipient === currentUserId && !msg.read) {
        conv.unreadCount += 1;
      }
    }

    // Sort conversations by latest message timestamp descending
    return Array.from(groupMap.values()).sort(
      (a, b) =>
        new Date(b.lastMessage.created).getTime() -
        new Date(a.lastMessage.created).getTime(),
    );
  }, [rawMessages, currentUserId]);

  // Set initial active conversation if not set
  useEffect(() => {
    if (!activeConversationKey && conversations.length > 0) {
      setActiveConversationKey(conversations[0].key);
    }
  }, [conversations, activeConversationKey]);

  // Active conversation object
  const activeConversation = useMemo(() => {
    if (!activeConversationKey) return null;
    return conversations.find((c) => c.key === activeConversationKey) || null;
  }, [conversations, activeConversationKey]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeConversation) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeConversation?.messages.length, activeConversationKey]);

  // Mark unread messages in the active conversation as read
  useEffect(() => {
    if (
      !activeConversation ||
      activeConversation.unreadCount === 0 ||
      !currentUserId
    )
      return;

    const unreadMessages = activeConversation.messages.filter(
      (m) => m.recipient === currentUserId && !m.read,
    );

    if (unreadMessages.length === 0) return;

    // Mark as read in PocketBase
    Promise.allSettled(
      unreadMessages.map((m) =>
        pb
          .collection("messages")
          .update(m.id, { read: true }, { requestKey: null }),
      ),
    ).then(() => {
      queryClient.invalidateQueries({
        queryKey: ["dashboard-messages", currentUserId],
      });
    });
  }, [
    activeConversationKey,
    activeConversation?.unreadCount,
    currentUserId,
    queryClient,
  ]);

  // Filtered conversation list
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      if (filterTab === "unread" && c.unreadCount === 0) {
        return false;
      }

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const matchName = c.otherUserName.toLowerCase().includes(q);
      const matchEmail = c.otherUserEmail.toLowerCase().includes(q);
      const matchItem =
        c.item?.title?.toLowerCase().includes(q) ||
        c.item?.model?.toLowerCase().includes(q);
      const matchText = c.messages.some((m) =>
        m.text.toLowerCase().includes(q),
      );

      return matchName || matchEmail || matchItem || matchText;
    });
  }, [conversations, filterTab, searchQuery]);

  // Quick reply pills
  const quickReplies = [
    "Yes, this iPhone is still available!",
    "Physical inspection available in Ikeja.",
    "Battery health and specs are 100% genuine.",
    "Are you looking for direct purchase or trade-in?",
  ];

  // Send reply handler
  const handleSendMessage = async (
    e?: React.FormEvent,
    customText?: string,
  ) => {
    if (e) e.preventDefault();
    const textToSend = (customText || replyText).trim();
    if (!textToSend || !activeConversation || sending || !currentUserId) return;

    setSending(true);

    try {
      const backendUrl =
        import.meta.env.VITE_POCKETBASE_URL || "http://127.0.0.1:8090";
      const token = pb.authStore.token;

      // Primary: Call the Go custom API endpoint
      const res = await fetch(
        `${backendUrl}/api/chat/${encodeURIComponent(activeConversation.chatroom)}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            text: textToSend,
            recipient: activeConversation.otherUserId,
          }),
        },
      );

      if (!res.ok) {
        // Fallback: Direct PocketBase creation
        await pb.collection("messages").create(
          {
            chatroom: activeConversation.chatroom,
            item: activeConversation.item?.id,
            sender: currentUserId,
            recipient: activeConversation.otherUserId,
            text: textToSend,
            read: false,
          },
          { requestKey: null },
        );
      }

      setReplyText("");
      queryClient.invalidateQueries({
        queryKey: ["dashboard-messages", currentUserId],
      });
    } catch (err) {
      console.error("Failed to send reply:", err);
      // Fallback
      try {
        await pb.collection("messages").create(
          {
            chatroom: activeConversation.chatroom,
            item: activeConversation.item?.id,
            sender: currentUserId,
            recipient: activeConversation.otherUserId,
            text: textToSend,
            read: false,
          },
          { requestKey: null },
        );
        setReplyText("");
        queryClient.invalidateQueries({
          queryKey: ["dashboard-messages", currentUserId],
        });
      } catch (fallbackErr) {
        console.error("Fallback creation also failed:", fallbackErr);
      }
    } finally {
      setSending(false);
    }
  };

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  if (!isAuthenticated) {
    return (
      <DashboardLayout activeTab="messages">
        <div className="card bg-base-100 border border-base-300 shadow-sm p-8 text-center max-w-md mx-auto my-12">
          <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
          <p className="text-base-content/70 text-sm mb-6">
            Please log in to your Swappy seller account to access your received
            chat inquiries and messages.
          </p>
          <Link
            to="/app/auth/login"
            search={{ redirect: "/dashboard/messages" }}
            className="btn btn-primary"
          >
            Log In to Account
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="messages">
      <div className="space-y-6">
        {/* Page Title & Stats Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-base-content">
                Chat Inquiries
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-success/15 text-success font-bold text-xs">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-sm text-base-content/70 mt-1">
              Direct inquiries and swap negotiations from prospective buyers
              across Nigeria.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="btn btn-sm btn-ghost border border-base-300 text-xs font-bold gap-1.5"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card bg-base-100 border border-base-300 shadow-xs p-4 flex flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-base-content">
                {conversations.length}
              </div>
              <div className="text-xs font-bold text-base-content/60">
                Active Buyer Chats
              </div>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300 shadow-xs p-4 flex flex-row items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                totalUnread > 0
                  ? "bg-error/15 text-error"
                  : "bg-base-200 text-base-content/50"
              }`}
            >
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-base-content">
                {totalUnread}
              </div>
              <div className="text-xs font-bold text-base-content/60">
                Unread Inquiries
              </div>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300 shadow-xs p-4 flex flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-base-content">
                {
                  new Set(conversations.map((c) => c.item?.id || c.chatroom))
                    .size
                }
              </div>
              <div className="text-xs font-bold text-base-content/60">
                Listing Devices Discussed
              </div>
            </div>
          </div>
        </div>

        {/* Main Messenger Master-Detail Shell */}
        <div className="bg-base-100 rounded-3xl border border-base-300 shadow-sm overflow-hidden flex flex-col md:flex-row h-[720px] max-h-[82vh]">
          {/* Left Sidebar: Conversations List */}
          <div
            className={`w-full md:w-80 lg:w-96 border-r border-base-200 flex flex-col shrink-0 h-full ${
              activeConversationKey ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Search and Tabs */}
            <div className="p-4 border-b border-base-200 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-base-content/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search buyer or iPhone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input input-sm w-full pl-9 pr-4 rounded-xl bg-base-200/60 border-base-300 focus:bg-base-100 text-xs"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFilterTab("all")}
                  className={`btn btn-xs rounded-lg font-bold flex-1 ${
                    filterTab === "all"
                      ? "btn-primary"
                      : "btn-ghost bg-base-200/80 text-base-content/70"
                  }`}
                >
                  All ({conversations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("unread")}
                  className={`btn btn-xs rounded-lg font-bold flex-1 ${
                    filterTab === "unread"
                      ? "btn-primary"
                      : "btn-ghost bg-base-200/80 text-base-content/70"
                  }`}
                >
                  Unread ({totalUnread})
                </button>
              </div>
            </div>

            {/* Conversation List Scroll Area */}
            <div className="flex-1 overflow-y-auto divide-y divide-base-200">
              {isLoading ? (
                <div className="p-8 text-center space-y-2">
                  <span className="loading loading-spinner loading-md text-primary" />
                  <p className="text-xs text-base-content/60 font-semibold">
                    Loading inquiries...
                  </p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-base-200 text-base-content/40 flex items-center justify-center mx-auto">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-base-content">
                      No inquiries found
                    </h4>
                    <p className="text-xs text-base-content/60 mt-1 max-w-[220px] mx-auto">
                      {searchQuery
                        ? "Try clearing your search keyword."
                        : "Messages received on your published iPhone listings will appear here."}
                    </p>
                  </div>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isActive = conv.key === activeConversationKey;
                  const itemImage = conv.item
                    ? getItemCardImageUrl(conv.item, "100x100")
                    : "/iphone_1.png";

                  return (
                    <button
                      key={conv.key}
                      type="button"
                      onClick={() => setActiveConversationKey(conv.key)}
                      className={`w-full p-4 text-left transition-colors flex items-start gap-3.5 hover:bg-base-200/60 ${
                        isActive
                          ? "bg-primary/10 border-l-4 border-l-primary"
                          : ""
                      }`}
                    >
                      {/* Device Thumbnail Preview */}
                      <div className="relative w-12 h-12 rounded-2xl bg-base-200 border border-base-300 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                        <img
                          src={itemImage}
                          alt={conv.item?.title || "iPhone"}
                          className="w-full h-full object-contain"
                        />
                        {conv.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-error rounded-full border-2 border-base-100" />
                        )}
                      </div>

                      {/* Content Preview */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="font-extrabold text-sm text-base-content truncate">
                            {conv.otherUserName}
                          </span>
                          <span className="text-[10px] font-bold text-base-content/50 shrink-0">
                            {formatRelativeTime(conv.lastMessage.created)}
                          </span>
                        </div>

                        {/* Listing Name Badge */}
                        <div className="text-[11px] font-bold text-primary truncate flex items-center gap-1">
                          <span>{conv.item?.title || "iPhone Inquiry"}</span>
                        </div>

                        {/* Message Snippet */}
                        <p
                          className={`text-xs truncate mt-1 ${
                            conv.unreadCount > 0
                              ? "font-bold text-base-content"
                              : "text-base-content/60"
                          }`}
                        >
                          {conv.lastMessage.sender === currentUserId
                            ? "You: "
                            : ""}
                          {conv.lastMessage.text}
                        </p>
                      </div>

                      {/* Unread Badge */}
                      {conv.unreadCount > 0 && (
                        <span className="badge badge-error badge-xs font-black text-white px-1.5 py-0.5 shrink-0 self-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Pane: Active Chat Thread */}
          {activeConversation ? (
            <div
              className={`flex-1 flex flex-col h-full bg-base-100 ${
                !activeConversationKey ? "hidden md:flex" : "flex"
              }`}
            >
              {/* Thread Header */}
              <div className="p-4 border-b border-base-200 flex items-center justify-between gap-3 bg-base-100/90 backdrop-blur-xs sticky top-0 z-10">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => setActiveConversationKey(null)}
                    className="btn btn-ghost btn-circle btn-sm md:hidden"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary flex items-center justify-center font-black text-sm shrink-0">
                    {activeConversation.otherUserName.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm sm:text-base text-base-content truncate">
                        {activeConversation.otherUserName}
                      </h3>
                      <span className="badge badge-xs bg-success/20 text-success font-bold text-[10px]">
                        Buyer
                      </span>
                    </div>
                    <div className="text-xs text-base-content/50 truncate flex items-center gap-1.5">
                      <span>
                        Inquiry for{" "}
                        {activeConversation.item?.title || "your iPhone"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Listing Peek Card & Marketplace Link */}
                {activeConversation.item && (
                  <div className="hidden sm:flex items-center gap-3 p-2 rounded-2xl bg-base-200/70 border border-base-300/80">
                    <img
                      src={getItemCardImageUrl(
                        activeConversation.item,
                        "80x80",
                      )}
                      alt={activeConversation.item.title}
                      className="w-8 h-8 object-contain"
                    />
                    <div className="text-right">
                      <div className="text-xs font-black text-primary font-mono leading-none">
                        {formatCurrency(activeConversation.item.price)}
                      </div>
                      {activeConversation.item.battery_health && (
                        <div className="text-[10px] text-success font-bold">
                          {activeConversation.item.battery_health}% Battery
                        </div>
                      )}
                    </div>
                    <Link
                      to="/items/$slug"
                      params={{
                        slug:
                          activeConversation.item.slug ||
                          activeConversation.item.id,
                      }}
                      target="_blank"
                      className="btn btn-ghost btn-circle btn-xs text-base-content/60 hover:text-primary"
                      title="Open Item Listing in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Chat Thread Messages Stream */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-base-200/30">
                {/* Security Advisory Pill */}
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-base-200/80 border border-base-300 text-[11px] font-semibold text-base-content/70">
                    <ShieldCheck className="w-3.5 h-3.5 text-success shrink-0" />
                    <span>
                      Safe Trading: Inspect iPhone battery & Face ID in public
                      before transferring funds.
                    </span>
                  </div>
                </div>

                {activeConversation.messages.map((msg) => {
                  const isMe = msg.sender === currentUserId;

                  return (
                    <div
                      key={msg.id}
                      className={`chat ${isMe ? "chat-end" : "chat-start"}`}
                    >
                      <div className="chat-image avatar">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                          {isMe
                            ? "You"
                            : activeConversation.otherUserName
                                .charAt(0)
                                .toUpperCase()}
                        </div>
                      </div>

                      <div className="chat-header text-[11px] opacity-60 mb-1 flex items-center gap-1.5 font-bold">
                        <span>
                          {isMe ? "You" : activeConversation.otherUserName}
                        </span>
                        <time className="text-[10px] font-normal">
                          {formatRelativeTime(msg.created)}
                        </time>
                      </div>

                      <div
                        className={`chat-bubble text-sm sm:text-base leading-relaxed ${
                          isMe
                            ? "bg-primary text-primary-content font-medium rounded-2xl"
                            : "bg-base-100 text-base-content border border-base-300 rounded-2xl shadow-xs"
                        }`}
                      >
                        {msg.text}
                      </div>

                      <div className="chat-footer opacity-60 text-[10px] mt-1 flex items-center gap-1">
                        {isMe && (
                          <span className="flex items-center gap-0.5">
                            {msg.read ? (
                              <span className="text-primary font-bold inline-flex items-center gap-0.5">
                                <CheckCheck className="w-3.5 h-3.5" /> Read
                              </span>
                            ) : (
                              <span>Sent</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reply Pills */}
              <div className="px-4 py-2 bg-base-100 border-t border-base-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-black uppercase text-base-content/40 shrink-0">
                  Quick Reply:
                </span>
                {quickReplies.map((pill) => (
                  <button
                    key={pill}
                    type="button"
                    onClick={() => handleSendMessage(undefined, pill)}
                    disabled={sending}
                    className="btn btn-xs rounded-xl btn-ghost bg-base-200/80 hover:bg-base-200 text-base-content/80 text-[11px] font-semibold shrink-0"
                  >
                    {pill}
                  </button>
                ))}
              </div>

              {/* Reply Input Form */}
              <form
                onSubmit={(e) => handleSendMessage(e)}
                className="p-3 sm:p-4 bg-base-100 border-t border-base-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder={`Reply to ${activeConversation.otherUserName}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  disabled={sending}
                  className="input input-bordered flex-1 rounded-2xl text-sm focus:outline-primary"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || sending}
                  className="btn btn-primary btn-circle shrink-0 shadow-sm"
                  aria-label="Send message"
                >
                  {sending ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 hidden md:flex flex-col items-center justify-center p-8 text-center bg-base-200/20">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-base-content">
                Select an Inquiry
              </h3>
              <p className="text-xs sm:text-sm text-base-content/60 max-w-sm mt-1">
                Choose a conversation from the left to view negotiation
                messages, inspect trade-in offers, and reply instantly.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
