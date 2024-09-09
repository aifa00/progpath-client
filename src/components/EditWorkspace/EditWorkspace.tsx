import "./EditWorkspace.css";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import axios from "../../axiosConfig";
import { useParams } from "react-router-dom";
import { setAlert } from "../../redux/alertSlice";
import { BarLoader } from "react-spinners";

interface editWorkspaceProps {
  id: string;
  title: string;
  type: string;
  description: string;
  setEditWorkspaceModal: React.Dispatch<React.SetStateAction<boolean>>;
  setWorkspace: React.Dispatch<React.SetStateAction<{}>>;
}

const EditWorkspace: React.FC<editWorkspaceProps> = ({
  title,
  type,
  description,
  setEditWorkspaceModal,
  setWorkspace,
}) => {
  const [loading, setLoading] = useState(false);
  const [datas, setDatas] = useState({
    title,
    type,
    description,
  });

  const { workspaceId } = useParams();
  const dispatch = useDispatch();

  const handleClose = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setEditWorkspaceModal(false);
  };

  const handleSubmit = async () => {
    try {
      if (!datas.title || !datas.type) return;

      if (loading) return;

      setLoading(true);

      const { data } = await axios.patch(`/workspaces/${workspaceId}`, {
        title: datas?.title?.trim(),
        type: datas?.type,
        description: datas?.description?.trim(),
      });

      if (data.success) {
        setEditWorkspaceModal(false);

        setWorkspace((prevDatas) => ({
          ...prevDatas,
          title: datas.title,
          type: datas.type,
          description: datas.description,
        }));
        dispatch(
          setAlert({
            message: "Workspace updated successfully !",
            type: "success",
          })
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(true);
    }
  };

  return (
    <div className="dialog-overlay">
      <i onClick={handleClose} className="bi bi-x-lg close-button"></i>
      <div className="editWorkspace">
        <div className="input-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={datas.title}
            onChange={(e) => setDatas({ ...datas, title: e.target.value })}
          />
        </div>

        <div className="input-group">
          <label htmlFor="type">Type</label>
          <select
            id="type"
            value={datas.type}
            onChange={(e) => setDatas({ ...datas, type: e.target.value })}
          >
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
            id="description"
            rows={3}
            value={datas.description}
            onChange={(e) =>
              setDatas({ ...datas, description: e.target.value })
            }
          ></textarea>
        </div>

        <button
          className={
            !datas.title || !datas.type || loading
              ? "btn-disabled"
              : "btn-primary"
          }
          onClick={handleSubmit}
          style={{ marginTop: "5%", marginBottom: "10px" }}
        >
          UPDATE
        </button>
        {loading && <BarLoader width={"100%"} color="var(--color-blue)" />}
      </div>
    </div>
  );
};

export default EditWorkspace;
