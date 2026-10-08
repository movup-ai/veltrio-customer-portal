interface BookingBranchProps {
  name: string;
  /** Empty when the company has no address on file for the branch. */
  address?: string;
}

/** A branch by name, with its street address beneath. */
export function BookingBranch({ name, address }: BookingBranchProps) {
  return (
    <>
      {name}
      {address && (
        <span className="block font-normal text-muted">{address}</span>
      )}
    </>
  );
}
