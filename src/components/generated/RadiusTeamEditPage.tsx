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
interface RepAmount {
  feeType: string;
  flat: string;
  percent: string;
}
interface RadiusFee {
  feeId: string;
  feeName: string;
  representationTypes: string[];
  whoPays: string;
  commissionBreakdownType: string;
  amounts: Record<string, RepAmount>;
}
interface AuditFee {
  representationTypes: string[];
  whoPays: string;
  amounts: Record<string, RepAmount>;
}
const blankAmt = (): RepAmount => ({ feeType: "Flat", flat: "", percent: "" });

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
const WHO_PAYS_OPTIONS = ["Agent Pays", "Team Lead Pays"];
const COMMISSION_BREAKDOWN_OPTIONS = [{
  value: "Full Transparency",
  label: "Full Transparency"
}, {
  value: "Radius Split Hidden",
  label: "Radius Split Hidden"
}, {
  value: "Team Split Hidden",
  label: "Team Split Hidden"
}, {
  value: "Gross",
  label: "Gross"
}];
const FEE_TYPE_OPTIONS = ["Flat", "Percentage", "Both"];
const REPRESENTATION_TYPE_OPTIONS = ["Buyer", "Seller", "Landlord", "Tenant"];

// --- Rep Type Rules ---
// Buyer & Seller are in one category; Landlord & Tenant are in another.
// Within-category multi-select is allowed. Cross-category is not.
const REP_CATEGORY: Record<string, "residential" | "rental"> = {
  Buyer: "residential",
  Seller: "residential",
  Landlord: "rental",
  Tenant: "rental"
};

// Returns all types claimed by a fee list (used to prevent duplicates / overlaps)
const getUsedTypes = (fees: RadiusFee[], excludeFeeId?: string): string[] => {
  const used: string[] = [];
  fees.forEach(fee => {
    if (fee.feeId !== excludeFeeId) {
      fee.representationTypes.forEach(t => {
        if (!used.includes(t)) used.push(t);
      });
    }
  });
  return used;
};

// Returns true when all 4 representation types are covered (no new non-overlapping fee possible)
const allTypesCovered = (fees: RadiusFee[]): boolean => {
  const used = getUsedTypes(fees);
  return REPRESENTATION_TYPE_OPTIONS.every(t => used.includes(t));
};

// Given current selection and the already-used types (from other fees),
// determine whether a rep type button should be disabled and why.
const getRepTypeState = (type: string, currentSelection: string[], usedTypes: string[]): {
  disabled: boolean;
  reason: "used" | "category" | null;
} => {
  // Already used by another fee
  if (usedTypes.includes(type)) {
    return {
      disabled: true,
      reason: "used"
    };
  }
  return {
    disabled: false,
    reason: null
  };
};

// --- Per-Rep Amount Inputs ---

