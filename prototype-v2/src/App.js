const SCREENS = {
  "/": HomeScreen,
  "/chats": ChatsScreen,
  "/tasks": TasksScreen,
  "/pre-arrival": PreArrivalScreen,
  "/housekeeping": HousekeepingScreen,
  "/guests": GuestsScreen,
  "/team": TeamScreen,
  "/analytics": AnalyticsScreen,
  "/departments": DepartmentsScreen,
  "/reports": ReportsScreen,
  "/settings": SettingsScreen,
};

function AppLayout() {
  const path = window.useHashRoute();
  const ActiveScreen = SCREENS[path] || HomeScreen;
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <ActiveScreen />
      </div>
    </div>
  );
}

function App() {
  return <AppLayout />;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
