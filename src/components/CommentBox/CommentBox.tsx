import React, { useEffect, useState } from "react";
import "./CommentBox.css";
import { getUserId } from "../../utils/jwtUtils";
import axios from "../../axiosConfig";
import { useDispatch } from "react-redux";
import { setAlert } from "../../redux/alertSlice";
import Dialog from "../../assets/Dialog";
import { BarLoader } from "react-spinners";
import CommentReplies from "../CommentReplies/CommentReplies";
import EmojiPicker from "emoji-picker-react";

interface CommentBoxType {
  referenceId: string | undefined | null;
  setCommentsCount: React.Dispatch<React.SetStateAction<number>>;
  setOpenCommentBox: React.Dispatch<React.SetStateAction<boolean>>;
}

interface CommentType {
  _id: string;
  timestamp: string;
  userDetails: {
    username: string;
    avatar: string;
  };
  text: string;
  replyCount: number;
}

const CommentBox: React.FC<CommentBoxType> = ({
  referenceId,
  setCommentsCount,
  setOpenCommentBox,
}) => {
  const [loading, setLoading] = useState(false);
  const [showReplies, setShowReplies] = useState("");
  const [showReplyInput, setShowReplyInput] = useState("");
  const [parentCommentId, setParentCommentId] = useState("");
  const [userId] = useState(getUserId());
  const [comments, setComments] = useState<CommentType[]>([]);
  const [activeId, setActiveId] = useState("");
  const [commmentText, setCommentText] = useState("");
  const [replyInput, setReplyInput] = useState("");
  const [editCommentText, seteEditCommentText] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [showReplyPicker, setShowReplyPicker] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState({
    header: "",
    message: "",
    toDelete: false,
    onCancel: () => {},
    onSuccess: () => {},
  });
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/comments/${referenceId}`);

        if (data.success) {
          setCommentText("");
          setComments(data.comments);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [referenceId]);

  const handlePostComment = async (e: any) => {
    try {
      if (e.key === "Enter") {
        if (!commmentText) return;
        setLoading(true);
        const { data } = await axios.post(`/comments`, {
          referenceId,
          text: commmentText,
        });

        if (data.success) {
          setCommentsCount((prevCount: number) => prevCount + 1);
          setCommentText("");
          setComments((prevComments: any) => [
            { ...data.newComment, replyCount: 0 },
            ...prevComments,
          ]);
        }
      }
    } catch (error) {
      setCommentsCount((prevCount: number) => prevCount);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    try {
      if (!editCommentText) return;
      setLoading(true);
      const { data } = await axios.patch(`/comments/${commentId}`, {
        text: editCommentText,
      });

      if (data.success) {
        dispatch(setAlert({ message: "Comment edited", type: "success" }));
        seteEditCommentText("");
        setActiveId("");
        setComments((prevComments: any) =>
          [...prevComments].map((comment) => {
            if (comment._id === commentId) {
              return { ...comment, text: editCommentText };
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
      setLoading(false);
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
          setLoading(true);
          const { data } = await axios.delete(`/comments/${commentId}`);

          if (data.success) {
            setCommentsCount((prevCount: number) =>
              prevCount > 0 ? prevCount - 1 : prevCount
            );
            dispatch(setAlert({ message: "Comment deleted", type: "success" }));
            setComments((prevComments: any) =>
              [...prevComments].filter((comment) => comment._id !== commentId)
            );
          }
        } catch (error) {
          console.log(error);
          setCommentsCount((prevCount: number) => prevCount);
          setComments([...comments]);
        } finally {
          setLoading(false);
          setOpenDeleteDialog(false);
        }
      },
    });
    setOpenDeleteDialog(true);
  };

  const reduceReplyCount = (parentCommentId: string) => {
    setComments([
      ...comments.map((comment) =>
        comment._id === parentCommentId
          ? { ...comment, replyCount: comment.replyCount - 1 }
          : comment
      ),
    ]);
  };

  const hadleReplyComment = async (
    parentCommentId: string,
    mentionedTo: string
  ) => {
    try {
      if (!replyInput) return;

      setLoading(true);

      const { data } = await axios.post(
        `/comments/${parentCommentId}/replies`,
        {
          mentionedTo,
          text: replyInput || "",
        }
      );

      if (data.success) {
        setReplyInput("");
        setComments([
          ...comments.map((comment) =>
            comment._id === parentCommentId
              ? { ...comment, replyCount: comment.replyCount + 1 }
              : comment
          ),
        ]);

        dispatch(setAlert({ message: "Reply added", type: "success" }));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowReplies = (commentId: string) => {
    if (showReplyInput) setShowReplyInput("");

    if (showReplies === commentId) {
      setShowReplies("");
    } else {
      setParentCommentId(commentId);
      setShowReplies(commentId);
    }
  };

  const handleShowReplyInput = (commentId: string) => {
    if (showReplies) setShowReplies("");
    showReplyInput === commentId
      ? setShowReplyInput("")
      : setShowReplyInput(commentId);
    replyInput && setReplyInput("");
  };

  const handleClose = () => {
    document.body.classList.remove("modal-open");
    setOpenCommentBox(false);
  };

  const handleOuterClick = () => {
    if (showPicker) setShowPicker(false);
    if (showReplyPicker) setShowReplyPicker(false);
    if (showReplyInput) setShowReplyInput("");
  };

  return (
    <div className="dialog-overlay" onClick={handleOuterClick}>
      <i onClick={handleClose} className="bi bi-x-lg close-button"></i>

      <div className="comment-box">
        <h5>Comments</h5>

        <div className="comments">
          {comments.length > 0 ? (
            comments.map((comment: any) => (
              <div key={comment._id}>
                <div className="singleComment">
                  <img
                    style={{ marginRight: "10px", marginTop: "5px" }}
                    src={comment?.userDetails?.avatar?.trim()}
                    alt="profile"
                  />
                  <div>
                    <p
                      style={{
                        fontSize: "10px",
                        color: "rgba(106, 106, 106, 0.732)",
                      }}
                    >
                      {new Date(comment.timestamp).toLocaleDateString("en-GB")}{" "}
                      &nbsp; &nbsp;
                      {new Date(comment.timestamp).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                      })}
                    </p>
                    <p style={{ fontSize: "smaller", fontWeight: "600" }}>
                      {comment?.userDetails?.username}
                    </p>

                    {activeId === comment._id ? (
                      <textarea
                        style={{ width: "20rem" }}
                        rows={4}
                        value={editCommentText}
                        onChange={(e) => seteEditCommentText(e.target.value)}
                      ></textarea>
                    ) : (
                      <p style={{ fontWeight: "lighter" }}>{comment.text}</p>
                    )}

                    {!activeId && comment.replyCount > 0 && (
                      <strong
                        id="show-reply-button"
                        onClick={() => handleShowReplies(comment._id)}
                      >
                        <i
                          className={
                            showReplies === comment._id
                              ? "fa-solid fa-angle-up"
                              : "fa-solid fa-angle-down"
                          }
                        ></i>{" "}
                        {comment.replyCount} Replies
                      </strong>
                    )}
                    {!activeId && (
                      <button
                        id="reply-button"
                        onClick={() => handleShowReplyInput(comment._id)}
                      >
                        Reply
                      </button>
                    )}

                    {comment.userDetails._id === userId &&
                      (activeId === comment._id ? (
                        <>
                          <span
                            id="editCommentCancelButton"
                            onClick={() => {
                              setActiveId("");
                              seteEditCommentText("");
                            }}
                          >
                            Cancel
                          </span>
                          <span
                            id="editCommentSaveButton"
                            onClick={() => handleEditComment(comment._id)}
                          >
                            Save
                          </span>
                        </>
                      ) : (
                        <>
                          <span
                            onClick={() => {
                              setActiveId(comment._id);
                              seteEditCommentText(comment.text);
                            }}
                            id="editCommentIcon"
                          >
                            Edit
                          </span>
                          <span
                            onClick={() => handleDeleteComment(comment._id)}
                            id="deleteCommentIcon"
                          >
                            Delete
                          </span>
                        </>
                      ))}
                  </div>
                </div>

                {showReplies === comment._id && (
                  <CommentReplies
                    parentCommentId={parentCommentId}
                    setLoading={setLoading}
                    reduceReplyCount={reduceReplyCount}
                  />
                )}

                {showReplyInput === comment._id && (
                  <div
                    className="reply-input"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {showReplyPicker && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="emoji-picker"
                        style={{ bottom: "initial", top: "120%" }}
                      >
                        <EmojiPicker
                          onEmojiClick={(emojiObj: any) =>
                            setReplyInput(
                              (currText: string) => currText + emojiObj.emoji
                            )
                          }
                          autoFocusSearch={true}
                        />
                      </div>
                    )}
                    <button
                      onClick={() => setShowReplyPicker(!showReplyPicker)}
                      className="emoji-picker-button"
                    >
                      <i className="bi bi-emoji-smile"></i>
                    </button>
                    <input
                      placeholder="Type a message..."
                      id="reply-input"
                      type="text"
                      value={replyInput}
                      onFocus={() =>
                        showReplyPicker && setShowReplyPicker(false)
                      }
                      onChange={(e) => setReplyInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          hadleReplyComment(
                            comment._id,
                            comment.userDetails._id
                          );
                        }
                      }}
                    />
                    <button
                      onClick={() =>
                        hadleReplyComment(comment._id, comment.userDetails._id)
                      }
                      className="btn-tertiary"
                    >
                      {" "}
                      send{" "}
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              No comments yet!
            </p>
          )}
        </div>

        <div className="comment-input">
          {/* <img
            src={avatarUrl ? avatarUrl : "/images/avatar.jpg"}
            alt="profile"
          /> */}
          {showPicker && (
            <div onClick={(e) => e.stopPropagation()} className="emoji-picker">
              <EmojiPicker
                onEmojiClick={(emojiObj: any) =>
                  setCommentText(
                    (currText: string) => currText + emojiObj.emoji
                  )
                }
                autoFocusSearch={true}
              />
            </div>
          )}
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="emoji-picker-button"
          >
            <i className="bi bi-emoji-smile"></i>
          </button>
          <input
            placeholder="Add a comment"
            id="comment-input"
            type="text"
            value={commmentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handlePostComment}
          />
          <button onClick={handlePostComment} className="btn-secondary">
            send
          </button>
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

export default CommentBox;
