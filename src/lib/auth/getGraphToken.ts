import "server-only";

import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/options";

interface GraphTokenResponse {
  access_token: string;
  expires_in: number;
}

export default async function getGraphToken(access_token: string): Promise<{
  graphToken: string | undefined;
}> {

  const session = await getServerSession(authOptions);

  if (!session) {
    return { graphToken: undefined };
  }

  try {

    const response = await fetch(process.env.AZURE_AD_TOKEN_URI!, {

      method: "POST",

      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },

      body: new URLSearchParams({

        client_id: process.env.AZURE_AD_CLIENT_ID as string,

        client_secret: process.env.AZURE_AD_CLIENT_SECRET as string,

        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",

        requested_token_use: "on_behalf_of",

        scope: "https://graph.microsoft.com/.default",

        assertion: access_token
      })
    });

    const data: GraphTokenResponse = await response.json();

    return { graphToken: data.access_token };

  } catch (error) {

    return { graphToken: undefined };
  }
}