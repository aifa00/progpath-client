import "./Home.css";
import PieChart from "../../assets/PieChart";
import { ChartData } from "chart.js";
import SideBar from "../SideBar/SideBar";
import { useEffect, useState } from "react";
import axios from "../../axiosConfig";
import Task from "../Task/Task";
import { useNavigate } from "react-router-dom";
import Tooltip from "rc-tooltip";

interface Task {
  _id: string;
  title: string;
  workspaceId: string;
  projectId: string;
}

function Home() {
  const [result, setResult] = useState<any>({});
  const [taskStatusCounts, setTaskStatusCounts] = useState<any>([]);
  const [tasks, settasks] = useState<any>({
    tasksDueToday: [],
    tasksDueTomorrow: [],
    tasksDueThisWeek: [],
    workspaceId: "",
    projectId: "",
  });

  useEffect(() => {
    const getHome = async () => {
      try {
        const { data } = await axios.get("/");

        if (data.success) {
          setResult(data.result);
          setTaskStatusCounts([
            data.taskStatusCounts["Not Started"],
            data.taskStatusCounts["In Progress"],
            data.taskStatusCounts["Stuck"],
            data.taskStatusCounts["Done"],
          ]);
          settasks(data.tasks);
        }
      } catch (error: any) {
        console.log(error);
      }
    };

    getHome();
  }, []);

  const navigate = useNavigate();

  const data: ChartData<"pie"> = {
    labels: ["NOT STARTED", "IN PROGRESS", "STUCK", "DONE"],
    datasets: [
      {
        data: taskStatusCounts,
        backgroundColor: [
          "rgb(153, 50, 204)",
          "rgb(255, 205, 86)",
          "rgb(229, 62, 62)",
          "rgb(60, 179, 113)",
        ],
        hoverOffset: 4,
      },
    ],
  };

  const navigateToTask = async (
    workspaceId: string,
    projectId: string,
    taskId: string
  ) => {
    navigate(`/workspaces/${workspaceId}/projects/${projectId}?task=${taskId}`);
  };

  return (
    <div className="homepage">
      <SideBar />
      <div className="dashboard">
        <div className="innerdiv-dashboard">
          <div className="subdiv-analytics">
            <div>
              <h5>WORKSPACES</h5>
              <Tooltip
                placement="bottom"
                trigger={["hover"]}
                overlay={<span>Workspaces({result.totalWorkspaces || 0})</span>}
              >
                <h3>{result.totalWorkspaces || 0}</h3>
              </Tooltip>
            </div>
            <div>
              <h5>PROJECTS</h5>
              <Tooltip
                placement="bottom"
                trigger={["hover"]}
                overlay={<span>Projects({result.totalProjects || 0})</span>}
              >
                <h3>{result.totalProjects || 0}</h3>
              </Tooltip>
            </div>
            <div>
              <h5>INVITATIONS</h5>
              <Tooltip
                placement="bottom"
                trigger={["hover"]}
                overlay={<span>Invitations({result.newInvitations || 0})</span>}
              >
                <h3>{result.newInvitations || 0}</h3>
              </Tooltip>
            </div>
          </div>
          {!taskStatusCounts.every((value: number) => value === 0) && (
            <div className="subdiv-piechart">
              <h5>TASK PROGRESSION</h5>
              <PieChart data={data} />
            </div>
          )}
          <div className="subdiv-reminder">
            <div className="due-tasks">
              <h5>TASK DUE TODAY</h5>
              {tasks?.tasksDueToday.length > 0 ? (
                <ul>
                  {tasks?.tasksDueToday?.map((task: Task) => (
                    <li
                      key={task._id}
                      onClick={() =>
                        navigateToTask(
                          task.workspaceId,
                          task.projectId,
                          task._id
                        )
                      }
                    >
                      {task?.title}
                    </li>
                  ))}
                </ul>
              ) : (
                <span>No tasks</span>
              )}
            </div>
            <div className="due-tasks">
              <h5>TASK DUE TOMORROW</h5>
              {tasks?.tasksDueTomorrow.length > 0 ? (
                <ul>
                  {tasks?.tasksDueTomorrow?.map((task: Task) => (
                    <li
                      key={task._id}
                      onClick={() =>
                        navigateToTask(
                          task.workspaceId,
                          task.projectId,
                          task._id
                        )
                      }
                    >
                      {task?.title}
                    </li>
                  ))}
                </ul>
              ) : (
                <span>No tasks</span>
              )}
            </div>
            <div className="due-tasks">
              <h5>TASK DUE THIS WEEK</h5>
              {tasks?.tasksDueThisWeek.length > 0 ? (
                <ul>
                  {tasks?.tasksDueThisWeek?.map((task: Task) => (
                    <li
                      key={task._id}
                      onClick={() =>
                        navigateToTask(
                          task.workspaceId,
                          task.projectId,
                          task._id
                        )
                      }
                    >
                      {task?.title}
                    </li>
                  ))}
                </ul>
              ) : (
                <span>No tasks</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
