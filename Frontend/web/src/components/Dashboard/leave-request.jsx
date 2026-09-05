import DefaultProfile from "@/assets/userprofile.jpg";
import Footer from "@/components/footer-items";

function ContainerItems({ name, email, typeLeave }) {
  return (
    <div class="flex items-center justify-between p-1">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-full border"></div>
        <div>
          <p class="font-semibold text-sm">abdul jackul</p>
          <p class="text-xs text-gray-500">abdul@gmail.com</p>
        </div>
      </div>

      <p class="text-sm">Sick Leave</p>

      <button class="bg-green-600 text-white px-4 py-2 rounded-full text-sm">
        view
      </button>
    </div>
  );
}

export default function LeaveRequestLayout() {
  return (
    <div className="flex-1 min-w-37.5 px-3 py-2 bg-white border border-gray-100 rounded-xl shadow-[0_0_6.3px_3px_rgba(0,0,0,0.25)]">
      <p className="p-1 font-bold text-[#6675EC] text-[20px]">Leave Request</p>
      <div className="h-[2px] w-full bg-[#E0E0E0] my-0.5" />

      {/* items children */}
      <div>
        <ContainerItems
          name="abdul jackul"
          email="abdul@gmail.com"
          typeLeave="Sick Leave"
        />
        <ContainerItems
          name="abdul jackul"
          email="abdul@gmail.com"
          typeLeave="Sick Leave"
        />
        <ContainerItems
          name="abdul jackul"
          email="abdul@gmail.com"
          typeLeave="Sick Leave"
        />
        <ContainerItems
          name="abdul jackul"
          email="abdul@gmail.com"
          typeLeave="Sick Leave"
        />
      </div>
      <div className="h-[2px] w-full bg-[#E0E0E0] my-0.5" />
      <Footer />
    </div>
  );
}
