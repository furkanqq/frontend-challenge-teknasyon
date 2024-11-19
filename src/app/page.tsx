"use client";
import React from "react";
import dynamic from "next/dynamic";

const DynamicCanvasComponent = dynamic(
  () => import("@/components/canvasComponent"),
  {
    ssr: false,
  }
);

export default function Home() {
  return (
    <React.Fragment>
      <DynamicCanvasComponent />
    </React.Fragment>
  );
}
