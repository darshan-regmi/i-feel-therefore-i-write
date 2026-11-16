// `/` keeps rendering the home experience while `/home` is the named route
// and canonical URL.
export { metadata, default } from "./home/page";

export const revalidate = 300;
export const runtime = "edge";
