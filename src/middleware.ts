// import { withAuth } from "next-auth/middleware";
// import { NextResponse } from "next/server";

// interface MenuBlade {
//   redirectUrl: string;
//   allowedRoutes: string[];
// }

// export default withAuth(

//   async function middleware(req) {

//     const token: any = req.nextauth.token;

//     if (!token) {
//       return NextResponse.redirect(new URL("/", req.url));
//     }

//     const menuBlade = token?.menuBlade as MenuBlade;

//     const { redirectUrl, allowedRoutes } = menuBlade;

//     const requestedPath = req.nextUrl.pathname;

//     const isRouteAllowed = allowedRoutes.some((route: string) => {

//       const routeRegex = new RegExp(
//         `^${route.replace(/:[^/]+/g, "[^/]+")}$`
//       );

//       return routeRegex.test(requestedPath);
//     });

//     if (!isRouteAllowed) {

//       return NextResponse.redirect(
//         new URL(redirectUrl, req.url)
//       );
//     }

//     return NextResponse.next();
//   },

//   {
//     callbacks: {
//       authorized: ({ token }) => !!token,
//     },
//   }
// );

// export const config = {

//   matcher: [
//     "/dashboard/:path*",
//     "/drives/:path*",
//     "/applications/:path*",
//     "/notifications/:path*",
//     "/profile/:path*",
//     "/admin/:path*",
//     "/tpo/:path*",
//   ],
// };
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

interface MenuBlade {
  redirectUrl: string;
  allowedRoutes: string[];
}

export default withAuth(
  async function middleware(req) {

    const token: any = req.nextauth.token;

    if (!token) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const menuBlade = token?.menuBlade as MenuBlade | undefined;

    // If no role data → allow
    if (!menuBlade) {
      return NextResponse.next();
    }

    const { redirectUrl, allowedRoutes } = menuBlade;
    const requestedPath = req.nextUrl.pathname;


    const isAllowed = allowedRoutes.some((route: string) =>
      requestedPath.startsWith(route)
    );

  
    if (!isAllowed) {
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/student/:path*",
    "/tpo/:path*",
  ],
};