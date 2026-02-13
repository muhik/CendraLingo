"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export const FacebookPixel = ({ pixelId }: { pixelId: string | null }) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        // Debug Pixel ID
        console.log("FacebookPixel: Initializing with ID:", pixelId);

        if (!pixelId || pixelId === "null" || pixelId === "undefined") {
            console.warn("FacebookPixel: Skipping init, invalid ID:", pixelId);
            return;
        }
        if (loaded) return;

        // Initialize Facebook Pixel
        // @ts-ignore
        !function (f, b, e, v, n, t, s)
        // @ts-ignore
        {
            if (f.fbq) return; n = f.fbq = function () {
                n.callMethod ?
                    n.callMethod.apply(n, arguments) : n.queue.push(arguments)
            };
            // @ts-ignore
            if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
            // @ts-ignore
            n.queue = []; t = b.createElement(e); t.async = !0;
            // @ts-ignore
            t.src = v; s = b.getElementsByTagName(e)[0];
            // @ts-ignore
            s.parentNode.insertBefore(t, s)
        }(window, document, 'script',
            'https://connect.facebook.net/en_US/fbevents.js');

        // @ts-ignore
        window.fbq('init', pixelId);
        // @ts-ignore
        window.fbq('track', 'PageView');

        console.log("FacebookPixel: Initialized Successfully!");

        setLoaded(true);
    }, [pixelId, loaded]);

    // Track PageView on route change (SPA)
    useEffect(() => {
        if (!loaded || !pixelId) return;
        console.log("FacebookPixel: Tracking PageView (Route Change)");
        // @ts-ignore
        window.fbq('track', 'PageView');
    }, [pathname, searchParams, loaded, pixelId]);

    return null;
};

// Helper utility to track custom events
export const trackPixelEvent = (eventName: string, data?: object) => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
        console.log(`FacebookPixel: Tracking Event '${eventName}'`, data);
        (window as any).fbq('track', eventName, data);
    } else {
        console.warn(`FacebookPixel: Failed to track '${eventName}' - fbq not found`);
    }
};
