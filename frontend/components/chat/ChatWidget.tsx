"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Send, Sparkles, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ChatAction, executeChatActions, sendChat } from "@/lib/api";
import { notifyDataChanged } from "@/lib/dataEvents";

type ActionResult = { ok: boolean; text: string };

type ChatMessage = {
    id: number;
    role: "user" | "assistant";
    text: string;
    isError?: boolean;
    actions?: ChatAction[];
    status?: "pending" | "done" | "cancelled";
    results?: ActionResult[];
};

const GREETING: ChatMessage = {
    id: 0,
    role: "assistant",
    text: "Hi! How can I help you today?"
};

export default function ChatWidget() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [executingId, setExecutingId] = useState<number | null>(null);
    const nextId = useRef(1);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, open]);

    if (!user) return null;

    const push = (msg: Omit<ChatMessage, "id">) =>
        setMessages((prev) => [...prev, { ...msg, id: nextId.current++ }]);

    const patch = (id: number, changes: Partial<ChatMessage>) =>
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...changes } : m)));

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || sending) return;

        const history = messages
            .filter((m) => m.id !== GREETING.id && m.text && !m.isError)
            .map((m) => ({ role: m.role, text: m.text }));

        push({ role: "user", text });
        setInput("");
        setSending(true);

        try {
            const res = await sendChat(text, history);
            const { reply, actions } = res.data as { reply: string; actions: ChatAction[] };
            push({
                role: "assistant",
                text: reply,
                actions: actions?.length ? actions : undefined,
                status: actions?.length ? "pending" : undefined,
            });
        } catch (err: any) {
            push({
                role: "assistant",
                isError: true,
                text:
                    err.message === "Failed to fetch"
                        ? "Can't reach the server. Make sure the backend is running, then try again."
                        : err.message || "Something went wrong. Please try again.",
            });
        } finally {
            setSending(false);
        }
    };

    const handleConfirm = async (msg: ChatMessage) => {
        if (!msg.actions) return;
        setExecutingId(msg.id);
        try {
            const res = await executeChatActions(msg.actions);
            const results = res.data.results as ActionResult[];
            patch(msg.id, { status: "done", results });
            if (results.some((r) => r.ok)) notifyDataChanged();
            push({
                role: "assistant",
                text: results.some((r) => !r.ok) ? "Some actions failed. See the details above." : "Saved ✅",
            });
        } catch (err: any) {
            push({ role: "assistant", isError: true, text: err.message || "Failed to run the actions." });
        } finally {
            setExecutingId(null);
        }
    };

    return (
        <>
            {/* Tombol melayang (di atas bottom navigation pada mobile) */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? "Close assistant" : "Open assistant"}
                className="fixed z-40 right-4 bottom-24 md:right-6 md:bottom-6 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
            >
                {open ? <X className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </button>

            {open && (
                <div className="fixed z-40 inset-x-3 bottom-40 md:inset-x-auto md:right-6 md:bottom-24 md:w-96 h-[60vh] md:h-[32rem] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">Finora Assistant</p>
                            <p className="text-[10px] text-slate-500">Record income, expenses, moves, and categories</p>
                        </div>
                    </div>

                    {/* Pesan */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {messages.map((m) => (
                            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className="max-w-[85%] space-y-2">
                                    <div
                                        className={`px-3 py-2 rounded-2xl text-xs whitespace-pre-line ${m.role === "user"
                                            ? "bg-emerald-600 text-white rounded-br-sm"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm"
                                            }`}
                                    >
                                        {m.text}
                                    </div>

                                    {/* Kartu konfirmasi */}
                                    {m.actions && (
                                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 space-y-2 bg-white dark:bg-slate-900">
                                            <ul className="space-y-1">
                                                {(m.results ?? m.actions.map((a) => ({ ok: true, text: a.summary }))).map((r, i) => (
                                                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-slate-200">
                                                        {m.status === "done" ? (
                                                            r.ok ? (
                                                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                                            ) : (
                                                                <X className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                                                            )
                                                        ) : (
                                                            <span className="text-slate-400">•</span>
                                                        )}
                                                        <span className={m.status === "done" && !r.ok ? "text-rose-600" : ""}>{r.text}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            {m.status === "pending" && (
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleConfirm(m)}
                                                        disabled={executingId === m.id}
                                                        className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold disabled:opacity-50 cursor-pointer"
                                                    >
                                                        {executingId === m.id ? "Saving..." : "Save"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => patch(m.id, { status: "cancelled" })}
                                                        disabled={executingId === m.id}
                                                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
                                            {m.status === "cancelled" && <p className="text-[10px] text-slate-400">Cancelled</p>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {sending && <p className="text-[11px] text-slate-400 px-1">Typing...</p>}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-slate-100 dark:border-slate-800">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            maxLength={500}
                            placeholder="Type a message..."
                            className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                        <button
                            type="submit"
                            disabled={sending || !input.trim()}
                            aria-label="Send"
                            className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center disabled:opacity-50 cursor-pointer"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}