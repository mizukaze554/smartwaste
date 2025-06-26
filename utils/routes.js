// utils/routes.js
import { Home } from '../users/home.js';

// Map route paths to classes (or functions)
export const routes = {
  '/users/dashboard': Home,
};

// Function to resolve route and render
export function loadRoute(path) {
  const View = routes[path];
  if (View) {
    document.body.innerHTML = ''; // Clear body
    history.replaceState({}, '', path); // Sync URL
    new View(); // Instantiate the class
  }
}
