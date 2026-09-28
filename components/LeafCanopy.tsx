/** Fixed full-viewport photorealistic leaf canopy with a readability scrim.
 *  (Gyro parallax removed — static now.) */
export default function LeafCanopy() {
  return (
    <>
      <div className="canopy" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/leaves/canopy.jpg" alt="" className="canopy__img" />
      </div>
      <div className="scrim" aria-hidden="true" />
    </>
  );
}
