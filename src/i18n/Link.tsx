import NextLink from "next/link";
import { useLocale } from "next-intl";
import type { ComponentProps } from "react";
import { localizeHref } from "./href";

type LinkProps = Omit<ComponentProps<typeof NextLink>, "href"> & {
  href: string;
};

/** A link that keeps the reader in their language. Use it for every link to a page of ours. */
export function Link({ href, ...props }: LinkProps) {
  return <NextLink href={localizeHref(href, useLocale())} {...props} />;
}
