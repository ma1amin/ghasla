import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpLeft,
  BarChart3,
  Bell,
  Bolt,
  Box,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Car,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  CreditCard,
  Crown,
  Droplets,
  FileText,
  Gauge,
  Gift,
  Handshake,
  LayoutDashboard,
  Megaphone,
  Menu,
  Package,
  Palette,
  PanelRight,
  Percent,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  TicketCheck,
  Trash2,
  TrendingUp,
  UserRound,
  Users,
  WalletCards,
  WashingMachine,
  X,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useMemo, useState } from "react";

type Role = "owner" | "manager" | "cashier" | "ops" | "customer";
type NavKey =
  | "overview"
  | "pos"
  | "operations"
  | "transactions"
  | "branches"
  | "customers"
  | "loyalty"
  | "subscriptions"
  | "referrals"
  | "partners"
  | "campaigns"
  | "services"
  | "shifts"
  | "employees"
  | "analytics"
  | "growth"
  | "brand"
  | "settings"
  | "customer";
type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

type Service = { id: string; name: string; description: string; price: number; icon: "wash" | "sparkle" | "car" | "shield" };
type Customer = {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  plate: string;
  branch: string;
  status: string;
  visits: number;
  spend: number;
  points: number;
  reserved: number;
  source: string;
  lastVisit: string;
  package?: string;
};
type Invoice = {
  id: string;
  customerId: string;
  customer: string;
  service: string;
  branch: string;
  amount: number;
  gross: number;
  discount: number;
  payment: string;
  status: "مدفوعة" | "ملغاة";
  time: string;
  points: number;
  source?: string;
};
type Ticket = { id: string; invoiceId: string; customer: string; vehicle: string; service: string; branch: string; status: string; started: string; employee: string };
type Ledger = { id: string; customer: string; type: string; points: number; reason: string; reference: string; time: string };
type DemoState = {
  customers: Customer[];
  services: Service[];
  invoices: Invoice[];
  tickets: Ticket[];
  ledger: Ledger[];
  partners: { id: string; name: string; category: string; code: string; registrations: number; customers: number; conversions: number; revenue: number; status: string }[];
  campaigns: { id: string; name: string; segment: string; offer: string; status: string; redemptions: number }[];
  reservation: { id: string; customerId: string; reward: string; cost: number; code: string; status: "محجوز" | "مستخدم" | "ملغى" } | null;
  shift: { status: "مفتوحة" | "مغلقة"; opening: number; openedAt: string; actual?: number };
};

const STORAGE_KEY = "ghasla-demo-state-v3";
const ROLES: { id: Role; label: string; name: string }[] = [
  { id: "owner", label: "مالك الأعمال", name: "سارة العتيبي" },
  { id: "manager", label: "مدير الفرع", name: "نواف الحربي" },
  { id: "cashier", label: "كاشير", name: "خالد المطيري" },
  { id: "ops", label: "موظف عمليات", name: "يوسف الشهري" },
  { id: "customer", label: "عميل", name: "عبدالله السالم" },
];
const statusOrder = ["استلام", "انتظار", "غسيل", "فحص", "جاهز", "تم التسليم"];
const branches = ["كل الفروع", "فرع النخيل", "فرع الملقا", "فرع الياسمين"];
const SAR = (value: number) => `${new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 0 }).format(Math.round(value))} ر.س`;
const NUM = (value: number) => new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 0 }).format(value);

const seedData = (): DemoState => ({
  customers: [
    { id: "c1", name: "عبدالله السالم", phone: "05 5123 7846", vehicle: "تويوتا كامري 2022", plate: "أ ب د 4821", branch: "فرع النخيل", status: "متكرر", visits: 18, spend: 785, points: 640, reserved: 0, source: "مباشر", lastVisit: "منذ يومين", package: "الباقة الشهرية" },
    { id: "c2", name: "ريم القحطاني", phone: "05 6981 2234", vehicle: "لكزس ES 2021", plate: "ر ج م 9032", branch: "فرع الملقا", status: "نشط", visits: 8, spend: 390, points: 285, reserved: 0, source: "FUEL10", lastVisit: "منذ 6 أيام" },
    { id: "c3", name: "تركي الغامدي", phone: "05 7432 1108", vehicle: "هيونداي سوناتا 2023", plate: "ط ك ي 1160", branch: "فرع النخيل", status: "معرض للخطر", visits: 4, spend: 180, points: 90, reserved: 0, source: "إحالة", lastVisit: "منذ 31 يومًا" },
    { id: "c4", name: "مشاعل الدوسري", phone: "05 8821 4490", vehicle: "كيا سبورتاج 2024", plate: "م س ل 7741", branch: "فرع الياسمين", status: "جديد", visits: 1, spend: 70, points: 70, reserved: 0, source: "إنستغرام", lastVisit: "اليوم" },
    { id: "c5", name: "فيصل الشمري", phone: "05 4312 9907", vehicle: "فورد إكسبلورر 2020", plate: "ف ش ر 6217", branch: "فرع الملقا", status: "نشط", visits: 11, spend: 540, points: 410, reserved: 0, source: "محطة وقود", lastVisit: "منذ 9 أيام" },
  ],
  services: [
    { id: "s1", name: "غسيل خارجي", description: "تنظيف سريع ولمعة نهائية", price: 25, icon: "wash" },
    { id: "s2", name: "غسيل داخلي + خارجي", description: "التجربة الأكثر طلبًا", price: 40, icon: "car" },
    { id: "s3", name: "الغسيل الفاخر", description: "عناية كاملة وحماية", price: 70, icon: "sparkle" },
    { id: "s4", name: "تلميع السيارة", description: "لمعة احترافية تدوم", price: 150, icon: "shield" },
  ],
  invoices: [
    { id: "INV-2026-1048", customerId: "c1", customer: "عبدالله السالم", service: "الغسيل الفاخر", branch: "فرع النخيل", amount: 70, gross: 70, discount: 0, payment: "بطاقة", status: "مدفوعة", time: "اليوم، 10:42", points: 70, source: "مباشر" },
    { id: "INV-2026-1047", customerId: "c2", customer: "ريم القحطاني", service: "غسيل داخلي + خارجي", branch: "فرع الملقا", amount: 36, gross: 40, discount: 4, payment: "بطاقة", status: "مدفوعة", time: "اليوم، 10:18", points: 36, source: "FUEL10" },
    { id: "INV-2026-1046", customerId: "c4", customer: "مشاعل الدوسري", service: "الغسيل الفاخر", branch: "فرع الياسمين", amount: 70, gross: 70, discount: 0, payment: "نقدي", status: "مدفوعة", time: "اليوم، 09:56", points: 70, source: "إنستغرام" },
    { id: "INV-2026-1045", customerId: "c5", customer: "فيصل الشمري", service: "غسيل خارجي", branch: "فرع الملقا", amount: 25, gross: 25, discount: 0, payment: "نقدي", status: "مدفوعة", time: "اليوم، 09:34", points: 25, source: "محطة وقود" },
    { id: "INV-2026-1044", customerId: "c3", customer: "تركي الغامدي", service: "غسيل داخلي + خارجي", branch: "فرع النخيل", amount: 40, gross: 40, discount: 0, payment: "تحويل", status: "مدفوعة", time: "أمس، 19:12", points: 40, source: "إحالة" },
  ],
  tickets: [
    { id: "T-881", invoiceId: "INV-2026-1048", customer: "عبدالله السالم", vehicle: "تويوتا كامري · أ ب د 4821", service: "الغسيل الفاخر", branch: "فرع النخيل", status: "فحص", started: "18 د", employee: "يوسف الشهري" },
    { id: "T-880", invoiceId: "INV-2026-1047", customer: "ريم القحطاني", vehicle: "لكزس ES · ر ج م 9032", service: "داخلي + خارجي", branch: "فرع الملقا", status: "غسيل", started: "12 د", employee: "بدر العتيبي" },
    { id: "T-879", invoiceId: "INV-2026-1046", customer: "مشاعل الدوسري", vehicle: "كيا سبورتاج · م س ل 7741", service: "الغسيل الفاخر", branch: "فرع الياسمين", status: "جاهز", started: "23 د", employee: "سلمان الحربي" },
    { id: "T-878", invoiceId: "INV-2026-1045", customer: "فيصل الشمري", vehicle: "فورد إكسبلورر · ف ش ر 6217", service: "غسيل خارجي", branch: "فرع الملقا", status: "تم التسليم", started: "16 د", employee: "عبدالرحمن" },
    { id: "T-877", invoiceId: "INV-2026-1044", customer: "تركي الغامدي", vehicle: "هيونداي سوناتا · ط ك ي 1160", service: "داخلي + خارجي", branch: "فرع النخيل", status: "انتظار", started: "7 د", employee: "—" },
  ],
  ledger: [
    { id: "L-44", customer: "عبدالله السالم", type: "مكتسبة", points: 70, reason: "فاتورة INV-2026-1048", reference: "INV-2026-1048", time: "اليوم، 10:42" },
    { id: "L-43", customer: "ريم القحطاني", type: "مكتسبة", points: 36, reason: "فاتورة INV-2026-1047", reference: "INV-2026-1047", time: "اليوم، 10:18" },
    { id: "L-42", customer: "مشاعل الدوسري", type: "ترحيبية", points: 70, reason: "أول زيارة", reference: "INV-2026-1046", time: "اليوم، 09:56" },
    { id: "L-41", customer: "عبدالله السالم", type: "إحالة", points: 100, reason: "إحالة عميل جديد", reference: "REF-183", time: "أمس، 17:20" },
  ],
  partners: [
    { id: "p1", name: "محطات وقود درب", category: "محطة وقود", code: "FUEL10", registrations: 184, customers: 126, conversions: 88, revenue: 4680, status: "نشط" },
    { id: "p2", name: "زيوت بلس", category: "زيوت وصيانة", code: "OIL15", registrations: 93, customers: 61, conversions: 39, revenue: 2120, status: "نشط" },
    { id: "p3", name: "أسطول نجد", category: "أسطول شركات", code: "NAJD-FLEET", registrations: 41, customers: 28, conversions: 22, revenue: 3950, status: "قيد المراجعة" },
  ],
  campaigns: [
    { id: "CMP-1", name: "ارجع وخذ اللمعة", segment: "غير نشط 30 يومًا", offer: "خصم 20%", status: "نشطة", redemptions: 48 },
    { id: "CMP-2", name: "زيارة ثانية بلا انتظار", segment: "زوار أول مرة", offer: "نقاط مضاعفة", status: "مجدولة", redemptions: 0 },
    { id: "CMP-3", name: "اشتراكك على وشك الانتهاء", segment: "اشتراكات منتهية قريبًا", offer: "ترقية مجانية", status: "متوقفة", redemptions: 31 },
  ],
  reservation: null,
  shift: { status: "مفتوحة", opening: 500, openedAt: "اليوم، 07:30" },
});

const loadState = (): DemoState => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as DemoState;
  } catch { /* use seed */ }
  return seedData();
};

const iconForService = (kind: Service["icon"]) => {
  if (kind === "car") return <Car />;
  if (kind === "sparkle") return <Sparkles />;
  if (kind === "shield") return <ShieldCheck />;
  return <Droplets />;
};

const toneFor = (value: string): StatusTone => {
  if (["مدفوعة", "نشطة", "تم التسليم", "جاهز", "نشط", "مفتوحة", "مكتسبة", "مستخدم"].includes(value)) return "success";
  if (["ملغاة", "متوقفة", "معرض للخطر", "مغلقة", "غير متاح"].includes(value)) return "danger";
  if (["انتظار", "غسيل", "فحص", "قيد المراجعة", "مجدولة", "محجوز"].includes(value)) return "warning";
  if (["جديد", "استلام"].includes(value)) return "info";
  return "neutral";
};

