import "reflect-metadata";

import "@/styles/globals.css";
import "@/styles/audio.css";
import "react-tooltip/dist/react-tooltip.css";

import type { AppProps } from "next/app";
import Head from "next/head";

import "@/config/globals";
import { Tooltip } from "react-tooltip";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

export default function App({ Component, pageProps }: AppProps) {
    return (
        <ThemeProvider attribute="class" defaultTheme="dark">
            <Head>
                <title>Kart.IO</title>
            </Head>
            <Tooltip
                id="t"
                style={{
                    backgroundColor: "#020202",
                    zIndex: 3,
                    fontFamily: "monospace",
                    color: "white",
                    opacity: 1,
                    fontWeight: 400,
                }}
            />
            <Toaster position="bottom-right" theme="dark" />
            <Component {...pageProps} />
        </ThemeProvider>
    );
}
