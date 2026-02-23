"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";    

export default function IOPage() {
    const router = useRouter();
    useEffect(() => {
        router.push("/io/console");
    }, [router]);
    return null;
}

