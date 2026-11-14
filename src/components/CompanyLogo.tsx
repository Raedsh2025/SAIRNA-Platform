import type { CSSProperties } from "react";
import type { Company } from "@/api/types";
import { companyInitial, companyLabel, companyVisual } from "@/lib/company";

interface CompanyLogoProps {
  company: Company;
  size?: "normal" | "tiny" | "large";
}

export function CompanyLogo({ company, size = "normal" }: CompanyLogoProps) {
  const { color, bg } = companyVisual(company);
  const style = { "--logo-color": color, "--logo-bg": bg } as CSSProperties;

  return (
    <span
      className={`company-logo ${size === "normal" ? "" : size}`.trim()}
      style={style}
      aria-hidden="true"
    >
      {company.logoUrl ? (
        <img
          src={company.logoUrl}
          alt=""
          width={28}
          height={28}
          style={{ borderRadius: 8 }}
        />
      ) : (
        companyInitial(companyLabel(company))
      )}
    </span>
  );
}
