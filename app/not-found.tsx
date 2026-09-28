import Link from "next/link";
import EarthPanel from "../components/EarthPanel";
import GamosaStrip from "../components/GamosaStrip";
import SoilBackdrop, { SoilVignette } from "../components/SoilBackdrop";
import SoilScene from "../components/SoilScene";
import Footer from "../components/Footer";

export const metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <>
      <SoilBackdrop />
      <SoilScene />
      <SoilVignette />
      <main className="wrap" style={{ position: "relative", zIndex: 2, padding: "4rem 0" }}>
        <EarthPanel tilt="l" labelledBy="nf-title">
          <span className="stamp">404</span>
          <h1 id="nf-title" className="font-display">
            This path isn't on the board
          </h1>
          <p className="font-body" style={{ fontSize: "1.2rem" }}>
            The page you reached for doesn't exist — like stepping onto a point
            with no line to it.
          </p>
          <GamosaStrip />
          <p>
            <Link href="/" className="btn-clay">
              ← Back to the games
            </Link>
          </p>
        </EarthPanel>
        <Footer />
      </main>
    </>
  );
}
