import "@/styles/globals.css";
import "@/styles/audio.css";
import "react-toastify/dist/ReactToastify.css";
import "react-tooltip/dist/react-tooltip.css";

import type { AppProps } from "next/app";
import Head from "next/head";

import "@/config/globals";

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <title>Kart.IO</title>
            </Head>
            <Component {...pageProps} />
        </>
    );
}
