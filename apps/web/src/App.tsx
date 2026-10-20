// import { useState } from 'react'
// import heroImg from './assets/hero.png'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <section id="center">
//         <div className="hero">
//           <img src={heroImg} className="base" width="170" height="179" alt="" />
//           <img src={reactLogo} className="framework" alt="React logo" />
//           <img src={viteLogo} className="vite" alt="Vite logo" />
//         </div>
//         <div>
//           <h1>Get started</h1>
//           <p>
//             Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
//           </p>
//         </div>
//         <button
//           type="button"
//           className="counter"
//           onClick={() => setCount((count) => count + 1)}
//         >
//           Count is {count}
//         </button>
//       </section>

//       <div className="ticks"></div>

//       <section id="next-steps">
//         <div id="docs">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#documentation-icon"></use>
//           </svg>
//           <h2>Documentation</h2>
//           <p>Your questions, answered</p>
//           <ul>
//             <li>
//               <a href="https://vite.dev/" target="_blank">
//                 <img className="logo" src={viteLogo} alt="" />
//                 Explore Vite
//               </a>
//             </li>
//             <li>
//               <a href="https://react.dev/" target="_blank">
//                 <img className="button-icon" src={reactLogo} alt="" />
//                 Learn more
//               </a>
//             </li>
//           </ul>
//         </div>
//         <div id="social">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#social-icon"></use>
//           </svg>
//           <h2>Connect with us</h2>
//           <p>Join the Vite community</p>
//           <ul>
//             <li>
//               <a href="https://github.com/vitejs/vite" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#github-icon"></use>
//                 </svg>
//                 GitHub
//               </a>
//             </li>
//             <li>
//               <a href="https://chat.vite.dev/" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#discord-icon"></use>
//                 </svg>
//                 Discord
//               </a>
//             </li>
//             <li>
//               <a href="https://x.com/vite_js" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#x-icon"></use>
//                 </svg>
//                 X.com
//               </a>
//             </li>
//             <li>
//               <a href="https://bsky.app/profile/vite.dev" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#bluesky-icon"></use>
//                 </svg>
//                 Bluesky
//               </a>
//             </li>
//           </ul>
//         </div>
//       </section>

//       <div className="ticks"></div>
//       <section id="spacer"></section>
//     </>
//   )
// }

// export default App

import CitizenReportPage from './features/incidents/pages/CitizenReportPage';
import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  LayoutDashboard,
  MapPin,
  Menu,
  MessageSquare,
  Plus,
  Radio,
  Search,
  Settings,
  ShieldCheck,
  Siren,
  Users,
  Video,
  X,
} from 'lucide-react';

type Role = 'Dispatcher' | 'Citizen' | 'Responder' | 'Administrator';

type Incident = {
  reference: string;
  title: string;
  location: string;
  priority: 'Critical' | 'High' | 'Medium';
  status: 'Reported' | 'Under Review' | 'Dispatched' | 'Resolved';
  time: string;
  type: 'Fire' | 'Road Accident' | 'Medical' | 'Flood';
};

const roleOptions: Role[] = [
  'Dispatcher',
  'Citizen',
  'Responder',
  'Administrator',
];

const roleMenus: Record<
  Role,
  { label: string; icon: LucideIcon }[]
> = {
  Dispatcher: [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'All Incidents', icon: Siren },
    { label: 'Live Operations', icon: Radio },
    { label: 'Response Teams', icon: Users },
    { label: 'Reports', icon: FileText },
  ],
  Citizen: [
    { label: 'My Dashboard', icon: LayoutDashboard },
    { label: 'Report Emergency', icon: Plus },
    { label: 'My Reports', icon: Siren },
    { label: 'Messages', icon: MessageSquare },
  ],
  Responder: [
    { label: 'My Dashboard', icon: LayoutDashboard },
    { label: 'Assigned Incidents', icon: Siren },
    { label: 'Response Updates', icon: Activity },
    { label: 'Messages', icon: MessageSquare },
  ],
  Administrator: [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'All Incidents', icon: Siren },
    { label: 'User Management', icon: Users },
    { label: 'Reports & Analytics', icon: FileText },
    { label: 'Settings', icon: Settings },
  ],
};

const incidents: Incident[] = [
  {
    reference: 'CF-2026-0042',
    title: 'Road traffic collision',
    location: 'North Circular Road, Dublin 7',
    priority: 'Critical',
    status: 'Dispatched',
    time: '2 min ago',
    type: 'Road Accident',
  },
  {
    reference: 'CF-2026-0041',
    title: 'Medical assistance required',
    location: 'Dorset Street, Dublin 1',
    priority: 'High',
    status: 'Under Review',
    time: '8 min ago',
    type: 'Medical',
  },
  {
    reference: 'CF-2026-0040',
    title: 'Building fire reported',
    location: 'Phibsborough Road, Dublin 7',
    priority: 'Critical',
    status: 'Dispatched',
    time: '12 min ago',
    type: 'Fire',
  },
  {
    reference: 'CF-2026-0039',
    title: 'Localised flooding',
    location: 'Church Street, Dublin 7',
    priority: 'Medium',
    status: 'Reported',
    time: '18 min ago',
    type: 'Flood',
  },
  {
    reference: 'CF-2026-0038',
    title: 'Minor road collision',
    location: 'Cabra Road, Dublin 7',
    priority: 'Medium',
    status: 'Resolved',
    time: '32 min ago',
    type: 'Road Accident',
  },
];