function Badge({ children, tone }: { children: React.ReactNode; tone?: StatusTone }) {
  return <span className={`status-badge ${tone ?? toneFor(String(children))}`}>{children}</span>;
}

function PageHead({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  return <div className="page-head"><div><h1>{title}</h1><p>{subtitle}</p></div>{action && <div className="head-actions">{action}</div>}</div>;
}

function PanelHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return <div className="panel-header"><div><div className="panel-title">{title}</div>{subtitle && <div className="panel-subtitle">{subtitle}</div>}</div>{action}</div>;
}

function KpiCard({ label, value, foot, icon, tone = "good" }: { label: string; value: string; foot: string; icon: React.ReactNode; tone?: "good" | "warn" | "neutral" }) {
  return <div className="kpi-card"><div className="kpi-top"><span className="kpi-label">{label}</span><span className="kpi-icon">{icon}</span></div><div className="kpi-value">{value}</div><div className={`kpi-foot ${tone === "neutral" ? "neutral" : tone === "warn" ? "warn" : ""}`}>{tone === "good" ? <ArrowUpLeft size={12} /> : tone === "warn" ? <AlertTriangle size={12} /> : <Activity size={12} />}{foot}</div></div>;
}

function Empty({ text }: { text: string }) { return <div className="empty-state"><Box size={24} />{text}</div>; }

