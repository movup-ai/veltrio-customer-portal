import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/** Navigation that keeps the reader in their language; for links, see ./Link. */
export const { usePathname, useRouter } = createNavigation(routing);
