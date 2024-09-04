import React, { useState, useEffect } from "react";
import "./ChatBox.css";
import axios from "../../axiosConfig";
import { BarLoader } from "react-spinners";
import { setChats, setSelectedChat } from "../../redux/chatSlice";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import ChatPage from "../ChatPage/ChatPage";
import { RootState } from "../../redux/store";
import Tooltip from "rc-tooltip";
import "rc-tooltip/assets/bootstrap.css";

const TypedUseSelector: TypedUseSelectorHook<RootState> = useSelector;

interface ChatBoxProps {
  setOpenChatBox: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatBox: React.FC<ChatBoxProps> = ({ setOpenChatBox }) => {
  const chats = TypedUseSelector((state) => state.chat.chats);
  const selectedChat = TypedUseSelector((state) => state.chat.selectedChat);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTooltip, setSearchTooltip] = useState(false);
  const [searchNotFoundError, setSearchNotFoundError] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchChats();

    return () => {
      dispatch(setSelectedChat(null));
    };
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(`/chat/my-chats`);

      if (data.success) {
        dispatch(setChats(data.chats));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!search) {
      setSearchResults([]);
      setSearchNotFoundError(false);
    }
  }, [search]);

  const handleSearch = async () => {
    try {
      if (!search) return;
      setLoading(true);
      const { data } = await axios.post(`/chat/users?search=${search}`);

      if (data.success) {
        setSearchResults(data.users);
        if (data.users.length <= 0) setSearchNotFoundError(true);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchInputKeydown = (e: any) => {
    if (e.key === "Enter") {
      if (!search) {
        return e.target.focus();
      }
      handleSearch();
    }
  };

  const accessChat = async (user_id: string) => {
    try {
      setLoading(true);

      const { data } = await axios.get(`/chat/users/${user_id}`);

      if (data.success) {
        if (search) setSearch("");
        if (searchResults.length > 0) setSearchResults([]);
        if (!chats.find((chat: any) => chat._id === data.chat._id)) {
          dispatch(setChats([data.chat, ...chats]));
        }

        dispatch(setSelectedChat(data.chat));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dialog-overlay">
      <i
        onClick={() => setOpenChatBox(false)}
        className="bi bi-x-lg close-button"
      ></i>

      <div className="chat-box">
        {selectedChat ? (
          <ChatPage fetchChats={fetchChats} />
        ) : (
          <div>
            <div className="chat-header">
              <strong>Chats</strong>
              <Tooltip
                placement="bottom"
                overlay={<span>Search</span>}
                visible={searchTooltip ? true : false}
              >
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleSearchInputKeydown}
                  onMouseOver={() => setSearchTooltip(true)}
                  onMouseLeave={() => setSearchTooltip(false)}
                  onFocus={() => setSearchTooltip(false)}
                  type="text"
                  id="chat-search"
                  placeholder="search..."
                />
              </Tooltip>
            </div>

            {searchNotFoundError && (
              <p id="no-results-found-text">
                <i className="bi bi-emoji-frown-fill"></i> No results found
              </p>
            )}

            {loading && <BarLoader width={"100%"} color="var(--color-blue)" />}

            <div className="chat-room">
              {searchResults.length > 0
                ? searchResults.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => accessChat(user._id)}
                      className="chat-list"
                    >
                      <div className="list-item">
                        <img
                          src={user.avatar ? user.avatar : "/images/avatar.jpg"}
                          alt="profile"
                        />
                        <div>
                          <strong>{user.username}</strong>
                          <p>{user?.email}</p>
                        </div>
                      </div>
                    </div>
                  ))
                : chats.length > 0 && !searchNotFoundError
                ? chats.map((chat) => (
                    <div
                      key={chat._id}
                      onClick={() => accessChat(chat?.user?._id)}
                      className="chat-list"
                    >
                      <div className="list-item">
                        <img
                          src={
                            chat?.user.avatar
                              ? chat.user.avatar
                              : "/images/avatar.jpg"
                          }
                          alt="profile-pic"
                        />

                        <div>
                          <strong>{chat?.user?.username}</strong>
                          <p id="latest-message">
                            {chat?.latestMessage?.content?.slice(0, 40)}
                          </p>
                        </div>
                      </div>

                      {/* {chat?.unreadCount > 0 && (
                        <div className="unreadMessageCount">
                          {chat.unreadCount}
                        </div>
                      )} */}
                    </div>
                  ))
                : !searchNotFoundError && (
                    <p className="info-text">
                      <i className="bi bi-chat-quote-fill"></i> No chats! Search
                      users to start chat
                    </p>
                  )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBox;
