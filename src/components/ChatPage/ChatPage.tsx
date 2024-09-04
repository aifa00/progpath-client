import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { getUserId } from "../../utils/jwtUtils";
import "./ChatPage.css";
import Dialog from "../../assets/Dialog";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import axios from "../../axiosConfig";
import { setSelectedChat } from "../../redux/chatSlice";
import EmojiPicker from "emoji-picker-react";
import { BarLoader } from "react-spinners";
import Tooltip from "rc-tooltip";
import { getFormattedDate } from "../../utils/appUtils";

const TypedUseSelector: TypedUseSelectorHook<RootState> = useSelector;
var socket: Socket;

const ChatPage: React.FC<any> = ({ fetchChats }) => {
  const selectedChat = TypedUseSelector((state) => state.chat.selectedChat);
  const [loading, setLoading] = useState<boolean>(false);

  const [userId] = useState(getUserId());
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const chatContainerRef: any = useRef(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [deleteDialog, setDeleteDialog] = useState({
    header: "",
    message: "",
    toDelete: false,
    onCancel: () => {},
    onSuccess: () => {},
  });
  const dispatch = useDispatch();

  useEffect(() => {
    socket = io(process.env.REACT_APP_BASE_URL as string);
    socket.emit("setup", userId);
  }, []);

  useEffect(() => {
    socket.on("message recieved", (newMessage) => {
      if (selectedChat._id === newMessage.chat) {
        setMessages([...messages, newMessage]);
      }
    });

    socket.on("message deleted", (message) => {
      if (selectedChat._id === message.chat) {
        setMessages([...messages].filter((msg) => msg._id !== message._id));
      }
    });
  });

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!selectedChat) return;

        setLoading(true);

        const { data } = await axios.get(`/chat/${selectedChat._id}/messages`);

        if (data.success) {
          setMessages(data.messages);
        }

        socket.emit("join chat", selectedChat._id);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    return () => {
      fetchChats();
      if (socket) socket.emit("disconnect me");
    };
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeydown = (e: any) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const onEmojiClick = (emojiObject: any) => {
    setNewMessage((prevInput) => prevInput + emojiObject.emoji);
  };

  const sendMessage = async () => {
    try {
      if (!newMessage) return;
      setNewMessage("");

      const { data } = await axios.post(`/chat/${selectedChat._id}/messages`, {
        content: newMessage,
      });

      if (data.success) {
        const newMessage = data.message;
        setMessages([...messages, newMessage]);

        socket.emit("new message", newMessage, selectedChat.user._id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleUnsendMessage = (message: any) => {
    const isLastMessage = messages[messages.length - 1]._id === message._id;
    let nextLatestMessageId = "";
    if (isLastMessage && messages.length >= 2) {
      nextLatestMessageId = messages[messages.length - 2]._id;
    }

    if (message?.sender !== userId) return;
    setDeleteDialog({
      header: "UNSEND MESSAGE",
      message: "",
      toDelete: false,
      onCancel: () => setOpenDeleteDialog(false),
      onSuccess: () => deleteMessage(message, nextLatestMessageId),
    });

    setOpenDeleteDialog(true);
  };

  const deleteMessage = async (message: any, nextLatestMessageId: string) => {
    try {
      if (!message) return;

      const { data } = await axios.delete(
        `/chat/messages/${message._id}?latestmessageid=${nextLatestMessageId}`
      );

      if (data.success) {
        setMessages([...messages].filter((msg) => msg._id !== message._id));
        socket &&
          socket.emit(
            "delete message",
            {
              _id: message._id,
              chat: message.chat,
            },
            selectedChat.user._id
          );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const handleGoBack = () => {
    dispatch(setSelectedChat(null));
  };

  return (
    <div className="chat-page" onClick={() => setShowPicker(false)}>
      <div className="chat-header">
        <button onClick={handleGoBack} id="back-button">
          <i className="fa-solid fa-arrow-left fa-lg"></i>
        </button>
        <img
          id="author-profile-picture"
          src={
            selectedChat?.user.avatar
              ? selectedChat?.user?.avatar?.trim()
              : "/images/avatar.jpg"
          }
          alt="author-profile"
        />
        <strong id="username">{selectedChat?.user?.username}</strong>
      </div>

      {loading && <BarLoader width={"100%"} color="var(--color-blue)" />}

      <div className="chat-room" ref={chatContainerRef}>
        {messages.map((message) => (
          <Tooltip
            key={message._id}
            placement="top"
            trigger={["hover"]}
            overlay={<span>{getFormattedDate(message.timestamp)}</span>}
          >
            <div
              onDoubleClick={() => handleUnsendMessage(message)}
              style={{
                alignSelf:
                  userId === message.sender ? "flex-end" : "flex-start",
              }}
              className="chat-message"
            >
              {message?.content} &nbsp;
              <small id="chat-time">
                {message.timestamp &&
                  new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </small>
            </div>
          </Tooltip>
        ))}
      </div>

      <div className="message-input" onClick={(e) => e.stopPropagation()}>
        {showPicker && (
          <div className="emoji-picker">
            <EmojiPicker onEmojiClick={onEmojiClick} autoFocusSearch={true} />
          </div>
        )}
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="emoji-picker-button"
        >
          <i className="bi bi-emoji-smile"></i>
        </button>
        <input
          id="message-input"
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeydown}
          onFocus={() => showPicker && setShowPicker(false)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="message-send-button">
          <i className="bi bi-arrow-up-circle-fill"></i>
        </button>
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

export default ChatPage;
