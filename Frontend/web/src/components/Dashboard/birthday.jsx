function ContainerItems({ name, email, birthday }) {
  return (
    <div class="flex items-center justify-between w-full py-1">
      <div class="flex gap-3">
        {/* image */}
        <div class="w-12 h-12 rounded-full border"></div>
        {/* text */}
        <div className="flex flex-col flex-1 items-start self-center">
          <p className="font-semibold text-[14px] text-[#3A3A3A] leading-tight">
            {name}
          </p>
          <p className="text-[14px] text-[#3A3A3A]/70 leading-none">{email}</p>
        </div>
      </div>
      <p className="text-sm font-bold text-[#3A3A3A]/">{birthday}</p>
    </div>
  );
}

export default function Birthday() {
  return (
    <>
      <div className=" max-h-[380px] min-h-[380px] w-full px-3 py-2 bg-white border border-gray-100 rounded-xl shadow-[0_0_6.3px_3px_rgba(0,0,0,0.25)]">
        <h2>Employee Birthday</h2>
        <div className="h-[2px] w-full bg-[#E0E0E0] my-0.5" />
        <ContainerItems
          name="Abdul Mercado"
          email="abdul@email.com"
          birthday="Dec 28, 2004"
        />
        <ContainerItems
          name="Abdul Mercado"
          email="abdul@email.com"
          birthday="Dec 28, 2004"
        />
        <ContainerItems
          name="Abdul Mercado"
          email="abdul@email.com"
          birthday="Dec 28, 2004"
        />
        <ContainerItems
          name="Abdul Mercado"
          email="abdul@email.com"
          birthday="Dec 28, 2004"
        />
      </div>
    </>
  );
}
