import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  Users,
  CalendarClock,
  ClipboardCheck,
  ArrowRight,
  CheckCircle2,
  Info,
  Receipt,
  History,
  TriangleAlert,
} from "lucide-react";
import Containers from "@/components/container";
import StatusBadge from "@/components/Payroll/StatusBadge";

import { useEffect, useMemo } from "react";
import axios from "axios";
import { url } from "@/resources/api";

function Counts({ title, count, icon }) {
  return (
    <div className="flex flex-col bg-white rounded-[10px] py-2 px-4 border border-[#b2b2b2] w-full">
      <p className="text-start font-medium ">{title}</p>
      <div className="flex flex-row justify-between items-center ">
        <p className="text-[20px]">{count}</p>
        {icon}
      </div>
    </div>
  );
}
function dateFormat(date) {
  const format = new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return format;
}
function dateFormatYear(date) {
  const format = new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return format;
}
export default function PayrollOutlet() {
  const [salaries, setSalaries] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [loans, setLoans] = useState([]);
  const [frequentLatesCount, setFrequentLatesCount] = useState(0);
  const [paidOffCount, setPaidOffCount] = useState(0);
  const payrollRunsHeader = (
    <div className="flex flex-row justify-between items-center">
      <h2 className="flex items-start ">Past Payroll Runs</h2>
      <Link
        to="run"
        className="text-s text-[#f2f2f2] bg-[#6675EC] px-4 py-1 hover:bg-[#2AAF56] self-end rounded-[10px]"
      >
        Run Payroll
      </Link>
    </div>
  );
  const money = (n) =>
    Number(n || 0).toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP",
    });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    };

    const fetchData = async () => {
      try {
        const [salaryRes, payslipRes, loanRes, latesRes] = await Promise.all([
          axios.get(url + "/salary", { headers }),
          axios.get(url + "/payslips", { headers }),
          axios.get(url + "/loans", { headers }),
          axios.get(url + "/frequentLates", { headers }),
        ]);
        setSalaries(salaryRes.data);
        setPayslips(payslipRes.data);
        setLoans(loanRes.data);
        setFrequentLatesCount(latesRes.data.count);
      } catch (error) {
        console.error("Failed to load payroll overview data:", error);
      }
    };

    fetchData();
  }, []);

  const payrollRuns = useMemo(() => {
    const groups = {};
    payslips.forEach((p) => {
      const key = `${p.period_start}_${p.period_end}`;
      if (!groups[key]) {
        groups[key] = {
          period_start: p.period_start,
          period_end: p.period_end,
          count: 0,
          totalNetPay: 0,
          statutory: 0,
          incomeTax: 0,
          loanDeductions: 0,
        };
      }
      groups[key].count += 1;
      groups[key].totalNetPay += Number(p.net_pay);
      groups[key].statutory +=
        Number(p.sss) + Number(p.philhealth) + Number(p.pagibig);
      groups[key].incomeTax += Number(p.income_tax);
      groups[key].loanDeductions += Number(p.loan_deduction);
    });
    return Object.values(groups).sort(
      (a, b) => new Date(b.period_start) - new Date(a.period_start),
    );
  }, [payslips]);

  const latestRun = payrollRuns[0];
  const activeLoanCount = loans.filter((l) => l.status === "Active").length;
  const outstandingBalance = loans
    .filter((l) => l.status === "Active")
    .reduce((sum, l) => sum + Number(l.remaining_balance), 0);

  useEffect(() => {
    if (!latestRun) return;
    const token = localStorage.getItem("token");
    axios
      .get(url + "/loans/paidOffThisPeriod", {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        params: {
          period_start: latestRun.period_start,
          period_end: latestRun.period_end,
        },
      })
      .then((res) => setPaidOffCount(res.data.count))
      .catch((error) => console.error("Failed to load paid-off loans:", error));
  }, [latestRun]);
  const deductions = latestRun
    ? {
        statutory: latestRun.statutory,
        incomeTax: latestRun.incomeTax,
        loans: latestRun.loanDeductions,
      }
    : { statutory: 0, incomeTax: 0, loans: 0 };

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 4;

  const totalPages = Math.max(1, Math.ceil(payrollRuns.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = payrollRuns.slice(startIndex, startIndex + itemsPerPage);
  return (
    <>
      <div className=" flex justify-end mb-4 p-4 md:p-[16px_20px] bg-white border border-[#b2b2b2] rounded-[14px]">
        <h2 className="text-[#6675EC] font-bold justify-end">
          Payroll Overview
        </h2>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-row gap-2">
          <Counts
            title="Employees with Salary"
            count={salaries.length}
            icon={<Users className="w-8 h-8 text-[#6675EC]" />}
          />
          <Counts
            title="Active loans"
            count={activeLoanCount}
            icon={<ClipboardCheck className="w-8 h-8 text-[#EACA3A]" />}
          />
          <Counts
            title="Employees with 3+ lates"
            count={frequentLatesCount}
            icon={<History className="w-8 h-8 text-[#EC6668]" />}
          />
          <Counts
            title="Last run net pay"
            count={latestRun ? money(latestRun.totalNetPay) : "—"}
            icon={<Wallet className="w-8 h-8 text-[#2AAF56]" />}
          />
          <Counts
            title="Outstanding loan balance"
            count={money(outstandingBalance)}
            icon={<Receipt className="w-8 h-8 text-[#6675EC]" />}
          />

          <Counts
            title="Last run period"
            count={
              latestRun
                ? `${dateFormat(latestRun.period_start)} – ${dateFormat(latestRun.period_end)}`
                : "—"
            }
            icon={<CalendarClock className="w-8 h-8 text-[#EC6668]" />}
          />
        </div>
        <div className="flex flex-row gap-4">
          <div className="flex-3 w-full">
            <Containers
              // name="Employee List"
              searchShow={false}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              arrowSize={32}
              minH={700}
              maxH={700}
              headerDefault={false}
              header={payrollRunsHeader}
              totalPages={totalPages}
              spacing={false}
            >
              <div className="w-full justify-start">
                <div className="flex flex-row items-center px-4 py-1 border-b border-[#b2b2b2] ">
                  <p className="flex-2 text-start font-medium">Period</p>
                  <p className="flex-1 text-start font-medium">
                    Employees paid
                  </p>
                  <p className="flex-1 text-start font-medium">Total net pay</p>
                  <p className="flex-1 text-start font-medium">Status</p>
                </div>
                <div className="h-2" />
                <div className="flex flex-col gap-2">
                  {pageItems.length > 0 ? (
                    pageItems.map((run) => (
                      <div
                        key={`${run.period_start}_${run.period_end}`}
                        className="flex flex-row items-center px-4 py-2 hover:bg-gray-50"
                      >
                        <p className="flex-2 text-start">
                          {dateFormatYear(run.period_start)} –{" "}
                          {dateFormatYear(run.period_end)}
                        </p>
                        <p className="flex-1 text-start">{run.count}</p>
                        <p className="flex-1 text-start font-medium">
                          {money(run.totalNetPay)}
                        </p>
                        <p className="flex-1 text-start">
                          <StatusBadge tone="success">Generated</StatusBadge>
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-sm text-[#8a90a3] py-4">
                      No payroll runs yet.
                    </p>
                  )}
                </div>
              </div>
            </Containers>
          </div>
          <div className="flex-1 w-full">
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-2.5 p-4 rounded-[10px] bg-[#2AAF56]/10">
                <CheckCircle2 className="w-4 h-4 text-[#2AAF56] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-start font-semibold text-[#2AAF56] mb-1">
                    Loans paid off
                  </p>
                  <p className="text-xs  text-[#2AAF56] leading-relaxed">
                    {paidOffCount} loan{paidOffCount !== 1 ? "s" : ""} were
                    fully paid off in the last run.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 p-4 bg-white border border-[#b2b2b2] rounded-[10px]">
                <p className="text-sm text-start font-semibold mb-3">
                  Last run deductions
                </p>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#8a90a3]">
                      SSS / PhilHealth / Pag-IBIG
                    </span>
                    <span className="font-medium">
                      {money(deductions.statutory)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8a90a3]">Income tax</span>
                    <span className="font-medium">
                      {money(deductions.incomeTax)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8a90a3]">Loan deductions</span>
                    <span className="font-medium">
                      {money(deductions.loans)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
