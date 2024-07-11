export { default } from "next-auth/middleware"

export const config = {
    matcher: ["/search"],
    pages: {
        signIn: "/signin"
    },
}