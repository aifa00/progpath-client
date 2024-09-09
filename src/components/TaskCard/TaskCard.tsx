import React from "react";
import { getPriorityColor, getStatusColor } from "../../utils/appUtils";
import Tooltip from "rc-tooltip";

const TaskCard: React.FC<any> = ({
  projectTheme,
  tasks,
  openTask,
  handleDeleteTask,
  updateStatus,
  updatePriority,
}) => {
  return tasks.map((task: any) => (
    <div
      className="card"
      key={task._id}
      onClick={(e) => openTask(e, task._id)}
      style={{ border: `2px solid ${projectTheme}` }}
    >
      <i
        className="bi bi-dash-circle"
        id="task-delete-icon"
        onClick={(e) => handleDeleteTask(e, task?._id)}
      ></i>

      <div className="title">
        <h5>{task?.title}</h5>
      </div>

      <Tooltip
        placement="right"
        trigger={["hover"]}
        overlay={
          <span>
            {task?.assignee?.map((obj: any) => (
              <p key={obj.username}>{obj?.username}</p>
            ))}
          </span>
        }
      >
        <div className="assignee">
          {task?.assignee.map((obj: any, index: number) => (
            <img
              key={index}
              src={obj.avatar ? obj.avatar.trim() : "/images/avatar.jpg"}
              alt="profile"
            />
          ))}
        </div>
      </Tooltip>

      <div className="status">
        <i className="bi bi-flag-fill"></i> &nbsp;
        <select
          value={task?.status}
          onChange={(e) => updateStatus(e, task?._id)}
          onClick={(e) => e.stopPropagation()}
          name="status"
          style={{ border: `1px solid ${getStatusColor(task?.status)}` }}
        >
          <option
            style={{ color: getStatusColor("Not Started") }}
            value="Not Started"
          >
            Not Started
          </option>
          <option
            style={{ color: getStatusColor("In Progress") }}
            value="In Progress"
          >
            In Progress
          </option>
          <option style={{ color: getStatusColor("Done") }} value="Done">
            Done
          </option>
          <option style={{ color: getStatusColor("Stuck") }} value="Stuck">
            Blocked
          </option>
        </select>
      </div>

      {task?.labels.length > 0 && (
        <div className="labels">
          {task.labels.map((label: any) => (
            <h5 key={label._id} style={{ backgroundColor: label.theme }}>
              {label.text}
            </h5>
          ))}
        </div>
      )}

      <div className="priority">
        <i className="bi bi-exclamation-octagon-fill"></i> &nbsp;
        <select
          value={task.priority ? task.priority : ""}
          onChange={(e) => updatePriority(e, task?._id)}
          onClick={(e) => e.stopPropagation()}
          name="priority"
          style={{
            color: getPriorityColor(task.priority ? task.priority : ""),
          }}
        >
          <option style={{ color: getPriorityColor("") }} value="">
            Priority
          </option>
          <option style={{ color: getPriorityColor("Low") }} value="Low">
            Low
          </option>
          <option style={{ color: getPriorityColor("Medium") }} value="Medium">
            Medium
          </option>
          <option style={{ color: getPriorityColor("High") }} value="High">
            High
          </option>
        </select>
      </div>

      <div className="dueDate">
        <h5>
          <i className="fa-regular fa-calendar-days"></i> &nbsp; Due:{" "}
          {task?.dueDate ? (
            new Date(task.dueDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          ) : (
            <small style={{ color: "var(--color-text-secondary)" }}>
              not set
            </small>
          )}
        </h5>
      </div>
    </div>
  ));
};

export default TaskCard;