export default function Home() {
  const [state, setState] = useState<DemoState>(loadState);
  const [role, setRole] = useState<Role>("owner");
  const [activeNav, setActiveNav] = useState<NavKey>("overview");
  const [branch, setBranch] = useState("كل الفروع");
  const [toast, setToast] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("c1");
  const [posSearch, setPosSearch] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("s2");
  const [payment, setPayment] = useState("بطاقة");
  const [rewardApplied, setRewardApplied] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [editingService, setEditingService] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState("الرئيسية");
  const [actualCash, setActualCash] = useState("635");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const roleInfo = ROLES.find((item) => item.id === role) ?? ROLES[0];
  const selectedCustomer = state.customers.find((customer) => customer.id === selectedCustomerId) ?? state.customers[0];
  const selectedService = state.services.find((service) => service.id === selectedServiceId) ?? state.services[0];
  const paidInvoices = state.invoices.filter((invoice) => invoice.status === "مدفوعة");
  const todaySales = paidInvoices.slice(0, 4).reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalPoints = state.customers.reduce((sum, customer) => sum + customer.points, 0);
  const reservedPoints = state.customers.reduce((sum, customer) => sum + customer.reserved, 0);
  const completedWashes = state.tickets.filter((ticket) => ticket.status === "تم التسليم").length;
  const avgTicket = paidInvoices.length ? Math.round(paidInvoices.reduce((sum, invoice) => sum + invoice.amount, 0) / paidInvoices.length) : 0;
  const activeSubscriptions = state.customers.filter((customer) => customer.package).length;
  const partnerRevenue = state.partners.reduce((sum, partner) => sum + partner.revenue, 0);
  const allowedNav: NavKey[] = useMemo(() => {
    if (role === "customer") return ["customer"];
    if (role === "cashier") return ["pos", "operations", "transactions", "customers", "loyalty", "shifts"];
    if (role === "ops") return ["operations", "pos", "customers"];
    if (role === "manager") return ["overview", "pos", "operations", "transactions", "branches", "customers", "loyalty", "subscriptions", "partners", "campaigns", "services", "shifts", "analytics", "growth"];
    return ["overview", "pos", "operations", "transactions", "branches", "customers", "loyalty", "subscriptions", "referrals", "partners", "campaigns", "services", "shifts", "employees", "analytics", "growth", "brand", "settings"];
  }, [role]);

  useEffect(() => {
    if (!allowedNav.includes(activeNav)) setActiveNav(role === "customer" ? "customer" : allowedNav[0]);
  }, [activeNav, allowedNav, role]);

  const pushToast = (message: string) => setToast(message);
  const updateState = (updater: (current: DemoState) => DemoState) => setState((current) => updater(current));

  const completeSale = () => {
    const discount = rewardApplied && state.reservation?.status === "محجوز" ? selectedService.price : 0;
    const amount = Math.max(0, selectedService.price - discount);
    const nextInvoiceNumber = 1049 + state.invoices.length - 5;
    const id = `INV-2026-${nextInvoiceNumber}`;
    const ticketId = `T-${882 + state.tickets.length - 5}`;
    const earned = amount > 0 ? Math.floor(amount) : 0;
    updateState((current) => ({
      ...current,
      invoices: [{ id, customerId: selectedCustomer.id, customer: selectedCustomer.name, service: selectedService.name, branch: selectedCustomer.branch, amount, gross: selectedService.price, discount, payment: discount === selectedService.price ? "مكافأة" : payment, status: "مدفوعة", time: "الآن، 11:24", points: earned, source: selectedCustomer.source }, ...current.invoices],
      tickets: [{ id: ticketId, invoiceId: id, customer: selectedCustomer.name, vehicle: `${selectedCustomer.vehicle} · ${selectedCustomer.plate}`, service: selectedService.name, branch: selectedCustomer.branch, status: "استلام", started: "الآن", employee: roleInfo.name }, ...current.tickets],
      customers: current.customers.map((customer) => customer.id !== selectedCustomer.id ? customer : { ...customer, visits: customer.visits + 1, spend: customer.spend + amount, points: customer.points + earned, reserved: rewardApplied ? Math.max(0, customer.reserved - (current.reservation?.cost ?? 0)) : customer.reserved, lastVisit: "الآن" }),
      ledger: earned > 0 ? [{ id: `L-${current.ledger.length + 45}`, customer: selectedCustomer.name, type: "مكتسبة", points: earned, reason: `فاتورة ${id}`, reference: id, time: "الآن" }, ...current.ledger] : current.ledger,
      reservation: rewardApplied && current.reservation ? { ...current.reservation, status: "مستخدم" } : current.reservation,
    }));
    setRewardApplied(false);
    pushToast(`تم إنشاء الفاتورة ${id} وإضافة المركبة إلى الطابور`);
  };

  const reserveReward = () => {
    if (selectedCustomer.points < 300) {
      pushToast("الرصيد غير كافٍ لحجز هذه المكافأة");
      return;
    }
    if (state.reservation?.status === "محجوز") {
      pushToast("لدى العميل مكافأة محجوزة بالفعل");
      return;
    }
    updateState((current) => ({
      ...current,
      customers: current.customers.map((customer) => customer.id === selectedCustomer.id ? { ...customer, points: customer.points - 300, reserved: customer.reserved + 300 } : customer),
      reservation: { id: `RED-${Math.floor(1000 + Math.random() * 8999)}`, customerId: selectedCustomer.id, reward: "غسيل خارجي مجاني", cost: 300, code: `GH-${Math.floor(100000 + Math.random() * 899999)}`, status: "محجوز" },
      ledger: [{ id: `L-${current.ledger.length + 45}`, customer: selectedCustomer.name, type: "محجوزة", points: -300, reason: "حجز مكافأة غسيل خارجي", reference: "RED-PENDING", time: "الآن" }, ...current.ledger],
    }));
    pushToast("تم حجز المكافأة وإنشاء رمز التحقق");
  };

  const advanceTicket = (ticketId: string) => {
    updateState((current) => ({ ...current, tickets: current.tickets.map((ticket) => { if (ticket.id !== ticketId) return ticket; const index = statusOrder.indexOf(ticket.status); return { ...ticket, status: statusOrder[Math.min(index + 1, statusOrder.length - 1)] }; }) }));
    pushToast("تم تحديث حالة المركبة");
  };

  const cancelInvoice = (id: string) => {
    updateState((current) => ({ ...current, invoices: current.invoices.map((invoice) => invoice.id === id ? { ...invoice, status: "ملغاة" } : invoice) }));
    pushToast("تم إلغاء الفاتورة وتسجيل أثر العكس في السجل");
  };

  const updatePrice = (id: string, value: string) => {
    const price = Number(value);
    if (!Number.isNaN(price) && price > 0) updateState((current) => ({ ...current, services: current.services.map((service) => service.id === id ? { ...service, price } : service) }));
  };

  const resetDemo = () => {
    if (!window.confirm("إعادة بيانات العرض ستلغي التغييرات الحالية. هل تريد المتابعة؟")) return;
    setState(seedData());
    setSelectedCustomerId("c1");
    setRewardApplied(false);
    pushToast("تمت إعادة بيانات العرض الأصلية");
  };

  const navSections: { label: string; items: { id: NavKey; label: string; icon: React.ReactNode }[] }[] = [
    { label: "نظرة عامة", items: [{ id: "overview", label: "لوحة المؤشرات", icon: <LayoutDashboard /> }] },
    { label: "التشغيل", items: [
      { id: "pos", label: "نقطة البيع POS", icon: <WalletCards /> },
      { id: "operations", label: "طابور المركبات", icon: <WashingMachine /> },
      { id: "transactions", label: "المعاملات والفواتير", icon: <FileText /> },
      { id: "branches", label: "الفروع", icon: <Building2 /> },
    ] },
    { label: "العملاء والنمو", items: [
      { id: "customers", label: "العملاء والمركبات", icon: <Users /> },
      { id: "loyalty", label: "الولاء والمكافآت", icon: <Gift /> },
      { id: "subscriptions", label: "الاشتراكات والباقات", icon: <Package /> },
      { id: "referrals", label: "الإحالات", icon: <Handshake /> },
      { id: "partners", label: "الشركاء والأكواد", icon: <BriefcaseBusiness /> },
      { id: "campaigns", label: "الحملات والعروض", icon: <Megaphone /> },
    ] },
    { label: "الإدارة", items: [
      { id: "services", label: "الخدمات والأسعار", icon: <Tag /> },
      { id: "shifts", label: "الورديات والنقد", icon: <CircleDollarSign /> },
      { id: "employees", label: "الموظفون والصلاحيات", icon: <ShieldCheck /> },
      { id: "analytics", label: "التحليلات والتقارير", icon: <BarChart3 /> },
      { id: "growth", label: "ذكاء نمو الإيرادات", icon: <TrendingUp /> },
      { id: "brand", label: "تخصيص العلامة", icon: <Palette /> },
      { id: "settings", label: "الإعدادات", icon: <Settings /> },
    ] },
  ];

  const renderPage = () => {
    if (activeNav === "overview") return <Overview state={state} todaySales={todaySales} completedWashes={completedWashes} avgTicket={avgTicket} activeSubscriptions={activeSubscriptions} partnerRevenue={partnerRevenue} onNavigate={setActiveNav} />;
    if (activeNav === "pos") return <POS state={state} selectedCustomer={selectedCustomer} selectedService={selectedService} selectedCustomerId={selectedCustomerId} setSelectedCustomerId={setSelectedCustomerId} selectedServiceId={selectedServiceId} setSelectedServiceId={setSelectedServiceId} search={posSearch} setSearch={setPosSearch} rewardApplied={rewardApplied} setRewardApplied={setRewardApplied} payment={payment} setPayment={setPayment} completeSale={completeSale} />;
    if (activeNav === "operations") return <Operations state={state} advanceTicket={advanceTicket} />;
    if (activeNav === "transactions") return <Transactions state={state} cancelInvoice={cancelInvoice} />;
    if (activeNav === "customers") return <Customers state={state} selectedCustomerId={selectedCustomerId} setSelectedCustomerId={setSelectedCustomerId} search={customerSearch} setSearch={setCustomerSearch} onNavigate={setActiveNav} />;
    if (activeNav === "loyalty") return <Loyalty state={state} selectedCustomer={selectedCustomer} reserveReward={reserveReward} />;
    if (activeNav === "subscriptions") return <Subscriptions state={state} />;
    if (activeNav === "partners") return <Partners state={state} pushToast={pushToast} />;
    if (activeNav === "campaigns") return <Campaigns state={state} updateState={updateState} pushToast={pushToast} />;
    if (activeNav === "services") return <Services state={state} editingService={editingService} setEditingService={setEditingService} updatePrice={updatePrice} />;
    if (activeNav === "shifts") return <Shifts state={state} actualCash={actualCash} setActualCash={setActualCash} updateState={updateState} pushToast={pushToast} />;
    if (activeNav === "employees") return <Employees pushToast={pushToast} />;
    if (activeNav === "analytics") return <Analytics state={state} />;
    if (activeNav === "growth") return <Growth onNavigate={setActiveNav} pushToast={pushToast} />;
    if (activeNav === "brand") return <Brand pushToast={pushToast} />;
    if (activeNav === "settings") return <SettingsPage resetDemo={resetDemo} pushToast={pushToast} />;
    if (activeNav === "branches") return <Branches state={state} />;
    if (activeNav === "referrals") return <Referrals pushToast={pushToast} />;
    return <CustomerMobile state={state} selectedCustomer={selectedCustomer} mobileTab={mobileTab} setMobileTab={setMobileTab} reserveReward={reserveReward} />;
  };

  const navigate = (id: NavKey) => { if (allowedNav.includes(id)) setActiveNav(id); };

  return <div className="app-shell" dir="rtl">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">غ</div><div className="brand-copy"><strong>GHASLA</strong><span>منصة تشغيل ونمو المغسلة</span></div></div>
      {role !== "customer" && navSections.map((section) => <div key={section.label}><div className="nav-label">{section.label}</div><div className="nav-list">{section.items.filter((item) => allowedNav.includes(item.id)).map((item) => <button key={item.id} className={`nav-item ${activeNav === item.id ? "active" : ""}`} onClick={() => navigate(item.id)}>{item.icon}{item.label}</button>)}</div></div>)}
      {role === "customer" && <div><div className="nav-label">تطبيق العميل</div><button className="nav-item active"><Car />تطبيق غسلا</button></div>}
      <div className="sidebar-foot"><div className="role-mini"><div className="avatar">{roleInfo.name.slice(0, 1)}</div><div><strong>{roleInfo.name}</strong><div>{roleInfo.label}</div></div></div><div className="mini-note">بيئة تجريبية · البيانات محفوظة محليًا<br />لا توجد معاملات مالية حقيقية</div></div>
    </aside>
    <div className="main-shell">
      <header className="topbar"><div className="topbar-left"><button className="icon-btn mobile-only" aria-label="القائمة"><Menu size={16} /></button><div className="crumb"><span>غسلا / </span><strong>{role === "customer" ? "تطبيق العميل" : navSections.flatMap((section) => section.items).find((item) => item.id === activeNav)?.label ?? "لوحة المؤشرات"}</strong></div></div><div className="topbar-right"><select className="branch-select" value={branch} onChange={(event) => setBranch(event.target.value)} aria-label="الفرع"><option>كل الفروع</option><option>فرع النخيل</option><option>فرع الملقا</option><option>فرع الياسمين</option></select><div className="role-switcher"><label>تجربة العرض</label><select value={role} onChange={(event) => setRole(event.target.value as Role)} aria-label="تبديل الدور">{ROLES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div><button className="icon-btn" aria-label="التنبيهات"><Bell size={16} /><i className="dot" /></button><div className="avatar">{roleInfo.name.slice(0, 1)}</div></div></header>
      <main className="content">{renderPage()}</main>
    </div>
    {toast && <div className="toast" role="status">{toast}</div>}
  </div>;
}

function Overview({ state, todaySales, completedWashes, avgTicket, activeSubscriptions, partnerRevenue, onNavigate }: { state: DemoState; todaySales: number; completedWashes: number; avgTicket: number; activeSubscriptions: number; partnerRevenue: number; onNavigate: (nav: NavKey) => void }) {
  const salesData = [{ day: "السبت", sales: 1840, visits: 54 }, { day: "الأحد", sales: 2310, visits: 68 }, { day: "الإثنين", sales: 2070, visits: 61 }, { day: "الثلاثاء", sales: 2890, visits: 77 }, { day: "الأربعاء", sales: 2630, visits: 72 }, { day: "الخميس", sales: 3180, visits: 89 }, { day: "اليوم", sales: todaySales, visits: state.invoices.filter((invoice) => invoice.status === "مدفوعة").length }];
  const branchesData = [{ name: "النخيل", value: 44 }, { name: "الملقا", value: 31 }, { name: "الياسمين", value: 25 }];
  const topServices = [{ label: "داخلي + خارجي", value: 86 }, { label: "الغسيل الفاخر", value: 72 }, { label: "غسيل خارجي", value: 58 }, { label: "التلميع", value: 29 }];
  const alerts = [
    { tone: "amber", icon: <Clock3 />, title: "٣ اشتراكات تقترب من الانتهاء", body: "آخر مهلة خلال ٧ أيام · شغّل حملة التجديد", nav: "subscriptions" as NavKey },
    { tone: "red", icon: <AlertTriangle />, title: "فروقات تسوية تحتاج مراجعة", body: "وردية خالد المطيري · فرق ٢٥ ر.س", nav: "shifts" as NavKey },
    { tone: "blue", icon: <Users />, title: "١٢ عميلاً غير نشط منذ ٣٠ يومًا", body: "فرصة إعادة تنشيط بقيمة متوقعة ١٬٨٤٠ ر.س", nav: "customers" as NavKey },
    { tone: "amber", icon: <Handshake />, title: "شريك يسجل ولا يحوّل", body: "زيوت بلس · التحويل ٤٢٪ هذا الشهر", nav: "partners" as NavKey },
  ];
  return <>
    <PageHead title="صباح الخير، سارة" subtitle="هذه لقطة تشغيلية مختصرة تساعدك على اتخاذ قرار اليوم، ١٢ أكتوبر ٢٠٢٦" action={<><button className="ghost-btn"><CalendarDays />هذا الأسبوع <ChevronDown size={13} /></button><button className="primary-btn" onClick={() => onNavigate("pos")}><Plus />عملية بيع جديدة</button></>} />
    <div className="kpi-grid">
      <KpiCard label="صافي مبيعات اليوم" value={SAR(todaySales)} foot="+١٢٫٨٪ مقابل أمس" icon={<CircleDollarSign />} />
      <KpiCard label="غسلات مكتملة" value={NUM(completedWashes)} foot="متوسط زمن ٢٢ دقيقة" icon={<WashingMachine />} />
      <KpiCard label="متوسط قيمة الفاتورة" value={SAR(avgTicket)} foot="+٤٫٥٪ هذا الأسبوع" icon={<ReceiptIcon />} />
      <KpiCard label="عملاء جدد" value={NUM(state.customers.filter((customer) => customer.status === "جديد").length)} foot="٤ من مصادر شريكة" icon={<UserRound />} />
      <KpiCard label="عملاء عائدون" value={NUM(state.customers.filter((customer) => customer.visits > 1).length)} foot="معدل الاحتفاظ ٧٢٪" icon={<RefreshCw />} />
      <KpiCard label="اشتراكات نشطة" value={NUM(activeSubscriptions)} foot="٣ تقترب من الانتهاء" icon={<Crown />} tone="warn" />
      <KpiCard label="نقاط مكتسبة" value={NUM(state.ledger.filter((entry) => entry.points > 0).reduce((sum, entry) => sum + entry.points, 0))} foot={`الرصيد المتاح ${NUM(totalPoints(state))}`} icon={<Star />} tone="neutral" />
      <KpiCard label="إيراد من الشركاء" value={SAR(partnerRevenue)} foot="١٣٪ من الإيراد المحصل" icon={<Handshake />} />
    </div>
    <div className="section-grid grid-2">
      <div className="panel"><PanelHeader title="المبيعات اليومية" subtitle="الإيراد المحصل وعدد الزيارات · آخر ٧ أيام" action={<div className="legend"><span><i style={{ background: "#0bbf9c" }} />المبيعات</span><span><i style={{ background: "#b7dcd4" }} />الزيارات</span></div>} /><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={salesData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}><defs><linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0bbf9c" stopOpacity={.28} /><stop offset="100%" stopColor="#0bbf9c" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#edf3f1" vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#82999b" }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#82999b" }} tickFormatter={(value) => `${value / 1000}k`} /><Tooltip content={<ChartTooltip />} /><Area type="monotone" dataKey="sales" stroke="#0bbf9c" strokeWidth={3} fill="url(#salesGradient)" /><Area type="monotone" dataKey="visits" stroke="#b7dcd4" strokeWidth={2} fill="transparent" /></AreaChart></ResponsiveContainer></div></div>
      <div className="panel"><PanelHeader title="تنبيهات تستحق الإجراء" subtitle="إشارات من عمليات اليوم" /><div className="panel-body"><div className="alert-list">{alerts.map((alert) => <div className="alert-row" key={alert.title} onClick={() => onNavigate(alert.nav)}><div className={`alert-symbol ${alert.tone}`}>{alert.icon}</div><div className="alert-copy"><strong>{alert.title}</strong><span>{alert.body}</span></div><span className="alert-arrow"><ArrowLeft /></span></div>)}</div></div></div>
    </div>
    <div className="section-grid grid-3" style={{ marginTop: 14 }}>
      <div className="panel"><PanelHeader title="أداء الفروع" subtitle="حصة الإيراد المحصل هذا الأسبوع" /><div className="panel-body"><div className="bar-list">{branchesData.map((item) => <div className="bar-item" key={item.name}><span className="bar-label">فرع {item.name}</span><div className="bar-track"><div className="bar-fill" style={{ width: `${item.value * 2}%` }} /></div><span className="bar-value">{item.value}٪</span></div>)}</div></div></div>
      <div className="panel"><PanelHeader title="الخدمات الأعلى طلبًا" subtitle="نسبة من إجمالي الطلبات" /><div className="panel-body"><div className="bar-list">{topServices.map((item) => <div className="bar-item" key={item.label}><span className="bar-label">{item.label}</span><div className="bar-track"><div className="bar-fill" style={{ width: `${item.value}%`, background: item.value > 70 ? "#0bbf9c" : "#8bd8c8" }} /></div><span className="bar-value">{item.value}٪</span></div>)}</div></div></div>
      <div className="panel"><PanelHeader title="ما الذي يحرك النمو؟" subtitle="اقتراحات مبنية على بيانات العرض" /><div className="panel-body"><div className="insight-card"><strong><Sparkles size={14} style={{ verticalAlign: "-3px", marginLeft: 4 }} /> ارفع التحويل من الشركاء</strong><p>تسجيلات FUEL10 أعلى من المعتاد، لكن ٥٢٪ منها لم تتحول إلى أول غسلة مدفوعة.</p><div className="insight-foot"><span>تقدير الفرصة: +١٬٨٤٠ ر.س</span><button className="soft-btn" onClick={() => onNavigate("partners")}>استكشف <ArrowLeft size={13} /></button></div></div></div></div>
    </div>
    <div className="panel" style={{ marginTop: 14 }}><PanelHeader title="آخر النشاطات" subtitle="تتبع موحد للفواتير والتذاكر والتحديثات" action={<button className="ghost-btn" onClick={() => onNavigate("transactions")}>عرض السجل الكامل <ArrowLeft size={13} /></button>} /><div className="table-wrap"><table className="data-table"><thead><tr><th>المرجع</th><th>العميل</th><th>الخدمة</th><th>الفرع</th><th>القيمة</th><th>الحالة</th></tr></thead><tbody>{state.invoices.slice(0, 4).map((invoice) => <tr key={invoice.id}><td><strong>{invoice.id}</strong></td><td>{invoice.customer}</td><td>{invoice.service}</td><td>{invoice.branch}</td><td><strong>{SAR(invoice.amount)}</strong></td><td><Badge>{invoice.status}</Badge></td></tr>)}</tbody></table></div></div>
  </>;
}

const totalPoints = (state: DemoState) => state.customers.reduce((sum, customer) => sum + customer.points, 0);
function ReceiptIcon() { return <FileText />; }
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; dataKey: string }[]; label?: string }) { if (!active || !payload?.length) return null; return <div className="chart-tooltip"><b>{label}</b>{payload.map((entry) => <div key={entry.dataKey}>{entry.dataKey === "sales" ? SAR(entry.value) : `${NUM(entry.value)} زيارة`}</div>)}</div>; }

