// components/admin/about/adminContact.tsx

import Image from "next/image";
export default function AdminContact() {
  return (
    <div className="text-center">
      <Image
        src="/images/admin/image2.png"
        className="avatar rounded-circle mt-3 mb-2"
        alt="Lena Cruz"
        width={120}
        height={120}
      />
    </div>
  );
}

