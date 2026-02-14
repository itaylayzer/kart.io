import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Credits() {
    const router = useRouter();
    useEffect(() => {
        router.replace("/");
    }, [router]);
    return null;
}