function POS({ state, selectedCustomer, selectedService, selectedCustomerId, setSelectedCustomerId, selectedServiceId, setSelectedServiceId, search, setSearch, rewardApplied, setRewardApplied, payment, setPayment, completeSale }: { state: DemoState; selectedCustomer: Customer; selectedService: Service; selectedCustomerId: string; setSelectedCustomerId: (id: string) => void; selectedServiceId: string; setSelectedServiceId: (id: string) => void; search: string; setSearch: (value: string) => void; rewardApplied: boolean; setRewardApplied: (value: boolean) => void; payment: string; setPayment: (value: string) => void; completeSale: () => void }) {
  const filtered = state.customers.filter((customer) => `${customer.name} ${customer.phone}`.includes(search));
  const hasReservation = state.reservation?.status === "محجوز" && state.reservation.customerId === selectedCustomer.id;
  const discount = rewardApplied && hasReservation ? selectedService.price : 0;
  return <>
    <PageHead title="نقطة البيع" subtitle="عملية سريعة، أثر واضح — كل فاتورة تحدّث الولاء والتشغيل والتقارير" action={<><Badge tone="info"><Bolt size={11} /> وضع الكاشير</Badge><button className="ghost-btn"><FileText />آخر الفواتير</button></>} />
    <div className="pos-layout">
      <div className="panel pos-panel"><PanelHeader title="العميل والمركبة" subtitle="الخطوة ١ من ٣" /><div className="panel-body"><div className="step-label"><span className="step-number">١</span>ابحث عن العميل</div><div className="search-box"><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="رقم الجوال أو اسم العميل" /></div><div style={{ display: "grid", gap: 7, marginBottom: 14 }}>{filtered.slice(0, 3).map((customer) => <button className={`customer-mini ${customer.id === selectedCustomerId ? "selected" : ""}`} key={customer.id} onClick={() => setSelectedCustomerId(customer.id)}><strong>{customer.name}</strong><span dir="ltr">{customer.phone} · {customer.branch}</span></button>)}</div><div className="step-label"><span className="step-number">٢</span>المركبة المسجلة</div><div className="vehicle-chip selected"><span><Car size={14} style={{ verticalAlign: "-3px", marginLeft: 5 }} />{selectedCustomer.vehicle}</span><Check size={14} /></div><div className="vehicle-chip"><span>+ إضافة مركبة جديدة</span><Plus size={14} /></div><div className="customer-stat-row"><div className="customer-stat"><b>{NUM(selectedCustomer.points)}</b><span>نقاط متاحة</span></div><div className="customer-stat"><b>{selectedCustomer.visits}</b><span>زيارة سابقة</span></div><div className="customer-stat"><b>{selectedCustomer.package ? "نشط" : "—"}</b><span>الاشتراك</span></div><div className="customer-stat"><b>{selectedCustomer.source}</b><span>مصدر الاكتساب</span></div></div>{hasReservation && <div className="discount-row" style={{ marginTop: 14 }}><span><Gift size={13} style={{ verticalAlign: "-3px", marginLeft: 4 }} /> مكافأة محجوزة · {state.reservation?.code}</span><Badge tone="warning">جاهزة</Badge></div>}</div></div>
      <div className="panel pos-panel"><PanelHeader title="اختر الخدمة" subtitle="الخطوة ٢ من ٣ · الأسعار قابلة للتعديل من الإدارة" action={<button className="ghost-btn"><Tag size={13} />إدارة الأسعار</button>} /><div className="panel-body"><div className="service-grid">{state.services.map((service) => <button className={`service-card ${service.id === selectedServiceId ? "selected" : ""}`} key={service.id} onClick={() => setSelectedServiceId(service.id)}><span className="service-icon">{iconForService(service.icon)}</span><span className="service-name">{service.name}</span><span className="service-desc">{service.description}</span><span className="service-price">{SAR(service.price)}</span></button>)}</div><div style={{ marginTop: 20 }}><div className="step-label"><span className="step-number">٣</span>المزايا والخصومات</div>{hasReservation ? <button className={`discount-row ${rewardApplied ? "active" : ""}`} style={{ width: "100%", border: rewardApplied ? "2px solid #0bbf9c" : "0" }} onClick={() => setRewardApplied(!rewardApplied)}><span><Gift size={13} style={{ verticalAlign: "-3px", marginLeft: 4 }} /> استخدام غسيل مجاني (٣٠٠ نقطة)</span><strong>{rewardApplied ? "مفعلة ✓" : "تفعيل"}</strong></button> : <div className="split-row" style={{ padding: 11, border: "1px dashed #cadbd6", borderRadius: 9 }}><span>لا توجد مكافآت محجوزة لهذا العميل</span><button className="soft-btn" onClick={() => setRewardApplied(false)}>التحقق</button></div>}<div className="discount-row" style={{ background: "#fff8e9", color: "#a96f16" }}><span><Percent size={13} style={{ verticalAlign: "-3px", marginLeft: 4 }} /> خصم الشريك</span><span>{selectedCustomer.source === "FUEL10" ? "١٠٪ مطبق" : "غير مؤهل"}</span></div></div></div></div>
      <div className="panel pos-panel"><PanelHeader title="مراجعة وإتمام" subtitle="محاكاة مالية — لا يوجد دفع حقيقي" /><div className="panel-body"><div className="checkout-box"><div className="checkout-row"><span>{selectedService.name}</span><strong>{SAR(selectedService.price)}</strong></div>{discount > 0 && <div className="checkout-row"><span>خصم المكافأة</span><strong style={{ color: "#0b9c83" }}>− {SAR(discount)}</strong></div>}<div className="checkout-row"><span>الضريبة (محاكاة)</span><strong>مشمولة</strong></div><div className="checkout-row total"><span>الإجمالي المحصل</span><strong>{SAR(selectedService.price - discount)}</strong></div></div><div style={{ marginTop: 17, color: "var(--deep)", fontSize: 11, fontWeight: 900 }}>طريقة الدفع</div><div className="payment-grid">{["نقدي", "بطاقة", "تحويل", "اشتراك"].map((item) => <button key={item} className={`payment-option ${payment === item ? "active" : ""}`} onClick={() => setPayment(item)}>{item}</button>)}</div><div className="split-row"><span>نقاط ستُكتسب</span><strong>{discount === selectedService.price ? "٠" : NUM(Math.floor(selectedService.price - discount))} نقطة</strong></div><div className="split-row"><span>حالة التشغيل</span><Badge tone="info">تُضاف إلى الطابور</Badge></div><button className="primary-btn" style={{ width: "100%", marginTop: 15, minHeight: 45 }} onClick={completeSale}><TicketCheck />إتمام المعاملة وإنشاء الفاتورة</button><div style={{ color: "var(--muted)", fontSize: 9, lineHeight: 1.6, marginTop: 10, textAlign: "center" }}>بإتمام العملية ستُنشأ فاتورة فريدة وتذكرة غسيل، وتُسجل الآثار المالية والولائية بشكل متسق.</div></div></div>
    </div>
  </>;
}

