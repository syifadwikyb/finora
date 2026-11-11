"use client";

import { useState, useCallback } from "react";
import SplashScreen from "./SplashScreen";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const [showSplash, setShowSplash] = useState(true);
    const handleFinish = useCallback(() => setShowSplash(false), []);

    return (
        <>
            {showSplash && <SplashScreen onFinish={handleFinish} />}
            {children}
        </>
    );
}