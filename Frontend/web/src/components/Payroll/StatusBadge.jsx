const TONES = {
  success: "bg-[#2AAF56]/10 text-[#2AAF56]",
  warning: "bg-[#EACA3A]/15 text-[#8a6d10]",
  danger: "bg-[#EC6668]/10 text-[#EC6668]",
  info: "bg-[#6675EC]/10 text-[#6675EC]",
  neutral: "bg-gray-100 text-gray-600",
};

export default function StatusBadge({ tone = "neutral", children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
