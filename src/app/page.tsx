"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {

    if (status === "authenticated") {

      const redirectUrl = (session?.user as any)?.menuBlade?.redirectUrl;

      if (redirectUrl) {
        router.push(redirectUrl);
      }

    }

  }, [session, status, router]);

  return (

    <div className="h-screen flex items-center justify-center bg-black">

      <div className="bg-zinc-900 p-10 rounded-xl text-center">

        <h1 className="text-white text-3xl mb-6">
          Trident Placement Portal
        </h1>

        <button
          onClick={() => signIn("azure-ad")}
          className="bg-blue-600 px-6 py-3 text-white rounded-lg"
        >
          Login with Microsoft
        </button>

      </div>

    </div>

  );
}