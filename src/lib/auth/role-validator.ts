import "server-only";

import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/options";

interface User {
  accessToken: string;
  role: string;
}

export default async function authValidator(): Promise<{
  session: boolean;
  role: string | undefined;
  token: string | undefined;
}> {

  const session = (await getServerSession(authOptions)) as { user: User };

  if (!session || !session.user) {

    return {
      session: false,
      role: undefined,
      token: undefined
    };

  } else {

    return {
      session: true,
      role: session.user.role,
      token: session.user.accessToken
    };
  }
}