import Upload from "./views/Upload";
import Display from "./views/Display";

/**
 * Converts the path to a regex expression.
 * @param {*} path
 * @returns
 */
const pathToRegex = (path) =>
  new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const getParams = (match) => {
  const values = match.result.slice(1);
  const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(
    (result) => result[1]
  );

  return Object.fromEntries(
    keys.map((key, i) => {
      return [key, values[i]];
    })
  );
};

export const navigateTo = (url) => {
  history.pushState(null, null, url);
  router();
};

const router = async () => {
  const routes = [
    { path: "/", view: Upload },
    { path: "/display", view: Display },
  ];

  // Test each route for potential match
  const potentialMatches = routes.map((route) => {
    return {
      route: route,
      result: location.pathname.match(pathToRegex(route.path)),
    };
  });

  let match = potentialMatches.find(
    (potentialMatch) => potentialMatch.result !== null
  );

  if (!match) {
    match = {
      route: routes[0],
      result: [location.pathname],
    };
    console.log(match);
  }

  const view = new match.route.view(getParams(match));

  /**
   * Updates the HTML in the document.
   */
  document.querySelector("#app").innerHTML = await view.getHtml();

  /**
   * Add listeners for the screens.
   */
  view.setupListeners();
};

/**
 * Allows automatic change in screeen when the back/forward button are pressed.
 */
window.addEventListener("popstate", router);

/**
 * Calls the router once the initial HTML document has been loaded.
 */
document.addEventListener("DOMContentLoaded", () => {
  router();
});
