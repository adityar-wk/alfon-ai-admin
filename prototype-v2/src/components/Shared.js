// Each screen file is loaded via a separate indirect eval() call (see index.html),
// and top-level const/let bindings don't survive past the eval that created them —
// only assignments to `window` persist across files. So Recharts pieces are attached
// to window here, and every screen reads them off window instead of destructuring locally.
window.LineChart = Recharts.LineChart;
window.Line = Recharts.Line;
window.BarChart = Recharts.BarChart;
window.Bar = Recharts.Bar;
window.AreaChart = Recharts.AreaChart;
window.Area = Recharts.Area;
window.PieChart = Recharts.PieChart;
window.Pie = Recharts.Pie;
window.Cell = Recharts.Cell;
window.XAxis = Recharts.XAxis;
window.YAxis = Recharts.YAxis;
window.Tooltip = Recharts.Tooltip;
window.ResponsiveContainer = Recharts.ResponsiveContainer;
window.CartesianGrid = Recharts.CartesianGrid;
const { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } = window;

function Card({ className = "", hover = true, children }) {
  const hasPadding = /\bp[trblxy]?-\d/.test(className);
  return (
    <div className={`alfon-card ${hover ? "alfon-card-hover" : ""} ${hasPadding ? "" : "p-6"} ${className}`}>
      {children}
    </div>
  );
}
window.Card = Card;

function StatCard({ icon, label, value, sub, subColor }) {
  const trendColor = subColor === "text-success" ? "#22C55E" : subColor === "text-orange" ? "#EF4444" : "#9CA3AF";
  return (
    <Card style={{ padding: "20px 24px" }}>
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
        style={{ background: "#FFFFFF", border: "1px solid rgba(232,98,58,0.25)" }}
      >
        <Icon name={icon} size={18} color="#E8623A" />
      </div>
      <div className="text-sm" style={{ color: "#6B7280" }}>{label}</div>
      <div className="font-display font-bold leading-tight mt-0.5" style={{ fontSize: 28, color: "#1A1A1A" }}>{value}</div>
      {sub && (
        <div className="text-xs font-medium mt-1" style={{ color: trendColor }}>{sub}</div>
      )}
    </Card>
  );
}
window.StatCard = StatCard;

function Sparkline({ data, color = "#E8623A" }) {
  const points = data.map((v, i) => ({ i, v }));
  return (
    <div className="w-full h-10">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
window.Sparkline = Sparkline;

function TrendArrow({ trend }) {
  if (trend === "up") return <Icon name="TrendingUp" size={14} color="#22C55E" />;
  if (trend === "down") return <Icon name="TrendingDown" size={14} color="#EF4444" />;
  return <Icon name="Minus" size={14} color="#9CA3AF" />;
}
window.TrendArrow = TrendArrow;

function EmptyState({ icon = "Sparkles", title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: "#FFF4F0" }}>
        <Icon name={icon} size={26} color="#E8623A" />
      </div>
      <div className="font-display font-semibold mb-1" style={{ color: "#1A1A1A" }}>{title}</div>
      <div className="text-sm max-w-xs" style={{ color: "#6B7280" }}>{desc}</div>
    </div>
  );
}
window.EmptyState = EmptyState;

function Modal({ open, onClose, title, children, width = "max-w-lg" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={onClose}>
      <div className={`bg-card rounded-2xl shadow-xl w-full ${width} max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #F0F0F0" }}>
          <h3 className="font-display font-semibold" style={{ color: "#1A1A1A" }}>{title}</h3>
          <button onClick={onClose} className="alfon-btn p-1 rounded hover:bg-lightgray">
            <Icon name="X" size={18} color="#9CA3AF" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
window.Modal = Modal;

const PRIORITY_STYLE = {
  High: { bg: "#FFF4F0", color: "#E8623A", dot: "#E8623A" },
  Medium: { bg: "#FFF9EC", color: "#D97706", dot: "#D97706" },
  Low: { bg: "#F0FDF4", color: "#22C55E", dot: "#22C55E" },
};

function PriorityBadge({ priority }) {
  const s = PRIORITY_STYLE[priority] || PRIORITY_STYLE.Low;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
      {priority}
    </span>
  );
}
window.PriorityBadge = PriorityBadge;

const STATUS_STYLE = {
  Open: { bg: "#FFF4F0", color: "#E8623A" },
  "In Progress": { bg: "#FFF9EC", color: "#D97706" },
  Pending: { bg: "#F5F5F5", color: "#6B7280" },
  Completed: { bg: "#F0FDF4", color: "#22C55E" },
  Resolved: { bg: "#F0FDF4", color: "#22C55E" },
  "Pre-Arrival": { bg: "#EFF6FF", color: "#2563EB" },
  Void: { bg: "#F5F5F5", color: "#9CA3AF" },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || { bg: "#F5F5F5", color: "#6B7280" };
  return (
    <span className="inline-flex text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}
window.StatusBadge = StatusBadge;

function ComplaintBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
      style={{ background: "#FEF2F2", color: "#DC2626" }}
      title="Logged as a guest complaint"
    >
      <Icon name="AlertTriangle" size={10} color="#DC2626" /> Complaint
    </span>
  );
}
window.ComplaintBadge = ComplaintBadge;

function Avatar({ initials, photo, size = 10, vip = false }) {
  return (
    <div className="relative shrink-0">
      {photo ? (
        <img
          src={photo}
          alt=""
          className="rounded-full object-cover"
          style={{ width: size * 4, height: size * 4 }}
        />
      ) : (
        <div
          className="rounded-full flex items-center justify-center font-semibold font-display"
          style={{ width: size * 4, height: size * 4, fontSize: size * 1.3, background: "#FFF4F0", color: "#E8623A" }}
        >
          {initials}
        </div>
      )}
      {vip && (
        <span
          className="absolute -bottom-1 -right-1 text-[9px] font-bold rounded-full px-1 py-0.5 leading-none"
          style={{ background: "#F3F0FF", color: "#7C3AED" }}
        >
          VIP
        </span>
      )}
    </div>
  );
}
window.Avatar = Avatar;
