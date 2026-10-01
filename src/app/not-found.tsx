import Link from "next/link";
import { Button } from "@/shared/ui/atoms/Button";
import { SiteHeader } from "@/shared/ui/organisms/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="container-page py-24 text-center">
        <h1 className="font-display text-h1">
          This road doesn&apos;t go anywhere.
        </h1>
        <p className="mt-4 text-muted">
          The page you&apos;re looking for doesn&apos;t exist yet.
        </p>
        <Button asChild variant="dark" className="mt-8">
          <Link href="/">Back to home</Link>
        </Button>
      </main>
    </>
  );
}
