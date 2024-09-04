import "./Task.css";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAlert } from "../../redux/alertSlice";
import AddLabel from "../AddLabel/AddLabel";
import axios from "../../axiosConfig";
import Dialog from "../../assets/Dialog";
import { BarLoader } from "react-spinners";
import { getUserId } from "../../utils/jwtUtils";
import { getStatusColor, getPriorityColor } from "../../utils/appUtils";
import { RootState } from "../../redux/store";

interface Person {
  _id: string;
  username: string;
  avatar: string;
}

interface TaskProps {
  taskId: string | null;
  projectTheme: string;
  fetchTasks: () => void;
  workspaceMembers: Person[] | [];
  setTaskModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const Task: React.FC<TaskProps> = ({
  taskId,
  projectTheme,
  workspaceMembers,
  fetchTasks,
  setTaskModal,
}) => {
  const profileImageUrl: any = useSelector<RootState>(
    (state) => state.user.avatar
  );
  const [loading, setloading] = useState(false);
  const [userId] = useState(getUserId());
  const [edit, setEdit] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<{}[]>([]);
  const [comments, setComments] = useState<any>([]);
  const [assignee, setAssignee] = useState<Person[]>([]);
  const [reporter, setReporter] = useState<Person[]>([]);
  const [labels, setLabels] = useState<{}[]>([]);
  const [status, setStatus] = useState("Not Started");
  const [tags, setTags] = useState<string[]>([]);
  const [priority, setPriority] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [storyPoints, setStoryPoints] = useState<number | "">("");
  const [task, setTask] = useState({
    title: "",
    description: "",
    tags: [],
    attachments: [],
  });

  const [dropDownAssignee, setDropDownAssignee] = useState(false);
  const [dropDownReporter, setDropDownReporter] = useState(false);
  const [dropDownStatus, setDropDownStatus] = useState(false);
  const [dropDownTags, setDropDownTags] = useState(false);
  const [dropDownPriority, setDropDownPriority] = useState(false);
  const [dropDownLabels, setDropDownLabels] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [idOfCommentToEdit, setIdOfCommentToEdit] = useState("");
  const [commentInputText, setCommentInputText] = useState("");
  const [editCommentInputText, setEditCommentInputText] = useState("");
  const [statusOptions] = useState([
    "Not Started",
    "In Progress",
    "Done",
    "Stuck",
  ]);
  const [priorityOptions] = useState(["Low", "Medium", "High"]);
  const [tagOptions] = useState([
    "Bug",
    "Feature",
    "Enhancement",
    "Maintenance",
    "Documentation",
    "Testing",
    "High",
    "Medium",
    "Low",
    "To Do",
    "In Progress",
    "Review",
    "Done",
    "Backend",
    "Frontend",
    "QA",
    "Design",
    "Marketing",
    "DevOps",
    "Critical",
    "Urgent",
    "Normal",
    "Low Priority",
    "Sprint1",
    "Sprint2",
    "Release1.0",
    "Release2.0",
    "Authentication",
    "User Interface",
    "API",
    "Database",
    "Security",
    "Performance",
    "Quickwin",
    "Shortterm",
    "Longterm",
  ]);
  const [deleteDialog, setDeleteDialog] = useState({
    header: "",
    message: "",
    toDelete: false,
    onCancel: () => {},
    onSuccess: () => {},
  });
  const { workspaceId, projectId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setloading(true);
        const { data } = await axios.get(
          `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`
        );

        if (data.success) {
          setFiles(data?.task?.attachments);
          setTask(data?.task);
          setTasksToStates(data?.task);
          setComments(data?.comments);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };

    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  const setTasksToStates = (task: any) => {
    setTitle(task.title);
    setDescription(task.description);
    setLabels(task.labels);
    setAssignee(task.assignee);
    setReporter(task.reporter);
    setStatus(task.status);
    setStartDate(task?.startDate ? task.startDate : "");
    setDueDate(task?.dueDate ? task.dueDate : "");
    setTags(task.tags);
    setPriority(task.priority);
    setStoryPoints(task.storyPoints);
  };

  const addTask = async () => {
    try {
      if (!title) return;
      const formData = new FormData();

      files.forEach((file) => {
        formData.append(`files`, file as Blob);
      });
      formData.append("title", title);
      formData.append("description", description);
      formData.append("labels", JSON.stringify(labels));
      formData.append("assignee", JSON.stringify(assignee));
      formData.append("reporter", JSON.stringify(reporter));
      formData.append("status", status);
      formData.append("startDate", startDate);
      formData.append("dueDate", dueDate);
      formData.append("priority", priority);
      formData.append("tags", JSON.stringify(tags));
      formData.append("storyPoints", String(storyPoints));

      setloading(true);
      const { data } = await axios.post(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (data.success) {
        dispatch(
          setAlert({ message: "Task added succeessfully", type: "success" })
        );
        closeTaskModal();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setloading(false);
    }
  };

  const editTask = async () => {
    try {
      if (!title) return;
      setloading(true);
      const { data } = await axios.put(
        `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`,
        {
          title,
          description,
          labels,
          assignee,
          reporter,
          status,
          startDate,
          dueDate,
          tags,
          priority,
          storyPoints,
        }
      );
      if (data.success) {
        dispatch(setAlert({ message: "Task Saved", type: "success" }));
        closeAllDropdowns();
        setEdit(false);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setloading(false);
    }
  };

  const handlePostComment = async (e: any) => {
    try {
      if (e.key === "Enter") {
        if (!commentInputText) return;
        setloading(true);
        const { data } = await axios.post(`/comments`, {
          referenceId: taskId,
          text: commentInputText,
        });

        if (data.success) {
          setCommentInputText("");
          setComments((prevComments: any) => [
            data.newComment,
            ...prevComments,
          ]);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setloading(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    try {
      if (!editCommentInputText) return;
      setloading(true);
      const { data } = await axios.patch(`/comments/${commentId}`, {
        text: editCommentInputText,
      });

      if (data.success) {
        dispatch(setAlert({ message: "Comment edited", type: "success" }));
        setEditCommentInputText("");
        setIdOfCommentToEdit("");
        setComments((prevComments: any) =>
          [...prevComments].map((comment) => {
            if (comment._id === commentId) {
              return { ...comment, text: editCommentInputText };
            } else {
              return comment;
            }
          })
        );
      }
    } catch (error) {
      setComments([...comments]);
      console.log(error);
    } finally {
      setloading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setDeleteDialog({
      header: "Delete comment ?",
      message: "",
      toDelete: true,
      onCancel: () => {
        setOpenDeleteDialog(false);
      },
      onSuccess: async () => {
        try {
          setloading(true);
          const { data } = await axios.delete(`/comments/${commentId}`);

          if (data.success) {
            dispatch(setAlert({ message: "Comment deleted", type: "success" }));
            setComments((prevComments: any) =>
              [...prevComments].filter((comment) => comment._id !== commentId)
            );
          }
        } catch (error) {
          setComments([...comments]);
          console.log(error);
        } finally {
          setloading(false);
          setOpenDeleteDialog(false);
        }
      },
    });
    setOpenDeleteDialog(true);
  };

  const handleViewFile = (file: any) => {
    const link = document.createElement("a");
    link.href = file.imageUrl;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const closeAllDropdowns = () => {
    if (dropDownLabels) setDropDownLabels(false);
    if (dropDownPriority) setDropDownPriority(false);
    if (dropDownTags) setDropDownTags(false);
    if (dropDownStatus) setDropDownStatus(false);
    if (dropDownReporter) setDropDownReporter(false);
    if (dropDownAssignee) setDropDownAssignee(false);
  };

  const handleAddAssignee = (member: any) => {
    const memberExist = assignee.find((obj: any) => obj._id === member._id);
    if (memberExist) return;
    setAssignee([...assignee, member]);
  };
  const handleRemoveAssignee = (id: string) => {
    setAssignee([...assignee].filter((obj) => obj._id !== id));
  };

  const handleAddReporter = (member: any) => {
    const memberExist = reporter.find((obj: any) => obj._id === member._id);
    if (memberExist) return;
    setReporter([...reporter, member]);
  };
  const handleRemoveReporter = (id: string) => {
    setReporter([...reporter].filter((obj) => obj._id !== id));
  };

  const handleSetStatus = (opt: string) => {
    setStatus(opt);
  };

  const handleStartDateOnchange = (e: any) => {
    const value = e.target.value;
    const dateString = new Date(value).toISOString();
    setStartDate(dateString);
  };

  const handledueDateOnchange = (e: any) => {
    const value = e.target.value;
    const dateString = new Date(value).toISOString();
    setDueDate(dateString);
  };

  const handleTagChange = (tag: string) => {
    setTags(
      tags.includes(tag) ? tags.filter((elem) => elem !== tag) : [...tags, tag]
    );
  };

  const handleDescriptionInput = (e: any) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const handleRemoveLabel = (id: string) => {
    setDeleteDialog({
      header: "Delete Label ?",
      message: "",
      toDelete: true,
      onCancel: () => {
        setOpenDeleteDialog(false);
      },
      onSuccess: () => {
        setLabels((prev) =>
          [...labels].filter((label: any) => label._id !== id)
        );
        setOpenDeleteDialog(false);
      },
    });
    setOpenDeleteDialog(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files) {
        const newFiles = Array.from(e.target.files); // Convert FileList to array

        if (taskId) {
          const formData = new FormData();

          newFiles.forEach((file, index) => {
            formData.append(`files`, file as Blob);
          });

          setloading(true);
          const { data } = await axios.post(
            `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          if (data.success) {
            dispatch(
              setAlert({
                message: "File Attached successfully",
                type: "success",
              })
            );
            setFiles([...files, ...data.files]);
          }
        } else {
          setFiles((prevFiles) => [...prevFiles, ...newFiles]); // Append new files to existing files
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setloading(false);
    }
  };

  const handleDeleteAttachment = async (
    index: number,
    attachmentKey: string
  ) => {
    setDeleteDialog({
      header: "Delete Attachmet ?",
      message: "",
      toDelete: true,
      onCancel: () => {
        setOpenDeleteDialog(false);
      },
      onSuccess: async () => {
        try {
          setloading(true);
          setOpenDeleteDialog(false);
          const encodedKey = encodeURIComponent(attachmentKey);
          const { data } = await axios.delete(
            `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments/${encodedKey}`
          );

          if (data.success) {
            dispatch(
              setAlert({ message: "File delete successfully", type: "success" })
            );
            setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
          }
        } catch (error) {
          console.log(error);
        } finally {
          setloading(false);
        }
      },
    });

    setOpenDeleteDialog(true);
  };

  const handleCancelEdit = () => {
    setEdit(false);
    closeAllDropdowns();
    setTasksToStates(task);
  };

  const getFileUrl = (file: any) => {
    if (file.type === "application/pdf") {
      return "/images/pdf-placeholder.jpg";
    } else if (file?.type?.startsWith("image/")) {
      return file.imageUrl ? file.imageUrl : URL.createObjectURL(file);
    } else if (file?.type?.startsWith("audio/")) {
      return "/images/audio-placeholder.jpg";
    } else if (file?.type?.startsWith("video/")) {
      return "/images/video-placeholder.jpg";
    } else {
      return "";
    }
  };

  const formatDateForInput = (isoString: string) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const closeTaskModal = () => {
    setTitle("");
    setDescription("");
    setLabels([]);
    setFiles([]);
    setAssignee([]);
    setReporter([]);
    setStatus("Not Started");
    setStartDate("");
    setDueDate("");
    setPriority("");
    setTags([]);
    setStoryPoints("");

    setEdit(false);
    closeAllDropdowns();
    setTaskModal(false);

    document.body.classList.remove("modal-open");
    fetchTasks();
  };

  return (
    <div
      className="dialog-overlay"
      onClick={(e: any) => {
        if (!e.target.closest(".input-group") && e.target.id !== "addLabels") {
          setDropDownLabels(false);
        }
      }}
    >
      <i onClick={closeTaskModal} className="bi bi-x-lg close-button"></i>

      <div
        className="taskModal"
        style={{ border: `3px solid ${projectTheme}` }}
      >
        <div className="div1">
          {taskId && (
            <div className="editButtons">
              {edit && <button onClick={handleCancelEdit}>Cancel</button>}
              {edit ? (
                <button
                  onClick={editTask}
                  style={{ backgroundColor: "var(--color-blue)" }}
                  className={!title ? "btn-disabled" : ""}
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => setEdit(true)}
                  style={{ backgroundColor: "var(--color-blue)" }}
                >
                  Edit
                </button>
              )}
            </div>
          )}

          <div className="left">
            <div className="header">
              {!taskId || edit ? (
                <>
                  <h5>Title</h5>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter Task title"
                  />
                </>
              ) : (
                <h3>{title}</h3>
              )}
            </div>
            <div className="body">
              {" "}
              <br />
              <div className="upper">
                <label>
                  <i className="bi bi-paperclip"></i>&nbsp; Attach
                  <input
                    type="file"
                    multiple
                    accept="image/*,application/pdf,video/*,audio/*"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                </label>

                <label
                  id="addLabels"
                  style={{ position: "relative" }}
                  onClick={() => {
                    closeAllDropdowns();
                    setDropDownLabels(true);
                  }}
                >
                  <i className="bi bi-bookmark"></i>&nbsp; Labels
                  {dropDownLabels && (
                    <AddLabel setLabels={setLabels} setEdit={setEdit} />
                  )}
                </label>
              </div>
              <div className="lower">
                <div className="description">
                  <h5>Description</h5>

                  {!taskId || edit ? (
                    <textarea
                      id="description"
                      placeholder="Add Descsription..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onInput={handleDescriptionInput}
                      style={{
                        height: "auto",
                        overflow: "hidden",
                        padding: "10px",
                        width: "95%",
                      }}
                    />
                  ) : description ? (
                    <div className="task-description">{task?.description}</div>
                  ) : (
                    <div
                      style={{
                        fontSize: "small",
                        color: "gray",
                        padding: "10px",
                      }}
                    >
                      <p
                        onClick={() => {
                          if (!edit) setEdit(true);
                        }}
                        style={{ display: "inline-block" }}
                      >
                        Add description...
                      </p>
                    </div>
                  )}
                </div>
                {files?.length > 0 && (
                  <div className="attachments">
                    <h5>Attachments</h5>
                    <div className="attachmentOuterdiv">
                      {!taskId &&
                        files?.length > 0 &&
                        files.map((file: any, index) => (
                          <div key={file.name} className="attachmentImage">
                            <img src={getFileUrl(file)} alt="file" />
                            <div className="attachmentIcons">
                              <i
                                className="bi bi-x-lg"
                                onClick={() =>
                                  setFiles((prevFiles) =>
                                    prevFiles.filter((_, i) => i !== index)
                                  )
                                }
                              ></i>
                            </div>
                          </div>
                        ))}
                      {taskId &&
                        files?.length > 0 &&
                        files.map((file: any, index) => (
                          <div key={file._id} className="attachmentImage">
                            <img src={getFileUrl(file)} alt="file" />
                            <div className="attachmentIcons">
                              <i
                                className="fa-solid fa-eye"
                                onClick={() => handleViewFile(file)}
                              ></i>{" "}
                              &nbsp;
                              <i
                                className="bi bi-trash-fill"
                                onClick={() =>
                                  handleDeleteAttachment(index, file.key)
                                }
                              ></i>
                            </div>
                            <small>{file?.originalName?.slice(0, 17)}...</small>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                {labels?.length > 0 && (
                  <div className="labels">
                    <h5>Labels</h5>
                    <div className="currentLabels">
                      {labels.map((label: any) => (
                        <div key={label._id}>
                          <section
                            style={{
                              backgroundColor: label.theme,
                              color: "#3f3f3f",
                            }}
                            className="singleLabel"
                          >
                            {edit ? (
                              <input
                                value={label.text}
                                onChange={(e) => {
                                  setLabels(
                                    labels.map((obj: any) => {
                                      if (obj._id === label._id) {
                                        return { ...obj, text: e.target.value };
                                      } else {
                                        return obj;
                                      }
                                    })
                                  );
                                }}
                                type="text"
                              />
                            ) : (
                              <h5>{label.text}</h5>
                            )}
                            {edit && (
                              <i
                                className="bi bi-trash-fill"
                                onClick={() => handleRemoveLabel(label._id)}
                              ></i>
                            )}
                          </section>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {taskId && (
              <div className="taskFooter">
                <div className="comment">
                  <img
                    src={
                      profileImageUrl
                        ? profileImageUrl.trim()
                        : "/images/avatar.jpg"
                    }
                    alt="profile"
                  />
                  <input
                    placeholder="Add a comment"
                    type="text"
                    value={commentInputText}
                    onChange={(e) => setCommentInputText(e.target.value)}
                    onKeyDown={handlePostComment}
                  />
                </div>
                <div className="comments">
                  {" "}
                  <br />
                  <div className="allComments">
                    {comments?.length > 0 && <h5>All comments</h5>} <br />
                    {comments?.length > 0 &&
                      comments.map((comment: any) => (
                        <div key={comment._id} className="singleComment">
                          <img
                            style={{ marginRight: "10px", marginTop: "5px" }}
                            src={comment.userDetails.avatar?.trim()}
                            alt="profile"
                          />
                          <div>
                            <p
                              style={{
                                fontSize: "10px",
                                color: "rgba(106, 106, 106, 0.732)",
                              }}
                            >
                              {new Date(comment.timestamp).toLocaleDateString(
                                "en-GB"
                              )}{" "}
                              &nbsp; &nbsp;
                              {new Date(comment.timestamp).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "numeric",
                                  minute: "numeric",
                                  hour12: true,
                                }
                              )}
                            </p>
                            <p
                              style={{ fontSize: "smaller", fontWeight: "600" }}
                            >
                              {comment.userDetails.username}
                            </p>

                            {idOfCommentToEdit === comment._id ? (
                              <textarea
                                style={{ width: "20rem" }}
                                rows={4}
                                value={editCommentInputText}
                                onChange={(e) =>
                                  setEditCommentInputText(e.target.value)
                                }
                              ></textarea>
                            ) : (
                              <p style={{ fontWeight: "lighter" }}>
                                {comment.text}
                              </p>
                            )}

                            {comment.userDetails._id === userId &&
                              (idOfCommentToEdit === comment._id ? (
                                <>
                                  <span
                                    id="editCommentCancelButton"
                                    onClick={() => {
                                      setIdOfCommentToEdit("");
                                      setEditCommentInputText("");
                                    }}
                                  >
                                    Cancel
                                  </span>
                                  <span
                                    id="editCommentSaveButton"
                                    onClick={() =>
                                      handleEditComment(comment._id)
                                    }
                                  >
                                    Save
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span
                                    onClick={() => {
                                      setIdOfCommentToEdit(comment._id);
                                      setEditCommentInputText(comment.text);
                                    }}
                                    id="editCommentIcon"
                                  >
                                    Edit
                                  </span>
                                  <span
                                    onClick={() =>
                                      handleDeleteComment(comment._id)
                                    }
                                    id="deleteCommentIcon"
                                  >
                                    Delete
                                  </span>
                                </>
                              ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="right">
            <h6>Details</h6>
            <ul>
              <li>
                <label>Assignee</label>
                <div
                  className="optionButton"
                  style={{ cursor: edit ? "pointer" : "" }}
                  onClick={(e: any) => {
                    if (edit || !taskId) {
                      if (
                        !e.target.closest(".assigneeDropdown") &&
                        e.target.className !== "removeButton"
                      ) {
                        closeAllDropdowns();
                        setDropDownAssignee(!dropDownAssignee);
                      }
                    }
                  }}
                >
                  {assignee?.length > 0 ? (
                    assignee.map((member: any) => (
                      <div
                        className="selectedMembers"
                        style={{ cursor: edit ? "pointer" : "" }}
                        key={member._id}
                      >
                        <img src={member?.avatar} alt="profile" />
                        <p>
                          {member?.username?.split(" ").slice(0, 2).join(" ")}
                        </p>
                        {edit || !taskId ? (
                          <strong
                            className="removeButton"
                            onClick={() => handleRemoveAssignee(member._id)}
                          >
                            remove
                          </strong>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "var(--color-text-secondary)" }}>
                      Not Assigned
                    </p>
                  )}
                  {dropDownAssignee && (
                    <div className="assigneeDropdown">
                      <div className="dropdownOptions">
                        <h5>Workspace members</h5>
                      </div>
                      {workspaceMembers.map((member: any) => (
                        <div
                          key={member._id}
                          onClick={() => handleAddAssignee(member)}
                          className="dropdownOptions"
                        >
                          <img src={member?.avatar?.trim()} alt="profile" />
                          <p>
                            {member?.username?.split(" ").slice(0, 2).join("")}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </li>

              <li>
                <label>Reporter</label>
                <div
                  className="optionButton"
                  style={{ cursor: edit ? "pointer" : "" }}
                  onClick={(e: any) => {
                    if (edit || !taskId) {
                      if (
                        !e.target.closest(".reporterDropdown") &&
                        e.target.className !== "removeButton"
                      ) {
                        closeAllDropdowns();
                        setDropDownReporter(!dropDownReporter);
                      }
                    }
                  }}
                >
                  {reporter?.length > 0 ? (
                    reporter.map((member: any) => (
                      <div className="selectedMembers" key={member._id}>
                        <img src={member.avatar} alt="profile" />
                        <p>
                          {member?.username?.split(" ").slice(0, 2).join("")}
                        </p>
                        {edit || !taskId ? (
                          <strong
                            className="removeButton"
                            onClick={() => handleRemoveReporter(member._id)}
                          >
                            remove
                          </strong>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "var(--color-text-secondary)" }}>
                      Not Assigned
                    </p>
                  )}
                  {dropDownReporter && (
                    <div className="reporterDropdown">
                      <div className="dropdownOptions">
                        <h5>Workspace members</h5>
                      </div>
                      {workspaceMembers.map((member: any) => (
                        <div
                          onClick={() => handleAddReporter(member)}
                          className="dropdownOptions"
                          key={member._id}
                        >
                          <img src={member?.avatar?.trim()} alt="profile" />
                          <p>
                            {member?.username?.split(" ").slice(0, 2).join("")}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </li>

              <li>
                <label>Status</label>
                <div
                  className="optionButton"
                  style={{ cursor: edit ? "pointer" : "" }}
                  onClick={() => {
                    if (edit || !taskId) {
                      closeAllDropdowns();
                      setDropDownStatus(!dropDownStatus);
                    }
                  }}
                >
                  <h5
                    style={{
                      border: `2px solid ${getStatusColor(status)}`,
                      width: "5rem",
                      textAlign: "center",
                      borderRadius: "15px",
                      display: "inline-block",
                    }}
                  >
                    {status}
                  </h5>

                  {dropDownStatus && (
                    <div className="statusDropdown">
                      {statusOptions.map((opt: any) => (
                        <div
                          onClick={() => handleSetStatus(opt)}
                          className="dropdownOptions"
                          style={{ display: "flex", justifyContent: "center" }}
                          key={opt}
                        >
                          <h5
                            style={{
                              border: `2px solid ${getStatusColor(opt)}`,
                              width: "5rem",
                              textAlign: "center",
                              borderRadius: "15px",
                              display: "inline-block",
                            }}
                          >
                            {opt}
                          </h5>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </li>

              <li>
                <label>Start Date</label>
                <div
                  className="optionButton"
                  style={{ cursor: edit ? "pointer" : "" }}
                  onClick={() => {
                    if (edit) {
                      closeAllDropdowns();
                    }
                  }}
                >
                  {!edit && taskId ? (
                    startDate ? (
                      <strong>
                        {new Date(startDate).toLocaleDateString("en-GB")}
                      </strong>
                    ) : (
                      <p style={{ color: "var(--color-text-secondary)" }}>
                        Not Assigned
                      </p>
                    )
                  ) : (
                    <input
                      value={formatDateForInput(startDate)}
                      onChange={handleStartDateOnchange}
                      type="date"
                    />
                  )}
                </div>
              </li>

              <li>
                <label>Due Date</label>
                <div
                  className="optionButton"
                  style={{ cursor: edit ? "pointer" : "" }}
                  onClick={() => {
                    if (edit) {
                      closeAllDropdowns();
                    }
                  }}
                >
                  {!edit && taskId ? (
                    dueDate ? (
                      <strong>
                        {new Date(dueDate).toLocaleDateString("en-GB")}
                      </strong>
                    ) : (
                      <p style={{ color: "var(--color-text-secondary)" }}>
                        Not Assigned
                      </p>
                    )
                  ) : (
                    <input
                      value={formatDateForInput(dueDate)}
                      onChange={handledueDateOnchange}
                      type="date"
                    />
                  )}
                </div>
              </li>

              <li>
                <label>Priority</label>
                <div
                  className="optionButton"
                  style={{ cursor: edit ? "pointer" : "" }}
                  onClick={() => {
                    if (edit || !taskId) {
                      closeAllDropdowns();
                      setDropDownPriority(!dropDownPriority);
                    }
                  }}
                >
                  {priority ? (
                    <h5 style={{ color: getPriorityColor(priority) }}>
                      {priority}
                    </h5>
                  ) : (
                    <p style={{ color: "var(--color-text-secondary)" }}>
                      Not Assigned
                    </p>
                  )}
                  {dropDownPriority && (
                    <div className="priorityDropdown">
                      {priorityOptions.map((opt: string) => (
                        <div
                          key={opt}
                          onClick={() => setPriority(opt)}
                          className="dropdownOptions"
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <h5 style={{ color: getPriorityColor(opt) }}>
                            {opt}
                          </h5>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </li>

              <li>
                <label>Story Pionts</label>
                <div
                  className="optionButton"
                  style={{ cursor: edit ? "pointer" : "" }}
                  onClick={() => {
                    if (edit) {
                      closeAllDropdowns();
                    }
                  }}
                >
                  {!edit && taskId ? (
                    storyPoints ? (
                      <strong>{storyPoints}</strong>
                    ) : (
                      <p style={{ color: "var(--color-text-secondary)" }}>
                        Not Assigned
                      </p>
                    )
                  ) : (
                    <input
                      value={storyPoints}
                      onChange={(e) => {
                        const number = parseInt(e.target.value);
                        if (number < 1 || number > 100) return;
                        setStoryPoints(number);
                      }}
                      type="number"
                      placeholder="eg: 5"
                      min={1}
                    />
                  )}
                </div>
              </li>

              <li>
                <label>Tags</label>
                <div
                  className="optionButton"
                  style={{ cursor: edit ? "pointer" : "" }}
                  onClick={(e: any) => {
                    if (edit || !taskId) {
                      if (
                        !e.target.closest(".tags") &&
                        !e.target.closest(".tagsDropdown")
                      ) {
                        closeAllDropdowns();
                        setDropDownTags(!dropDownTags);
                      }
                    }
                  }}
                >
                  {tags?.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                      {tags.map((tag: string) => (
                        <div key={tag} className="tags">
                          <div>
                            <p>{tag}</p>
                            {edit ||
                              (!taskId && (
                                <span onClick={() => handleTagChange(tag)}>
                                  <i className="bi bi-x"></i>
                                </span>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: "var(--color-text-secondary)" }}>
                      Not Assigned
                    </p>
                  )}

                  {dropDownTags && (
                    <div className="tagsDropdown">
                      {tagOptions?.length > 0 ? (
                        tagOptions.map((tag: string) => (
                          <div key={tag} className="tags">
                            <div onClick={() => handleTagChange(tag)}>
                              <p>{tag}</p>
                              {tags.includes(tag) && (
                                <span>
                                  <i className="bi bi-check"></i>
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p style={{ color: "var(--color-text-secondary)" }}>
                          Not Assigned
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="div2">
          {!taskId && (
            <button
              className={!title ? "btn-disabled" : "btn-primary"}
              onClick={addTask}
            >
              Save
            </button>
          )}
        </div>

        {loading && <BarLoader width={"100%"} color="var(--color-blue)" />}
      </div>

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
  );
};

export default Task;