function Operations({ state, advanceTicket }: { state: DemoState; advanceTicket: (id: string) => void }) {
  const waiting = state.tickets.filter((ticket) => ticket.status === "انتظار" || ticket.status === "استلام").length;
  const washing = state.tickets.filter((ticket) => ticket.status === "غسيل").length;
  const complete = state.tickets.filter((ticket) => ticket.status === "تم التسليم").length;
  return <><PageHead title="طابور المركبات" subtitle="الرؤية اللحظية لكل مركبة — الحالة التشغيلية مستقلة عن حالة الفاتورة" action={<><Badge tone="success"><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0bbf9c" }} /> مباشر الآن</Badge><button className="primary-btn"><Plus />تذكرة يدوية</button></>} /><div className="metric-strip"><div className="metric-chip"><b>{NUM(waiting)}</b><span>مركبات تنتظر</span></div><div className="metric-chip"><b>{NUM(washing)}</b><span>قيد الغسيل</span></div><div className="metric-chip"><b>{NUM(complete)}</b><span>مكتملة اليوم</span></div><div className="metric-chip"><b>٢٢ د</b><span>متوسط زمن الخدمة</span></div></div><div className="panel"><PanelHeader title="سير العمل التشغيلي" subtitle="حرّك المركبة فقط عندما تُنجز المرحلة فعليًا" /><div className="panel-body"><div className="queue-columns">{statusOrder.map((status) => { const items = state.tickets.filter((ticket) => ticket.status === status); return <div className="queue-column" key={status}><div className="queue-column-head"><strong>{status === "غسيل" ? "غسيل جارٍ" : status}</strong><span className="queue-count">{items.length}</span></div>{items.map((ticket) => <div className="ticket-card" key={ticket.id}><strong>{ticket.vehicle.split(" · ")[0]}</strong><span>{ticket.customer}</span><span>{ticket.service}</span><div className="ticket-foot"><span>{ticket.started}</span>{status !== "تم التسليم" && <button onClick={() => advanceTicket(ticket.id)}>المرحلة التالية <ArrowLeft size={11} style={{ verticalAlign: "-2px" }} /></button>}</div></div>)}{!items.length && <div style={{ color: "#9bb0ae", fontSize: 9, padding: "23px 3px", textAlign: "center" }}>لا توجد مركبات</div>}</div>; })}</div></div></div><div className="section-grid grid-2" style={{ marginTop: 14 }}><div className="panel"><PanelHeader title="مؤشرات الموظفين" subtitle="عدد المركبات المكتملة حسب الموظف" /><div className="panel-body"><div className="bar-list">{["يوسف الشهري", "سلمان الحربي", "بدر العتيبي"].map((name, index) => <div className="bar-item" key={name}><span className="bar-label">{name}</span><div className="bar-track"><div className="bar-fill" style={{ width: `${[82, 66, 48][index]}%` }} /></div><span className="bar-value">{[18, 14, 9][index]}</span></div>)}</div></div></div><div className="panel"><PanelHeader title="قواعد التشغيل" subtitle="تنبيهات SLA المحاكاة" /><div className="panel-body"><div className="split-list"><div className="split-row"><span>تنبيه انتظار أطول من ١٥ دقيقة</span><Badge tone="warning">مفعّل</Badge></div><div className="split-row"><span>فحص الجودة قبل الجاهزية</span><Badge tone="success">إلزامي</Badge></div><div className="split-row"><span>إخفاء المركبات المسلّمة</span><Badge tone="info">بعد ٢٤ ساعة</Badge></div></div></div></div></div></>;
}

function Transactions({ state, cancelInvoice }: { state: DemoState; cancelInvoice: (id: string) => void }) { return <><PageHead title="المعاملات والفواتير" subtitle="الفاتورة هي المرجع القانوني داخل النموذج لكل أثر مالي وولائي وتشغيلي" action={<><button className="ghost-btn"><RefreshCw />تحديث</button><button className="primary-btn"><FileText />تصدير التقرير</button></>} /><div className="kpi-grid"><KpiCard label="الفواتير اليوم" value={NUM(state.invoices.length)} foot="٤ مدفوعة · ١ ملغاة" icon={<FileText />} /><KpiCard label="إجمالي القيمة" value={SAR(state.invoices.reduce((sum, invoice) => sum + invoice.gross, 0))} foot="قبل الخصومات" icon={<CircleDollarSign />} /><KpiCard label="صافي المحصل" value={SAR(state.invoices.filter((invoice) => invoice.status === "مدفوعة").reduce((sum, invoice) => sum + invoice.amount, 0))} foot="بعد العكس والخصومات" icon={<CreditCard />} /><KpiCard label="خدمات مجانية" value="١" foot="لا تُحتسب كإيراد مدفوع" icon={<Gift />} tone="neutral" /></div><div className="panel"><PanelHeader title="سجل الفواتير" subtitle="بيانات محاكاة · لا تمثل إقرارًا ضريبيًا أو فاتورة إلكترونية رسمية" /><div className="filter-row"><input className="filter-input" placeholder="بحث برقم الفاتورة أو العميل" /><select className="filter-select"><option>كل الحالات</option><option>مدفوعة</option><option>ملغاة</option></select><select className="filter-select"><option>كل طرق الدفع</option><option>نقدي</option><option>بطاقة</option></select></div><div className="table-wrap"><table className="data-table"><thead><tr><th>الفاتورة</th><th>العميل</th><th>الخدمة</th><th>القيمة الأصلية</th><th>الخصم</th><th>المحصل</th><th>الدفع</th><th>الحالة</th><th /></tr></thead><tbody>{state.invoices.map((invoice) => <tr key={invoice.id}><td><strong>{invoice.id}</strong><small style={{ display: "block", color: "#93a6a7", marginTop: 3 }}>{invoice.time}</small></td><td>{invoice.customer}</td><td>{invoice.service}</td><td>{SAR(invoice.gross)}</td><td>{invoice.discount ? `− ${SAR(invoice.discount)}` : "—"}</td><td><strong>{SAR(invoice.amount)}</strong></td><td>{invoice.payment}</td><td><Badge>{invoice.status}</Badge></td><td>{invoice.status === "مدفوعة" && <button className="danger-btn" onClick={() => cancelInvoice(invoice.id)}><X size={13} />إلغاء</button>}</td></tr>)}</tbody></table></div></div></>; }

function Customers({ state, selectedCustomerId, setSelectedCustomerId, search, setSearch, onNavigate }: { state: DemoState; selectedCustomerId: string; setSelectedCustomerId: (id: string) => void; search: string; setSearch: (value: string) => void; onNavigate: (nav: NavKey) => void }) { const selected = state.customers.find((customer) => customer.id === selectedCustomerId) ?? state.customers[0]; const filtered = state.customers.filter((customer) => `${customer.name} ${customer.phone} ${customer.plate}`.includes(search)); return <><PageHead title="العملاء والمركبات" subtitle="من زيارة عابرة إلى علاقة يمكن تنميتها" action={<><button className="ghost-btn"><Users />التقسيمات</button><button className="primary-btn"><Plus />إضافة عميل</button></>} /><div className="profile-layout"><div className="panel"><PanelHeader title="دليل العملاء" subtitle={`${NUM(filtered.length)} من ${NUM(state.customers.length)} عميل`} /><div className="filter-row"><div className="search-box" style={{ margin: 0, minWidth: 245 }}><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="اسم، جوال، لوحة" /></div><select className="filter-select"><option>كل الحالات</option><option>نشط</option><option>معرض للخطر</option><option>جديد</option></select><select className="filter-select"><option>كل المصادر</option><option>مباشر</option><option>FUEL10</option><option>إحالة</option></select></div><div className="table-wrap"><table className="data-table"><thead><tr><th>العميل</th><th>المركبة</th><th>الحالة</th><th>الزيارات</th><th>الإنفاق</th><th>النقاط</th></tr></thead><tbody>{filtered.map((customer) => <tr key={customer.id} onClick={() => setSelectedCustomerId(customer.id)} style={{ cursor: "pointer" }}><td><strong>{customer.name}</strong><small style={{ display: "block", color: "#93a6a7", marginTop: 3 }} dir="ltr">{customer.phone}</small></td><td>{customer.vehicle}<small style={{ display: "block", color: "#93a6a7", marginTop: 3 }}>{customer.plate}</small></td><td><Badge>{customer.status}</Badge></td><td>{customer.visits}</td><td>{SAR(customer.spend)}</td><td><strong>{NUM(customer.points)}</strong></td></tr>)}</tbody></table></div></div><div className="panel profile-card"><div className="profile-hero"><div className="profile-avatar">{selected.name.slice(0, 1)}</div><div><h3>{selected.name}</h3><p dir="ltr">{selected.phone} · عميل {selected.status}</p></div><button className="icon-btn" style={{ marginRight: "auto" }}><PanelRight size={15} /></button></div><div className="detail-grid"><div className="detail-item"><span>المركبة الأساسية</span><b>{selected.vehicle}</b></div><div className="detail-item"><span>الفرع المفضل</span><b>{selected.branch}</b></div><div className="detail-item"><span>أول زيارة</span><b>١٥ يناير ٢٠٢٦</b></div><div className="detail-item"><span>آخر زيارة</span><b>{selected.lastVisit}</b></div><div className="detail-item"><span>الرصيد المتاح</span><b>{NUM(selected.points)} نقطة</b></div><div className="detail-item"><span>نقاط محجوزة</span><b>{NUM(selected.reserved)} نقطة</b></div></div><div className="split-list" style={{ marginTop: 14 }}><div className="split-row"><span>مصدر الاكتساب</span><strong>{selected.source}</strong></div><div className="split-row"><span>الاشتراك</span>{selected.package ? <Badge tone="success">{selected.package}</Badge> : <span>لا يوجد</span>}</div><div className="split-row"><span>فرصة الإجراء التالي</span><button className="soft-btn" onClick={() => onNavigate("campaigns")}>إنشاء حملة مخصصة <ArrowLeft size={12} /></button></div></div></div></div></>; }

function Loyalty({ state, selectedCustomer, reserveReward }: { state: DemoState; selectedCustomer: Customer; reserveReward: () => void }) { return <><PageHead title="الولاء والمكافآت" subtitle="رصيد قابل للتتبع — كل نقطة لها سبب ومرجع ونتيجة" action={<><Badge tone="success"><ShieldCheck size={11} />قواعد مفعّلة</Badge><button className="primary-btn"><Plus />مكافأة جديدة</button></>} /><div className="kpi-grid"><KpiCard label="النقاط المتاحة" value={NUM(totalPoints(state))} foot="+٨٫٤٪ هذا الشهر" icon={<Star />} /><KpiCard label="النقاط المحجوزة" value={NUM(state.customers.reduce((sum, customer) => sum + customer.reserved, 0))} foot="تنتظر تأكيد الكاشير" icon={<Clock3 />} tone="warn" /><KpiCard label="المكافآت المستخدمة" value="١٨٦" foot="معدل الاستخدام ٣٤٪" icon={<Gift />} /><KpiCard label="تكلفة الولاء التقديرية" value="١٬٢٤٠ ر.س" foot="قيمة خدمات مجانية" icon={<CircleDollarSign />} tone="neutral" /></div><div className="section-grid grid-2"><div className="panel"><PanelHeader title="كتالوج المكافآت" subtitle="القواعد الحالية · النقطة لكل ريال · لا نقاط على قيمة المكافأة" /><div className="panel-body"><div className="reward-grid"><div className="reward-card"><h3>غسيل خارجي مجاني</h3><p>خدمة غسيل خارجية واحدة، صالحة في كل الفروع.</p><div className="reward-points">٣٠٠ <small>نقطة</small></div><button className="soft-btn" style={{ marginTop: 12 }} onClick={reserveReward}>حجز لعميل العرض</button></div><div className="reward-card"><h3>ترقية إلى فاخر</h3><p>استبدل الغسيل الداخلي والخارجي بتجربة فاخرة.</p><div className="reward-points">٥٥٠ <small>نقطة</small></div><button className="ghost-btn" style={{ marginTop: 12 }}>تفاصيل الشرط</button></div><div className="reward-card"><h3>خصم ٥٠ ر.س</h3><p>خصم مباشر على فاتورة بقيمة ١٥٠ ر.س أو أكثر.</p><div className="reward-points">٧٥٠ <small>نقطة</small></div><button className="ghost-btn" style={{ marginTop: 12 }}>تفاصيل الشرط</button></div></div></div></div><div className="panel"><PanelHeader title="تجربة الحجز الحالية" subtitle="سيناريو متصل بين العميل والكاشير" /><div className="panel-body">{state.reservation?.status === "محجوز" ? <div className="insight-card"><strong><Gift size={14} style={{ verticalAlign: "-3px", marginLeft: 4 }} /> مكافأة محجوزة · {state.reservation.reward}</strong><p>للعميل {state.customers.find((customer) => customer.id === state.reservation?.customerId)?.name}. سيظهر الرمز في POS ويمكن تأكيده عند إتمام الفاتورة فقط.</p><div className="split-row"><span>رمز التحقق</span><strong dir="ltr">{state.reservation.code}</strong></div><div className="split-row"><span>النقاط المحجوزة</span><strong>٣٠٠ نقطة</strong></div><div className="split-row"><span>الحالة</span><Badge tone="warning">محجوزة</Badge></div></div> : <div className="empty-state"><Gift size={25} />لا توجد مكافأة محجوزة حاليًا<br /><button className="soft-btn" style={{ marginTop: 12 }} onClick={reserveReward}>محاكاة حجز من تطبيق العميل</button></div>}</div></div></div><div className="panel" style={{ marginTop: 14 }}><PanelHeader title="سجل الولاء" subtitle="Ledger · لا يتم تعديل الرصيد دون إدخال قابل للتتبع" /><div className="table-wrap"><table className="data-table"><thead><tr><th>المرجع</th><th>العميل</th><th>النوع</th><th>التغيير</th><th>السبب</th><th>الوقت</th></tr></thead><tbody>{state.ledger.map((entry) => <tr key={entry.id}><td><strong>{entry.reference}</strong></td><td>{entry.customer}</td><td><Badge tone={entry.type === "محجوزة" ? "warning" : "success"}>{entry.type}</Badge></td><td style={{ color: entry.points > 0 ? "#0b9c83" : "#c65b51", fontWeight: 900 }}>{entry.points > 0 ? "+" : ""}{NUM(entry.points)}</td><td>{entry.reason}</td><td>{entry.time}</td></tr>)}</tbody></table></div></div></>; }


function Subscriptions({ state }: { state: DemoState }) {
  const packages = [
    { name: "الباقة الشهرية", price: 149, washes: 5, used: 3, color: "#0bbf9c", meta: "تنتهي بعد ١٢ يومًا" },
    { name: "خمس غسلات", price: 115, washes: 5, used: 2, color: "#4b83c4", meta: "تنتهي بعد ٤٥ يومًا" },
    { name: "عائلية متعددة المركبات", price: 299, washes: 10, used: 6, color: "#e7a43a", meta: "تنتهي بعد ٢١ يومًا" },
  ];
  return <><PageHead title="الاشتراكات والباقات" subtitle="الاستخدام يستهلك الاستحقاق ولا يكرر الإيراد المحصل" action={<button className="primary-btn"><Plus />إضافة باقة</button>} /><div className="package-grid">{packages.map((item) => <div className="package-card" key={item.name}><h3>{item.name}</h3><p>خدمات مؤهلة في الفروع المحددة مع سجل استخدام واضح.</p><div className="package-price">{SAR(item.price)} <small>/ باقة</small></div><div className="package-meta"><span>{item.used} مستخدمة من {item.washes}</span><span>{item.meta}</span></div><div className="progress"><i style={{ width: `${(item.used / item.washes) * 100}%`, background: item.color }} /></div><button className="ghost-btn" style={{ marginTop: 13, width: "100%" }}>إدارة الباقة</button></div>)}</div><div className="section-grid grid-2" style={{ marginTop: 14 }}><div className="panel"><PanelHeader title="الاستخدامات الأخيرة" subtitle="مرتبطة بالفواتير الأصلية" /><div className="table-wrap"><table className="data-table"><thead><tr><th>العميل</th><th>الباقة</th><th>الاستخدام</th><th>الفاتورة</th><th>التاريخ</th></tr></thead><tbody>{state.customers.filter((customer) => customer.package).map((customer, index) => <tr key={customer.id}><td><strong>{customer.name}</strong></td><td>{customer.package}</td><td>{index + 1} من ٥</td><td>INV-2026-10{48 - index}</td><td>اليوم</td></tr>)}</tbody></table></div></div><div className="panel"><PanelHeader title="تنبيهات التجديد" subtitle="إجراءات مقترحة قبل انتهاء الاستحقاق" /><div className="panel-body"><div className="alert-list"><div className="alert-row"><div className="alert-symbol amber"><Clock3 /></div><div className="alert-copy"><strong>عبدالله السالم · ٣ استخدامات متبقية</strong><span>انتهاء الباقة خلال ١٢ يومًا</span></div><button className="soft-btn">إرسال عرض</button></div><div className="alert-row"><div className="alert-symbol amber"><RefreshCw /></div><div className="alert-copy"><strong>١٢ اشتراكًا يحتاج متابعة</strong><span>تقدير الإيراد عند التجديد ١٬٧٨٨ ر.س</span></div><button className="soft-btn">إنشاء حملة</button></div></div></div></div></div></>;
}

function Partners({ state, pushToast }: { state: DemoState; pushToast: (message: string) => void }) {
  const [code, setCode] = useState("");
  const [registered, setRegistered] = useState(false);
  return <><PageHead title="الشركاء والأكواد" subtitle="من التسجيل إلى أول فاتورة مدفوعة — لا تخلط بين أحداث الاكتساب" action={<><button className="ghost-btn"><BarChart3 />مقارنة الأداء</button><button className="primary-btn" onClick={() => pushToast("تم فتح نموذج شريك جديد") }><Plus />إضافة شريك</button></>} /><div className="kpi-grid"><KpiCard label="تسجيلات الأكواد" value="٣١٨" foot="+١٨٪ هذا الشهر" icon={<Tag />} /><KpiCard label="عملاء منسوبون" value="٢١٥" foot="اكتساب أول لمرة" icon={<Users />} /><KpiCard label="تحويل أول مدفوع" value="٦٢٪" foot="+٧ نقاط عن السابق" icon={<TrendingUp />} /><KpiCard label="إيراد منسوب" value={SAR(state.partners.reduce((sum, partner) => sum + partner.revenue, 0))} foot="بعد الخصومات" icon={<Handshake />} /></div><div className="section-grid grid-2"><div className="panel"><PanelHeader title="أداء الشركاء" subtitle="التسجيل والاكتساب والتحويل والإيراد المتكرر" /><div className="table-wrap"><table className="data-table"><thead><tr><th>الشريك</th><th>الكود</th><th>التسجيلات</th><th>العملاء</th><th>التحويل</th><th>الإيراد</th><th>الحالة</th></tr></thead><tbody>{state.partners.map((partner) => <tr key={partner.id}><td><strong>{partner.name}</strong><small style={{ display: "block", color: "#93a6a7", marginTop: 3 }}>{partner.category}</small></td><td><strong dir="ltr">{partner.code}</strong></td><td>{NUM(partner.registrations)}</td><td>{NUM(partner.customers)}</td><td>{Math.round((partner.conversions / partner.customers) * 100)}٪</td><td>{SAR(partner.revenue)}</td><td><Badge>{partner.status}</Badge></td></tr>)}</tbody></table></div></div><div className="panel"><PanelHeader title="محاكاة تسجيل كود" subtitle="سيناريو FUEL10 — من تطبيق العميل إلى أول زيارة" /><div className="panel-body"><div className="insight-card"><strong><Sparkles size={14} style={{ verticalAlign: "-3px", marginLeft: 4 }} /> أدخل كود شريك من تطبيق العميل</strong><p>التسجيل لا يمنح التحويل تلقائيًا. يُحتسب الاكتساب عند أول فاتورة مؤهلة مدفوعة.</p><div className="search-box" style={{ background: "white" }}><Tag /><input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="مثال: FUEL10" dir="ltr" /></div><button className="primary-btn" style={{ width: "100%" }} onClick={() => code === "FUEL10" ? (setRegistered(true), pushToast("تم تسجيل الكود — بانتظار أول فاتورة مدفوعة")) : pushToast("الكود غير صالح في العرض")}>تحقق وتسجيل الكود</button>{registered && <div className="split-list" style={{ marginTop: 13 }}><div className="split-row"><span>التسجيل</span><Badge tone="success">تم</Badge></div><div className="split-row"><span>الاكتساب</span><Badge tone="warning">بانتظار الفاتورة</Badge></div><div className="split-row"><span>قاعدة الإسناد</span><strong>أول لمسة مؤهلة</strong></div></div>}</div></div></div></div></>;
}

function Campaigns({ state, updateState, pushToast }: { state: DemoState; updateState: (updater: (current: DemoState) => DemoState) => void; pushToast: (message: string) => void }) {
  const [name, setName] = useState("");
  const saveCampaign = () => { if (!name) { pushToast("اكتب اسم الحملة أولًا"); return; } updateState((current) => ({ ...current, campaigns: [{ id: `CMP-${current.campaigns.length + 4}`, name, segment: "شريحة مخصصة", offer: "خصم ١٥٪", status: "مسودة", redemptions: 0 }, ...current.campaigns] })); setName(""); pushToast("تم حفظ الحملة كمسودة"); };
  return <><PageHead title="الحملات والعروض" subtitle="رسائل محاكاة موجهة إلى شرائح قابلة للقياس" action={<button className="primary-btn" onClick={saveCampaign}><Plus />حملة جديدة</button>} /><div className="section-grid grid-2"><div className="panel"><PanelHeader title="إنشاء حملة سريعة" subtitle="اختر شريحة ثم اختبر عرضًا قبل الإرسال" /><div className="panel-body"><div className="split-list"><label style={{ color: "var(--muted)", fontSize: 10 }}>اسم الحملة<input className="filter-input" style={{ width: "100%", marginTop: 6 }} value={name} onChange={(event) => setName(event.target.value)} placeholder="مثال: لمعة نهاية الأسبوع" /></label><label style={{ color: "var(--muted)", fontSize: 10 }}>الشريحة<select className="filter-select" style={{ width: "100%", marginTop: 6 }}><option>عملاء غير نشطين ٣٠ يومًا</option><option>زوار أول مرة</option><option>اشتراكات تقترب من الانتهاء</option></select></label><label style={{ color: "var(--muted)", fontSize: 10 }}>نوع العرض<select className="filter-select" style={{ width: "100%", marginTop: 6 }}><option>خصم نسبة</option><option>نقاط مضاعفة</option><option>ترقية مجانية</option></select></label></div><button className="soft-btn" style={{ marginTop: 13 }}>معاينة الجمهور: ١٢٤ عميل</button></div></div><div className="panel"><PanelHeader title="الحملات الحالية" subtitle="الحالة والاستجابة الفعلية" /><div className="table-wrap"><table className="data-table"><thead><tr><th>الحملة</th><th>الشريحة</th><th>العرض</th><th>الحالة</th><th>الاستردادات</th></tr></thead><tbody>{state.campaigns.map((campaign) => <tr key={campaign.id}><td><strong>{campaign.name}</strong></td><td>{campaign.segment}</td><td>{campaign.offer}</td><td><Badge>{campaign.status}</Badge></td><td>{campaign.redemptions}</td></tr>)}</tbody></table></div></div></div></>;
}

function Services({ state, editingService, setEditingService, updatePrice }: { state: DemoState; editingService: string | null; setEditingService: (id: string | null) => void; updatePrice: (id: string, value: string) => void }) { return <><PageHead title="الخدمات والأسعار" subtitle="مصدر واحد للأسعار المستخدمة في POS والتقارير" action={<button className="primary-btn"><Plus />إضافة خدمة</button>} /><div className="section-grid grid-2"><div className="panel"><PanelHeader title="قائمة الخدمات" subtitle="تعديل مباشر · الأسعار بالريال السعودي" /><div className="table-wrap"><table className="data-table"><thead><tr><th>الخدمة</th><th>الوصف</th><th>السعر</th><th>الأهلية</th><th /></tr></thead><tbody>{state.services.map((service) => <tr key={service.id}><td><strong>{service.name}</strong></td><td>{service.description}</td><td>{editingService === service.id ? <input className="filter-input" autoFocus defaultValue={service.price} onBlur={(event) => { updatePrice(service.id, event.target.value); setEditingService(null); }} onKeyDown={(event) => { if (event.key === "Enter") { updatePrice(service.id, event.currentTarget.value); setEditingService(null); } }} style={{ width: 90 }} /> : <strong>{SAR(service.price)}</strong>}</td><td><Badge tone="success">للولاء</Badge></td><td><button className="ghost-btn" onClick={() => setEditingService(service.id)}>تعديل</button></td></tr>)}</tbody></table></div></div><div className="panel"><PanelHeader title="قواعد التسعير" subtitle="تأثير القواعد على الحساب" /><div className="panel-body"><div className="split-list"><div className="split-row"><span>العملة</span><strong>ريال سعودي · هللة</strong></div><div className="split-row"><span>الضريبة</span><Badge tone="warning">محاكاة فقط</Badge></div><div className="split-row"><span>النقاط لكل ريال</span><strong>١ نقطة</strong></div><div className="split-row"><span>كسب نقاط على الخصم</span><Badge tone="danger">ممنوع</Badge></div><div className="split-row"><span>تكديس المكافآت</span><Badge tone="neutral">غير مسموح</Badge></div></div></div></div></div></>;
}

function Shifts({ state, actualCash, setActualCash, updateState, pushToast }: { state: DemoState; actualCash: string; setActualCash: (value: string) => void; updateState: (updater: (current: DemoState) => DemoState) => void; pushToast: (message: string) => void }) { const cashSales = state.invoices.filter((invoice) => invoice.status === "مدفوعة" && invoice.payment === "نقدي").reduce((sum, invoice) => sum + invoice.amount, 0); const expected = state.shift.opening + cashSales; const diff = Number(actualCash || 0) - expected; return <><PageHead title="الورديات وإدارة النقد" subtitle="تسوية شفافة للمتوقع والفعلي مع صلاحيات الإغلاق" action={<Badge tone={state.shift.status === "مفتوحة" ? "success" : "neutral"}>الوردية {state.shift.status}</Badge>} /><div className="kpi-grid"><KpiCard label="رصيد الافتتاح" value={SAR(state.shift.opening)} foot={state.shift.openedAt} icon={<WalletCards />} /><KpiCard label="نقدي محصل" value={SAR(cashSales)} foot="من معاملات اليوم" icon={<CircleDollarSign />} /><KpiCard label="المتوقع عند الإغلاق" value={SAR(expected)} foot="يُحسب من الفواتير" icon={<Gauge />} /><KpiCard label="فرق التسوية" value={`${diff >= 0 ? "+" : ""}${SAR(diff)}`} foot={diff === 0 ? "متطابق" : "يحتاج مراجعة المدير"} icon={<AlertTriangle />} tone={diff === 0 ? "good" : "warn"} /></div><div className="section-grid grid-2"><div className="panel"><PanelHeader title="تسوية الوردية الحالية" subtitle="خالد المطيري · فرع النخيل" /><div className="panel-body"><div className="split-list"><div className="split-row"><span>رصيد الافتتاح</span><strong>{SAR(state.shift.opening)}</strong></div><div className="split-row"><span>مبيعات نقدية</span><strong>{SAR(cashSales)}</strong></div><div className="split-row"><span>الرصيد المتوقع</span><strong>{SAR(expected)}</strong></div><div className="split-row"><span>النقد الفعلي</span><input className="filter-input" value={actualCash} onChange={(event) => setActualCash(event.target.value)} dir="ltr" style={{ width: 105 }} /></div><div className="split-row"><span>الفرق</span><Badge tone={diff === 0 ? "success" : "danger"}>{diff >= 0 ? "+" : "−"}{SAR(Math.abs(diff))}</Badge></div></div><button className="primary-btn" style={{ width: "100%", marginTop: 16 }} onClick={() => { updateState((current) => ({ ...current, shift: { ...current.shift, status: "مغلقة", actual: Number(actualCash) } })); pushToast(diff === 0 ? "أغلقت الوردية بنجاح دون فرق" : "تم إغلاق الوردية وتسجيل فرق يحتاج مراجعة"); }}><ClipboardCheck />تأكيد إغلاق الوردية</button></div></div><div className="panel"><PanelHeader title="سجل الورديات" subtitle="سيناريوهات تدقيق جاهزة للمراجعة" /><div className="table-wrap"><table className="data-table"><thead><tr><th>الكاشير</th><th>الفرع</th><th>الافتتاح</th><th>الإغلاق الفعلي</th><th>الفرق</th><th>الحالة</th></tr></thead><tbody><tr><td><strong>نواف الحربي</strong></td><td>فرع الملقا</td><td>{SAR(450)}</td><td>{SAR(1120)}</td><td style={{ color: "#0b9c83" }}>+ ٠ ر.س</td><td><Badge tone="success">متطابقة</Badge></td></tr><tr><td><strong>خالد المطيري</strong></td><td>فرع النخيل</td><td>{SAR(500)}</td><td>{SAR(635)}</td><td style={{ color: "#c65b51" }}>− ٢٥ ر.س</td><td><Badge tone="danger">مراجعة</Badge></td></tr></tbody></table></div></div></div></>;
}

function Employees({ pushToast }: { pushToast: (message: string) => void }) { const employees = [{ name: "خالد المطيري", role: "كاشير", branch: "النخيل", access: "POS + وردية", status: "نشط" }, { name: "يوسف الشهري", role: "عمليات", branch: "النخيل", access: "الطابور فقط", status: "نشط" }, { name: "نواف الحربي", role: "مدير فرع", branch: "الملقا", access: "إدارة كاملة", status: "نشط" }, { name: "بدر العتيبي", role: "كاشير", branch: "الملقا", access: "POS + وردية", status: "موقوف" }]; return <><PageHead title="الموظفون والصلاحيات" subtitle="أدوار واضحة تمنع التعديل غير المصرح به على الفواتير والورديات" action={<button className="primary-btn" onClick={() => pushToast("تم فتح نموذج إضافة موظف تجريبي")}><Plus />إضافة موظف</button>} /><div className="panel"><PanelHeader title="دليل الموظفين" subtitle="الصلاحيات المعروضة هي صلاحيات نموذجية للعرض" /><div className="table-wrap"><table className="data-table"><thead><tr><th>الموظف</th><th>الدور</th><th>الفرع</th><th>النطاق</th><th>الحالة</th><th /></tr></thead><tbody>{employees.map((employee) => <tr key={employee.name}><td><strong>{employee.name}</strong></td><td>{employee.role}</td><td>{employee.branch}</td><td>{employee.access}</td><td><Badge>{employee.status}</Badge></td><td><button className="ghost-btn">الصلاحيات</button></td></tr>)}</tbody></table></div></div><div className="section-grid grid-3" style={{ marginTop: 14 }}><div className="panel"><PanelHeader title="مبدأ أقل صلاحية" /><div className="panel-body"><p style={{ color: "var(--muted)", fontSize: 11, lineHeight: 1.8, margin: 0 }}>الكاشير ينفذ البيع ولا يعدّل الأسعار. موظف العمليات يحرّك التذاكر ولا يلغي الفواتير. الإلغاء محصور بالمدير.</p></div></div><div className="panel"><PanelHeader title="سجل التدقيق" /><div className="panel-body"><div className="split-row"><span>إلغاء فاتورة</span><strong>سارة العتيبي</strong></div><div className="split-row"><span>تعديل سعر</span><strong>نواف الحربي</strong></div></div></div><div className="panel"><PanelHeader title="حالة الوصول" /><div className="panel-body"><div className="split-row"><span>جلسات نشطة</span><Badge tone="success">٣</Badge></div><div className="split-row"><span>محاولات مرفوضة</span><Badge tone="neutral">٠</Badge></div></div></div></div></>; }

function Analytics({ state }: { state: DemoState }) { const data = [{ name: "يناير", revenue: 16800 }, { name: "فبراير", revenue: 19200 }, { name: "مارس", revenue: 21600 }, { name: "أبريل", revenue: 24500 }, { name: "مايو", revenue: 27800 }, { name: "يونيو", revenue: 31200 }]; const pie = [{ name: "مباشر", value: 48 }, { name: "شركاء", value: 27 }, { name: "إحالات", value: 15 }, { name: "حملات", value: 10 }]; const colors = ["#0bbf9c", "#4b83c4", "#e7a43a", "#d76058"]; return <><PageHead title="التحليلات والتقارير" subtitle="تقارير تشغيلية وإدارية قابلة للمقارنة — القيمة المحصلة منفصلة عن قيمة الخدمة" action={<><button className="ghost-btn"><CalendarDays />آخر ٦ أشهر</button><button className="primary-btn"><FileText />تقرير مخصص</button></>} /><div className="section-grid grid-2"><div className="panel"><PanelHeader title="الإيراد الشهري" subtitle="الإيراد المحصل · ريال سعودي" /><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 12, right: 5, left: -18, bottom: 0 }}><CartesianGrid stroke="#edf3f1" vertical={false} /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#82999b" }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#82999b" }} tickFormatter={(value) => `${value / 1000}k`} /><Tooltip content={<ChartTooltip />} /><Bar dataKey="revenue" fill="#0bbf9c" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></div><div className="panel"><PanelHeader title="مصادر اكتساب العملاء" subtitle={`من أصل ${NUM(state.customers.length)} عميلاً تجريبيًا`} /><div className="panel-body" style={{ display: "flex", alignItems: "center", gap: 13 }}><div style={{ width: "48%", height: 190 }}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pie} dataKey="value" nameKey="name" innerRadius={48} outerRadius={75} paddingAngle={3}>{pie.map((entry, index) => <Cell key={entry.name} fill={colors[index]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div><div className="split-list" style={{ flex: 1 }}>{pie.map((item, index) => <div className="split-row" key={item.name}><span><i style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: colors[index], marginLeft: 5 }} />{item.name}</span><strong>{item.value}٪</strong></div>)}</div></div></div></div><div className="section-grid grid-3" style={{ marginTop: 14 }}><div className="panel"><PanelHeader title="زمن الذروة" /><div className="panel-body"><div className="bar-list">{[["١٠ ص", 82], ["١٢ م", 95], ["٤ م", 54], ["٨ م", 71]].map(([label, value]) => <div className="bar-item" key={label as string}><span className="bar-label">{label}</span><div className="bar-track"><div className="bar-fill" style={{ width: `${value}%` }} /></div><span className="bar-value">{value}%</span></div>)}</div></div></div><div className="panel"><PanelHeader title="معدل الاحتفاظ" subtitle="آخر ٣٠ يومًا" /><div className="panel-body"><div style={{ color: "var(--deep)", fontSize: 32, fontWeight: 900 }}>٧٢٪</div><div className="progress" style={{ marginTop: 12 }}><i style={{ width: "72%" }} /></div><p style={{ color: "var(--muted)", fontSize: 10, lineHeight: 1.7 }}>أعلى من الشهر الماضي بـ ٥ نقاط، مدفوعًا بالاشتراكات والمكافآت.</p></div></div><div className="panel"><PanelHeader title="اتساق الإيراد" subtitle="فحص المصالحة" /><div className="panel-body"><div className="split-row"><span>الفواتير المدفوعة</span><Badge tone="success">متطابق</Badge></div><div className="split-row"><span>نقاط الولاء</span><Badge tone="success">قابل للتتبع</Badge></div><div className="split-row"><span>الاستهلاك الاشتراكي</span><Badge tone="info">تقديري</Badge></div></div></div></div></>; }

