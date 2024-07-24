export { default } from "next-auth/middleware"

export const config = {
    matcher: ["/search", "/browse", "/discover", "/discover/:genre/:path"],
    pages: {
        signIn: "/signin"
    },
}