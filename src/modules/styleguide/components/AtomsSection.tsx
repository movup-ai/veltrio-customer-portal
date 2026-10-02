import { ArrowRight, Heart, Search, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/shared/ui/atoms/Badge";
import { Button } from "@/shared/ui/atoms/Button";
import { Eyebrow } from "@/shared/ui/atoms/Eyebrow";
import { Logo } from "@/shared/ui/atoms/Logo";
import { Skeleton } from "@/shared/ui/atoms/Skeleton";
import { Specimen } from "./Specimen";
import { StyleSection } from "./StyleSection";

const ROW = "flex flex-wrap items-center gap-3";

export function AtomsSection() {
  return (
    <StyleSection
      id="atoms"
      title="Atoms"
      description="The smallest building blocks. Each one takes a className, so a page can adjust it without forking it."
    >
      <Specimen name="Button variants" source="shared/ui/atoms/Button.tsx">
        <div className={ROW}>
          <Button>Reserve</Button>
          <Button variant="dark">Continue</Button>
          <Button variant="outline">View details</Button>
          <Button variant="ghost">Cancel</Button>
          <Button disabled>Unavailable</Button>
        </div>
      </Specimen>

      <Specimen
        name="Buttons on dark surfaces"
        source="variant: light, glass, primary"
        tone="inverse"
      >
        <div className={ROW}>
          <Button variant="light">List your fleet</Button>
          <Button variant="glass">Show all photos</Button>
          <Button>Reserve</Button>
        </div>
      </Specimen>

      <Specimen name="Button sizes" source="size: sm, md, lg, icon, icon-sm">
        <div className={ROW}>
          <Button variant="dark" size="sm">
            Done
          </Button>
          <Button variant="dark">Continue</Button>
          <Button size="lg">
            <Search aria-hidden className="size-5" />
            Search
          </Button>
          <Button variant="outline" size="icon" aria-label="Save vehicle">
            <Heart aria-hidden className="size-5" />
          </Button>
          <Button variant="outline" size="icon-sm" aria-label="Next">
            <ArrowRight aria-hidden className="size-4" />
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Link styled as a button</Link>
          </Button>
        </div>
      </Specimen>

      <Specimen
        name="Badge"
        source="shared/ui/atoms/Badge.tsx"
        tone="background"
      >
        <div className={ROW}>
          <Badge>
            <Zap aria-hidden className="size-3.5" /> Electric
          </Badge>
          <Badge variant="inverse">New</Badge>
          <Badge variant="success">
            <ShieldCheck aria-hidden className="size-3.5" /> Free cancellation
          </Badge>
          <Badge variant="accent">Unlimited miles</Badge>
          <Badge variant="muted">Automatic</Badge>
        </div>
      </Specimen>

      <div className="grid gap-10 md:grid-cols-2">
        <Specimen name="Eyebrow" source="shared/ui/atoms/Eyebrow.tsx">
          <Eyebrow>For rental companies</Eyebrow>
        </Specimen>
        <Specimen
          name="Eyebrow, inverse"
          source='tone="inverse"'
          tone="inverse"
        >
          <Eyebrow tone="inverse">For rental companies</Eyebrow>
        </Specimen>
        <Specimen name="Logo" source="shared/ui/atoms/Logo.tsx">
          <Logo />
        </Specimen>
        <Specimen name="Logo, inverse" source="inverse" tone="inverse">
          <Logo inverse />
        </Specimen>
      </div>

      <Specimen name="Skeleton" source="shared/ui/atoms/Skeleton.tsx">
        <div className="max-w-sm space-y-2.5">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </Specimen>
    </StyleSection>
  );
}
