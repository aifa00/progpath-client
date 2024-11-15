import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Profile.css";
import axios from "../../axiosConfig";
import { useDispatch } from "react-redux";
import { setAlert } from "../../redux/alertSlice";
import Otp from "../Otp/Otp";
import ChangePassword from "../ChangePassword/ChangePassword";
import AddProgram from "../AddProgram/AddProgram";
import { useNavigate } from "react-router-dom";
import { extractTextFromHtml } from "../../utils/appUtils";
import Dialog from "../../assets/Dialog";
import EditProgram from "../EditProgram/EditProgram";
import { BarLoader } from "react-spinners";
import {
  removeAvatarUrl,
  setAvatarUrl,
  setUsername,
} from "../../redux/userSlice";
import Tooltip from "rc-tooltip";
import Spinner from "../../assets/Spinner";

interface ProgramsType {
  _id: "";
  title: "";
  description: "";
  image: "";
  status: string;
}

function Profile() {
  const [Loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [editImage, setEditImage] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [otpForm, setOtpForm] = useState(false);
  const [sort, setSort] = useState("");
  const [order, setOrder] = useState("");
  const [search, setSearch] = useState("");
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    password: "",
    avatar: "",
  });
  const [programs, setPrograms] = useState<ProgramsType[] | []>([]);
  const [membership, setMembership] = useState<{
    planTitle: string;
    endDate: string;
  } | null>(null);
  const [addProgramForm, setAddProgramForm] = useState(false);
  const [editForm, setEditForm] = useState(false);
  const [programIdToEdit, setProgramIdToEdit] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [sortDropdown, setSortDropdown] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    header: "",
    message: "",
    toDelete: false,
    onCancel: () => {},
    onSuccess: () => {},
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const usernameRef: any = useRef(null);
  const emailRef: any = useRef(null);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data } = await axios.get(`/profile`);
        if (data.success) {
          setProfile(data.profile);
          setMembership(data.membership);
        }
      } catch (error) {
        console.log(error);
      }
    };

    getProfile();
  }, []);

  useEffect(() => {
    const getPrograms = async () => {
      try {
        const { data } = await axios.get(`/profile/programs`, {
          params: {
            sort,
            order,
          },
        });
        if (data.success) {
          setPrograms(data.programs);
        }
      } catch (error) {
        console.log(error);
      }
    };

    getPrograms();
  }, [sort, order]);

  useEffect(() => {
    if (usernameRef.current) {
      usernameRef.current.value = profile.username;
      usernameRef.current.focus();
    }

    if (emailRef.current) {
      emailRef.current.value = profile.email;
    }
  }, [editProfile]);

  const handleDeleteProgram = async (e: any, programId: string) => {
    e.stopPropagation();
    setDeleteDialog({
      header: "Delete Upload ?",
      message: "Are you sure you want to delete this program?",
      toDelete: true,
      onCancel: () => {
        setOpenDialog(false);
      },
      onSuccess: async () => {
        try {
          setActiveDropdown(null);
          setOpenDialog(false);

          setPrograms((prevPrograms: any) =>
            [...prevPrograms].filter((p) => p._id !== programId)
          );

          const { data } = await axios.delete(`/marketplace/${programId}`);

          if (data.success) {
            dispatch(
              setAlert({ message: "Delete was succesful", type: "success" })
            );
          }
        } catch (error) {
          setPrograms([...programs]);
          console.log(error);
        }
      },
    });
    setOpenDialog(true);
  };

  const openProgram = (programId: string) => {
    navigate(`/marketplace/${programId}`);
  };

  const filteredPrograms = useMemo(
    () =>
      [...programs].filter((p) =>
        p.title?.toLowerCase()?.includes(search?.toLowerCase())
      ),
    [programs, search]
  );

  const toggleDropdown = (e: React.MouseEvent<HTMLElement>, index: number) => {
    e.stopPropagation(); //to donot trigger navigation to single program page
    if (sortDropdown) setSortDropdown(false);
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  const toggleSortDropdown = (e: any) => {
    e.stopPropagation();
    setActiveDropdown(null);
    setSortDropdown(!sortDropdown);
  };

  let getStatusColor = (status: string) => {
    if (status === "accepted") return "var(--color-success)";
    if (status === "rejected") return "var(--color-error)";
    if (status === "pending") return "var(--color-warning)";
  };

  const handleSort = (opt: string) => {
    const [optionToSort, orderToSort] = opt.split("-");

    if (sort === optionToSort && order === orderToSort) {
      setSort("");
      setOrder("");
      return;
    }

    setSort(optionToSort);
    setOrder(orderToSort);
  };

  const handleUpdateProfile = async () => {
    try {
      const username = usernameRef.current.value?.trim();
      const email = emailRef.current.value?.trim();

      if (!username && !email) {
        return dispatch(
          setAlert({
            message: "Enter username and email!",
            type: "error",
          })
        );
      }
      if (!username) {
        return dispatch(
          setAlert({ message: "Enter a username!", type: "error" })
        );
      }
      if (!email) {
        return dispatch(setAlert({ message: "Enter email!", type: "error" }));
      }

      if (Loading) return;

      setLoading(true);

      const { data } = await axios.patch(`/profile`, {
        newUsername: username,
        newEmail: email,
      });

      if (data.success) {
        setProfile({
          ...profile,
          username,
        });

        dispatch(setUsername(username));

        if (data.updateEmail) {
          return setOtpForm(true);
        }
        setEditProfile(false);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const onOtpSuccess = async () => {
    setOtpForm(false);
    dispatch(
      setAlert({ message: "Email verified and updated", type: "success" })
    );
    try {
      const email = emailRef.current.value;
      const { data } = await axios.post(`/profile/email`, {
        email: email.trim(),
      });

      if (data.success) {
        setProfile({
          ...profile,
          email,
        });
        setEditProfile(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const openAddProgramForm = () => {
    document.body.classList.add("modal-open");
    setAddProgramForm(true);
  };

  const openEditForm = (e: any, programId: string) => {
    e.stopPropagation();
    setProgramIdToEdit(programId);
    setActiveDropdown(null);
    document.body.classList.add("modal-open");
    setEditForm(true);
  };

  const uploadProfileImage = async (e: any) => {
    try {
      setEditImage(false);

      const image = e.target.files[0];

      if (!image) return;

      const formData = new FormData();

      formData.append("image", image);

      if (imageLoading) return;

      setImageLoading(true);

      const { data } = await axios.post("/profile/image", formData);

      if (data.success) {
        const imageUrl = data.imageUrl;
        setProfile({
          ...profile,
          avatar: imageUrl,
        });
        dispatch(setAvatarUrl(imageUrl));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setImageLoading(false);
    }
  };

  const deleteProfileImage = async (e: any) => {
    try {
      setEditImage(false);

      if (!profile.avatar) return;

      if (imageLoading) return;

      setImageLoading(true);

      const { data } = await axios.delete("/profile/image");

      if (data.success) {
        setProfile({
          ...profile,
          avatar: "",
        });
        dispatch(removeAvatarUrl());
      }
    } catch (error) {
      console.log(error);
    } finally {
      setImageLoading(false);
    }
  };

  const handleOuterClick = () => {
    if (editImage) setEditImage(false);
  };

  return (
    <>
      <div className="profile" onClick={handleOuterClick}>
        <div className="card">
          <header>
            <h4>PROFILE</h4>
            {membership && (
              <strong>
                Premium &nbsp;<i className="bi bi-check-circle"></i>
              </strong>
            )}
          </header>
          <div className="body">
            <div className="profileImage">
              {imageLoading && (
                <div className="spinner">
                  <Spinner />
                </div>
              )}
              <img
                src={
                  profile?.avatar ? profile.avatar.trim() : "/images/avatar.jpg"
                }
                alt="profile"
              />
              <button onClick={() => setEditImage(!editImage)}>
                <i className="bi bi-pencil-fill"></i>&nbsp; Edit
              </button>

              {editImage && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="dropdown-menu"
                  style={{ top: "13.5rem", right: "-8rem" }}
                >
                  <div className="dropdown-option">
                    <label
                      style={{
                        width: "100%",
                      }}
                    >
                      {profile?.avatar ? "Change Image" : "Upload Profile"}
                      <input
                        onChange={uploadProfileImage}
                        accept="image/*"
                        type="file"
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>
                  {profile?.avatar && (
                    <div
                      onClick={deleteProfileImage}
                      className="dropdown-option"
                    >
                      <p>Remove Image</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="profileData">
              {!editProfile && (
                <i
                  style={{ position: "absolute", right: "5px", top: "5px" }}
                  className="bi bi-pencil-square"
                  onClick={() => setEditProfile(!editProfile)}
                ></i>
              )}

              {editProfile ? (
                <>
                  <input ref={usernameRef} type="text" placeholder="username" />
                </>
              ) : (
                <>
                  <h3>{profile.username}</h3>
                  <br />
                </>
              )}

              {editProfile ? (
                <input ref={emailRef} type="text" placeholder="email" />
              ) : (
                <>
                  <h4>{profile.email}</h4>
                  <br />
                </>
              )}
              {editProfile && (
                <div className="editProfileActionButtons">
                  <button onClick={() => setEditProfile(false)}>Cancel</button>
                  <button onClick={handleUpdateProfile}>Save</button>
                </div>
              )}

              {!editProfile && profile.password && (
                <p onClick={() => setChangePassword(true)}>Change password</p>
              )}

              {Loading && (
                <BarLoader width={"100%"} color="var(--color-blue)" />
              )}
            </div>
          </div>
          <footer>
            {membership && (
              <p>
                Your premium membership with{" "}
                <strong>{membership.planTitle}</strong> is valid upto{" "}
                <strong>
                  {new Date(membership.endDate).toLocaleDateString("en-GB")}
                </strong>
              </p>
            )}
          </footer>
        </div>
      </div>
      <div
        className="marketplace-uploads"
        onClick={() => {
          setSortDropdown(false);
          setActiveDropdown(null);
        }}
      >
        <div className="upper">
          <div className="left">
            <h4>MARKETPLACE UPLOADS</h4>
          </div>

          <div className="right">
            <input
              className="search"
              placeholder="search..."
              type="search"
              onChange={(e) => setSearch(e.target.value)}
            />
            <span onClick={toggleSortDropdown}>
              Sort &nbsp; <i className="bi bi-sort-down-alt"></i>
            </span>
            {sortDropdown && (
              <div
                className="dropdown-menu"
                style={{ top: "2.5rem", right: "4.5rem" }}
              >
                <div
                  className="dropdown-option"
                  onClick={() => handleSort("title-asce")}
                >
                  <p>
                    Title &nbsp; <i className="bi bi-sort-alpha-down"></i>
                  </p>
                  {sort === "title" && order === "asce" && (
                    <span>
                      <i className="fa-solid fa-check"></i>
                    </span>
                  )}
                </div>
                <div
                  className="dropdown-option"
                  onClick={() => handleSort("title-desc")}
                >
                  <p>
                    Title &nbsp; <i className="bi bi-sort-alpha-down-alt"></i>
                  </p>
                  {sort === "title" && order === "desc" && (
                    <span>
                      <i className="fa-solid fa-check"></i>
                    </span>
                  )}
                </div>
                <div
                  className="dropdown-option"
                  onClick={() => handleSort("timestamp-asce")}
                >
                  <p>
                    Date Uploaded &nbsp;{" "}
                    <i className="bi bi-sort-numeric-up"></i>
                  </p>
                  {sort === "timestamp" && order === "asce" && (
                    <span>
                      <i className="fa-solid fa-check"></i>
                    </span>
                  )}
                </div>
                <div
                  className="dropdown-option"
                  onClick={() => handleSort("timestamp-desc")}
                >
                  <p>
                    Date Uploaded &nbsp;{" "}
                    <i className="bi bi-sort-numeric-down-alt"></i>
                  </p>
                  {sort === "timestamp" && order === "desc" && (
                    <span>
                      <i className="fa-solid fa-check"></i>
                    </span>
                  )}
                </div>
              </div>
            )}
            {membership && (
              <Tooltip
                placement="bottom"
                trigger={["hover"]}
                overlay={<span>Upload a program</span>}
              >
                <button onClick={openAddProgramForm} className="btn-primary">
                  + Upload Program
                </button>
              </Tooltip>
            )}
          </div>
        </div>
        <div className="lower">
          {programs.length > 0 ? (
            filteredPrograms.length > 0 ? (
              filteredPrograms.map((program, index) => (
                <div
                  key={program._id}
                  onClick={() => openProgram(program._id)}
                  className="post-card"
                >
                  <strong style={{ color: getStatusColor(program.status) }}>
                    {program.status}
                  </strong>
                  <div className="post-image">
                    <img
                      src={
                        program.image
                          ? program.image
                          : "/images/image-placeholder.jpg"
                      }
                      alt="img"
                    />
                  </div>
                  <div className="post-content">
                    <h5>{program.title}</h5>
                    <p>{extractTextFromHtml(program.description)}</p>
                  </div>
                  <i
                    onClick={(e) => toggleDropdown(e, index)}
                    className="fa-solid fa-ellipsis-vertical"
                  ></i>
                  {activeDropdown === index && (
                    <div
                      className="dropdown-menu"
                      style={{ top: "30px", right: "10px" }}
                    >
                      <div
                        onClick={(e) => openEditForm(e, program._id)}
                        className="dropdown-option"
                      >
                        <p>Edit</p>
                      </div>
                      <div
                        className="dropdown-option"
                        onClick={(e) => handleDeleteProgram(e, program._id)}
                      >
                        <p>Delete</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p style={{ color: "var(--color-text-secondary)" }}>
                No results found !
              </p>
            )
          ) : (
            <p style={{ color: "var(--color-text-secondary)" }}>
              No uploaded programs
              <span>
                {!membership && ". Subscibe to premium to upload yours!"}
              </span>
            </p>
          )}
        </div>
      </div>
      {changePassword && (
        <ChangePassword setChangePassword={setChangePassword} />
      )}
      {addProgramForm && (
        <AddProgram
          setAddProgramForm={setAddProgramForm}
          setPrograms={setPrograms}
        />
      )}
      {editForm && (
        <EditProgram
          programId={programIdToEdit}
          setEditForm={setEditForm}
          setPrograms={setPrograms}
        />
      )}
      {openDialog && (
        <Dialog
          header={deleteDialog.header}
          message={deleteDialog.message}
          toDelete={deleteDialog.toDelete}
          onCancel={deleteDialog.onCancel}
          onSuccess={deleteDialog.onSuccess}
        />
      )}
      {otpForm && (
        <Otp
          setOtpForm={setOtpForm}
          onSuccess={onOtpSuccess}
          email={emailRef?.current?.value?.trim() || ""}
        />
      )}
    </>
  );
}

export default Profile;
