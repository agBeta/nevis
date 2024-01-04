import makeBlogView from "./blogs-view.js";
import makeRouter from "./router.js";

const routes = [
    { path: "/blog", pageView: makeBlogView() }
];


if (history.scrollRestoration) {
    history.scrollRestoration = "auto";
}
const Router = makeRouter({ routes });



