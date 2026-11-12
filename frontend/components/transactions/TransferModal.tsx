"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowRight, ArrowUpDown, X } from "lucide-react";
import { Account, Category, Transfer } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

interface TransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Transfer | null;
    accounts: Account[];
    categories: Category[];
    onSubmit: (formData: any) => Promise<void>;
    loading: boolean;
}

// Today's date in the user's local time zone (YYYY-MM-DD)
const localToday = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
};

const fieldClass =
    "w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm";
const labelClass = "block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1";

export default function TransferModal({
    isOpen,
    onClose,
    initialData,
    accounts,
    categories,
    onSubmit,
    loading,
}: TransferModalProps) {
    const [fromId, setFromId] = useState("");
    const [toId, setToId] = useState("");
    const [amountDigits, setAmountDigits] = useState("");
    const [date, setDate] = useState(localToday());
    const [note, setNote] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Reset the form every time the modal opens
    useEffect(() => {
        if (!isOpen) return;
        setError(null);
        if (initialData) {
            setFromId(initialData.from_category_id ? String(initialData.from_category_id) : "");
            setToId(initialData.to_category_id ? String(initialData.to_category_id) : "");
            setAmountDigits(String(Math.round(Number(initialData.amount))));
            setDate(String(initialData.transfer_date).slice(0, 10));
            setNote(initialData.note || "");
        } else {
            setFromId("");
            setToId("");
            setAmountDigits("");
            setDate(localToday());
            setNote("");
        }
    }, [isOpen, initialData]);

    const accountNameOf = (c?: Category) => {
        if (!c) return "";
        return accounts.find((a) => a.id === c.account_id)?.name || c.account?.name || "No account";
    };

    // Categories grouped by their account, e.g. "Wallet" and "Bank Mandiri"
    const groups = useMemo(() => {
        const map = new Map<string, Category[]>();
        categories.forEach((c) => {
            const label = accounts.find((a) => a.id === c.account_id)?.name || c.account?.name || "No account";
            map.set(label, [...(map.get(label) || []), c]);
        });
        return Array.from(map.entries());
    }, [accounts, categories]);

    if (!isOpen) return null;

    const fromCategory = categories.find((c) => String(c.id) === fromId);
    const toCategory = categories.find((c) => String(c.id) === toId);
    const restoredAmount =
        initialData && String(initialData.from_category_id) === fromId
            ? Number(initialData.amount)
            : 0;
    const available = Number(fromCategory?.current_balance || 0) + restoredAmount;
    const amount = Number(amountDigits || 0);

    const renderOptions = (excludeId: string) =>
        groups.map(([label, list]) => {
            const items = list.filter((c) => String(c.id) !== excludeId);
            if (items.length === 0) return null;
            return (
                <optgroup key={label} label={label}>
                    {items.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name} · {formatCurrency(Number(c.current_balance || 0))}
                        </option>
                    ))}
                </optgroup>
            );
        });

    const handleSwap = () => {
        setFromId(toId);
        setToId(fromId);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!fromId || !toId) {
            setError("Please choose where the money comes from and where it goes.");
            return;
        }
        if (fromId === toId) {
            setError("Source and destination must be different.");
            return;
        }
        if (amount <= 0) {
            setError("Amount must be greater than 0.");
            return;
        }
        if (amount > available) {
            setError(`Insufficient balance in "${fromCategory?.name}". Available: ${formatCurrency(available)}.`);
            return;
        }

        try {
            await onSubmit({
                from_category_id: Number(fromId),
                to_category_id: Number(toId),
                amount,
                note: note.trim() || undefined,
                transfer_date: date,
            });
        } catch (err: any) {
            setError(err.message || "Failed to move money.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                    <div>
                        <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                            {initialData ? "Edit Move" : "Move Money"}
                        </h3>
                        <p className="text-xs text-slate-500">
                            Move funds between accounts, e.g. from your wallet to your bank
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="flex items-start gap-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3 rounded-xl">
                            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-rose-700 dark:text-rose-300 font-medium leading-relaxed">{error}</p>
                        </div>
                    )}

                    {/* From */}
                    <div>
                        <label className={labelClass}>From</label>
                        <select value={fromId} onChange={(e) => setFromId(e.target.value)} className={fieldClass}>
                            <option value="">Select source category</option>
                            {renderOptions(toId)}
                        </select>
                        {fromCategory && (
                            <p className="mt-1 text-[11px] text-slate-500">
                                Available: <span className="font-semibold">{formatCurrency(available)}</span>
                            </p>
                        )}
                    </div>

                    {/* Swap */}
                    <div className="flex justify-center -my-1">
                        <button
                            type="button"
                            onClick={handleSwap}
                            aria-label="Swap source and destination"
                            title="Swap"
                            className="p-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors cursor-pointer"
                        >
                            <ArrowUpDown className="w-4 h-4" />
                        </button>
                    </div>

                    {/* To */}
                    <div>
                        <label className={labelClass}>To</label>
                        <select value={toId} onChange={(e) => setToId(e.target.value)} className={fieldClass}>
                            <option value="">Select destination category</option>
                            {renderOptions(fromId)}
                        </select>
                    </div>

                    {/* Preview */}
                    {fromCategory && toCategory && (
                        <div className="flex items-center justify-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 px-3 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                            <span className="truncate">{accountNameOf(fromCategory)}</span>
                            <ArrowRight className="w-4 h-4 shrink-0" />
                            <span className="truncate">{accountNameOf(toCategory)}</span>
                        </div>
                    )}

                    {/* Amount */}
                    <div>
                        <div className="flex items-center justify-between">
                            <label className={labelClass}>Amount</label>
                            {fromCategory && available > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setAmountDigits(String(Math.floor(available)))}
                                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer mb-1"
                                >
                                    Use all
                                </button>
                            )}
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">Rp</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="0"
                                value={amount ? amount.toLocaleString("id-ID") : ""}
                                onChange={(e) => setAmountDigits(e.target.value.replace(/\D/g, ""))}
                                className={`${fieldClass} pl-10`}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Date</label>
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className={fieldClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Note (optional)</label>
                            <input
                                type="text"
                                placeholder="e.g. Deposit cash to bank"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className={fieldClass}
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {loading ? "Saving..." : initialData ? "Update Move" : "Move Money"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}