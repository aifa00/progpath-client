import "./Workspace.css";
import SideBar from "../SideBar/SideBar";
import { useEffect, useRef, useState, useMemo } from "react";
import axios from "../../axiosConfig";
import { useDispatch } from "react-redux";
import { setAlert } from "../../redux/alertSlice";
import { useNavigate } from "react-router-dom";
import { getRole } from "../../utils/jwtUtils";
import { togglePremiumComponent } from "../../redux/premiumSlice";
import { BarLoader } from "react-spinners";
import Tooltip from "rc-tooltip";

interface Workspace {
  title: string;
  type: string;
  description: string;
  email: string[];
}

interface State {
  workspaces: {}[];
  invitations: {}[];
}

function Workspace() {
  const [loading, setLoading] = useState(false);
  const [role] = useState(getRole());
  const [search, setSearch] = useState("");
  const [dropDown, setDropdown] = useState(false);
  const [addEmail, setAddEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [result, setResult] = useState<State>({
    workspaces: [],
    invitations: [],
  });
  const [addWorkspace, setAddworkspace] = useState<Workspace>({
    title: "",
    type: "",
    description: "",
    email: [],
  });
  const [notificationsDropdown, setNotificationsDropdown] =
    useState<boolean>(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const inputRef: any = useRef();

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth >= 300 && screenWidth <= 1000) {
        setNotificationsDropdown(false);
      } else {
        setNotificationsDropdown(true);
      }
    };

    // Set initial class name based on current screen size
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getWorkspace = async () => {
    try {
      const res = await axios.get(`/workspaces`);

      if (res.data.success) {
        setResult({ ...res.data.result });
      }
    } catch (error: any) {
      console.log(error);
    }
  };
  useEffect(() => {
    getWorkspace();
  }, []);

  const handleAddEmail = () => {
    if (newEmail !== "") {
      if (addWorkspace.email.includes(newEmail)) return;

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail))
        return dispatch(
          setAlert({ message: "Provide a valid email !", type: "error" })
        );

      setAddworkspace((prevWorkspace) => ({
        ...prevWorkspace,
        email: [...prevWorkspace.email, newEmail.trim()],
      }));
      setNewEmail("");
      inputRef.current.focus();
    } else {
      inputRef.current.focus();
    }
  };

  const handleRemoveEmail = (email: string) => {
    setAddworkspace((prevWorkspace) => ({
      ...prevWorkspace,
      email: [...prevWorkspace.email].filter((elem) => {
        if (email !== elem) {
          return elem;
        }
      }),
    }));
  };

  const handleClose = () => {
    setAddworkspace({
      title: "",
      type: "",
      description: "",
      email: [],
    });
    setDropdown(false);
    setAddEmail(false);
    setNewEmail("");
  };

  const handleAddWorkspace = async () => {
    try {
      if (!addWorkspace.title || !addWorkspace.type) return;

      setLoading(true);

      const res = await axios.post(`/workspaces`, {
        title: addWorkspace.title.trim(),
        type: addWorkspace.type,
        description: addWorkspace.description.trim(),
        emails: addWorkspace.email,
      });

      if (res.data.success) {
        handleClose();

        setResult((prevState) => ({
          ...prevState,
          workspaces: [...prevState.workspaces, res.data.workspace],
        }));

        if (addWorkspace.email.length > 0) {
          dispatch(
            setAlert({
              message: "Invitations Sent Successfully !",
              type: "success",
            })
          );
        }
      }
    } catch (error: any) {
      if (!error.response.data.isPremiumUser) {
        dispatch(togglePremiumComponent());
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInvitationAction = async (
    workspaceId: string,
    invitationId: string,
    action: string
  ) => {
    try {
      const res = await axios.post("/workspaces/invitations/action", {
        workspaceId,
        invitationId,
        action,
      });

      if (res.data.success) {
        getWorkspace();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const openWorkspace = (workspaceId: string) => {
    navigate(`/workspaces/${workspaceId}`);
  };

  const handleEmailKeyDown = (e: any) => {
    if (e.key === "Enter") {
      handleAddEmail();
    }
  };

  const filteredWorksapces = useMemo(
    () =>
      result.workspaces.filter((workspace: any) =>
        workspace?.title?.toLowerCase().includes(search.toLowerCase())
      ),
    [result.workspaces, search]
  );

  return (
    <div className="workspace" onClick={handleClose}>
      <SideBar />
      <div className="dashboard">
        <div className="innerdiv-dashboard">
          <div className="search-div">
            <input
              type="search"
              onChange={(e) => setSearch(e.target.value)}
              className="search"
              placeholder="search ..."
            />
            <i
              onClick={() => setNotificationsDropdown(!notificationsDropdown)}
              id="bell-icon"
              className="fa-solid fa-bell"
            ></i>
          </div>

          {role === "teamlead" && (
            <div className="workspace-wrapper">
              <Tooltip
                placement="bottom"
                trigger={["hover"]}
                overlay={<span>Add workspace</span>}
              >
                <button
                  className="btn-primary "
                  id="add-workspace-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdown(!dropDown);
                  }}
                >
                  + Add New Workspace
                </button>
              </Tooltip>

              {dropDown && (
                <div
                  className="add-workspace"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="input-group">
                    <label htmlFor="title">Title</label>
                    <input
                      value={addWorkspace.title}
                      type="text"
                      id="title"
                      onChange={(e) =>
                        setAddworkspace({
                          ...addWorkspace,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="type">Type</label>
                    <select
                      id="type"
                      onChange={(e) =>
                        setAddworkspace({
                          ...addWorkspace,
                          type: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Type</option>
                      <option value="engineering">Engineering IT</option>
                      <option value="business">Business</option>
                      <option value="sales">Sales</option>
                      <option value="project">Project Management</option>
                      <option value="education">Education</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label htmlFor="description">Description</label> <br />
                    <textarea
                      value={addWorkspace.description}
                      id="description"
                      rows={3}
                      onChange={(e) =>
                        setAddworkspace({
                          ...addWorkspace,
                          description: e.target.value,
                        })
                      }
                    ></textarea>
                  </div>

                  <div className="invite-members">
                    <label>Invite Members</label>

                    {addWorkspace.email.length > 0 && (
                      <>
                        {addWorkspace.email.map((email) => (
                          <div key={email} className="recipients">
                            <p>{email}</p>
                            <strong onClick={() => handleRemoveEmail(email)}>
                              &times;
                            </strong>
                          </div>
                        ))}
                      </>
                    )}

                    <div className="add-recipients">
                      {addEmail ? (
                        <>
                          <input
                            ref={inputRef}
                            placeholder="eg:john@gmail.com"
                            value={newEmail}
                            type="text"
                            onKeyDown={handleEmailKeyDown}
                            onChange={(e) => setNewEmail(e.target.value)}
                          />
                          <button
                            className="btn-secondary"
                            onClick={handleAddEmail}
                          >
                            Add
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn-secondary"
                            onClick={() => setAddEmail(!addEmail)}
                          >
                            Add
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    className={
                      !addWorkspace.title || !addWorkspace.type || loading
                        ? "btn-disabled"
                        : "btn-primary"
                    }
                    onClick={handleAddWorkspace}
                  >
                    ADD WORKSPACE
                  </button>
                  {loading && (
                    <BarLoader width={"100%"} color={"var(--color-blue)"} />
                  )}
                </div>
              )}
            </div>
          )}

          <div className="contents">
            <div className="workspaces">
              <h5>WORKSPACES</h5>

              <ul>
                {search ? (
                  filteredWorksapces.length > 0 ? (
                    filteredWorksapces.map((workspace: any) => {
                      return (
                        <li
                          key={workspace._id}
                          onClick={() => openWorkspace(workspace._id)}
                        >
                          {workspace.title}
                        </li>
                      );
                    })
                  ) : (
                    <p style={{ fontSize: "smaller" }}>No Results found!</p>
                  )
                ) : result.workspaces.length > 0 ? (
                  result.workspaces.map((workspace: any) => {
                    return (
                      <li
                        key={workspace._id}
                        onClick={() => openWorkspace(workspace._id)}
                      >
                        {workspace.title}
                      </li>
                    );
                  })
                ) : role === "teamlead" ? (
                  <p style={{ color: "gray" }}>
                    Create a workspace to start collaborating
                  </p>
                ) : (
                  <p style={{ color: "gray" }}>
                    Join a workspace to start collaborating
                  </p>
                )}
              </ul>
            </div>

            <div
              className={
                notificationsDropdown ? "invitations" : "hide-invitations"
              }
            >
              <h5>INVITATIONS</h5>
              {result.invitations.length > 0 ? (
                <>
                  {result.invitations.map((invitation: any) => {
                    return (
                      <div
                        key={invitation.invitations._id}
                        className="notifications"
                      >
                        <span className="date">
                          {new Date(
                            invitation.invitations.timestamp
                          ).toLocaleDateString("en-GB")}
                        </span>
                        <p>
                          {invitation.workspaceAdmin} has sent you an invitation
                          to join workspace '{invitation.title}'
                        </p>
                        <div className="options">
                          <button
                            className="reject-button"
                            onClick={() =>
                              handleInvitationAction(
                                invitation._id,
                                invitation.invitations._id,
                                "rejected"
                              )
                            }
                          >
                            Reject
                          </button>
                          <button
                            className="accept-button"
                            onClick={() =>
                              handleInvitationAction(
                                invitation._id,
                                invitation.invitations._id,
                                "accepted"
                              )
                            }
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <p style={{ fontSize: "smaller", paddingTop: "5%" }}>
                  No invitations yet!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Workspace;