function Growth({ onNavigate, pushToast }: { onNavigate: (nav: NavKey) => void; pushToast: (message: string) => void }) { const ideas = [{ title: "أعد تنشيط ١٢ عميلاً معرضًا للخطر", body: "عرض ٢٠٪ في أوقات الركود يمكن أن يعيد ٤ منهم خلال أسبوع.", action: "إنشاء حملة", nav: "campaigns" as NavKey, value: "+ ٨٦٠ ر.س" }, { title: "حوّل تسجيلات FUEL10 إلى زيارات", body: "صفحة الكود تعمل، لكن خطوة التذكير بعد التسجيل غير مفعلة.", action: "مراجعة الشريك", nav: "partners" as NavKey, value: "+ ١٬٨٤٠ ر.س" }, { title: "ارفع استخدام الاشتراكات", body: "٣ اشتراكات تقترب من الانتهاء. اقترح عرض تجديد قبل ٧ أيام.", action: "عرض الاشتراكات", nav: "subscriptions" as NavKey, value: "+ ٤٥٠ ر.س" }]; return <><PageHead title="ذكاء نمو الإيرادات" subtitle="من أين تأتي الفرصة التالية؟ توصيات قابلة للتنفيذ مرتبطة بسجلات التشغيل" action={<Badge tone="info"><Sparkles size={11} />تحليل العرض محدث الآن</Badge>} /><div className="section-grid grid-3">{ideas.map((idea) => <div className="insight-card" key={idea.title}><strong>{idea.title}</strong><p>{idea.body}</p><div className="insight-foot"><span>{idea.value}</span><button className="soft-btn" onClick={() => onNavigate(idea.nav)}>{idea.action} <ArrowLeft size={13} /></button></div></div>)}</div><div className="panel" style={{ marginTop: 14 }}><PanelHeader title="مؤشر صحة النمو" subtitle="درجة مركبة من الاحتفاظ والتحويل وقيمة العميل" /><div className="panel-body"><div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>{[["الاحتفاظ", 72], ["تحويل الشركاء", 62], ["استخدام الولاء", 34], ["نمو متوسط الفاتورة", 48]].map(([label, value]) => <div className="detail-item" key={label as string}><span>{label}</span><b>{value}%</b><div className="progress" style={{ marginTop: 7 }}><i style={{ width: `${value}%` }} /></div></div>)}</div></div></div><div className="panel" style={{ marginTop: 14 }}><PanelHeader title="ملاحظة الذكاء التشغيلي" /><div className="panel-body"><div className="insight-card"><strong>القرار المقترح لهذا الأسبوع</strong><p>لا تزيد الخصم العام الآن. ابدأ بشريحة العملاء المعرضين للخطر، ثم قِس العودة خلال ٧ أيام قبل توسيع الحملة.</p><button className="primary-btn" onClick={() => pushToast("تم حفظ التوصية في قائمة الإجراءات")}><Check />حفظ كإجراء</button></div></div></div></>; }

