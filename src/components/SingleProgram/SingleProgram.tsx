import { useEffect, useState } from "react";
import "./SingleProgram.css";
import axios from "../../axiosConfig";
import { useParams } from "react-router-dom";
import CarouselComponent from "../Carousel/Carousel";
import CommentBox from "../CommentBox/CommentBox";
import { MoonLoader, RiseLoader } from "react-spinners";
import {
  convertMarkDownToHtml,
  formatNumber,
  setContentToSummarize,
} from "../../utils/appUtils";
import ChatBox from "../ChatBox/ChatBox";

interface ProgramType {
  _id: string;
  userId: {
    _id: string;
    username: string;
    avatar: string;
  };
  images: string[];
  title: string;
  description: string;
  features: string;
  languages: string;
  frameworks: string;
  technologies: string;
  highlights: string;
  collaborators: string;
  contact: string;
  timestamp: string;
}

function SingleProgram() {
  const [loading, setLoading] = useState<boolean>(false);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [openChat, setOpenChat] = useState<boolean>(false);
  const [summary, setSummary] = useState<string>("");
  const [program, setProgram] = useState<ProgramType | null>(null);
  const [likesCount, setlikesCount] = useState<number>(0);
  const [commentsCount, setCommentsCount] = useState<number>(0);
  const [userLiked, setUserLiked] = useState<boolean>(false);
  const [openCommentBox, setOpenCommentBox] = useState<boolean>(false);
  const { programId } = useParams();

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const { data } = await axios.get(`/marketplace/${programId}`);
        if (data.success) {
          setProgram(data.program);
          setlikesCount(data.likesCount);
          setCommentsCount(data.commentsCount);
          setUserLiked(data.userLiked);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchProgram();
  }, []);

  const handleOpenCommentBox = () => {
    document.body.classList.add("modal-open");
    setOpenCommentBox(true);
  };

  const handleLike = async () => {
    try {
      setUserLiked(!userLiked);
      if (!userLiked) {
        setlikesCount(likesCount + 1);

        await axios.post(`/likes`, {
          referenceId: programId,
        });
      } else {
        setlikesCount(likesCount - 1);

        await axios.delete(`/likes/${programId}`);
      }
    } catch (error) {
      setUserLiked(userLiked);
      console.log(error);
    }
  };

  const summarizeContent = async () => {
    try {
      const content = setContentToSummarize(program);

      setLoading(true);

      const { data } = await axios.post("/gemini/prompt/summarize", {
        content,
      });

      if (data.success) {
        const result = data.summary;
        if (result) {
          const convertedSummary = convertMarkDownToHtml(result);
          setSummary(convertedSummary);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowSummary = () => {
    document.body.classList.add("modal-open");
    setShowSummary(true);
    if (!loading) {
      summarizeContent();
    }
  };

  const handleCloseSummary = () => {
    document.body.classList.remove("modal-open");
    setShowSummary(false);
  };

  const handleOpenChat = () => {
    setOpenChat(true);
  };

  if (!program) {
    return (
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <MoonLoader size={30} color="var(--color-blue)" />
      </div>
    );
  }
  return (
    <div className="single-program">
      <div className="dashboard">
        <div className="post">
          <button className="chat-button" onClick={handleOpenChat}>
            Chat &nbsp;<i className="fa-solid fa-comments"></i>
          </button>

          <div className="top">
            <h1>{program.title}</h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "3rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  src={
                    program?.userId?.avatar
                      ? program?.userId?.avatar?.trim()
                      : "/images/avatar.jpg"
                  }
                  alt="author-profile"
                />
                <p>{program?.userId?.username}</p>
              </div>
              <small
                style={{
                  color: "var(--color-text-secondary)",
                  marginRight: "10px",
                }}
              >
                {new Date(program.timestamp).toLocaleDateString("en-GB")}
              </small>
            </div>
          </div>

          <CarouselComponent images={program?.images} />

          <div className="likes-and-comments">
            <span onClick={handleLike}>
              <i className={userLiked ? "bi bi-heart-fill" : "bi bi-heart"}></i>
              &nbsp;{formatNumber(likesCount)}
            </span>{" "}
            &nbsp; &nbsp;
            <span onClick={handleOpenCommentBox}>
              <i className="bi bi-chat-dots"></i>&nbsp;
              {formatNumber(commentsCount)}
            </span>
          </div>

          <div className="content" style={{ border: "none" }}>
            <div dangerouslySetInnerHTML={{ __html: program?.description }} />
          </div>

          <div className="content">
            <h4>FEATURES</h4>
            <div dangerouslySetInnerHTML={{ __html: program?.features }} />
          </div>

          <div className="content">
            <h4>DEVELOPMENT TOOLS</h4>
            {program.languages && (
              <div className="language">
                <h5>LANGUAGE</h5>
                <p>{program.languages}</p>
              </div>
            )}
            {program.frameworks && (
              <div className="frameworks">
                <h5>FRAMEWORKS</h5>
                <p>{program?.frameworks}</p>
              </div>
            )}
            {program.technologies && (
              <div className="technologies">
                <h5>TECHNOLOGIES</h5>
                <p>{program?.technologies}</p>
              </div>
            )}
          </div>

          {program.highlights && (
            <div className="content">
              <h4>HIGHLIGHTS</h4>
              <div dangerouslySetInnerHTML={{ __html: program?.highlights }} />
            </div>
          )}
          {program.collaborators && (
            <div className="content">
              <h4>COLLABORATORS</h4>
              <div
                dangerouslySetInnerHTML={{ __html: program?.collaborators }}
              />
            </div>
          )}
          {program.contact && (
            <div className="content" style={{ textAlign: "center" }}>
              <h4>Reach Out</h4>
              <div dangerouslySetInnerHTML={{ __html: program?.contact }} />
            </div>
          )}
        </div>
        <button className="summarize-button" onClick={handleShowSummary}>
          Summarize
          <img src="/images/gemini-icon.svg" alt="google-gemini-icon" />
        </button>
      </div>

      {showSummary && (
        <div className="dialog-overlay">
          <div className="summarized-content">
            <i
              className="fa-solid fa-xmark"
              id="close-summary-button"
              onClick={handleCloseSummary}
            ></i>
            {loading ? (
              <div className="loading-spinner">
                <RiseLoader size={10} color="var(--color-blue)" />
              </div>
            ) : (
              <div className="summary-text">
                <div dangerouslySetInnerHTML={{ __html: summary }} />
              </div>
            )}
          </div>
        </div>
      )}

      {openCommentBox && (
        <CommentBox
          referenceId={programId}
          setCommentsCount={setCommentsCount}
          setOpenCommentBox={setOpenCommentBox}
        />
      )}
      {openChat && <ChatBox setOpenChatBox={setOpenChat} />}
    </div>
  );
}

export default SingleProgram;
