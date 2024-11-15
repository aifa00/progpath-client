import "./SingleProject.css";
import SideBar from "../SideBar/SideBar";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "../../axiosConfig";
import EditProject from "../EditProject/EditProject";
import TaskSearchFilterSort from "../TaskSearchFilterSort/TaskSearchFilterSort";
import Task from "../Task/Task";
import { useDispatch } from "react-redux";
import { setAlert } from "../../redux/alertSlice";
import Dialog from "../../assets/Dialog";
import TaskCard from "../TaskCard/TaskCard";
import { ChartData } from "chart.js";
import LineChart from "../../assets/LineChart";
import { getUserId } from "../../utils/jwtUtils";
import Tooltip from "rc-tooltip";
import { BarLoader } from "react-spinners";

function SingleProject() {
  const { workspaceId, projectId } = useParams();
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<any>({
    title: "",
    description: "",
    theme: "",
    starred: false,
    timestamp: "",
  });
  const [workspaceMembers, setWorkspaceMembers] = useState([
    {
      _id: "",
      username: "",
      avatar: "",
    },
  ]);
  const [deleteDialog, setDeleteDialog] = useState({
    header: "",
    message: "",
    toDelete: false,
    onCancel: () => {},
    onSuccess: () => {},
  });

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [dropDown, setDropDown] = useState("");
  const [userId] = useState(getUserId());
  const [workspaceAdmin, setWorkspaceAdmin] = useState("");
  const [editProjectModal, setEditProjectModal] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [showBurnDownGraph, setShowBurnDownGraph] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [tasks, setTasks] = useState<any>([]);

  const [search, setSearch] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState([]);
  const [priority, setPriority] = useState([]);
  const [sortBy, setSortBy] = useState("");
  const [order, setOrder] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateUpto, setDateUpto] = useState("");
  const [burnoutData, setBurnoutData] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);

        const { data } = await axios.get(
          `/workspaces/${workspaceId}/projects/${projectId}`
        );

        if (data.success) {
          setProject(data.project);
          setWorkspaceAdmin(data.workspaceAdmin);
          setWorkspaceMembers(data.workspaceMembers);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();

    fetchBurnOutGraph();

    const queryParams = new URLSearchParams(location.search);
    const taskId = queryParams.get("task");

    if (taskId) {
      setTaskId(taskId);
      setTaskModal(true);
    }
  }, [workspaceId, projectId, location.search]);

  useEffect(() => {
    fetchTasks();
  }, [search, endDate, dateUpto, status, priority, sortBy, order]);

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks`,
        {
          params: {
            search,
            date: endDate,
            dateFrom,
            dateUpto,
            status,
            priority,
            sortBy,
            order,
          },
        }
      );
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBurnOutGraph = async () => {
    try {
      const { data } = await axios.get(
        `/workspaces/${workspaceId}/projects/${projectId}/burn-out-graph`
      );

      if (data.success) {
        setBurnoutData(data.burnoutData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditProject = async () => {
    if (workspaceAdmin !== userId) return;
    setEditProjectModal(true);
  };

  const starProject = async (action: number) => {
    try {
      setProject((prevProject: any) => ({
        ...prevProject,
        starred: action,
      }));
      await axios.post(
        `/workspaces/${workspaceId}/projects/${projectId}/star`,
        {
          action,
        }
      );
    } catch (error) {
      setProject([...project]);
      console.log(error);
    }
  };

  const deleteProject = async () => {
    try {
      const { data } = await axios.delete(
        `/workspaces/${workspaceId}/projects/${projectId}`
      );
      if (data.success) {
        navigate(`/workspaces/${workspaceId}`);
        dispatch(
          setAlert({ message: "Delete Was Successful!", type: "success" })
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    document.body.classList.remove("modal-open");
  };

  const handleDeleteProject = () => {
    if (workspaceAdmin !== userId) return;

    setDeleteDialog({
      header: "Delete Project",
      message: `Are you sure you want to delete this project? 
      Once You delete, you can't retrieve it. 
      All tasks related with this workspace will be permanently deleted`,
      toDelete: true,
      onCancel: handleCloseDeleteDialog,
      onSuccess: deleteProject,
    });
    setOpenDeleteDialog(true);
    document.body.classList.add("modal-open");
  };

  const handleDeleteTask = (e: any, taskId: string) => {
    e.stopPropagation();
    setDeleteDialog({
      header: "Delete task",
      message: `Are you sure you want to delete this task? 
      Once You delete, you can't retrieve it. 
      All datas related with this task will be permanently deleted`,
      toDelete: true,
      onCancel: handleCloseDeleteDialog,
      onSuccess: async () => {
        try {
          setOpenDeleteDialog(false);

          setTasks([...tasks].filter((task: any) => task._id !== taskId));

          const { data } = await axios.delete(
            `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`
          );

          if (data.success) {
            dispatch(
              setAlert({ message: "Delete Was Successful!", type: "success" })
            );
          }
        } catch (error) {
          setTasks(tasks);
          console.log(error);
        }
      },
    });
    setOpenDeleteDialog(true);
    document.body.classList.add("modal-open");
  };

  const updateStatus = async (e: any, taskId: string) => {
    try {
      const status = e.target.value || "";

      setTasks(
        [...tasks].map((task: any) => {
          if (task._id === taskId) {
            return {
              ...task,
              status,
            };
          } else {
            return task;
          }
        })
      );

      const { data } = await axios.patch(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/status`,
        {
          status,
        }
      );

      if (data.success) {
        dispatch(setAlert({ message: "Status updated!", type: "success" }));
        fetchBurnOutGraph();
      }
    } catch (error) {
      setTasks(tasks);
      console.log(error);
    }
  };

  const updatePriority = async (e: any, taskId: string) => {
    try {
      const priority = e.target.value || "";

      setTasks(
        [...tasks].map((task: any) => {
          if (task._id === taskId) {
            return {
              ...task,
              priority,
            };
          } else {
            return task;
          }
        })
      );

      const { data } = await axios.patch(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/priority`,
        {
          priority,
        }
      );

      if (data.success) {
        dispatch(setAlert({ message: "Priority updated!", type: "success" }));
      }
    } catch (error) {
      setTasks(tasks);
      console.log(error);
    }
  };

  const openTask = (e: any, id: string) => {
    if (workspaceAdmin !== userId && id === "") return;
    setTaskId(id);
    setTaskModal(true);
    document.body.classList.add("modal-open");
  };

  const handleDropDownClose = (e: any) => {
    if (
      e.target.id !== "menuIcon" &&
      !e.target.closest(".menu") &&
      !e.target.closest(".filterBy") &&
      !e.target.closest(".sortBy")
    ) {
      setDropDown("");
    }
  };

  const toggleBurnOutGraph = () => {
    setShowBurnDownGraph(!showBurnDownGraph);
  };

  const burnOutChartdata: ChartData<"line"> = {
    labels: burnoutData.map((data: any) =>
      new Date(data.date).toLocaleDateString("en-GB", {
        month: "short",
        day: "numeric",
      })
    ),
    datasets: [
      {
        label: "Ideal Burnout",
        data: burnoutData.map((data: any) => data.idealBurnDownData),
        fill: false, // No area fill under the line
        borderColor: "rgb(75, 192, 192)", // Line color
        tension: 0.1, // Smooth the line (0 for straight lines)
        pointBackgroundColor: "rgb(75, 192, 192)", // Color of the points
        pointBorderColor: "#fff", // Border color of the points
        pointHoverBackgroundColor: "#fff", // Hover background color
        pointHoverBorderColor: "rgb(75, 192, 192)", // Hover border color
      },
      {
        label: "Actual Burnout",
        data: burnoutData.map((data: any) => data.actualBurnDownData),
        fill: true, // Area fill under the line
        backgroundColor: "rgba(153, 102, 255, 0.2)", // Fill color for the area under the line
        borderColor: "rgb(153, 102, 255)", // Line color
        tension: 0.4, // More smoothing for the line
        pointBackgroundColor: "rgb(153, 102, 255)", // Color of the points
        pointBorderColor: "#fff", // Border color of the points
        pointHoverBackgroundColor: "#fff", // Hover background color
        pointHoverBorderColor: "rgb(153, 102, 255)", // Hover border color
      },
    ],
  };

  return (
    <>
      <div onClick={handleDropDownClose} className="singleProject">
        <SideBar />
        <div className="dashboard">
          <div className="innerdiv-dashboard">
            <div className="body">
              <div className="header">
                <div className="left">
                  <h2 style={{ color: project?.theme }}>{project?.title}</h2>
                  <p style={{ marginBlock: "1%" }}>{project?.description}</p>
                </div>

                <div className="right">
                  <Tooltip
                    placement="bottom"
                    trigger={["hover"]}
                    overlay={<span>View burnout</span>}
                  >
                    <div
                      onClick={toggleBurnOutGraph}
                      className="chart-icon"
                      style={{
                        backgroundColor: showBurnDownGraph
                          ? "var(--color-violet)"
                          : "",
                      }}
                    >
                      <i className="bi bi-bar-chart-line-fill"></i>
                    </div>
                  </Tooltip>

                  <Tooltip
                    placement="bottom"
                    trigger={["hover"]}
                    overlay={<span>Star project</span>}
                  >
                    <i
                      onClick={(e) => starProject(project.starred ? 0 : 1)}
                      style={{
                        color: project.starred
                          ? "yellow"
                          : "var(--color-text-primary)",
                        marginInline: "5%",
                      }}
                      className={
                        project.starred ? "bi bi-star-fill" : "bi bi-star"
                      }
                    ></i>
                  </Tooltip>

                  <i
                    onClick={() =>
                      dropDown === "delete"
                        ? setDropDown("")
                        : setDropDown("delete")
                    }
                    className="bi bi-three-dots-vertical"
                    id="menuIcon"
                    style={{ fontSize: "larger" }}
                  ></i>

                  {dropDown === "delete" && (
                    <div
                      className="dropdown-menu"
                      style={{ top: "100%", right: "0" }}
                    >
                      <div
                        onClick={handleEditProject}
                        className={
                          workspaceAdmin === userId
                            ? "dropdown-option"
                            : "dropdown-option disabled"
                        }
                      >
                        <p>Edit</p>
                      </div>
                      <div
                        onClick={handleDeleteProject}
                        className={
                          workspaceAdmin === userId
                            ? "dropdown-option"
                            : "dropdown-option disabled"
                        }
                      >
                        <p>Delete Project</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <TaskSearchFilterSort
                dropDown={dropDown}
                setDropDown={setDropDown}
                search={search}
                setSearch={setSearch}
                endDate={endDate}
                status={status}
                setStatus={setStatus}
                setEndDate={setEndDate}
                priority={priority}
                setPriority={setPriority}
                sortBy={setSortBy}
                setSortBy={setSortBy}
                order={order}
                setOrder={setOrder}
                setDateFrom={setDateFrom}
                setDateUpto={setDateUpto}
              />

              <div className="tasks">
                {workspaceAdmin === userId && (
                  <div className="addTask">
                    <Tooltip
                      placement="bottom"
                      trigger={["hover"]}
                      overlay={<span>Add task</span>}
                    >
                      <button
                        onClick={(e) => openTask(e, "")}
                        id="addTaskButton"
                      >
                        + Add task
                      </button>
                    </Tooltip>
                  </div>
                )}

                {showBurnDownGraph && (
                  <div className="burndown-graph">
                    <LineChart data={burnOutChartdata} />
                  </div>
                )}

                <div className="cards">
                  {loading && (
                    <BarLoader color="var(--color-blue)" width={"100%"} />
                  )}

                  <div className="task-status-wrapper">
                    <h2 className="status-heading">Blocked</h2>
                    <TaskCard
                      projectTheme={project?.theme}
                      tasks={[...tasks].filter(
                        (task: any) => task.status === "Stuck"
                      )}
                      openTask={openTask}
                      handleDeleteTask={handleDeleteTask}
                      updateStatus={updateStatus}
                      updatePriority={updatePriority}
                    />
                  </div>
                  <div className="task-status-wrapper">
                    <h2 className="status-heading">Not Started</h2>
                    <TaskCard
                      projectTheme={project?.theme}
                      tasks={[...tasks].filter(
                        (task: any) => task.status === "Not Started"
                      )}
                      openTask={openTask}
                      handleDeleteTask={handleDeleteTask}
                      updateStatus={updateStatus}
                      updatePriority={updatePriority}
                    />
                  </div>
                  <div className="task-status-wrapper">
                    <h2 className="status-heading">In Progress</h2>
                    <TaskCard
                      projectTheme={project?.theme}
                      tasks={[...tasks].filter(
                        (task: any) => task.status === "In Progress"
                      )}
                      openTask={openTask}
                      handleDeleteTask={handleDeleteTask}
                      updateStatus={updateStatus}
                      updatePriority={updatePriority}
                    />
                  </div>
                  <div className="task-status-wrapper">
                    <h2 className="status-heading">Done</h2>
                    <TaskCard
                      projectTheme={project?.theme}
                      tasks={[...tasks].filter(
                        (task: any) => task.status === "Done"
                      )}
                      openTask={openTask}
                      handleDeleteTask={handleDeleteTask}
                      updateStatus={updateStatus}
                      updatePriority={updatePriority}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {editProjectModal && (
          <EditProject
            project={project}
            setProject={setProject}
            setEditProjectModal={setEditProjectModal}
          />
        )}
        {taskModal && (
          <Task
            taskId={taskId}
            projectTheme={project?.theme}
            fetchTasks={fetchTasks}
            workspaceMembers={workspaceMembers}
            setTaskModal={setTaskModal}
            fetchBurnOutGraph={fetchBurnOutGraph}
          />
        )}
        {openDeleteDialog && (
          <Dialog
            header={deleteDialog.header}
            message={deleteDialog.message}
            toDelete={deleteDialog.toDelete}
            onCancel={deleteDialog.onCancel}
            onSuccess={deleteDialog.onSuccess}
          />
        )}
      </div>
    </>
  );
}

export default SingleProject;
