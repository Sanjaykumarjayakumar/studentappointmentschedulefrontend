import { FaClinicMedical } from "react-icons/fa";

export default function Logo({ light = false, compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
          light ? "bg-white text-brand-700" : "bg-brand-600 text-white"
        }`}
      >
        <FaClinicMedical size={20} />
      </span>
      {!compact && (
        <div className="leading-tight">
          <p className={`text-sm font-extrabold ${light ? "text-white" : "text-ink"}`}>BIT Student</p>
          <p className={`text-sm font-semibold ${light ? "text-brand-200" : "text-brand-600"}`}>Health Center</p>
        </div>
      )}
    </div>
  );
}
