import React, { useState } from "react";
import "./AddProgram.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useDispatch } from "react-redux";
import { notify } from "../../redux/notifySlice";
import axios from "../../axiosConfig";
import { BarLoader } from "react-spinners";
import {
  descriptionModules,
  featureModules,
  highlightModules,
  basicModules,
} from "../../constants/constants";
import GeminiPrompt from "../GeminiPrompt/GeminiPrompt";

interface AddProgramProps {
  setAddProgramForm: React.Dispatch<React.SetStateAction<boolean>>;
  setPrograms: any;
}

const AddProgram: React.FC<AddProgramProps> = ({
  setAddProgramForm,
  setPrograms,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [imageOne, setImageOne] = useState<Blob | null>(null);
  const [imageTwo, setImageTwo] = useState<Blob | null>(null);
  const [imageThree, setImageThree] = useState<Blob | null>(null);
  const [title, setTitle] = useState<string>("");
  const [languages, setLanguages] = useState<string>("");
  const [frameworks, setFrameworks] = useState<string>("");
  const [technologies, setTechnologies] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [features, setFeatures] = useState<string>("");
  const [highlights, setHighlights] = useState<string>("");
  const [collaborators, setCollaborators] = useState<string>("");
  const [contact, setContact] = useState<string>("");

  const [titleError, setTitleError] = useState<string>("");
  const [descriptionError, setDescriptionError] = useState<string>("");
  const [featuresError, setFeaturesError] = useState<string>("");
  const [languagesError, setLanguagesError] = useState<string>("");
  const dispatch = useDispatch();

  const handleUploadProgram = async () => {
    try {
      let hasError = false;

      if (!imageOne && !imageTwo && !imageThree) {
        dispatch(
          notify({
            message: `Provide at least one image to continue`,
            type: "error",
          })
        );
        hasError = true;
      }

      if (!title) {
        setTitleError("This field is required");
        hasError = true;
      } else if (title.length > 100) {
        setTitleError("Title can't be more than 100 characters long");
        hasError = true;
      } else {
        setTitleError("");
      }

      if (!description || description === "<p><br></p>") {
        setDescriptionError("This field is required");
        hasError = true;
      } else if (description.length > 2000) {
        setDescriptionError("Description exceeds the maximum length");
        hasError = true;
      } else {
        setDescriptionError("");
      }

      if (!features || features === "<p><br></p>") {
        setFeaturesError("This field is required");
        hasError = true;
      } else if (features.length > 2000) {
        setFeaturesError("Features exceeds the maximum length");
        hasError = true;
      } else {
        setFeaturesError("");
      }

      if (!languages) {
        setLanguagesError("This field is required");
        hasError = true;
      } else {
        setLanguagesError("");
      }

      if (hasError) return;

      //handle request to backend
      const formData = new FormData();

      if (imageOne) formData.append(`images`, imageOne as Blob);
      if (imageTwo) formData.append(`images`, imageTwo as Blob);
      if (imageThree) formData.append(`images`, imageThree as Blob);
      formData.append(`title`, title?.trim());
      formData.append(`description`, description);
      formData.append(`features`, features);
      formData.append(`languages`, languages?.trim());
      formData.append(`frameworks`, frameworks?.trim());
      formData.append(`technologies`, technologies?.trim());
      formData.append(`highlights`, highlights);
      formData.append(`collaborators`, collaborators);
      formData.append(`contact`, contact);

      if (loading) return;

      setLoading(true);

      const { data } = await axios.post(`/marketplace`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.success) {
        handleCloseForm();
        dispatch(
          notify({
            message:
              "Program added successfully! Your program is currently in pending stage, will be published to the marketplace after admin approval",
            type: "success",
          })
        );
        if (setPrograms) {
          setPrograms((prevPrograms: any) => [data.program, ...prevPrograms]);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImage = e.target.files[0];

      if (e.target.id === "image-one") {
        setImageOne(newImage);
      } else if (e.target.id === "image-two") {
        setImageTwo(newImage);
      } else if (e.target.id === "image-three") {
        setImageThree(newImage);
      }
    }
  };

  const handleRemoveImage = (
    e: React.MouseEvent<HTMLElement>,
    imageNum: number
  ) => {
    e.preventDefault();
    if (imageNum === 1) {
      setImageOne(null);
    } else if (imageNum === 2) {
      setImageTwo(null);
    } else if (imageNum === 3) {
      setImageThree(null);
    }
  };

  const handleCloseForm = () => {
    document.body.classList.remove("modal-open");
    setAddProgramForm(false);
  };

  return (
    <div className="form-overlay">
      <div
        className="addprogram-form"
        style={{
          border:
            (titleError ||
              descriptionError ||
              featuresError ||
              languagesError) &&
            "1px solid var(--color-error)",
        }}
      >
        <i
          onClick={handleCloseForm}
          className="fa-solid fa-x fa-lg"
          style={{ position: "absolute", top: "1.5rem", right: "1rem" }}
        ></i>
        <br /> <h5>UPLOAD IMAGES *</h5> <br />
        <div className="image-group">
          <label htmlFor="image-one">
            <img
              src={
                imageOne
                  ? URL.createObjectURL(imageOne)
                  : "/images/image-placeholder.jpg"
              }
              alt="img-1"
            />
            <input
              onChange={handleAddImage}
              id="image-one"
              accept="image/*"
              type="file"
            />
            {imageOne && (
              <i
                onClick={(e) => handleRemoveImage(e, 1)}
                className="fa-regular fa-x fa-lg"
              ></i>
            )}
          </label>
          <label htmlFor="image-two">
            <img
              src={
                imageTwo
                  ? URL.createObjectURL(imageTwo)
                  : "/images/image-placeholder.jpg"
              }
              alt="img-2"
            />
            <input
              onChange={handleAddImage}
              id="image-two"
              accept="image/*"
              type="file"
            />
            {imageTwo && (
              <i
                onClick={(e) => handleRemoveImage(e, 2)}
                className="fa-regular fa-x fa-lg"
              ></i>
            )}
          </label>
          <label htmlFor="image-three">
            <img
              src={
                imageThree
                  ? URL.createObjectURL(imageThree)
                  : "/images/image-placeholder.jpg"
              }
              alt="img-3"
            />
            <input
              onChange={handleAddImage}
              id="image-three"
              accept="image/*"
              type="file"
            />
            {imageThree && (
              <i
                onClick={(e) => handleRemoveImage(e, 3)}
                className="fa-regular fa-x fa-lg"
              ></i>
            )}
          </label>
        </div>
        <div className="input-group">
          <label htmlFor="title">TITLE*</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            id="title"
            type="text"
            placeholder="Enter the title of your project"
          />
          {titleError && <span className="error">{titleError}</span>}
        </div>
        <div className="input-group">
          <label htmlFor="description">DESCRIPTION*</label>
          <ReactQuill
            theme="snow"
            value={description}
            id="description"
            modules={descriptionModules}
            onChange={setDescription}
            placeholder="Provide a brief overview of what your project does and its main purpose"
            className="custom-quill-editor"
          />
          <GeminiPrompt setResult={setDescription} />
          {descriptionError && (
            <span className="error">{descriptionError}</span>
          )}
        </div>
        <div className="input-group">
          <label htmlFor="features">FEATURES*</label>
          <ReactQuill
            theme="snow"
            value={features}
            id="features"
            modules={featureModules}
            onChange={setFeatures}
            className="custom-quill-editor"
            placeholder="eg: Easy CSV Upload: Drag-and-drop interface for uploading CSV files.
                Multiple Graph Types: Line, bar, pie, and scatter plots."
          />
          <GeminiPrompt setResult={setFeatures} />
          {featuresError && <span className="error">{featuresError}</span>}
        </div>
        <div className="input-group">
          <label htmlFor="title">LANGUAGES*</label>
          <input
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
            id="languages"
            type="text"
            placeholder="Enter the languages used in project/program (e.g., Python, JavaScript, C++, Java, PHP)"
          />
          {languagesError && <span className="error">{languagesError}</span>}
        </div>
        <div className="input-group">
          <label htmlFor="title">FRAMEWORKS</label>
          <input
            value={frameworks}
            onChange={(e) => setFrameworks(e.target.value)}
            id="frameworks"
            type="text"
            placeholder="Enter the languages used in your project/program (e.g., React, Angular, Express, Django)"
          />
        </div>
        <div className="input-group">
          <label htmlFor="title">TECHNOLOGIES</label>
          <input
            value={technologies}
            onChange={(e) => setTechnologies(e.target.value)}
            id="frameworks"
            type="text"
            placeholder="Enter the technologies used in your project/program (e.g., Docker, AWS, Azure, Webpack)"
          />
        </div>
        <div className="input-group">
          <label htmlFor="highlights">HIGHLIGHTS</label>
          <ReactQuill
            theme="snow"
            value={highlights}
            id="highlights"
            modules={highlightModules}
            onChange={setHighlights}
            className="custom-quill-editor"
            placeholder="eg: User-Friendly Interface: Intuitive design for effortless graph creation."
          />
          <GeminiPrompt setResult={setHighlights} />
        </div>
        <div className="input-group">
          <label htmlFor="highlights">COLLABORATORS</label>
          <ReactQuill
            theme="snow"
            value={collaborators}
            id="highlights"
            modules={basicModules}
            onChange={setCollaborators}
            className="custom-quill-editor"
            placeholder="Provide details about collaborators or team members who contributed to the project (e.g., names, roles, contributions)"
          />
          <GeminiPrompt setResult={setCollaborators} />
        </div>
        <div className="input-group">
          <label htmlFor="highlights">CONTACT INFORMATIONS</label>
          <ReactQuill
            theme="snow"
            value={contact}
            id="highlights"
            modules={basicModules}
            onChange={setContact}
            className="custom-quill-editor"
            placeholder="Enter contact details such as email, phone number, LinkedIn, GitHub, or other relevant links. You can also include the company address or any other contact information"
          />
          <GeminiPrompt setResult={setContact} />
        </div>
        <button
          onClick={handleUploadProgram}
          id="submit-button"
          className="btn-primary"
        >
          UPLOAD
        </button>
        {loading && <BarLoader width={"100%"} color="var(--color-blue)" />}
      </div>
    </div>
  );
};

export default AddProgram;