interface PerRepAmountInputsProps {
  reps: string[];
  amounts: Record<string, RepAmount>;
  setRepAmt: (rep: string, key: keyof RepAmount, val: string) => void;
}
const PerRepAmountInputs = ({ reps, amounts, setRepAmt }: PerRepAmountInputsProps) => {
  if (reps.length === 0) {
    return <p className="text-xs text-gray-400 italic">Select at least one representation type to set up a fee.</p>;
  }
  return <div className="flex flex-col gap-5">
      {reps.map(rep => {
      const a = amounts[rep] ?? blankAmt();
      const ft = a.feeType || "Flat";
      return <div key={rep} className="flex flex-col gap-3 border border-gray-200 rounded-md p-3 bg-gray-50/40">
            <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">{rep}</div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Fee Type</label>
              <div className="relative">
                <select value={ft} onChange={e => setRepAmt(rep, "feeType", e.target.value)} className="w-full appearance-none bg-white border border-gray-200 rounded px-3 py-2 pr-8 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer">
                  {FEE_TYPE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
            {ft === "Both" ? <div className="flex gap-3">
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Flat Amount</label>
                  <div className="flex items-center border border-gray-200 rounded overflow-hidden focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-white">
                    <span className="px-3 py-2 text-sm text-gray-400 bg-gray-50 border-r border-gray-200 select-none font-medium">$</span>
                    <input type="number" value={a.flat} onChange={e => setRepAmt(rep, "flat", e.target.value)} placeholder="0.00" className="flex-1 px-3 py-2 text-sm text-gray-800 outline-none bg-white placeholder:text-gray-300 min-w-0" />
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Percentage</label>
                  <div className="flex items-center border border-gray-200 rounded overflow-hidden focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-white">
                    <input type="number" value={a.percent} onChange={e => setRepAmt(rep, "percent", e.target.value)} placeholder="0.00" className="flex-1 px-3 py-2 text-sm text-gray-800 outline-none bg-white placeholder:text-gray-300 min-w-0" />
                    <span className="px-3 py-2 text-sm text-gray-400 bg-gray-50 border-l border-gray-200 select-none font-medium">%</span>
                  </div>
                </div>
              </div> : ft === "Flat" ? <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Flat Amount</label>
                <div className="flex items-center border border-gray-200 rounded overflow-hidden focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-white">
                  <span className="px-3 py-2 text-sm text-gray-400 bg-gray-50 border-r border-gray-200 select-none font-medium">$</span>
                  <input type="number" value={a.flat} onChange={e => setRepAmt(rep, "flat", e.target.value)} placeholder="0.00" className="flex-1 px-3 py-2 text-sm text-gray-800 outline-none bg-white placeholder:text-gray-300" />
                </div>
              </div> : <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Percentage</label>
                <div className="flex items-center border border-gray-200 rounded overflow-hidden focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-white">
                  <input type="number" value={a.percent} onChange={e => setRepAmt(rep, "percent", e.target.value)} placeholder="0.00" className="flex-1 px-3 py-2 text-sm text-gray-800 outline-none bg-white placeholder:text-gray-300" />
                  <span className="px-3 py-2 text-sm text-gray-400 bg-gray-50 border-l border-gray-200 select-none font-medium">%</span>
                </div>
              </div>}
          </div>;
    })}
    </div>;
};

// --- Modal ---

interface RadiusFeeModalProps {
  memberId: string;
  memberName: string;
  editingFee: RadiusFee | null;
  usedTypes: string[];
  onSave: (memberId: string, fee: RadiusFee) => void;
  onClose: () => void;
}
const RadiusFeeModal = ({
  memberId,
  memberName,
  editingFee,
  usedTypes,
  onSave,
  onClose
}: RadiusFeeModalProps) => {
  const isEditing = editingFee !== null;
  const [feeName, setFeeName] = React.useState<string>(editingFee?.feeName ?? "");
  const [representationTypes, setRepresentationTypes] = React.useState<string[]>(editingFee?.representationTypes ?? []);
  const [whoPays, setWhoPays] = React.useState<string>(editingFee?.whoPays ?? "Agent Pays");
  const [commissionBreakdownType, setCommissionBreakdownType] = React.useState<string>(editingFee?.commissionBreakdownType ?? "Full Transparency");
  const [amounts, setAmounts] = React.useState<Record<string, RepAmount>>(editingFee?.amounts ?? {});
  const toggleRepType = (type: string) => {
    const {
      disabled
    } = getRepTypeState(type, representationTypes, usedTypes);
    if (disabled && !representationTypes.includes(type)) return;
    const isOn = representationTypes.includes(type);
    if (isOn && representationTypes.length === 1) return;
    setRepresentationTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
    setAmounts(prev => {
      const next = { ...prev };
      if (isOn) delete next[type];
      else if (!next[type]) next[type] = blankAmt();
      return next;
    });
  };
  const setRepAmt = (rep: string, key: keyof RepAmount, val: string) => {
    setAmounts(prev => ({ ...prev, [rep]: { ...(prev[rep] ?? blankAmt()), [key]: val } }));
  };
  const canSave = representationTypes.length > 0;
  const handleSave = () => {
    if (!canSave) return;
    const cleanAmounts: Record<string, RepAmount> = {};
    representationTypes.forEach(r => { cleanAmounts[r] = amounts[r] ?? blankAmt(); });
    onSave(memberId, {
      feeId: editingFee?.feeId ?? `fee-${Date.now()}`,
      feeName,
      representationTypes,
      whoPays,
      commissionBreakdownType,
      amounts: cleanAmounts
    });
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={e => {
    if (e.target === e.currentTarget) onClose();
  }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {isEditing ? "Edit Radius Fee" : "Add Radius Fee"}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">{memberName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-md transition-colors" aria-label="Close modal">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-6 flex flex-col gap-6 overflow-y-auto">
          {/* Representation Type */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Representation Type
            </label>
            <div className="flex gap-2 flex-wrap">
              {REPRESENTATION_TYPE_OPTIONS.map(type => {
              const isSelected = representationTypes.includes(type);
              const {
                disabled,
                reason
              } = getRepTypeState(type, representationTypes, usedTypes);
              const isDisabled = disabled && !isSelected;
              return <button key={type} type="button" onClick={() => toggleRepType(type)} disabled={isDisabled} title={reason === "used" ? "Already used by another fee" : reason === "category" ? "Cannot mix Buyer/Seller with Landlord/Tenant" : undefined} className={cn("px-4 py-2 rounded-full text-sm font-medium border transition-all", isSelected ? "bg-[#2196F3] text-white border-[#2196F3] shadow-sm" : isDisabled ? "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50")}>
                
                  {type}
                </button>;
            })}
            </div>
          </div>

          {/* Who Pays */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Who Pays
            </label>
            <div className="relative">
              <select value={whoPays} onChange={e => setWhoPays(e.target.value)} className="w-full appearance-none bg-white border border-gray-200 rounded px-3 py-2.5 pr-8 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer">
                {WHO_PAYS_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Per-representation Fee Type + Amount */}
          <PerRepAmountInputs reps={representationTypes} amounts={amounts} setRepAmt={setRepAmt} />
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2 rounded border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="px-5 py-2 rounded bg-[#2196F3] text-white text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm">
            Save
          </button>
        </div>
      </div>
    </div>;
};

// --- Audit Fee Modal ---

interface AuditFeeModalProps {
  currentFee: AuditFee;
  onSave: (fee: AuditFee) => void;
  onClose: () => void;
}
const AuditFeeModal = ({
  currentFee,
  onSave,
  onClose
}: AuditFeeModalProps) => {
  const [representationTypes, setRepresentationTypes] = React.useState<string[]>(currentFee.representationTypes);
  const [whoPays, setWhoPays] = React.useState<string>(currentFee.whoPays);
  const [amounts, setAmounts] = React.useState<Record<string, RepAmount>>(currentFee.amounts ?? {});
  const toggleRepType = (type: string) => {
    const isOn = representationTypes.includes(type);
    if (isOn && representationTypes.length === 1) return;
    setRepresentationTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
    setAmounts(prev => {
      const next = { ...prev };
      if (isOn) delete next[type];
      else if (!next[type]) next[type] = blankAmt();
      return next;
    });
  };
  const setRepAmt = (rep: string, key: keyof RepAmount, val: string) => {
    setAmounts(prev => ({ ...prev, [rep]: { ...(prev[rep] ?? blankAmt()), [key]: val } }));
  };
  const handleSave = () => {
    if (representationTypes.length === 0) return;
    const cleanAmounts: Record<string, RepAmount> = {};
    representationTypes.forEach(r => { cleanAmounts[r] = amounts[r] ?? blankAmt(); });
    onSave({
      representationTypes,
      whoPays,
      amounts: cleanAmounts
    });
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={e => {
    if (e.target === e.currentTarget) onClose();
  }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-base font-bold text-gray-900">Audit Fee</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-md transition-colors" aria-label="Close modal">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col gap-6 overflow-y-auto">
          {/* Representation Type */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Representation Type
            </label>
            <div className="flex gap-2 flex-wrap">
              {REPRESENTATION_TYPE_OPTIONS.map(type => {
              const isSelected = representationTypes.includes(type);
              return <button key={type} type="button" onClick={() => toggleRepType(type)} className={cn("px-4 py-2 rounded-full text-sm font-medium border transition-all", isSelected ? "bg-[#2196F3] text-white border-[#2196F3] shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50")}>
                    {type}
                  </button>;
            })}
            </div>
          </div>

          {/* Who Pays */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Who Pays
            </label>
            <div className="relative">
              <select value={whoPays} onChange={e => setWhoPays(e.target.value)} className="w-full appearance-none bg-white border border-gray-200 rounded px-3 py-2.5 pr-8 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer">
                {WHO_PAYS_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Per-representation Fee Type + Amount */}
          <PerRepAmountInputs reps={representationTypes} amounts={amounts} setRepAmt={setRepAmt} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2 rounded border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="px-5 py-2 rounded bg-[#2196F3] text-white text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm">
            Save
          </button>
        </div>
      </div>
    </div>;
};

// --- Team Radius Fee Modal ---

interface TeamRadiusFeeModalProps {
  editingFee: RadiusFee | null;
  usedTypes: string[];
  onSave: (fee: RadiusFee) => void;
  onClose: () => void;
}
const TeamRadiusFeeModal = ({
  editingFee,
  usedTypes,
  onSave,
  onClose
}: TeamRadiusFeeModalProps) => {
  const isEditing = editingFee !== null;
  const [feeName, setFeeName] = React.useState<string>(editingFee?.feeName ?? "");
  const [representationTypes, setRepresentationTypes] = React.useState<string[]>(editingFee?.representationTypes ?? []);
  const [whoPays, setWhoPays] = React.useState<string>(editingFee?.whoPays ?? "Agent Pays");
  const [commissionBreakdownType, setCommissionBreakdownType] = React.useState<string>(editingFee?.commissionBreakdownType ?? "Full Transparency");
  const [amounts, setAmounts] = React.useState<Record<string, RepAmount>>(editingFee?.amounts ?? {});
  const toggleRepType = (type: string) => {
    const {
      disabled
    } = getRepTypeState(type, representationTypes, usedTypes);
    if (disabled && !representationTypes.includes(type)) return;
    const isOn = representationTypes.includes(type);
    if (isOn && representationTypes.length === 1) return;
    setRepresentationTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
    setAmounts(prev => {
      const next = { ...prev };
      if (isOn) delete next[type];
      else if (!next[type]) next[type] = blankAmt();
      return next;
    });
  };
  const setRepAmt = (rep: string, key: keyof RepAmount, val: string) => {
    setAmounts(prev => ({ ...prev, [rep]: { ...(prev[rep] ?? blankAmt()), [key]: val } }));
  };
  const handleSave = () => {
    if (representationTypes.length === 0) return;
    const cleanAmounts: Record<string, RepAmount> = {};
    representationTypes.forEach(r => { cleanAmounts[r] = amounts[r] ?? blankAmt(); });
    onSave({
      feeId: editingFee?.feeId ?? `team-fee-${Date.now()}`,
      feeName,
      representationTypes,
      whoPays,
      commissionBreakdownType,
      amounts: cleanAmounts
    });
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={e => {
    if (e.target === e.currentTarget) onClose();
  }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-base font-bold text-gray-900">
            {isEditing ? "Edit Radius Fee" : "Add Radius Fee"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-md transition-colors" aria-label="Close modal">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-6 flex flex-col gap-6 overflow-y-auto">
          {/* Representation Type */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Representation Type
            </label>
            <div className="flex gap-2 flex-wrap">
              {REPRESENTATION_TYPE_OPTIONS.map(type => {
              const isSelected = representationTypes.includes(type);
              const {
                disabled,
                reason
              } = getRepTypeState(type, representationTypes, usedTypes);
              const isDisabled = disabled && !isSelected;
              return <button key={type} type="button" onClick={() => toggleRepType(type)} disabled={isDisabled} title={reason === "used" ? "Already used by another fee" : reason === "category" ? "Cannot mix Buyer/Seller with Landlord/Tenant" : undefined} className={cn("px-4 py-2 rounded-full text-sm font-medium border transition-all", isSelected ? "bg-[#2196F3] text-white border-[#2196F3] shadow-sm" : isDisabled ? "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50")}>
                
                  {type}
                </button>;
            })}
            </div>
          </div>

          {/* Who Pays */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Who Pays
            </label>
            <div className="relative">
              <select value={whoPays} onChange={e => setWhoPays(e.target.value)} className="w-full appearance-none bg-white border border-gray-200 rounded px-3 py-2.5 pr-8 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer">
                {WHO_PAYS_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Per-representation Fee Type + Amount */}
          <PerRepAmountInputs reps={representationTypes} amounts={amounts} setRepAmt={setRepAmt} />
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2 rounded border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="px-5 py-2 rounded bg-[#2196F3] text-white text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm">
            Save
          </button>
        </div>
      </div>
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
              Radius Fee
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
          const canAddMore = !allTypesCovered(fees);
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
                {/* Radius Fee Column */}
                <td className="px-6 py-6 min-w-[160px]">
                  {fees.length === 0 ? <button type="button" onClick={() => onAddFee(member.id)} className="flex items-center gap-1 text-[#2196F3] text-sm font-medium hover:underline transition-colors whitespace-nowrap">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Radius Fee</span>
                    </button> : <div className="flex items-center gap-3">
                      <button type="button" onClick={() => toggleExpanded(member.id)} className="flex items-center gap-1.5 text-sm font-medium text-[#2196F3] hover:underline transition-colors whitespace-nowrap" aria-expanded={isExpanded}>
                        <span>{fees.length} {fees.length === 1 ? "fee" : "fees"}</span>
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      {!isExpanded && canAddMore && <button type="button" onClick={() => onAddFee(member.id)} className="flex items-center gap-1 text-[#2196F3] text-sm font-medium hover:underline transition-colors whitespace-nowrap">
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
                  <div className="overflow-hidden border border-gray-200 rounded bg-white max-w-2xl">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                          <th className="px-3 py-2">Representation</th>
                          <th className="px-3 py-2">Amount</th>
                          <th className="px-3 py-2 w-20 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {fees.flatMap(fee => {
                      const reps = fee.representationTypes.length > 0 ? fee.representationTypes : ["—"];
                      return reps.map(rep => {
                        const amt = fee.amounts?.[rep];
                        const amountLabel = formatRepAmount(amt);
                        return <tr key={`${fee.feeId}-${rep}`}>
                                  <td className="px-3 py-2 text-gray-800">{rep}</td>
                                  <td className="px-3 py-2 text-gray-600">{amountLabel || "—"}</td>
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
                                </tr>;
                      });
                    })}
                      </tbody>
                    </table>
                    {canAddMore && <div className="px-3 py-2 border-t border-gray-100">
                      <button type="button" onClick={() => onAddFee(member.id)} className="flex items-center gap-1 text-[#2196F3] text-xs font-medium hover:underline transition-colors">
                        <Plus className="w-3 h-3" />
                        <span>Add Fee</span>
                      </button>
                    </div>}
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
const formatRepAmount = (amt: RepAmount | undefined): string => {
  const a = amt ?? blankAmt();
  if (a.feeType === "Flat") return a.flat ? `$${a.flat}` : "";
  if (a.feeType === "Percentage") return a.percent ? `${a.percent}%` : "";
  if (a.feeType === "Both") {
    if (!a.flat && !a.percent) return "";
    return `$${a.flat || "0"} / ${a.percent || "0"}%`;
  }
  return "";
};
const getFeeAmountLabel = (fee: { representationTypes: string[]; amounts: Record<string, RepAmount> }): string => {
  const parts: string[] = [];
  fee.representationTypes.forEach(rep => {
    const s = formatRepAmount(fee.amounts?.[rep]);
    if (s) parts.push(`${rep} ${s}`);
  });
  return parts.join(" · ");
};
interface ModalState {
  memberId: string;
  editingFee: RadiusFee | null;
}
export const RadiusTeamEditPage: React.FC = () => {
  const [whoPays, setWhoPays] = React.useState<string>("Agent Pays");
  const [feeType, setFeeType] = React.useState<string>("Flat");
  const [commissionBreakdownType, setCommissionBreakdownType] = React.useState<string>("Full Transparency CDA");
  const [flatAmount, setFlatAmount] = React.useState<string>("");
  const [percentAmount, setPercentAmount] = React.useState<string>("");
  const [toggleStates, setToggleStates] = React.useState<Record<string, boolean>>(getInitialToggleStates);

  // Multi-fee per-row state
  const [memberFees, setMemberFees] = React.useState<Record<string, RadiusFee[]>>({});
  const [modalState, setModalState] = React.useState<ModalState | null>(null);

  // Team Radius Fee state
  const [teamRadiusFees, setTeamRadiusFees] = React.useState<RadiusFee[]>([]);
  const [showTeamRadiusFeeModal, setShowTeamRadiusFeeModal] = React.useState<boolean>(false);
  const [editingTeamFee, setEditingTeamFee] = React.useState<RadiusFee | null>(null);

  // Audit Fee state (kept but not wired to UI)
  const [showAuditFeeModal, setShowAuditFeeModal] = React.useState<boolean>(false);
  const [auditFee, setAuditFee] = React.useState<AuditFee>({
    representationTypes: [],
    whoPays: "Agent Pays",
    amounts: {}
  });
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
  const handleSaveAuditFee = (fee: AuditFee) => {
    setAuditFee(fee);
    setShowAuditFeeModal(false);
  };

  // Team Radius Fee handlers
  const handleOpenAddTeamFee = () => {
    setEditingTeamFee(null);
    setShowTeamRadiusFeeModal(true);
  };
  const handleOpenEditTeamFee = (fee: RadiusFee) => {
    setEditingTeamFee(fee);
    setShowTeamRadiusFeeModal(true);
  };
  const handleDeleteTeamFee = (feeId: string) => {
    setTeamRadiusFees(prev => prev.filter(f => f.feeId !== feeId));
  };
  const handleSaveTeamFee = (fee: RadiusFee) => {
    setTeamRadiusFees(prev => {
      const idx = prev.findIndex(f => f.feeId === fee.feeId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = fee;
        return updated;
      }
      return [...prev, fee];
    });
    setShowTeamRadiusFeeModal(false);
    setEditingTeamFee(null);
  };
  const modalMember = modalState !== null ? TEAM_MEMBERS_DATA.find(m => m.id === modalState.memberId) ?? null : null;

  // Compute used types for the per-member modal (exclude the currently editing fee)
  const modalMemberUsedTypes = React.useMemo(() => {
    if (modalState === null) return [];
    const fees = memberFees[modalState.memberId] ?? [];
    return getUsedTypes(fees, modalState.editingFee?.feeId);
  }, [modalState, memberFees]);

  // Compute used types for the team fee modal (exclude the currently editing team fee)
  const teamFeeUsedTypes = React.useMemo(() => {
    return getUsedTypes(teamRadiusFees, editingTeamFee?.feeId);
  }, [teamRadiusFees, editingTeamFee]);
  const auditFeeLabel = React.useMemo(() => {
    const label = getFeeAmountLabel(auditFee);
    return label || null;
  }, [auditFee]);

  // Team fees: can add more only if not all types are covered
  const teamAllCovered = allTypesCovered(teamRadiusFees);
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

                  {/* Team Radius Fee: label + pill button only */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">Team Radius Fee:</span>
                    {!teamAllCovered && <button type="button" onClick={handleOpenAddTeamFee} className="flex items-center gap-1 text-sm font-medium border rounded-full px-4 py-1.5 transition-colors text-[#2196F3] border-[#2196F3] hover:bg-blue-50">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>}
                  </div>

                  <div className="ml-auto">
                    <button className="border border-gray-300 text-gray-700 bg-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2">
                      <span>Commission Breakdown</span>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Row 2: Who Pays + Fee Type (hidden) */}
                <div className="flex items-center gap-3 flex-wrap" style={{
                display: "none"
              }}>
                  <label className="text-sm text-gray-800 whitespace-nowrap">
                    <span>Radius Fee - Who Pays:</span>
                  </label>
                  <div className="relative">
                    <select value={whoPays} onChange={e => setWhoPays(e.target.value)} className="appearance-none bg-white border border-gray-200 rounded px-3 py-2 pr-8 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer min-w-[140px]">
                      <option value="Agent Pays">Agent Pays</option>
                      <option value="Team Lead Pays">Team Lead Pays</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <label className="text-sm text-gray-800 whitespace-nowrap">
                    <span>Commission Breakdown Type:</span>
                  </label>
                  <div className="relative">
                    <select value={commissionBreakdownType} onChange={e => setCommissionBreakdownType(e.target.value)} className="appearance-none bg-white border border-gray-200 rounded px-3 py-2 pr-8 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer min-w-[200px]">
                      <option value="Full Transparency CDA">Full Transparency</option>
                      <option value="Radius Split Hidden CDA">Radius Split Hidden</option>
                      <option value="Team Split Hidden CDA">Team Split Hidden</option>
                      <option value="Gross CDA">Gross</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <label className="text-sm text-gray-800 whitespace-nowrap">
                    <span>Fee Type:</span>
                  </label>
                  <div className="relative">
                    <select value={feeType} onChange={e => setFeeType(e.target.value)} className="appearance-none bg-white border border-gray-200 rounded px-3 py-2 pr-8 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer min-w-[160px]" style={{
                    width: "50px",
                    maxWidth: "50px"
                  }}>
                      <option value="Flat">Flat</option>
                      <option value="Percent">% of Gross Commissions After Deductions</option>
                      <option value="Both">Both</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {(feeType === "Flat" || feeType === "Both") && <div className="flex items-center border border-gray-200 rounded bg-white overflow-hidden focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                      <span className="px-3 py-2 text-sm text-gray-400 bg-gray-50 border-r border-gray-200 select-none w-8 text-center">$</span>
                      <input type="number" value={flatAmount} onChange={e => setFlatAmount(e.target.value)} placeholder="0.00" className="px-3 py-2 text-sm text-gray-800 outline-none bg-white w-[100px] placeholder:text-gray-300" />
                    </div>}

                  {(feeType === "Percent" || feeType === "Both") && <div className="flex items-center gap-2">
                      <div className="flex items-center border border-gray-200 rounded bg-white overflow-hidden focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <input type="number" value={percentAmount} onChange={e => setPercentAmount(e.target.value)} placeholder="0.00" className="px-3 py-2 text-sm text-gray-800 outline-none bg-white w-[100px] placeholder:text-gray-300" />
                        <span className="px-3 py-2 text-sm text-gray-400 bg-gray-50 border-l border-gray-200 select-none w-8 text-center">%</span>
                      </div>
                      {feeType === "Percent" && <span className="text-sm text-gray-600 whitespace-nowrap">
                          <span>of Gross Commissions Deductions</span>
                        </span>}
                    </div>}
                </div>
              </div>

              {/* Team Radius Fee list */}
              {teamRadiusFees.length > 0 && <div className="mb-6 border-t border-gray-100 pt-4">
                  <div className="overflow-hidden border border-gray-200 rounded">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                          <th className="px-3 py-2">Representation</th>
                          <th className="px-3 py-2">Amount</th>
                          <th className="px-3 py-2 w-20 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {teamRadiusFees.flatMap(fee => {
                      const reps = fee.representationTypes.length > 0 ? fee.representationTypes : ["—"];
                      return reps.map(rep => {
                        const amt = fee.amounts?.[rep];
                        const amountLabel = formatRepAmount(amt);
                        return <tr key={`${fee.feeId}-${rep}`}>
                                  <td className="px-3 py-2 text-gray-800">{rep}</td>
                                  <td className="px-3 py-2 text-gray-600">{amountLabel || "—"}</td>
                                  <td className="px-3 py-2">
                                    <div className="flex items-center justify-end gap-0.5">
                                      <button type="button" onClick={() => handleOpenEditTeamFee(fee)} className="p-1 rounded text-gray-400 hover:text-[#2196F3] hover:bg-blue-50 transition-colors" aria-label="Edit team radius fee">
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                      <button type="button" onClick={() => handleDeleteTeamFee(fee.feeId)} className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" aria-label="Delete team radius fee">
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>;
                      });
                    })}
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

      {/* Radius Fee Modal (per-member) */}
      {modalState !== null && modalMember !== null && <RadiusFeeModal memberId={modalMember.id} memberName={modalMember.name} editingFee={modalState.editingFee} usedTypes={modalMemberUsedTypes} onSave={handleSaveFee} onClose={handleCloseModal} />}

      {/* Team Radius Fee Modal */}
      {showTeamRadiusFeeModal && <TeamRadiusFeeModal editingFee={editingTeamFee} usedTypes={teamFeeUsedTypes} onSave={handleSaveTeamFee} onClose={() => {
      setShowTeamRadiusFeeModal(false);
      setEditingTeamFee(null);
    }} />}

      {/* Audit Fee Modal (kept but unused by UI) */}
      {showAuditFeeModal && <AuditFeeModal currentFee={auditFee} onSave={handleSaveAuditFee} onClose={() => setShowAuditFeeModal(false)} />}
    </div>;
};