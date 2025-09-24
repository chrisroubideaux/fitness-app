// components/admin/trainers/Banner.tsx
"use client";

type Props = {
  url: string | null;
  name: string;
};

export default function ProfileImage({ url, name }: Props) {
  return (
    <div className="text-center mb-4">
      <img
        src={url || "/images/default-avatar.png"}
        alt={name}
        className="rounded-circle border border-4 shadow"
        style={{
          width: "150px",
          height: "150px",
          objectFit: "cover",
          marginTop: "-80px",
        }}
      />
      <h2 className="mt-3">{name}</h2>
    </div>
  );
}
