import React, { useEffect, useState } from "react";
import "./CommentReplies.css";
import { getUserId } from "../../utils/jwtUtils";
import axios from "../../axiosConfig";
import { setAlert } from "../../redux/alertSlice";
import { useDispatch } from "react-redux";
import Dialog from "../../assets/Dialog";
import EmojiPicker from "emoji-picker-react";

interface CommentrepliesProps {
  parentCommentId: string;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  reduceReplyCount: (parentCommentId: string) => void;
}

interface CommentType {
  _id: string;
  timestamp: string;
  userId: {
    username: string;
    avatar: string;
  };
  mentionedTo: {
    username: string;
  };
  text: string;
}

const CommentReplies: React.FC<CommentrepliesProps> = ({
  parentCommentId,
  setLoading,
  reduceReplyCount,
}) => {
  const [showReplyInput, setShowReplyInput] = useState("");
  const [userId] = useState(getUserId());
  const [comments, setComments] = useState<CommentType[]>([]);
  const [activeId, setActiveId] = useState("");
  const [replyInput, setReplyInput] = useState("");
  const [editCommentText, seteEditCommentText] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState({
    header: "",
    message: "",
    toDelete: false,
    onCancel: () => {},
    onSuccess: () => {},
  });
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const { data } = await axios.get(
          `/comments/${parentCommentId}/replies`
        );

        if (data.success) {
          setComments(data.replies);
        }
      } catch (error) {
        console.log(error);
      }
    };

    parentCommentId && fetchReplies();
  }, [parentCommentId]);

  const handleDeleteReply = async (commentId: string) => {
    setDeleteDialog({
      header: "Delete Reply ?",
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
            reduceReplyCount(parentCommentId);
            dispatch(setAlert({ message: "Reply deleted", type: "success" }));
            setComments((prevComments: any) =>
              [...prevComments].filter((comment) => comment._id !== commentId)
            );
          }
        } catch (error) {
          console.log(error);
          setComments([...comments]);
        } finally {
          setLoading(false);
          setOpenDeleteDialog(false);
        }
      },
    });
    setOpenDeleteDialog(true);
  };

  const handleEditReply = async (commentId: string) => {
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
        setShowReplyInput("");
        dispatch(setAlert({ message: "Reply added", type: "success" }));
        setComments([...comments, data.addedReply]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowReplyInput = (commentId: string) => {
    showReplyInput === commentId
      ? setShowReplyInput("")
      : setShowReplyInput(commentId);
  };
  const handleOuterClick = () => {
    if (showReplyInput) setShowReplyInput("");
  };
  return (
    <div className="comment-replies" onClick={handleOuterClick}>
      {comments.length > 0 ? (
        comments.map((comment: any) => (
          <div key={comment._id}>
            <div className="singleComment">
              <img
                style={{ marginRight: "10px", marginTop: "5px" }}
                src={comment.userId.avatar?.trim()}
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
                  {comment.userId.username}
                </p>

                {activeId === comment._id ? (
                  <textarea
                    style={{ width: "20rem" }}
                    rows={4}
                    value={editCommentText}
                    onChange={(e) => seteEditCommentText(e.target.value)}
                  ></textarea>
                ) : (
                  <p style={{ fontWeight: "lighter" }}>
                    {" "}
                    <strong id="mentiond-to">
                      @{comment?.mentionedTo?.username}
                    </strong>{" "}
                    {comment.text}
                  </p>
                )}

                {!activeId && (
                  <button
                    id="reply-button"
                    onClick={() => handleShowReplyInput(comment._id)}
                  >
                    Reply
                  </button>
                )}

                {comment.userId._id === userId &&
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
                        onClick={() => handleEditReply(comment._id)}
                      >
                        Save
                      </span>
                    </>
                  ) : (
                    <>
                      <span
                        onClick={() => {
                          showReplyInput && setShowReplyInput("");
                          setActiveId(comment._id);
                          seteEditCommentText(comment.text);
                        }}
                        id="editCommentIcon"
                      >
                        Edit
                      </span>
                      <span
                        onClick={() => handleDeleteReply(comment._id)}
                        id="deleteCommentIcon"
                      >
                        Delete
                      </span>
                    </>
                  ))}
              </div>
            </div>

            {showReplyInput === comment._id && (
              <div onClick={(e) => e.stopPropagation()} className="reply-input">
                {showPicker && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="emoji-picker"
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
                  onClick={() => setShowPicker(!showPicker)}
                  className="emoji-picker-button"
                >
                  <i className="bi bi-emoji-smile"></i>
                </button>
                <input
                  placeholder="Type a message..."
                  id="reply-input"
                  type="text"
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      hadleReplyComment(parentCommentId, comment?.userId?._id);
                    }
                  }}
                />
                <button
                  onClick={() =>
                    hadleReplyComment(parentCommentId, comment?.userId?._id)
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
          No Replies
        </p>
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
  );
};

export default CommentReplies;