function Brand({ pushToast }: { pushToast: (message: string) => void }) { const [dark, setDark] = useState(false); return <><PageHead title="تخصيص العلامة" subtitle="اجعل تجربة كل فرع تبدو مثل GHASLA من دون إرباك التشغيل" action={<button className="primary-btn" onClick={() => pushToast("تم حفظ إعدادات العلامة التجريبية")}><Check />حفظ التغييرات</button>} /><div className="section-grid grid-2"><div className="panel"><PanelHeader title="هوية العلامة" subtitle="قيم العرض الحالية" /><div className="panel-body"><div className="split-list"><div className="split-row"><span>الاسم التجاري</span><strong>غسلا GHASLA</strong></div><div className="split-row"><span>اللون المملوك</span><span style={{ color: "#0bbf9c", fontWeight: 900 }}>● أخضر غسلا</span></div><div className="split-row"><span>الخط</span><strong>IBM Plex Sans Arabic</strong></div><div className="split-row"><span>اللغة</span><Badge tone="success">العربية RTL</Badge></div></div></div></div><div className="panel"><PanelHeader title="نمط تطبيق العميل" subtitle="معاينة مختصرة" /><div className="panel-body"><div className="mobile-reward"><div className="mobile-reward-icon"><Droplets size={16} /></div><div><strong>واجهة عميل عربية</strong><span>رصيد، مكافآت، باقات ورمز شريك</span></div><Badge tone="success">مفعّل</Badge></div><div className="split-row" style={{ marginTop: 10 }}><span>الوضع الداكن</span><button className={`toggle ${dark ? "on" : ""}`} onClick={() => setDark(!dark)}><i /></button></div></div></div></div></>; }

