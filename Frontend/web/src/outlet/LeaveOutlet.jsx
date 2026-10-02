import Containers from "@/components/container";
import Item from "@/components/Employee/LeaveRequest/item-container";
import { useState, useEffect } from "react";
import axios from "axios";
import { url } from "@/resources/api";
import { format, parse } from "date-fns";
import Loading from "@/components/Loading";

export default function Leave() {
  const [currentPage, setCurrentPage] = useState(1);
  const [leaveReq, setLeaveReq] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchLeave = async () => {
      try {
        const response = await axios.get(url + "/leave", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
        setLeaveReq(response.data);
      } catch (error) {
        console.error("Failed to load employees", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeave();
  }, []);

  const [search, setSearch] = useState("");

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const filteredLeave = leaveReq
    .filter((leave) =>
      leave.user?.name?.toLowerCase().includes(search.toLowerCase()),
    )
    .reverse();

  const itemsPerPage = 12;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredLeave.length / itemsPerPage),
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filteredLeave.slice(startIndex, startIndex + itemsPerPage);
  return (
    <div className="flex flex-col">
      {loading && <Loading />}
      <div className=" flex justify-end mb-4 p-4 md:p-[16px_20px] bg-white border border-[#b2b2b2] rounded-[14px]">
        <h2 className="text-[#6675EC] font-bold justify-end">Leave</h2>
      </div>
      <Containers
        name="Leave"
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        arrowSize={32}
        searchShow={true}
        filterConfig={
          [
            /* ...unchanged... */
          ]
        }
        totalPages={totalPages}
        search={search}
        setSearch={handleSearch}
        onFilterApply={(filters) => console.log(filters)}
      >
        {pageItems.map((leave, i) => (
          <Item fetch={leave} />
        ))}
      </Containers>
    </div>
  );
}
