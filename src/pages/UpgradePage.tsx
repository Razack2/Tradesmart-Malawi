import { useNavigate } from "react-router-dom";
import { useCourses } from "@/contexts/CourseContext";
import { Button } from "@/components/ui/button";

export default function UpgradePage() {
  const { levels } = useCourses();
  const navigate = useNavigate();

  const paidLevels = levels.filter(
    (l) => l.name !== "Beginner"
  );

  const getPrice = (name: string) => {
    if (name === "Intermediate") return "MK15,000";
    if (name === "Expert") return "MK30,000";
    return "Premium";
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Upgrade Packages
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        {paidLevels.map((level) => (
          <div key={level.id} className="border rounded-xl p-6">
            <h2 className="text-xl font-bold mb-2">
              {level.name}
            </h2>

            <p className="text-muted-foreground mb-3">
              {level.description}
            </p>

            <p className="font-bold mb-4">
              {getPrice(level.name)}
            </p>

            <Button
              onClick={() =>
                navigate(`/payment/${level.id}`)
              }
            >
              Buy Access
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}