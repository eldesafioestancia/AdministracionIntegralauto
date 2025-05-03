import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function ReproductiveButton() {
  return (
    <Link href="/animals/reproductive">
      <Button variant="outline">
        <i className="ri-heart-pulse-line mr-1"></i> Manejo Reproductivo
      </Button>
    </Link>
  );
}