import Containers from "@/components/pagincation";
import { useState } from "react";

export default function Items({ centerLng, centerLat, zoom }) {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <Containers
      name={"Locations"}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      arrowSize={40}
    >
      <div></div>
    </Containers>
  );
}
