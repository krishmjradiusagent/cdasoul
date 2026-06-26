import * as React from "react";
import { ChevronDown, Home, Search, ArrowLeft, X, ChevronRight, Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---

interface TeamMember {
  id: string;
  name: string;
  memberType: string;
  inviteStatus: string;
  userPermission: string;
  radiusCap: number;
  internalCapPlaceholder: string;
  teamSplitPlaceholder: string;
  preRadiusProgress: number;
  progressToInternal: number;
}
interface RadiusFee {
  feeId: string;
  feeName: string;
  feeType: "Flat Fee" | "Percentage";
  flatAmount: string;
  percentAmount: string;
  whenApplied: "Pre-Split" | "Post-Split";
  feePayer: "Team" | "Agent";
  coAgentSplits: "Split equally" | "Proportional to split" | "Higher-cap agent pays";
  payableTo: "Radius" | "Other";
  payableName: string;
  slidingScale: boolean;
  contributesToCap: boolean;
}
const blankFee = (): Omit<RadiusFee, "feeId"> => ({
  feeName: "",
  feeType: "Flat Fee",
  flatAmount: "",
  percentAmount: "",
  whenApplied: "Pre-Split",
  feePayer: "Team",
  coAgentSplits: "Split equally",
  payableTo: "Radius",
  payableName: "Radius",
  slidingScale: false,
  contributesToCap: false
});
const formatFeeAmount = (fee: RadiusFee): string => {
  if (fee.feeType === "Flat Fee") return fee.flatAmount ? `$${fee.flatAmount}` : "—";
  return fee.percentAmount ? `${fee.percentAmount}%` : "—";
};

// --- Mock Data ---

const TEAM_MEMBERS_DATA: TeamMember[] = [{
  id: "1",
  name: "ALINE TALBOT",
  memberType: "Team Member",
  inviteStatus: "Accepted",
  userPermission: "",
  radiusCap: 0,
  internalCapPlaceholder: "Enter I...",
  teamSplitPlaceholder: "Enter ...",
  preRadiusProgress: 0,
  progressToInternal: 0
}, {
  id: "2",
  name: "AUSTIN DOSSEY",
  memberType: "Team Member",
  inviteStatus: "Accepted",
  userPermission: "",
  radiusCap: 0,
  internalCapPlaceholder: "Enter I...",
  teamSplitPlaceholder: "Enter ...",
  preRadiusProgress: 0,
  progressToInternal: 0
}, {
  id: "3",
  name: "CARLOS NAVA",
  memberType: "Operations",
  inviteStatus: "Accepted",
  userPermission: "",
  radiusCap: 0,
  internalCapPlaceholder: "Enter I...",
  teamSplitPlaceholder: "Enter ...",
  preRadiusProgress: 0,
  progressToInternal: 0
}, {
  id: "4",
  name: "DON SAN ANGELO",
  memberType: "Admins",
  inviteStatus: "Accepted",
  userPermission: "",
  radiusCap: 0,
  internalCapPlaceholder: "Enter I...",
  teamSplitPlaceholder: "Enter ...",
  preRadiusProgress: 0,
  progressToInternal: 0
}];
const FEE_TYPE_OPTIONS: RadiusFee["feeType"][] = ["Flat Fee", "Percentage"];
const WHEN_APPLIED_OPTIONS: RadiusFee["whenApplied"][] = ["Pre-Split", "Post-Split"];
const FEE_PAYER_OPTIONS: RadiusFee["feePayer"][] = ["Team", "Agent"];
const CO_AGENT_SPLIT_OPTIONS: RadiusFee["coAgentSplits"][] = ["Split equally", "Proportional to split", "Higher-cap agent pays"];
const PAYABLE_TO_OPTIONS: RadiusFee["payableTo"][] = ["Radius", "Other"];

// --- Fee Modal (shared) ---

interface FeeModalProps {
  editingFee: RadiusFee | null;
  subtitle?: string;
  onSave: (fee: RadiusFee) => void;
  onClose: () => void;
}
const FeeModal = ({ editingFee, subtitle, onSave, onClose }: FeeModalProps) => {
  const isEditing = editingFee !== null;
  const [fee, setFee] = React.useState<RadiusFee>(() => editingFee ?? { feeId: `fee-${Date.now()}`, ...blankFee() });
  const update = <K extends keyof RadiusFee>(key: K, val: RadiusFee[K]) =>
    setFee(prev => ({ ...prev, [key]: val }));
  const canSave = fee.feeName.trim().length > 0;
  const handleSave = () => {
    if (!canSave) return;
    onSave(fee);
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={e => {
    if (e.target === e.currentTarget) onClose();
  }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{isEditing ? "Edit Fee" : "Add Fee"}</h3>
            <p className="text-sm text-gray-400 mt-0.5">{subtitle ?? "Configure fee type details."}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-md transition-colors" aria-label="Close modal">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col gap-5 overflow-y-auto">
          {/* Fee Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">Fee Name</label>
            <input type="text" value={fee.feeName} onChange={e => update("feeName", e.target.value)} placeholder="e.g., Transaction Coordinator Fee" className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 placeholder:text-gray-300 transition-all" />
          </div>

          {/* Fee Type + Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-800">Fee Type</label>
              <div className="relative">
                <select value={fee.feeType} onChange={e => update("feeType", e.target.value as RadiusFee["feeType"])} className="w-full appearance-none bg-white border border-gray-200 rounded px-3 py-2.5 pr-8 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer">
                  {FEE_TYPE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-800">{fee.feeType === "Flat Fee" ? "Flat Fee" : "Percentage"}</label>
              {fee.feeType === "Flat Fee" ? <div className="flex items-center border border-gray-200 rounded overflow-hidden bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <span className="px-3 py-2.5 text-sm text-gray-400 bg-gray-50 border-r border-gray-200 select-none">$</span>
                <input type="number" value={fee.flatAmount} onChange={e => update("flatAmount", e.target.value)} placeholder="495" className="flex-1 px-3 py-2.5 text-sm text-gray-800 outline-none bg-white placeholder:text-gray-300 min-w-0" />
              </div> : <div className="flex items-center border border-gray-200 rounded overflow-hidden bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <input type="number" value={fee.percentAmount} onChange={e => update("percentAmount", e.target.value)} placeholder="1.5" className="flex-1 px-3 py-2.5 text-sm text-gray-800 outline-none bg-white placeholder:text-gray-300 min-w-0" />
                <span className="px-3 py-2.5 text-sm text-gray-400 bg-gray-50 border-l border-gray-200 select-none">%</span>
              </div>}
            </div>
          </div>

          {/* When Applied + Fee Payer + Co-Agent Splits */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-800">When Applied</label>
              <div className="relative">
                <select value={fee.whenApplied} onChange={e => update("whenApplied", e.target.value as RadiusFee["whenApplied"])} className="w-full appearance-none bg-white border border-gray-200 rounded px-3 py-2.5 pr-8 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer">
                  {WHEN_APPLIED_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center"><ChevronDown className="w-4 h-4 text-gray-400" /></div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-800">Fee Payer</label>
              <div className="relative">
                <select value={fee.feePayer} onChange={e => update("feePayer", e.target.value as RadiusFee["feePayer"])} className="w-full appearance-none bg-white border border-gray-200 rounded px-3 py-2.5 pr-8 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer">
                  {FEE_PAYER_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center"><ChevronDown className="w-4 h-4 text-gray-400" /></div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-800">Co-Agent Splits</label>
              <div className="relative">
                <select value={fee.coAgentSplits} onChange={e => update("coAgentSplits", e.target.value as RadiusFee["coAgentSplits"])} className="w-full appearance-none bg-white border border-gray-200 rounded px-3 py-2.5 pr-8 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer">
                  {CO_AGENT_SPLIT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center"><ChevronDown className="w-4 h-4 text-gray-400" /></div>
              </div>
            </div>
          </div>

          {/* Payable To + Payable Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-800">Payable To</label>
              <div className="relative">
                <select value={fee.payableTo} onChange={e => update("payableTo", e.target.value as RadiusFee["payableTo"])} className="w-full appearance-none bg-white border border-gray-200 rounded px-3 py-2.5 pr-8 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer">
                  {PAYABLE_TO_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center"><ChevronDown className="w-4 h-4 text-gray-400" /></div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-800">Payable Name</label>
              <input type="text" value={fee.payableName} onChange={e => update("payableName", e.target.value)} placeholder="Radius" className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 placeholder:text-gray-300 transition-all" />
            </div>
          </div>

          {/* Sliding Scale toggle */}
          <ToggleRow label="Sliding Scale" hint="Enable tiered fee values." value={fee.slidingScale} onChange={v => update("slidingScale", v)} />

          {/* Contributes to Cap toggle */}
          <ToggleRow label="Contributes to Cap" hint="Count toward cap." value={fee.contributesToCap} onChange={v => update("contributesToCap", v)} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2 rounded border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-100 transition-colors">Cancel</button>
          <button type="button" disabled={!canSave} onClick={handleSave} className={cn("px-5 py-2 rounded text-white text-sm font-semibold transition-colors shadow-sm", canSave ? "bg-[#5A5FF2] hover:bg-indigo-600" : "bg-gray-300 cursor-not-allowed")}>Save Fee Type</button>
        </div>
      </div>
    </div>;
};

interface ToggleRowProps {
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
}
const ToggleRow = ({ label, hint, value, onChange }: ToggleRowProps) => {
  return <div className="flex items-center justify-between border border-gray-200 rounded-md px-4 py-3">
    <div>
      <div className="text-sm font-semibold text-gray-800">{label}</div>
      <div className="text-xs text-gray-500 mt-0.5">{hint}</div>
    </div>
    <button type="button" role="switch" aria-checked={value} onClick={() => onChange(!value)} className={cn("relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1", value ? "bg-[#5A5FF2]" : "bg-gray-300")}>
      <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200", value ? "translate-x-6" : "translate-x-1")} />
    </button>
  </div>;
};


// --- Sub-components ---

const Navbar = () => {
  return <nav className="w-full bg-[#1565C0] h-16 flex items-center justify-between px-4 sticky top-0 z-40">
      <div className="flex items-center gap-6">
        <div className="flex items-center text-2xl font-black tracking-tighter cursor-pointer">
          <span className="text-[#FF5252]">S</span>
          <span className="text-[#FFD740]">O</span>
          <span className="text-[#448AFF]">U</span>
          <span className="text-[#69F0AE]">L</span>
        </div>

        <button className="text-white hover:bg-white/10 p-2 rounded-md transition-colors">
          <Home className="w-5 h-5" />
        </button>

        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input type="text" placeholder="Quick Agent Search" className="bg-white rounded-full py-2 pl-10 pr-4 w-[300px] text-sm outline-none border-none shadow-sm focus:ring-2 focus:ring-blue-300 transition-all" />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <button className="text-white text-sm flex items-center gap-1 hover:text-blue-100 font-medium">
            <span>Mortgage</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          <button className="text-white text-sm flex items-center gap-1 hover:text-blue-100 font-medium">
            <span>Dashboards</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="border border-white text-white rounded-full px-5 py-2 text-xs font-semibold hover:bg-white/10 transition-colors uppercase tracking-wide">
            Audit Dashboard
          </button>
          <button className="bg-white text-[#1565C0] rounded-full px-5 py-2 text-xs font-semibold hover:bg-blue-50 transition-colors uppercase tracking-wide">
            Create Agent Account
          </button>
        </div>
      </div>
    </nav>;
};
const PageHeader = () => {
  return <div className="w-full bg-white px-6 py-6 border-b border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="text-gray-600 hover:bg-gray-100 p-1 rounded-md">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Create/Edit Team</h1>
            <span className="text-sm text-gray-400">Create/Edit Team Or Create/Edit Jobs</span>
            <a href="#" className="text-sm text-blue-500 hover:underline ml-4 font-medium">
              View Team Public Page
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="px-5 py-2.5 rounded border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors">
            View Jobs
          </button>
          <button className="px-5 py-2.5 rounded bg-[#2196F3] text-white text-sm font-semibold hover:bg-blue-600 transition-colors">
            Create Job
          </button>
        </div>
      </div>
    </div>;
};
const TabsRow = () => {
  return <div className="w-full bg-white px-6 flex items-center justify-between border-b border-gray-200">
      <div className="flex">
        <button className="px-6 py-4 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors relative">
          Team Info
        </button>
        <button className="px-6 py-4 text-sm font-bold text-[#2196F3] relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#2196F3]">
          Team Members
        </button>
        <button className="px-6 py-4 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
          Team TCs
        </button>
      </div>

      <button className="bg-[#2196F3] text-white px-8 py-2 rounded text-sm font-bold shadow-sm hover:bg-blue-600 transition-all flex items-center gap-2 m-2">
        <span>Save</span>
      </button>
    </div>;
};
interface TeamTableProps {
  toggleStates: Record<string, boolean>;
  onToggle: (id: string) => void;
  memberFees: Record<string, RadiusFee[]>;
  onAddFee: (memberId: string) => void;
  onEditFee: (memberId: string, fee: RadiusFee) => void;
  onDeleteFee: (memberId: string, feeId: string) => void;
}
const TeamTable = ({
  toggleStates,
  onToggle,
  memberFees,
  onAddFee,
  onEditFee,
  onDeleteFee
}: TeamTableProps) => {
  const [expandedFees, setExpandedFees] = React.useState<Record<string, boolean>>({});
  const toggleExpanded = (memberId: string) => setExpandedFees(prev => ({
    ...prev,
    [memberId]: !prev[memberId]
  }));
  return <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-6 py-4 text-[13px] font-normal text-gray-500 uppercase tracking-tight">
              Agent Name
            </th>
            <th className="px-6 py-4 text-[13px] font-normal text-gray-500 uppercase tracking-tight">
              Member Type
            </th>
            <th className="px-6 py-4 text-[13px] font-normal text-gray-500 uppercase tracking-tight whitespace-nowrap">
              Fees
            </th>
            <th className="px-6 py-4 text-[13px] font-normal text-gray-500 uppercase tracking-tight whitespace-nowrap" style={{
            display: "none"
          }}>
              CDA Confirmation Visibility
            </th>
            <th className="px-6 py-4 text-[13px] font-normal text-gray-500 uppercase tracking-tight">
              Actions
            </th>
            <th className="px-6 py-4 text-[13px] font-normal text-gray-500 uppercase tracking-tight">
              Invite Status
            </th>
            <th className="px-6 py-4 text-[13px] font-normal text-gray-500 uppercase tracking-tight whitespace-nowrap">
              User permission
            </th>
            <th className="px-6 py-4 text-[13px] font-normal text-gray-500 uppercase tracking-tight whitespace-nowrap">
              Radius Cap
            </th>
            <th className="px-6 py-4 text-[13px] font-normal text-gray-500 uppercase tracking-tight whitespace-nowrap">
              Internal Cap
            </th>
            <th className="px-6 py-4 text-[13px] font-normal text-gray-500 uppercase tracking-tight whitespace-nowrap">
              Team Split
            </th>
            <th className="px-6 py-4 text-[13px] font-normal text-gray-500 uppercase tracking-tight leading-tight max-w-[120px]" style={{
            width: "1000px",
            maxWidth: "1000px"
          }}>
              Pre Radius Progress to Internal Cap
            </th>
            <th className="px-6 py-4 text-[13px] font-normal text-gray-500 uppercase tracking-tight leading-tight max-w-[120px]">
              Progress to I... Cap
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {TEAM_MEMBERS_DATA.map(member => {
          const isTeamMember = member.memberType === "Team Member";
          const isOn = toggleStates[member.id] ?? false;
          const fees = memberFees[member.id] ?? [];
          const isExpanded = expandedFees[member.id] ?? false;
          return <React.Fragment key={member.id}><tr className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-6">
                  <span className="font-bold text-gray-900 text-sm tracking-wide">
                    {member.name}
                  </span>
                </td>
                <td className="px-6 py-6">
                  <span className="px-3 py-1 text-[11px] font-semibold text-blue-600 bg-blue-50/50 border border-blue-200 rounded-full whitespace-nowrap uppercase tracking-wider">
                    {member.memberType}
                  </span>
                </td>
                {/* Fee Column */}
                <td className="px-6 py-6 min-w-[160px]">
                  {fees.length === 0 ? <button type="button" onClick={() => onAddFee(member.id)} className="flex items-center gap-1 text-[#2196F3] text-sm font-medium hover:underline transition-colors whitespace-nowrap">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Fee</span>
                    </button> : <div className="flex items-center gap-3">
                      <button type="button" onClick={() => toggleExpanded(member.id)} className="flex items-center gap-1.5 text-sm font-medium text-[#2196F3] hover:underline transition-colors whitespace-nowrap" aria-expanded={isExpanded}>
                        <span>{fees.length} {fees.length === 1 ? "fee" : "fees"}</span>
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      {!isExpanded && <button type="button" onClick={() => onAddFee(member.id)} className="flex items-center gap-1 text-[#2196F3] text-sm font-medium hover:underline transition-colors whitespace-nowrap">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>}
                    </div>}
                </td>
                <td className="px-6 py-6" style={{
              display: "none"
            }}>
                  <button type="button" role="switch" aria-checked={isOn} disabled={isTeamMember} onClick={() => {
                if (!isTeamMember) onToggle(member.id);
              }} className={cn("relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1", isTeamMember ? "opacity-40 cursor-not-allowed bg-gray-300" : isOn ? "bg-[#5A5FF2] cursor-pointer" : "bg-gray-300 cursor-pointer")}>
                    <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200", isOn ? "translate-x-6" : "translate-x-1")} />
                  </button>
                </td>
                <td className="px-6 py-6">
                  <button className="text-[#C62828] text-sm font-medium hover:underline hover:text-red-700 transition-colors">
                    Remove
                  </button>
                </td>
                <td className="px-6 py-6">
                  <div className="relative min-w-[140px]">
                    <div className="flex items-center justify-between border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 bg-white cursor-pointer group-hover:border-gray-300">
                      <span>{member.inviteStatus}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <div className="relative min-w-[140px]">
                    <div className="flex items-center justify-between border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 bg-white h-[38px] cursor-pointer group-hover:border-gray-300">
                      <span className="text-gray-400 italic"></span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6 text-center">
                  <span className="text-sm text-gray-900">{member.radiusCap}</span>
                </td>
                <td className="px-6 py-6">
                  <input type="text" placeholder={member.internalCapPlaceholder} className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-blue-400 placeholder:text-gray-300 group-hover:border-gray-300 transition-all" />
                </td>
                <td className="px-6 py-6">
                  <input type="text" placeholder={member.teamSplitPlaceholder} className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-blue-400 placeholder:text-gray-300 group-hover:border-gray-300 transition-all" />
                </td>
                <td className="px-6 py-6 text-center">
                  <span className="text-sm text-gray-900">{member.preRadiusProgress}</span>
                </td>
                <td className="px-6 py-6 text-center">
                  <span className="text-sm text-gray-900">{member.progressToInternal}</span>
                </td>
              </tr>
              {isExpanded && fees.length > 0 && <tr className="bg-gray-50/40">
                <td colSpan={12} className="px-6 pt-3 pb-4">
                  <div className="overflow-hidden border border-gray-200 rounded bg-white max-w-3xl">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                          <th className="px-3 py-2">Fee Name</th>
                          <th className="px-3 py-2">Payer</th>
                          <th className="px-3 py-2">Amount</th>
                          <th className="px-3 py-2 w-20 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {fees.map(fee => <tr key={fee.feeId}>
                          <td className="px-3 py-2 text-gray-800 font-medium">{fee.feeName || "—"}</td>
                          <td className="px-3 py-2 text-gray-600">{fee.feePayer}</td>
                          <td className="px-3 py-2 text-gray-600">{formatFeeAmount(fee)}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-end gap-0.5">
                              <button type="button" onClick={() => onEditFee(member.id, fee)} className="p-1 rounded text-gray-400 hover:text-[#2196F3] hover:bg-blue-50 transition-colors" aria-label="Edit fee">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button type="button" onClick={() => onDeleteFee(member.id, fee.feeId)} className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" aria-label="Delete fee">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>)}
                      </tbody>
                    </table>
                    <div className="px-3 py-2 border-t border-gray-100">
                      <button type="button" onClick={() => onAddFee(member.id)} className="flex items-center gap-1 text-[#2196F3] text-xs font-medium hover:underline transition-colors">
                        <Plus className="w-3 h-3" />
                        <span>Add Fee</span>
                      </button>
                    </div>
                  </div>
                </td>
              </tr>}
              </React.Fragment>;
        })}
        </tbody>
      </table>
    </div>;
};

// --- Main Page ---

const getInitialToggleStates = (): Record<string, boolean> => {
  const states: Record<string, boolean> = {};
  TEAM_MEMBERS_DATA.forEach(member => {
    if (member.memberType === "Operations" || member.memberType === "Admins") {
      states[member.id] = true;
    } else {
      states[member.id] = false;
    }
  });
  return states;
};
interface ModalState {
  memberId: string;
  editingFee: RadiusFee | null;
}
export const RadiusTeamEditPage: React.FC = () => {
  const [toggleStates, setToggleStates] = React.useState<Record<string, boolean>>(getInitialToggleStates);

  // Multi-fee per-row state
  const [memberFees, setMemberFees] = React.useState<Record<string, RadiusFee[]>>({});
  const [modalState, setModalState] = React.useState<ModalState | null>(null);

  // Team fee state
  const [teamFees, setTeamFees] = React.useState<RadiusFee[]>([]);
  const [showTeamFeeModal, setShowTeamFeeModal] = React.useState<boolean>(false);
  const [editingTeamFee, setEditingTeamFee] = React.useState<RadiusFee | null>(null);

  const handleToggle = (id: string) => {
    setToggleStates(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  const handleAddFee = (memberId: string) => {
    setModalState({
      memberId,
      editingFee: null
    });
  };
  const handleEditFee = (memberId: string, fee: RadiusFee) => {
    setModalState({
      memberId,
      editingFee: fee
    });
  };
  const handleDeleteFee = (memberId: string, feeId: string) => {
    setMemberFees(prev => ({
      ...prev,
      [memberId]: (prev[memberId] ?? []).filter(f => f.feeId !== feeId)
    }));
  };
  const handleCloseModal = () => {
    setModalState(null);
  };
  const handleSaveFee = (memberId: string, fee: RadiusFee) => {
    setMemberFees(prev => {
      const existing = prev[memberId] ?? [];
      const idx = existing.findIndex(f => f.feeId === fee.feeId);
      if (idx >= 0) {
        const updated = [...existing];
        updated[idx] = fee;
        return {
          ...prev,
          [memberId]: updated
        };
      }
      return {
        ...prev,
        [memberId]: [...existing, fee]
      };
    });
    setModalState(null);
  };

  // Team fee handlers
  const handleOpenAddTeamFee = () => {
    setEditingTeamFee(null);
    setShowTeamFeeModal(true);
  };
  const handleOpenEditTeamFee = (fee: RadiusFee) => {
    setEditingTeamFee(fee);
    setShowTeamFeeModal(true);
  };
  const handleDeleteTeamFee = (feeId: string) => {
    setTeamFees(prev => prev.filter(f => f.feeId !== feeId));
  };
  const handleSaveTeamFee = (fee: RadiusFee) => {
    setTeamFees(prev => {
      const idx = prev.findIndex(f => f.feeId === fee.feeId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = fee;
        return updated;
      }
      return [...prev, fee];
    });
    setShowTeamFeeModal(false);
    setEditingTeamFee(null);
  };
  const modalMember = modalState !== null ? TEAM_MEMBERS_DATA.find(m => m.id === modalState.memberId) ?? null : null;
  return <div className="min-h-screen bg-[#F4F7FA] font-sans text-gray-900 selection:bg-blue-100">
      <Navbar />

      <main className="flex flex-col">
        <PageHeader />
        <TabsRow />

        <div className="max-w-[1440px] w-full mx-auto p-8">
          <div className="bg-white rounded-md shadow-sm min-h-[600px] overflow-hidden">
            {/* Controls Area */}
            <div className="p-8">
              <div className="flex flex-col gap-4 mb-4">
                {/* Row 1: Add member + Team Cap + Team Radius Fee label+button + Commission Breakdown */}
                <div className="flex items-center gap-6 flex-wrap">
                  <button className="bg-[#2196F3] text-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2">
                    <span>Add new team member</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <label htmlFor="team-cap" className="text-sm font-semibold text-gray-700">
                      Team Cap:
                    </label>
                    <input id="team-cap" type="text" placeholder="Enter team cap" className="border border-gray-200 rounded px-4 py-2 text-sm w-[200px] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
                  </div>

                  {/* Team Fee: label + pill button only */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">Team Fee:</span>
                    <button type="button" onClick={handleOpenAddTeamFee} className="flex items-center gap-1 text-sm font-medium border rounded-full px-4 py-1.5 transition-colors text-[#2196F3] border-[#2196F3] hover:bg-blue-50">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="ml-auto">
                    <button className="border border-gray-300 text-gray-700 bg-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2">
                      <span>Commission Breakdown</span>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Team fee list */}
              {teamFees.length > 0 && <div className="mb-6 border-t border-gray-100 pt-4">
                  <div className="overflow-hidden border border-gray-200 rounded">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                          <th className="px-3 py-2">Fee Name</th>
                          <th className="px-3 py-2">Payer</th>
                          <th className="px-3 py-2">Amount</th>
                          <th className="px-3 py-2 w-20 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {teamFees.map(fee => <tr key={fee.feeId}>
                          <td className="px-3 py-2 text-gray-800 font-medium">{fee.feeName || "—"}</td>
                          <td className="px-3 py-2 text-gray-600">{fee.feePayer}</td>
                          <td className="px-3 py-2 text-gray-600">{formatFeeAmount(fee)}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-end gap-0.5">
                              <button type="button" onClick={() => handleOpenEditTeamFee(fee)} className="p-1 rounded text-gray-400 hover:text-[#2196F3] hover:bg-blue-50 transition-colors" aria-label="Edit team fee">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button type="button" onClick={() => handleDeleteTeamFee(fee.feeId)} className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" aria-label="Delete team fee">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>)}
                      </tbody>
                    </table>
                  </div>
                </div>}

              <div className="space-y-1 mb-8">
                <p className="text-[13px] text-gray-500">
                  Add new members to the team by clicking on the add agents button!
                </p>
                <p className="text-[13px] text-gray-500">
                  If you want to change a team member's role, please delete them and add them again
                  with the new role!
                </p>
              </div>

              <div className="mb-4">
                <h2 className="text-lg text-gray-700">Team Members</h2>
              </div>

              <TeamTable toggleStates={toggleStates} onToggle={handleToggle} memberFees={memberFees} onAddFee={handleAddFee} onEditFee={handleEditFee} onDeleteFee={handleDeleteFee} />
            
            </div>
          </div>
        </div>
      </main>

      {/* Fee Modal (per-member) */}
      {modalState !== null && modalMember !== null && <FeeModal editingFee={modalState.editingFee} subtitle={`Configure fee for ${modalMember.name}.`} onSave={fee => handleSaveFee(modalMember.id, fee)} onClose={handleCloseModal} />}

      {/* Team Fee Modal */}
      {showTeamFeeModal && <FeeModal editingFee={editingTeamFee} subtitle="Configure team-level fee details." onSave={handleSaveTeamFee} onClose={() => {
        setShowTeamFeeModal(false);
        setEditingTeamFee(null);
      }} />}
    </div>;
};