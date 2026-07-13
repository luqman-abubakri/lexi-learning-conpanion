import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);
const isProtectedRoute = createRouteMatcher([
  '/companions(.*)',
  '/my-journey(.*)',
  '/subscription(.*)',
]);

const middleware = clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request) || (!isPublicRoute(request) && request.nextUrl.pathname !== '/')) {
    await auth.protect();
  }
});

export default middleware;
export { middleware };

export const config = {
  matcher: [
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
};
