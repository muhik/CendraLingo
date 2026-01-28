"use client";

import { useEffect, useRef } from "react";

interface ScriptRendererProps {
    html: string;
    className?: string;
}

export const ScriptRenderer = ({ html, className }: ScriptRendererProps) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const doc = iframe.contentWindow?.document;
        if (!doc) return;

        // Reset content
        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <style>
                        body { margin: 0; padding: 0; overflow: hidden; display: flex; justify-content: center; align-items: center; }
                    </style>
                </head>
                <body>
                    <div id="ad-container">${html}</div>
                    <script>
                        // Resize iframe to fit content
                        const resizeObserver = new ResizeObserver(() => {
                            const height = document.body.scrollHeight;
                            window.parent.postMessage({ type: 'ad-resize', height }, '*');
                        });
                        resizeObserver.observe(document.body);
                    </script>
                </body>
            </html>
        `);
        doc.close();

    }, [html]);

    return (
        <iframe
            ref={iframeRef}
            className={className}
            style={{ width: '100%', border: 'none', minHeight: '600px', overflow: 'hidden' }}
            title="Ad Content"
        />
    );
};
// Trigger Rebuild: Force Cloudflare to re-process this file