const stats = [
  {
    label: 'Total incidents',
    value: '128',
    change: '+12.5%',
    trend: 'up',
    icon: Siren,
    color: 'text-blue-600',
    background: 'bg-blue-50',
  },
  {
    label: 'Awaiting response',
    value: '18',
    change: '-8.2%',
    trend: 'down',
    icon: Clock3,
    color: 'text-amber-600',
    background: 'bg-amber-50',
  },
  {
    label: 'Teams deployed',
    value: '24',
    change: '+4.1%',
    trend: 'up',
    icon: Radio,
    color: 'text-violet-600',
    background: 'bg-violet-50',
  },
  {
    label: 'Resolved today',
    value: '86',
    change: '+16.8%',
    trend: 'up',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    background: 'bg-emerald-50',
  },
];

const priorityStyles: Record<Incident['priority'], string> = {
  Critical: 'bg-red-50 text-red-700 ring-red-200',
  High: 'bg-orange-50 text-orange-700 ring-orange-200',
  Medium: 'bg-amber-50 text-amber-700 ring-amber-200',
};

const statusStyles: Record<Incident['status'], string> = {
  Reported: 'bg-slate-100 text-slate-700',
  'Under Review': 'bg-blue-50 text-blue-700',
  Dispatched: 'bg-violet-50 text-violet-700',
  Resolved: 'bg-emerald-50 text-emerald-700',
};