function SettingsPage({ resetDemo, pushToast }: { resetDemo: () => void; pushToast: (message: string) => void }) { return <><PageHead title="الإعدادات" subtitle="قواعد العرض، الحفظ، والتكاملات المحاكاة" action={<Badge tone="info"><ShieldCheck size={11} />بيئة تجريبية</Badge>} /><div className="section-grid grid-2"><div className="panel"><PanelHeader title="قواعد العمل" subtitle="القيم التي تؤثر على الحسابات" /><div className="panel-body"><div className="split-list"><div className="split-row"><span>العملة</span><strong>ر.س · ريال سعودي</strong></div><div className="split-row"><span>النقاط لكل ريال</span><strong>١</strong></div><div className="split-row"><span>حد الاستبدال الأدنى</span><strong>٣٠٠ نقطة</strong></div><div className="split-row"><span>انتهاء النقاط</span><strong>١٢ شهرًا</strong></div><div className="split-row"><span>الضريبة</span><Badge tone="warning">محاكاة فقط</Badge></div></div></div></div><div className="panel"><PanelHeader title="التكاملات" subtitle="لا توجد خدمات خارجية متصلة في العرض" /><div className="panel-body"><div className="split-list"><div className="split-row"><span>الدفع الإلكتروني</span><Badge tone="neutral">محاكاة</Badge></div><div className="split-row"><span>الرسائل وواتساب</span><Badge tone="neutral">محاكاة</Badge></div><div className="split-row"><span>الفوترة الإلكترونية السعودية</span><Badge tone="neutral">غير متصلة</Badge></div><div className="split-row"><span>حفظ البيانات</span><Badge tone="success">LocalStorage</Badge></div></div></div></div></div><div className="panel" style={{ marginTop: 14 }}><PanelHeader title="إدارة بيانات العرض" subtitle="أعد التشغيل من بيانات اصطناعية في أي وقت" /><div className="panel-body"><div className="split-row"><span>إعادة ضبط جميع المعاملات والعملاء</span><button className="danger-btn" onClick={resetDemo}><Trash2 size={13} />إعادة ضبط بيانات العرض</button></div><div className="split-row"><span>نسخة النظام</span><strong>GHASLA Preview · 0.9.0</strong></div></div></div></>; }

function Branches({ state }: { state: DemoState }) { const rows = [{ name: "فرع النخيل", manager: "نواف الحربي", sales: 4380, queue: state.tickets.filter((ticket) => ticket.branch === "فرع النخيل").length, status: "مستقر" }, { name: "فرع الملقا", manager: "سارة الدوسري", sales: 3120, queue: state.tickets.filter((ticket) => ticket.branch === "فرع الملقا").length, status: "مستقر" }, { name: "فرع الياسمين", manager: "مشعل العتيبي", sales: 2240, queue: state.tickets.filter((ticket) => ticket.branch === "فرع الياسمين").length, status: "يحتاج متابعة" }]; return <><PageHead title="الفروع" subtitle="مقارنة الأداء التشغيلي والمالي بين مواقع غسلا" action={<button className="primary-btn"><Plus />إضافة فرع</button>} /><div className="panel"><PanelHeader title="شبكة الفروع" subtitle="مبيعات اليوم · المركبات في الطابور · الحالة" /><div className="table-wrap"><table className="data-table"><thead><tr><th>الفرع</th><th>المدير</th><th>مبيعات اليوم</th><th>الطابور</th><th>الحالة</th><th /></tr></thead><tbody>{rows.map((row) => <tr key={row.name}><td><strong>{row.name}</strong></td><td>{row.manager}</td><td>{SAR(row.sales)}</td><td>{row.queue}</td><td><Badge tone={row.status === "مستقر" ? "success" : "warning"}>{row.status}</Badge></td><td><button className="ghost-btn">فتح الأداء</button></td></tr>)}</tbody></table></div></div></>; }

function Referrals({ pushToast }: { pushToast: (message: string) => void }) { return <><PageHead title="الإحالات" subtitle="برنامج منفصل عن الشركاء — يكافئ العميل عند أول عملية مؤهلة" action={<button className="primary-btn" onClick={() => pushToast("تم إنشاء رابط إحالة تجريبي")}><Plus />إعداد البرنامج</button>} /><div className="kpi-grid"><KpiCard label="إحالات مسجلة" value="١٨٦" foot="من ١٢٤ عميلاً" icon={<Handshake />} /><KpiCard label="إحالات ناجحة" value="٧٤" foot="أول فاتورة مدفوعة" icon={<Check />} /><KpiCard label="مكافآت معلقة" value="٢١" foot="بانتظار التأهل" icon={<Clock3 />} /><KpiCard label="مكافآت ممنوحة" value="٥٣" foot="١٠٠ نقطة للإحالة" icon={<Gift />} /></div><div className="section-grid grid-2"><div className="panel"><PanelHeader title="قواعد التأهل" /><div className="panel-body"><div className="split-list"><div className="split-row"><span>الحدث المؤهل</span><strong>أول غسيل مدفوع</strong></div><div className="split-row"><span>الحد الأدنى للشراء</span><strong>٢٥ ر.س</strong></div><div className="split-row"><span>منع الإحالة الذاتية</span><Badge tone="success">مفعّل</Badge></div><div className="split-row"><span>منع التكرار</span><Badge tone="success">مفعّل</Badge></div></div></div></div><div className="panel"><PanelHeader title="أعلى المحيلين" /><div className="table-wrap"><table className="data-table"><thead><tr><th>العميل</th><th>التسجيلات</th><th>الناجحة</th><th>المكافأة</th></tr></thead><tbody><tr><td><strong>عبدالله السالم</strong></td><td>١٢</td><td>٨</td><td>٨٠٠ نقطة</td></tr><tr><td><strong>ريم القحطاني</strong></td><td>٧</td><td>٤</td><td>٤٠٠ نقطة</td></tr><tr><td><strong>فيصل الشمري</strong></td><td>٦</td><td>٣</td><td>٣٠٠ نقطة</td></tr></tbody></table></div></div></div></>; }

function CustomerMobile({ state, selectedCustomer, mobileTab, setMobileTab, reserveReward }: { state: DemoState; selectedCustomer: Customer; mobileTab: string; setMobileTab: (tab: string) => void; reserveReward: () => void }) { return <><PageHead title="تطبيق العميل" subtitle="تجربة جوال مستقلة — ما يراه العميل بعد تسجيل الدخول" action={<><Badge tone="success"><UserRound size={11} />عبدالله السالم</Badge><button className="ghost-btn"><ShareIcon />مشاركة المعاينة</button></>} /><div className="mobile-stage"><div className="mobile-preview"><div className="mobile-top"><span>٩:٤١</span><span>●●● ᯤ</span></div><div className="mobile-content">{mobileTab === "الرئيسية" && <><div className="mobile-greeting">مساء الخير</div><h2>عبدالله السالم</h2><div className="mobile-balance"><span>رصيدك الحالي</span><b>{NUM(selectedCustomer.points)}</b><small>نقطة متاحة · {NUM(selectedCustomer.reserved)} محجوزة</small></div><div className="mobile-actions"><button className="mobile-action"><Car />حجز غسلة</button><button className="mobile-action"><Gift />المكافآت</button><button className="mobile-action"><Tag />كود شريك</button></div><div className="mobile-section-head"><strong>مكافأة قريبة</strong><span>عرض الكل</span></div><div className="mobile-reward"><div className="mobile-reward-icon"><Droplets size={16} /></div><div><strong>غسيل خارجي مجاني</strong><span>تبقى ٣٠٠ نقطة</span></div><button onClick={reserveReward}>حجز</button></div><div className="mobile-section-head"><strong>اشتراكك الحالي</strong><span>التفاصيل</span></div><div className="mobile-reward"><div className="mobile-reward-icon"><Crown size={16} /></div><div><strong>الباقة الشهرية</strong><span>متبقي ٢ من ٥ غسلات</span></div><Badge tone="success">نشط</Badge></div></>}{mobileTab === "المكافآت" && <><h2>مكافآتي</h2><div className="mobile-reward"><div className="mobile-reward-icon"><Gift size={16} /></div><div><strong>غسيل خارجي مجاني</strong><span>٣٠٠ نقطة</span></div><button onClick={reserveReward}>حجز</button></div><div className="mobile-reward" style={{ marginTop: 9 }}><div className="mobile-reward-icon"><Sparkles size={16} /></div><div><strong>ترقية إلى فاخر</strong><span>٥٥٠ نقطة</span></div><button>قريبًا</button></div></>}{mobileTab === "سجل الزيارات" && <><h2>سجل الزيارات</h2>{state.invoices.filter((invoice) => invoice.customerId === selectedCustomer.id).map((invoice) => <div className="mobile-reward" key={invoice.id} style={{ marginBottom: 8 }}><div className="mobile-reward-icon"><Car size={16} /></div><div><strong>{invoice.service}</strong><span>{invoice.time} · {SAR(invoice.amount)}</span></div><Badge>{invoice.status}</Badge></div>)}</>}{mobileTab === "حسابي" && <><h2>حسابي</h2><div className="mobile-reward"><div className="profile-avatar">ع</div><div><strong>{selectedCustomer.name}</strong><span dir="ltr">{selectedCustomer.phone}</span></div></div><div className="split-list" style={{ marginTop: 14 }}><div className="split-row"><span>المركبة</span><strong>{selectedCustomer.vehicle}</strong></div><div className="split-row"><span>كود الإحالة</span><strong dir="ltr">ABD-183</strong></div><div className="split-row"><span>كود الشريك</span><strong dir="ltr">FUEL10</strong></div></div></>}</div><div className="mobile-nav">{["الرئيسية", "المكافآت", "سجل الزيارات", "حسابي"].map((tab, index) => <button className={mobileTab === tab ? "active" : ""} key={tab} onClick={() => setMobileTab(tab)}>{[<LayoutDashboard />, <Gift />, <FileText />, <UserRound />][index]}{tab}</button>)}</div></div></div></>; }

function ShareIcon() { return <ArrowUpLeft size={13} />; }
