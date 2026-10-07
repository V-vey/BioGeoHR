import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { url } from "@/resources/api";
import Loading from "@/components/Loading";
import Containers from "@/components/container";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
const csvCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
const money = (n) =>
  Number(n || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const headers = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "ngrok-skip-browser-warning": "true",
});

const fmtDate = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
const periodKey = (p) => `${p.period_start}_${p.period_end}`;
const periodLabel = (p) =>
  `${fmtDate(p.period_start)} – ${fmtDate(p.period_end)}`;

export default function PayrollReportOutlet() {
  const [loading, setLoading] = useState(true);
  const [payslips, setPayslips] = useState([]);
  const [selected, setSelected] = useState("");
  const [rows, setRows] = useState([]);
  const fetchPayslips = async () => {
    try {
      const response = await axios.get(url + "/payslips", {
        headers: headers(),
      });
      setPayslips(response.data);
      // no payslips = no period to load a report for
      if (response.data.length === 0) setLoading(false);
    } catch (error) {
      console.error("Failed to load pay periods:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, []);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1); // new search starts at page 1
  };

  // filter 1: the pay period (one entry per distinct period, newest first)
  const periods = useMemo(() => {
    const seen = {};
    payslips.forEach((p) => {
      seen[periodKey(p)] = {
        period_start: p.period_start,
        period_end: p.period_end,
      };
    });
    return Object.values(seen).sort(
      (a, b) => new Date(b.period_start) - new Date(a.period_start),
    );
  }, [payslips]);

  // the newest period until HR picks another one
  const period =
    periods.find((p) => periodKey(p) === selected) ?? periods[0] ?? null;
  const start = period?.period_start;
  const end = period?.period_end;

  // the report for the chosen period
  useEffect(() => {
    if (!start || !end) return;
    let cancelled = false;

    const fetchReport = async () => {
      try {
        const response = await axios.get(url + "/payroll-report", {
          params: { period_start: start, period_end: end },
          headers: headers(),
        });
        if (!cancelled) setRows(response.data);
      } catch (error) {
        console.error("Failed to load payroll report:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchReport();
    return () => {
      cancelled = true;
    };
  }, [start, end]);

  const choosePeriod = (key) => {
    setLoading(true);
    setCurrentPage(1);
    setSelected(key);
  };

  // filter 2: the employee name
  const filteredRows = rows.filter((r) =>
    r.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const itemsPerPage = 15;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filteredRows.slice(startIndex, startIndex + itemsPerPage);

  // totals cover every filtered row, not only the page on screen
  const total = (key) =>
    filteredRows.reduce((sum, r) => sum + Number(r[key] || 0), 0);

  // one line for the container's "Total:" slot
  const totalText =
    filteredRows.length === 0
      ? "--"
      : `${filteredRows.length} employee${filteredRows.length === 1 ? "" : "s"}`;
  // ---- downloads: the rows matching the search, for the chosen period ----
  const hasOther = filteredRows.some((r) => Number(r.other_adjustments) !== 0);

  const reportHead = [
    "Employee",
    "Department",
    "Position",
    "On-time",
    "Late",
    "Absent",
    "Leave",
    "Hours",
    "Gross",
    "Gov't",
    "Tax",
    "Late ded.",
    "Loan",
    ...(hasOther ? ["Other"] : []),
    "Net pay",
  ];
  // fmt formats the money columns (plain 2-decimals for CSV, 1,234.56 for PDF)
  const reportBody = (fmt) =>
    filteredRows.map((r) => [
      r.name,
      r.department,
      r.position,
      r.on_time,
      r.late,
      r.absent,
      r.leave_days,
      r.hours,
      fmt(r.gross),
      fmt(r.government),
      fmt(r.tax),
      fmt(r.late_deduction),
      fmt(r.loan),
      ...(hasOther ? [fmt(r.other_adjustments)] : []),
      fmt(r.net),
    ]);
  const reportTotals = (fmt) => [
    `Total (${filteredRows.length})`,
    "",
    "",
    total("on_time"),
    total("late"),
    total("absent"),
    total("leave_days"),
    total("hours").toFixed(1),
    fmt(total("gross")),
    fmt(total("government")),
    fmt(total("tax")),
    fmt(total("late_deduction")),
    fmt(total("loan")),
    ...(hasOther ? [fmt(total("other_adjustments"))] : []),
    fmt(total("net")),
  ];
  const fileStem = `payroll-report_${start}_to_${end}`;

  const handleDownloadCsv = () => {
    const plain = (n) => Number(n || 0).toFixed(2);
    const csv = [reportHead, ...reportBody(plain), reportTotals(plain)]
      .map((r) => r.map(csvCell).join(","))
      .join("\r\n");

    // the leading BOM makes Excel read the file as UTF-8
    const blob = new Blob(["﻿" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileStem}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(14);
    doc.text("Academia de Santiago of Tarlac", 14, 14);
    doc.setFontSize(11);
    doc.text("Payroll Report", 14, 21);
    doc.setFontSize(9);
    doc.text(
      `Pay period: ${period ? periodLabel(period) : ""}   |   Employees: ${filteredRows.length}`,
      14,
      27,
    );

    autoTable(doc, {
      startY: 31,
      head: [reportHead],
      body: reportBody(money),
      foot: [reportTotals(money)],
      styles: { fontSize: 7, halign: "right" },
      columnStyles: { 0: { halign: "left" }, 1: { halign: "left" }, 2: { halign: "left" } },
      headStyles: { fillColor: [42, 175, 86] },
      footStyles: { fillColor: [235, 235, 235], textColor: 20, fontStyle: "bold" },
    });

    doc.save(`${fileStem}.pdf`);
  };

  const header = (
    <div className="flex flex-row justify-between items-center">
      <div className="flex flex-row gap-4 items-center">
        <h2>Payroll Report</h2>
        <select
          value={period ? periodKey(period) : ""}
          onChange={(e) => choosePeriod(e.target.value)}
          className="border border-[#b2b2b2] rounded-[10px] px-3 py-1 bg-white"
        >
          {periods.map((p) => (
            <option key={periodKey(p)} value={periodKey(p)}>
              {periodLabel(p)}
            </option>
          ))}
        </select>
        <input
          type="search"
          placeholder="Search Name"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="border-[#8E8E8E] border-1 rounded-2xl px-3"
        />
      </div>
      <div>
        <div className="flex flex-row gap-2 justify-end">
          <button
            type="button"
            className="flex flex-row gap-2 bg-[#6675EC] items-center
          justify-center rounded-[10px] px-4 py-1 text-white border
          border-[#b2b2b2] hover:bg-[#6675EC]/90 disabled:opacity-40"
            onClick={handleDownloadCsv}
            disabled={filteredRows.length === 0}
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
          <button
            type="button"
            className="flex flex-row gap-2 bg-[#2AAF56] items-center
          justify-center rounded-[10px] px-4 py-1 text-white border
          border-[#b2b2b2] hover:bg-[#2AAF56]/90 disabled:opacity-40"
            onClick={handleDownloadPdf}
            disabled={filteredRows.length === 0}
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
  return (
    <div>
      {loading && <Loading />}
      <div className=" flex justify-end mb-4 p-4 md:p-[16px_20px] bg-white border border-[#b2b2b2] rounded-[14px]">
        <h2 className="text-[#6675EC] font-bold justify-end">Payroll Report</h2>
      </div>
      <Containers
        headerDefault={false}
        header={header}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        arrowSize={32}
        total={totalText}
        spacing={false}
      >
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#b2b2b2] text-[#8a90a3]">
                <th className="px-3 py-2 text-left font-medium">Employee</th>
                <th className="px-3 py-2 text-right font-medium">On-time</th>
                <th className="px-3 py-2 text-right font-medium">Late</th>
                <th className="px-3 py-2 text-right font-medium">Absent</th>
                <th className="px-3 py-2 text-right font-medium">Leave</th>
                <th className="px-3 py-2 text-right font-medium">Hours</th>
                <th className="px-3 py-2 text-right font-medium">Gross</th>
                <th className="px-3 py-2 text-right font-medium">Gov't</th>
                <th className="px-3 py-2 text-right font-medium">Tax</th>
                <th className="px-3 py-2 text-right font-medium">Late Ded</th>
                <th className="px-3 py-2 text-right font-medium">Loan</th>
                <th className="px-3 py-2 text-right font-medium">Net Pay</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((r) => (
                <tr key={r.user_id} className="border-t border-[#b2b2b2]">
                  <td className="px-3 py-2 text-left">{r.name}</td>
                  <td className="px-3 py-2 text-right">{r.on_time}</td>
                  <td className="px-3 py-2 text-right">{r.late}</td>
                  <td className="px-3 py-2 text-right">{r.absent}</td>
                  <td className="px-3 py-2 text-right">{r.leave_days}</td>
                  <td className="px-3 py-2 text-right">{r.hours}</td>
                  <td className="px-3 py-2 text-right">{money(r.gross)}</td>
                  <td className="px-3 py-2 text-right">
                    {money(r.government)}
                  </td>
                  <td className="px-3 py-2 text-right">{money(r.tax)}</td>
                  <td className="px-3 py-2 text-right">
                    {money(r.late_deduction)}
                  </td>
                  <td className="px-3 py-2 text-right">{money(r.loan)}</td>
                  <td className="px-3 py-2 text-right font-medium">
                    {money(r.net)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Containers>
    </div>
  );
}