function App() {
  const [role, setRole] = useState<Role>('Dispatcher');
  const [activeMenu, setActiveMenu] = useState('Overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const navigation = roleMenus[role];

  const visibleIncidents = incidents.filter((incident) => {
    const matchesSearch = [
      incident.reference,
      incident.title,
      incident.location,
      incident.type,
    ]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesPriority =
      priorityFilter === 'All' ||
      incident.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const changeRole = (nextRole: Role) => {
    setRole(nextRole);
    setActiveMenu(roleMenus[nextRole][0].label);
    setMobileMenuOpen(false);
  };

  const pageTitle =
    activeMenu === 'Overview' || activeMenu === 'My Dashboard'
      ? `${role} dashboard`
      : activeMenu;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {mobileMenuOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <a href="#" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white">
              <Siren size={23} />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">
                Crisis<span className="text-blue-700">Flow</span>
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Emergency response
              </p>
            </div>
          </a>
          <button
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="border-b border-slate-100 p-4">
          <label
            htmlFor="role-switcher"
            className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400"
          >
            Development role preview
          </label>
          <div className="relative">
            <ShieldCheck
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-700"
            />
            <select
              id="role-switcher"
              value={role}
              onChange={(event) =>
                changeRole(event.target.value as Role)
              }
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-8 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {roleOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Workspace
          </p>
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = activeMenu === item.label;

            return (
              <button
                key={item.label}
                onClick={() => {
                  setActiveMenu(item.label);
                  setMobileMenuOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={19} />
                <span>{item.label}</span>
                {item.label === 'All Incidents' && (
                  <span className="ml-auto rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                    18
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="rounded-2xl bg-slate-900 p-4 text-white">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <ShieldCheck size={20} />
            </div>
            <p className="text-sm font-semibold">Emergency operations</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Keep teams informed and communities safer.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Interface preview
            </div>
          </div>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open navigation"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={22} />
            </button>
            <div className="min-w-0">
              <p className="truncate text-xs text-slate-400">
                Workspace / {role}
              </p>
              <h1 className="mt-1 truncate text-lg font-bold sm:text-xl">
                {pageTitle}
              </h1>
            </div>
          </div>

          <div className="ml-3 flex items-center gap-2 sm:gap-4">
            <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              System online
            </div>
            <button
              aria-label="Search incidents"
              onClick={() =>
                document.getElementById('incident-search')?.focus()
              }
              className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100"
            >
              <Search size={20} />
            </button>
            <button
              aria-label="Notifications"
              className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100"
            >
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
            </button>
            <div className="hidden h-9 w-px bg-slate-200 sm:block" />
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                CF
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold">Demo User</p>
                <p className="text-xs text-slate-400">{role}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] space-y-7 p-4 sm:p-6 lg:p-8">
          {role === 'Citizen' && activeMenu === 'Report Emergency' ? (
            <CitizenReportPage/>
          ) : (
            <>
          <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
                <Activity size={15} />
                Emergency management platform
              </div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Good day, {role === 'Citizen' ? 'there' : role}.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                {role === 'Dispatcher'
                  ? 'Monitor incoming incidents, coordinate response teams, and keep every response moving.'
                  : role === 'Citizen'
                    ? 'Report emergencies and keep track of the incidents you have submitted.'
                    : role === 'Responder'
                      ? 'Review your assigned incidents and stay up to date with response activities.'
                      : 'Monitor platform activity and review incident operations at a glance.'}
              </p>
            </div>

            {role === 'Citizen' ? (
              <button
                onClick={() => setActiveMenu('Report Emergency')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
              >
                <Plus size={18} />
                Report emergency
              </button>
            ) : (
              <button
                onClick={() => setActiveMenu('All Incidents')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
              >
                <Activity size={18} />
                View incidents
                <ArrowRight size={16} />
              </button>
            )}
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              const Trend =
                stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;

              return (
                <article
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/70"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {stat.label}
                      </p>
                      <p className="mt-3 text-3xl font-bold tracking-tight">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.background} ${stat.color}`}
                    >
                      <Icon size={21} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-xs">
                    <span
                      className={`inline-flex items-center font-semibold ${
                        stat.trend === 'up'
                          ? 'text-emerald-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      <Trend size={14} />
                      {stat.change}
                    </span>
                    <span className="text-slate-400">
                      vs. previous period
                    </span>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
              <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:px-6">
                <div>
                  <h3 className="font-bold">Recent incidents</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Review the latest reported emergencies
                  </p>
                </div>
                <button
                  onClick={() => setActiveMenu('All Incidents')}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900"
                >
                  View all <ArrowRight size={15} />
                </button>
              </div>

              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:px-6">
                <div className="relative flex-1">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="incident-search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search incidents or locations..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <select
                  value={priorityFilter}
                  onChange={(event) => setPriorityFilter(event.target.value)}
                  aria-label="Filter by priority"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="All">All priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[690px] text-left">
                  <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-6 py-3">Incident</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Reported</th>
                      <th className="px-4 py-3">Evidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleIncidents.map((incident) => (
                      <tr
                        key={incident.reference}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold">
                            {incident.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {incident.reference}
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                            <MapPin size={12} />
                            {incident.location}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${priorityStyles[incident.priority]}`}
                          >
                            {incident.priority}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[incident.status]}`}
                          >
                            {incident.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">
                          {incident.time}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            title="Preview evidence (demo)"
                            aria-label={`Preview evidence for ${incident.reference}`}
                            className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Video size={17} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {visibleIncidents.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-sm text-slate-500"
                        >
                          No incidents match your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-100 px-6 py-4 text-xs text-slate-400">
                Showing {visibleIncidents.length} of {incidents.length} demo incidents
              </div>
            </article>

            <div className="space-y-6">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">Response overview</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Current operational snapshot
                    </p>
                  </div>
                  <Activity size={19} className="text-blue-700" />
                </div>

                <div className="mt-6 space-y-5">
                  {[
                    {
                      label: 'Reported',
                      count: 18,
                      width: '25%',
                      color: 'bg-slate-400',
                    },
                    {
                      label: 'Under review',
                      count: 12,
                      width: '40%',
                      color: 'bg-blue-500',
                    },
                    {
                      label: 'Dispatched',
                      count: 24,
                      width: '65%',
                      color: 'bg-violet-500',
                    },
                    {
                      label: 'Resolved',
                      count: 86,
                      width: '90%',
                      color: 'bg-emerald-500',
                    },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-slate-600">
                          {item.label}
                        </span>
                        <span className="font-semibold">
                          {item.count}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${item.color}`}
                          style={{ width: item.width }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-start gap-3 rounded-xl bg-blue-50 p-3.5">
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0 text-blue-700"
                  />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">
                      Operations snapshot
                    </p>
                    <p className="mt-1 text-xs leading-5 text-blue-800/75">
                      Example figures for the dashboard preview. Live metrics
                      will come from the API.
                    </p>
                  </div>
                </div>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={19} className="text-amber-600" />
                  <h3 className="font-bold">Priority attention</h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Critical incidents should be reviewed promptly by an
                  authorised dispatcher.
                </p>
                <div className="mt-4 flex items-center justify-between rounded-xl border border-red-100 bg-red-50 p-3">
                  <div>
                    <p className="text-sm font-semibold text-red-800">
                      Critical incidents
                    </p>
                    <p className="mt-1 text-xs text-red-600">
                      Example data
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-red-700">
                    02
                  </span>
                </div>
                <button
                  onClick={() => {
                    setPriorityFilter('Critical');
                    setActiveMenu(
                      role === 'Citizen' ? 'My Reports' : 'All Incidents',
                    );
                  }}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Review critical incidents
                  <ArrowRight size={16} />
                </button>
              </article>
            </div>
          </section>

          <footer className="flex flex-col gap-2 border-t border-slate-200 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 CrisisFlow · Emergency response coordination</p>
            <p className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Development preview · Sample data only
            </p>
          </footer>
          </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
