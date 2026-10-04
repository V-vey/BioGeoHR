import Containers from "@/components/container";
import Item from "@/components/Employee/AllEmployee/item-container";
import { useState, useEffect } from "react";
import axios from "axios";
import { url } from "@/resources/api";
import Loading from "@/components/Loading";
export default function AllEmployee({}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const fetchEmployees = async () => {
    try {
      const response = await axios.get(url + "/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
      setEmployees(response.data);
    } catch (error) {
      console.error("Failed to load employees", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchEmployees();
  }, []);

  const [search, setSearch] = useState("");
  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const filteredEmployees = employees
    .filter((emp) => emp.name.toLowerCase().includes(search.toLowerCase()))
    .reverse();

  const itemsPerPage = 12;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredEmployees.length / itemsPerPage),
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filteredEmployees.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div>
      {loading && <Loading />}
      <div className=" flex justify-end mb-4 p-4 md:p-[16px_20px] bg-white border border-[#b2b2b2] rounded-[14px]">
        <h2 className="text-[#6675EC] font-bold justify-end">All Employee</h2>
      </div>

      <Containers
        name="Employees"
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
        {pageItems.map((emp, i) => (
          <Item key={i} onSaved={fetchEmployees} item={emp} />
        ))}
      </Containers>
    </div>
  );
}
