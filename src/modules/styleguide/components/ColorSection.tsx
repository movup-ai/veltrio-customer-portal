import { cn } from "@/shared/lib/cn";
import {
  PALETTE,
  SEMANTIC_COLORS,
  type ColorToken,
} from "@/modules/styleguide/tokens";
import { StyleSection } from "./StyleSection";
import { TokenValue } from "./TokenValue";

function Swatch({ token }: { token: ColorToken }) {
  return (
    <li>
      <div
        className={cn("h-16 rounded-md border border-border", token.className)}
      />
      <p className="mt-2 text-sm font-semibold">{token.name}</p>
      <p className="font-mono text-label text-muted">
        <TokenValue probeClass={token.className} property="backgroundColor" />
        {token.alias && ` from ${token.alias}`}
      </p>
      {token.use && <p className="mt-1 text-meta text-muted">{token.use}</p>}
    </li>
  );
}

function SwatchGroups({
  groups,
}: {
  groups: { group: string; colors: ColorToken[] }[];
}) {
  return (
    <div className="space-y-8">
      {groups.map(({ group, colors }) => (
        <div key={group}>
          <h4 className="mb-3 text-sm font-semibold text-muted">{group}</h4>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-5">
            {colors.map((token) => (
              <Swatch key={token.name} token={token} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function ColorSection() {
  return (
    <StyleSection
      id="color"
      title="Color"
      description="Components use the semantic tokens. Each one points at a palette color, so a retheme is a one-line change in globals.css."
    >
      <div>
        <h3 className="mb-5 text-h4 font-semibold">Semantic tokens</h3>
        <SwatchGroups groups={SEMANTIC_COLORS} />
      </div>
      <div>
        <h3 className="mb-5 text-h4 font-semibold">Palette</h3>
        <SwatchGroups groups={PALETTE} />
      </div>
    </StyleSection>
  );
}
