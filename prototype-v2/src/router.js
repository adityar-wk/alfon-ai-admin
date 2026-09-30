// Minimal hash-based router, replacing react-router-dom (whose UMD build needs two
// extra CDN packages — react-router + @remix-run/router — wired as globals, which is
// too brittle for a no-build CDN prototype). Behaves like the small subset of
// react-router-dom this app actually uses: current path + navigate().

function getHashPath() {
  const hash = window.location.hash.replace(/^#/, "");
  return hash || "/";
}

function useHashRoute() {
  const [path, setPath] = React.useState(getHashPath());
  React.useEffect(() => {
    const onChange = () => setPath(getHashPath());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return path;
}

function navigateTo(path) {
  window.location.hash = path;
}

function navigateToTask(taskId) {
  window.pendingTaskId = taskId;
  navigateTo("/tasks");
}

function navigateToGuest(guestId) {
  window.pendingGuestId = guestId;
  navigateTo("/guests");
}

window.useHashRoute = useHashRoute;
window.navigateTo = navigateTo;
window.navigateToTask = navigateToTask;
window.navigateToGuest = navigateToGuest;
