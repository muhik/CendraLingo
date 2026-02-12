import type { OpenNextConfig } from "@opennextjs/cloudflare";

const config: OpenNextConfig = {
    default: {
        override: {
            wrapper: "cloudflare-node",
            converter: "edge",
            proxyExternalRequest: "fetch",
            incrementalCache: "dummy",
            tagCache: "dummy",
            queue: "dummy",
        },
    },
    edgeExternals: ["node:crypto", "ws", "@libsql/isomorphic-ws", "@libsql/client", "@libsql/client/http", "@libsql/client/web"],
    middleware: {
        external: true,
        override: {
            wrapper: "cloudflare-edge",
            converter: "edge",
            proxyExternalRequest: "fetch",
            incrementalCache: "dummy",
            tagCache: "dummy",
            queue: "dummy",
        },
    },
};

export default config;
