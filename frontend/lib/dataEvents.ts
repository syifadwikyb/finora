"use client";

import { useEffect } from "react";

const DATA_CHANGED_EVENT = "finora:data-changed";

export const notifyDataChanged = () => window.dispatchEvent(new Event(DATA_CHANGED_EVENT));

export function useOnDataChanged(callback: () => void) {
    useEffect(() => {
        window.addEventListener(DATA_CHANGED_EVENT, callback);
        return () => window.removeEventListener(DATA_CHANGED_EVENT, callback);
    }, [callback]);
}