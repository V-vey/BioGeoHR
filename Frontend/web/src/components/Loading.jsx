import React from "react";

export default function Loading({ error = false, message, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-5">
      <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-[10px] border border-[#b2b2b2]">
        <p className={`font-medium ${error ? "" : "animate-pulse"}`}>
          {error ? (message ?? "Something went wrong.") : "Loading..."}
        </p>
        {error && onClose && (
          <button
            onClick={onClose}
            className="text-white bg-[#2AAF56] rounded-[10px] px-4 py-1 hover:bg-[#6675EC]"
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}
