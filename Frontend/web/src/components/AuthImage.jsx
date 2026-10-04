import { useEffect, useState } from "react";
import axios from "axios";

export default function AuthImage({ src, fallback, alt, className }) {
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    if (!src) return setBlobUrl(null);
    let objectUrl;
    let cancelled = false;
    axios
      .get(src, {
        responseType: "blob",
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(res.data);
        setBlobUrl(objectUrl);
      })
      .catch(() => !cancelled && setBlobUrl(null));
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  return <img src={blobUrl ?? fallback} alt={alt} className={className} />;
}
