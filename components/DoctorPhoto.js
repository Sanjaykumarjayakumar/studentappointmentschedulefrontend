"use client";

import { useState } from "react";
import { FiUser } from "react-icons/fi";

export default function DoctorPhoto({ name, image, className = "h-16 w-16" }) {
  const [failed, setFailed] = useState(false);

  if (image && !failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt={`${name || "Doctor"} profile`} onError={() => setFailed(true)} className={`${className} shrink-0 rounded-full object-cover`} />;
  }

  return (
    <span aria-label="Default doctor profile photo" className={`${className} grid shrink-0 place-items-center rounded-full bg-brand-100 text-brand-600`}>
      <FiUser aria-hidden="true" className="h-1/2 w-1/2" />
    </span>
  );
}
