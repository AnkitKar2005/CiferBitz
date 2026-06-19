import { createFileRoute } from "@tanstack/react-router";
import LandingPage from "../components/landing/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CiferBitz — Engineering Tomorrow's Digital Reality" },
      {
        name: "description",
        content:
          "CiferBitz builds futuristic software, AI systems, web platforms, and intelligent digital products for the next generation.",
      },
      { property: "og:title", content: "CiferBitz — Engineering Tomorrow's Digital Reality" },
      {
        property: "og:description",
        content:
          "Next-gen digital studio building futuristic software, AI systems and immersive product experiences.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <LandingPage />;
}
