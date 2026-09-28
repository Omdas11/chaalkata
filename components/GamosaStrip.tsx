/** Gamosa-weave divider: red strip with chalk ticks, after the
 *  red-and-white woven border of the Assamese gamosa. */
export default function GamosaStrip({ label }: { label?: string }) {
  return (
    <hr className="gamosa-strip" aria-hidden={label ? undefined : true} aria-label={label} />
  );
}
