import "./SingleWorkspace.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import SideBar from "../SideBar/SideBar";
import { Link, useNavigate, useParams } from "react-router-dom";
import EditWorkspace from "../EditWorkspace/EditWorkspace";
import { useDispatch } from "react-redux";
import { setAlert } from "../../redux/alertSlice";
import axios from "../../axiosConfig";
import { getWorkspaceType } from "../../constants/constants";
import { getUserId } from "../../utils/jwtUtils";
import Dialog from "../../assets/Dialog";
import AddProject from "../AddProject/AddProject";
import { BarLoader } from "react-spinners";
import { togglePremiumComponent } from "../../redux/premiumSlice";
import Tooltip from "rc-tooltip";
import Spinner from "../../assets/Spinner";

function SingleWorkspace() {
  const [pageLoading, setPageLoading] = useState(false);
  const [userId] = useState(getUserId());
  const [loading, setLoading] = useState(false);
  const [editWorkspaceModal, setEditWorkspaceModal] = useState(false);
  const [dropDown, setDropDown] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [dialog, setDialog] = useState({
    header: "",
    message: "",
    toDelete: false,
    onCancel: () => {},
    onSuccess: () => {},
  });
  const [workspace, setWorkspace] = useState<any>({
    collaborators: [],
    invitations: [],
  });
  const [projects, setProjects] = useState<any>([]);
  const [search, setSearch] = useState("");
  const [search2, setSearch2] = useState("");
  const [search3, setSearch3] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const inputRef: any = useRef();
  const dispatch = useDispatch();
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetData = async () => {
      try {
        setPageLoading(true);

        const { data } = await axios.get(`/workspaces/${workspaceId}`);
        if (data.success) {
          const targetObject = data.workspace.collaborators.find(
            (member: any) => member._id === data.workspace.createdBy
          );
          const remainingObjects = data.workspace.collaborators.filter(
            (member: any) => member._id !== data.workspace.createdBy
          );
          setWorkspace({
            ...data.workspace,
            collaborators: [targetObject, ...remainingObjects],
          });
          setProjects(data.projects);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setPageLoading(false);
      }
    };
    fetData();
  }, []);

  const handleAddEmail = () => {
    if (newEmail !== "") {
      if (emails.includes(newEmail)) return;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail))
        return dispatch(
          setAlert({ message: "Provide a valid email !", type: "error" })
        );
      setEmails((prevEmails) => [...prevEmails, newEmail.trim()]);
      setNewEmail("");
      inputRef.current.focus();
    } else {
      inputRef.current.focus();
    }
  };

  const handleRemoveEmail = (email: string) => {
    setEmails((prevEmails) =>
      [...prevEmails].filter((elem) => {
        if (elem !== email) {
          return elem;
        }
      })
    );
  };

  const handleDropDownClose = (e: any) => {
    if (
      e.target.className !== "inviteButton" &&
      !e.target.closest(".invitations") &&
      e.target.className !== "collaboratorsList" &&
      !e.target.closest(".settings") &&
      e.target.id !== "inviteIcon" &&
      e.target.id !== "add-project-btn" &&
      e.target.id !== "menuIcon" &&
      !e.target.closest(".menu") &&
      e.target.className !== "invitationsList" &&
      !e.target.closest(".addProjectButton") &&
      !e.target.closest(".addProject")
    ) {
      setDropDown("");
      setNewEmail("");
      setEmails([]);
      setSearch2("");
      setSearch3("");
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      handleAddEmail();
    }
  };

  const handleSendInvitations = async () => {
    try {
      if (workspace.createdBy !== userId) return;

      if (emails.length <= 0) {
        return dispatch(
          setAlert({ message: "Please add email to continue", type: "error" })
        );
      }

      setEmails([]);
      setNewEmail("");
      setLoading(true);

      const { data } = await axios.post(
        `/workspaces/${workspaceId}/invitations`,
        {
          emails,
        }
      );

      if (data.success) {
        dispatch(
          setAlert({
            message: "Invitations Sent Successfully !",
            type: "success",
          })
        );
        setDropDown("");
        const { data } = await axios.get(
          `/workspaces/${workspaceId}/invitations`
        );
        setWorkspace({
          ...workspace,
          invitations: data.invitations,
        });
      }
    } catch (error: any) {
      if (
        !error.response.data.message.includes(
          "You have reached the limit for free collaborators"
        )
      ) {
        dispatch(togglePremiumComponent());
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditWorkspace = () => {
    if (workspace.createdBy !== userId) return;
    setEditWorkspaceModal(true);
  };

  const handleMouseEnter = (e: any) => {
    if (workspace.createdBy === userId)
      e.currentTarget.style.backgroundColor = "rgba(223, 35, 35, 0.217)";
  };

  const handleMousLeave = (e: any) => {
    if (workspace.createdBy === userId)
      e.currentTarget.style.backgroundColor = "";
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      setOpenDialog(false);
      const { data } = await axios.delete(
        `/workspaces/${workspaceId}/invitations/${invitationId}`
      );
      if (data.success) {
        dispatch(
          setAlert({ message: "Invitation cancelled!", type: "success" })
        );
        setWorkspace({
          ...workspace,
          invitations: workspace.invitations.filter(
            (invitation: any) => invitation._id !== invitationId
          ),
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const removeCollaborator = async (
    username: string,
    collaboratorId: string
  ) => {
    try {
      setOpenDialog(false);
      const { data } = await axios.patch(
        `/workspaces/${workspaceId}/collaborators/${collaboratorId}`
      );
      if (data.success) {
        dispatch(
          setAlert({
            message: `${username} is removed from workspace`,
            type: "success",
          })
        );
        setWorkspace((prevWorkspace: any) => ({
          ...prevWorkspace,
          collaborators: prevWorkspace.collaborators.filter(
            (collaborator: any) => collaborator?._id !== collaboratorId
          ),
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveCollaborator = (
    username: string,
    collaboratorId: string
  ) => {
    if (workspace.createdBy !== userId) return;
    setDialog({
      header: "Remove Collaborator",
      message: `Are you sure you want to remove ${username} from this workspace?`,
      toDelete: true,
      onCancel: handleCloseDialog,
      onSuccess: () => removeCollaborator(username, collaboratorId),
    });
    setOpenDialog(true);
  };

  const handleCancelInvitation = (invitationId: string) => {
    if (workspace.createdBy !== userId) return;
    setDialog({
      header: "Delete Invitation",
      message: "Are you sure you want to cancel this invitation?",
      toDelete: true,
      onCancel: handleCloseDialog,
      onSuccess: () => cancelInvitation(invitationId),
    });
    setOpenDialog(true);
  };

  const handleAddProject = (e: any) => {
    e.preventDefault();
    dropDown === "addProject" ? setDropDown("") : setDropDown("addProject");
  };

  const filteredCollaborators = useMemo(
    () =>
      workspace.collaborators.filter((collaborator: any) =>
        collaborator?.username?.toLowerCase().includes(search2.toLowerCase())
      ),
    [workspace.collaborators, search2]
  );

  const filteredInvitations = useMemo(
    () =>
      workspace.invitations.filter((invitation: any) =>
        invitation?.email?.toLowerCase().includes(search3.toLowerCase())
      ),
    [workspace.invitations, search3]
  );

  const starredProjects = useMemo(
    () => projects.filter((project: any) => project?.starred),
    [projects]
  );

  const filteredProjects = useMemo(
    () =>
      projects.filter((project: any) =>
        project?.title?.toLowerCase().includes(search.toLowerCase())
      ),
    [projects, search]
  );

  const starProject = async (
    e: React.MouseEvent,
    projectId: string,
    action: number
  ) => {
    try {
      if (e.currentTarget.id === "starIcon") e.preventDefault();

      setProjects((prevState: any) =>
        prevState.map((proj: any) => {
          if (proj._id === projectId) {
            return { ...proj, starred: action };
          } else {
            return proj;
          }
        })
      );
      await axios.post(
        `/workspaces/${workspaceId}/projects/${projectId}/star`,
        {
          action,
        }
      );
    } catch (error) {
      setProjects([...projects]);
      console.log(error);
    }
  };

  const deleteWorkspace = async () => {
    try {
      const { data } = await axios.delete(`/workspaces/${workspaceId}`);
      if (data.success) {
        navigate("/workspaces");
        dispatch(
          setAlert({ message: "Delete was successfull", type: "success" })
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteWorkspace = () => {
    if (workspace.createdBy !== userId) return;

    setDialog({
      header: "Delete Workspace",
      message: `Are you sure you want to delete this workspace? Once You delete it you can't retrieve it. 
      All projects and tasks related with this workspace will be permanently deleted`,
      toDelete: true,
      onCancel: handleCloseDialog,
      onSuccess: deleteWorkspace,
    });
    setOpenDialog(true);
  };

  if (pageLoading)
    return (
      <div className="spinner">
        <Spinner />
      </div>
    );
  return (
    <>
      <div className="singleWorkspace" onClick={handleDropDownClose}>
        <SideBar />
        <div className="dashboard">
          <div className="innerdiv-dashboard">
            <div className="body">
              <div className="header">
                <div className="left">
                  <h2>{workspace?.title}&nbsp;&nbsp;</h2>
                  <p style={{ marginBlock: "1%" }}>{workspace?.description}</p>
                  <p style={{ fontWeight: "600" }}>
                    {workspace.type && getWorkspaceType(workspace.type)}
                  </p>
                </div>

                <div className="right">
                  <i
                    id="inviteIcon"
                    onClick={() => setDropDown("invite")}
                    className="fa-solid fa-paper-plane"
                  ></i>
                  {workspace.createdBy === userId && (
                    <Tooltip
                      placement="top"
                      trigger={["hover"]}
                      overlay={<span>Send Invitations</span>}
                    >
                      <button
                        className="inviteButton"
                        onClick={() => setDropDown("invite")}
                      >
                        + Invite Collaborators
                      </button>
                    </Tooltip>
                  )}
                  <i
                    onClick={() =>
                      dropDown === "delete"
                        ? setDropDown("")
                        : setDropDown("delete")
                    }
                    className="bi bi-three-dots-vertical"
                    id="menuIcon"
                  ></i>

                  {dropDown === "delete" && (
                    <div
                      className="dropdown-menu"
                      style={{ top: "100%", right: "0" }}
                    >
                      <div
                        onClick={handleEditWorkspace}
                        className={
                          workspace.createdBy !== userId
                            ? "dropdown-option disabled"
                            : "dropdown-option"
                        }
                      >
                        <p>Edit</p>
                      </div>
                      <div
                        onClick={handleDeleteWorkspace}
                        className={
                          workspace.createdBy !== userId
                            ? "dropdown-option disabled"
                            : "dropdown-option"
                        }
                      >
                        <p>Delete</p>
                      </div>
                    </div>
                  )}
                  {dropDown === "invite" && (
                    <div className="invitations">
                      <label>Invite Members</label>

                      {emails.length > 0 && (
                        <>
                          {emails.map((email) => (
                            <div key={email} className="recipients">
                              <p>{email}</p>
                              <strong
                                style={{
                                  fontSize: "larger",
                                  cursor: "pointer",
                                }}
                                onClick={() => handleRemoveEmail(email)}
                              >
                                &times;
                              </strong>
                            </div>
                          ))}
                        </>
                      )}

                      <div className="addEmail">
                        <input
                          onKeyDown={handleKeyDown}
                          onChange={(e) => setNewEmail(e.target.value)}
                          ref={inputRef}
                          placeholder="eg:john@gmail.com"
                          value={newEmail}
                          type="text"
                        />
                        <button
                          className="addButton"
                          onClick={(e) => handleAddEmail()}
                        >
                          Add
                        </button>
                      </div>

                      <button
                        className={loading ? "btn-disabled" : "sendInvitations"}
                        onClick={handleSendInvitations}
                      >
                        {loading ? "Sending..." : "SEND INVITATIONS"}
                      </button>
                      {loading && (
                        <BarLoader width={"100%"} color="var(--color-blue)" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="settings">
                <input
                  type="search"
                  placeholder="search..."
                  className="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <div>
                  <p
                    onClick={() =>
                      dropDown === "collaborators"
                        ? setDropDown("")
                        : setDropDown("collaborators")
                    }
                  >
                    <i
                      style={{ fontSize: "larger" }}
                      className="bi bi-people-fill"
                    ></i>
                    &nbsp; Workspace Collaborators &nbsp;
                    <i
                      style={{ fontSize: "small" }}
                      className={
                        dropDown === "collaborators"
                          ? "bi bi-chevron-up"
                          : "bi bi-chevron-down"
                      }
                    ></i>
                  </p>
                  <button
                    id="workspace-collaborators"
                    onClick={() =>
                      dropDown === "collaborators"
                        ? setDropDown("")
                        : setDropDown("collaborators")
                    }
                  >
                    <i className="bi bi-people-fill"></i>
                  </button>

                  {dropDown === "collaborators" && (
                    <ul className="collaboratorsList">
                      <input
                        style={{ width: "90%", marginBlock: "3%" }}
                        type="search"
                        placeholder="search..."
                        className="search"
                        value={search2}
                        onChange={(e) => setSearch2(e.target.value)}
                      />
                      {filteredCollaborators.map((member: any) => (
                        <li key={member?._id}>
                          <img
                            src={member?.avatar || "/images/avatar.jpg"}
                            alt="img"
                          />
                          {member?.username}
                          {member._id !== workspace.createdBy ? (
                            <strong
                              onClick={() =>
                                handleRemoveCollaborator(
                                  member.username
                                    ?.split(" ")
                                    .slice(0, 2)
                                    .join(" "),
                                  member?._id
                                )
                              }
                              onMouseLeave={handleMousLeave}
                              onMouseEnter={handleMouseEnter}
                              className={
                                workspace.createdBy !== userId
                                  ? "disabled"
                                  : "remove-collaborator-button"
                              }
                            >
                              remove
                            </strong>
                          ) : (
                            <strong className="workspace-admin">Admin</strong>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <p
                    onClick={() =>
                      dropDown === "invitations"
                        ? setDropDown("")
                        : setDropDown("invitations")
                    }
                  >
                    <i
                      style={{ fontSize: "larger" }}
                      className="bi bi-envelope-arrow-up-fill"
                    ></i>
                    &nbsp; &nbsp; Invitations Send &nbsp;
                    <i
                      style={{ fontSize: "small" }}
                      className={
                        dropDown === "invitations"
                          ? "bi bi-chevron-up"
                          : "bi bi-chevron-down"
                      }
                    ></i>
                  </p>
                  <button
                    id="invitations-send"
                    onClick={() =>
                      dropDown === "invitations"
                        ? setDropDown("")
                        : setDropDown("invitations")
                    }
                  >
                    <i className="bi bi-envelope-arrow-up-fill"></i>
                  </button>

                  {dropDown === "invitations" && (
                    <ul>
                      <input
                        style={{ width: "90%", marginBlock: "3%" }}
                        type="search"
                        placeholder="search..."
                        className="search"
                        value={search3}
                        onChange={(e) => setSearch3(e.target.value)}
                      />
                      {filteredInvitations.length > 0 ? (
                        filteredInvitations.map((invitation: any) => (
                          <li
                            key={invitation?._id}
                            style={{ paddingRight: "3%", paddingLeft: "5%" }}
                          >
                            {invitation?.email}
                            <strong
                              onMouseEnter={handleMouseEnter}
                              onMouseLeave={handleMousLeave}
                              onClick={() =>
                                handleCancelInvitation(invitation?._id)
                              }
                              className={
                                workspace.createdBy !== userId
                                  ? "disabled"
                                  : "cancel-invitation-button"
                              }
                            >
                              cancel
                            </strong>
                          </li>
                        ))
                      ) : (
                        <li style={{ paddingRight: "3%", paddingLeft: "5%" }}>
                          No invitations sent!
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>

              {!search ? (
                <>
                  {starredProjects.length > 0 && (
                    <div className="starred-projects">
                      <h5>STARRED PROJECTS</h5>
                      <div>
                        {starredProjects.map((project: any) => (
                          <Link
                            key={project?._id}
                            to={`/workspaces/${workspaceId}/projects/${project._id}`}
                            style={{ backgroundColor: project.theme }}
                          >
                            <i
                              onClick={(e) => starProject(e, project._id, 0)}
                              title="Remove from starred"
                              style={{
                                position: "absolute",
                                top: "1%",
                                left: "2%",
                                color: "yellow",
                              }}
                              className="bi bi-star-fill"
                              id="starIcon"
                            ></i>
                            {project.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="projects">
                    <h5>PROJECTS</h5>

                    <div>
                      <Tooltip
                        placement="top"
                        trigger={["hover"]}
                        overlay={<span>Add project</span>}
                      >
                        <Link
                          to="#"
                          className="addProjectButton"
                          onClick={(e) => handleAddProject(e)}
                          style={{ backgroundColor: "var(--color-tertiary" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <i
                              style={{ fontSize: "large", marginTop: "3%" }}
                              className="bi bi-plus-circle"
                            ></i>
                            &nbsp;&nbsp;
                            <span style={{ marginTop: "5px" }}>
                              New Project
                            </span>
                          </div>
                        </Link>
                      </Tooltip>

                      <Tooltip
                        placement="top"
                        trigger={["hover"]}
                        overlay={<span>Add project</span>}
                      >
                        <button
                          onClick={(e) => handleAddProject(e)}
                          id="add-project-btn"
                          className="btn-tertiary"
                        >
                          {" "}
                          + New Project
                        </button>
                      </Tooltip>

                      {dropDown === "addProject" && (
                        <>
                          <AddProject
                            setDropDown={setDropDown}
                            setProjects={setProjects}
                          />
                        </>
                      )}
                      {projects.map((project: any) => (
                        <Link
                          key={project?._id}
                          to={`/workspaces/${workspaceId}/projects/${project._id}`}
                          style={{ backgroundColor: project.theme }}
                        >
                          <i
                            onClick={(e) =>
                              starProject(
                                e,
                                project._id,
                                project.starred ? 0 : 1
                              )
                            }
                            title="Add to starred"
                            style={{
                              position: "absolute",
                              top: "1%",
                              left: "2%",
                              color: project.starred
                                ? "yellow"
                                : "var(--color-text-primary)",
                            }}
                            className={
                              project.starred ? "bi bi-star-fill" : "bi bi-star"
                            }
                            id="starIcon"
                          ></i>
                          {project.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="projects">
                  <h5>PROJECTS</h5>
                  {filteredProjects.length > 0 ? (
                    <div>
                      {filteredProjects.map((project: any) => (
                        <Link
                          key={project?._id}
                          to={`/workspaces/${workspaceId}/projects/${project._id}`}
                          style={{ backgroundColor: project.theme }}
                        >
                          <i
                            onClick={(e) =>
                              starProject(
                                e,
                                project._id,
                                project.starred ? 0 : 1
                              )
                            }
                            title={
                              project.starred
                                ? "Remove from starred"
                                : "Add to starred"
                            }
                            style={{
                              position: "absolute",
                              top: "1%",
                              left: "2%",
                              color: project.starred
                                ? "yellow"
                                : "var(--color-text-primary)",
                            }}
                            className={
                              project.starred ? "bi bi-star-fill" : "bi bi-star"
                            }
                            id="starIcon"
                          ></i>
                          {project.title}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p style={{ marginTop: "3%", fontSize: "smaller" }}>
                      No results found !
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {editWorkspaceModal && (
          <EditWorkspace
            id={workspace?._id}
            title={workspace?.title}
            type={workspace?.type}
            description={workspace?.description}
            setEditWorkspaceModal={setEditWorkspaceModal}
            setWorkspace={setWorkspace}
          />
        )}
      </div>
      {openDialog && (
        <Dialog
          header={dialog.header}
          message={dialog.message}
          toDelete={dialog.toDelete}
          onCancel={dialog.onCancel}
          onSuccess={dialog.onSuccess}
        />
      )}
    </>
  );
}

export default SingleWorkspace;
