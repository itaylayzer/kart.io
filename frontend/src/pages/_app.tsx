import "@/styles/globals.css";
import "@/styles/audio.css";
import "react-toastify/dist/ReactToastify.css";
import "react-tooltip/dist/react-tooltip.css";

import type { AppProps } from "next/app";
import Head from "next/head";

import "@/config/globals";
import { Tooltip } from "react-tooltip";
import { ToastContainer } from "react-toastify";

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
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
            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnHover
                pauseOnFocusLoss={false}
                closeButton={false}
                theme="dark"
            />
            <Component {...pageProps} />
        </>
    );
}
