import { Link } from "wouter";

interface Activity {
  id: number;
  type: "salary" | "animal" | "repair" | "maintenance";
  user: string;
  description: string;
  time: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "salary":
        return "ri-user-star-line";
      case "animal":
        return "ri-bear-smile-line";
      case "repair":
        return "ri-tools-line";
      case "maintenance":
        return "ri-settings-line";
      default:
        return "ri-file-list-line";
    }
  };

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "salary":
        return "bg-accent";
      case "animal":
        return "bg-success";
      case "repair":
        return "bg-error";
      case "maintenance":
        return "bg-warning";
      default:
        return "bg-primary";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <h2 className="font-header font-semibold text-neutral-500">Actividad Reciente</h2>
        <Link href="/">
          <a className="text-sm text-accent hover:text-accent-dark">Ver todas</a>
        </Link>
      </div>
      <div className="p-4">
        <ul className="divide-y divide-neutral-200">
          {activities.map((activity) => (
            <li key={activity.id} className="py-3 flex">
              <div className="flex-shrink-0 relative">
                <div
                  className={`h-10 w-10 rounded-full ${getActivityColor(
                    activity.type
                  )} flex items-center justify-center text-white`}
                >
                  <i className={getActivityIcon(activity.type)}></i>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-neutral-500" dangerouslySetInnerHTML={{ __html: activity.description }} />
                <p className="text-xs text-neutral-400 mt-1">{activity.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
