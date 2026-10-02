/** Up to two initials for a company avatar, e.g. "Coastline Exotics" -> "CE". */
export function companyInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}
