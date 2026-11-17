import Link from "next/link";
import type { ReactNode } from "react";

export default function IndexRow({
  meta,
  title,
  href,
  action,
  home = false,
}: {
  meta: ReactNode;
  title: ReactNode;
  href?: string;
  action?: ReactNode;
  home?: boolean;
}) {
  const classes = [
    "index-row",
    home ? "index-row--home" : "",
    action ? "index-row--with-action" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <div className="index-meta meta">{meta}</div>
      <div className="index-title">
        {href ? (
          <Link href={href} className="index-link plain-link">
            {title}
          </Link>
        ) : (
          title
        )}
      </div>
      {action ? <div className="index-action">{action}</div> : null}
    </div>
  );
}
