import { useTranslations } from "next-intl";
import { Link } from "@/i18n/Link";
import { Button } from "@/shared/ui/atoms/Button";
import { SiteHeader } from "@/shared/ui/organisms/SiteHeader";

export default function NotFound() {
  const t = useTranslations("common.notFound");
  return (
    <>
      <SiteHeader />
      <main id="main" className="container-page py-24 text-center">
        <h1 className="font-display text-h1">{t("title")}</h1>
        <p className="mt-4 text-muted">{t("body")}</p>
        <Button asChild variant="dark" className="mt-8">
          <Link href="/">{t("home")}</Link>
        </Button>
      </main>
    </>
  );
}
