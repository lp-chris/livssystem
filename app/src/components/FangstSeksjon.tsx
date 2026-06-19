"use client";

import { useState } from "react";
import FangstSkjema from "./FangstSkjema";
import SisteFangster from "./SisteFangster";

export default function FangstSeksjon() {
  const [oppdater, setOppdater] = useState(0);

  return (
    <>
      <FangstSkjema onSuksess={() => setOppdater((n) => n + 1)} />
      <SisteFangster oppdater={oppdater} />
    </>
  );
}
