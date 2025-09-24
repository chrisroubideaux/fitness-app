// components/admin/trainers/Banner.tsx
"use client";

type Props = {
  url: string | null;
};

export default function Banner({ url }: Props) {
  if (!url) return null;

  return (
    <img
      src={url}
      alt="banner"
      className="w-100 mb-5 rounded shadow"
      style={{ maxHeight: "320px", objectFit: "cover" }}
    />
  );
}
