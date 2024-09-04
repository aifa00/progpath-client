import { useEffect, useState } from "react";
import "./Marketplace.css";
import axios from "../../axiosConfig";
import Pagination from "../Pagination/Pagination";
import { extractTextFromHtml } from "../../utils/appUtils";
import { useNavigate } from "react-router-dom";
import AddProgram from "../AddProgram/AddProgram";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { togglePremiumComponent } from "../../redux/premiumSlice";
import { RootState } from "../../redux/store";
import { setPremiumUser } from "../../redux/userSlice";
import ChatBox from "../ChatBox/ChatBox";

interface ProgramsType {
  _id: string;
  title: string;
  description: string;
  image: string;
  likesCount: number;
  commentsCount: number;
}

const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

function Marketplace() {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [order, setOrder] = useState("");
  const [duration, setDuration] = useState("");
  const [programs, setPrograms] = useState<ProgramsType[]>([]);
  const [activeDropdown, setActiveDropdown] = useState("");
  const [addProgramForm, setAddProgramForm] = useState(false);
  const [openChatBox, setOpenChatBox] = useState(false);
  const premiumUser = useTypedSelector((state) => state.user.isPremiumUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchPrograms();
  }, [page, sort, order, duration]);

  const fetchPrograms = async () => {
    try {
      const { data } = await axios.get(`/marketplace`, {
        params: {
          search,
          page,
          sort,
          order,
          duration,
        },
      });
      if (data.success) {
        setPrograms(data.programs);
        setTotalPages(data.totalPages);
        setTotalResults(data.totalResults);
        setFrom(data.from);
        setTo(data.to);
        dispatch(setPremiumUser(data.premiumUser));
      }
    } catch (error) {
      console.log(error);
    }
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

  const handleFilter = (opt: string) => {
    if (duration === opt) {
      setDuration("");
      return;
    }

    setDuration(opt);
  };

  const toggleDropdown = (value: string) => {
    if (value === "sort") {
      activeDropdown === "sort"
        ? setActiveDropdown("")
        : setActiveDropdown("sort");
    } else if (value === "filter") {
      activeDropdown === "filter"
        ? setActiveDropdown("")
        : setActiveDropdown("filter");
    }
  };

  const onInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderBottom = "2px solid var(--color-blue)";
    if (activeDropdown) setActiveDropdown("");
  };

  const onInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderBottom = "1px solid var(--color-text-primary)";
  };

  const handleSearch = (e: any) => {
    if (e.key === "Enter") fetchPrograms();
  };

  const openProgram = (programId: string) => {
    navigate(`/marketplace/${programId}`);
  };

  const openUploadForm = () => {
    if (premiumUser) {
      setAddProgramForm(!addProgramForm);
    } else {
      dispatch(togglePremiumComponent());
    }
  };

  const handleOuterClick = () => {
    if (activeDropdown) setActiveDropdown("");
  };
  return (
    <div className="marketplace" onClick={handleOuterClick}>
      <div className="main">
        <div className="body">
          <div className="utils">
            <div className="search-input">
              <i id="searchIcon" className="bi bi-search"></i>
              <input
                onFocus={onInputFocus}
                onBlur={onInputBlur}
                onKeyDown={handleSearch}
                className="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="search"
                placeholder="search by title, author, language, framework, technologies..."
              />
            </div>

            <div className="sort-and-filter" style={{ flex: 1 }}>
              <div id="filterButton">
                <button
                  onClick={() => toggleDropdown("filter")}
                  style={{
                    borderLeft:
                      activeDropdown === "filter"
                        ? "2px solid var(--color-blue)"
                        : "",
                  }}
                >
                  Filter &nbsp; <i className="bi bi-filter"></i>
                </button>
                {activeDropdown === "filter" && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="dropdown-menu"
                    style={{ top: "2.5rem", left: "0" }}
                  >
                    <div
                      className="dropdown-option"
                      onClick={() => handleFilter("week")}
                    >
                      <p>Uploaded last Week</p>
                      {duration === "week" && (
                        <span>
                          <i className="fa-solid fa-check"></i>
                        </span>
                      )}
                    </div>
                    <div
                      className="dropdown-option"
                      onClick={() => handleFilter("month")}
                    >
                      <p>Uploaded last Month</p>
                      {duration === "month" && (
                        <span>
                          <i className="fa-solid fa-check"></i>
                        </span>
                      )}
                    </div>
                    <div
                      className="dropdown-option"
                      onClick={() => handleFilter("year")}
                    >
                      <p>Uploaded last Year</p>
                      {duration === "year" && (
                        <span>
                          <i className="fa-solid fa-check"></i>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div id="sortButton">
                <button
                  onClick={() => toggleDropdown("sort")}
                  style={{
                    borderLeft:
                      activeDropdown === "sort"
                        ? "2px solid var(--color-blue)"
                        : "",
                  }}
                >
                  Sort &nbsp; <i className="bi bi-sort-down-alt"></i>
                </button>
                {activeDropdown === "sort" && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="dropdown-menu"
                    style={{ top: "2.5rem", left: "0" }}
                  >
                    <div
                      className="dropdown-option"
                      onClick={() => handleSort("title-asce")}
                    >
                      <p>
                        Ascending &nbsp;{" "}
                        <i className="bi bi-sort-numeric-up"></i>
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
                        Descending &nbsp;{" "}
                        <i className="bi bi-sort-numeric-up"></i>
                      </p>
                      {sort === "title" && order === "desc" && (
                        <span>
                          <i className="fa-solid fa-check"></i>
                        </span>
                      )}
                    </div>
                    <div
                      className="dropdown-option"
                      onClick={() => handleSort("date-desc")}
                    >
                      <p>
                        Most Recent &nbsp;{" "}
                        <i className="bi bi-sort-numeric-up"></i>
                      </p>
                      {sort === "date" && order === "desc" && (
                        <span>
                          <i className="fa-solid fa-check"></i>
                        </span>
                      )}
                    </div>
                    <div
                      className="dropdown-option"
                      onClick={() => handleSort("popular-desc")}
                    >
                      <p>
                        Most Popular&nbsp;{" "}
                        <i className="bi bi-sort-numeric-down-alt"></i>
                      </p>
                      {sort === "popular" && order === "desc" && (
                        <span>
                          <i className="fa-solid fa-check"></i>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={openUploadForm}
                id="upload-btn"
                className="btn-primary"
              >
                + Upload
              </button>

              <button
                className="chat-button"
                onClick={() => setOpenChatBox(true)}
              >
                Chat &nbsp;<i className="fa-solid fa-comments"></i>
              </button>
            </div>
          </div>

          <div className="content">
            {programs.map((program: ProgramsType) => (
              <div
                key={program._id}
                className="card"
                onClick={() => openProgram(program._id)}
              >
                <img
                  src={
                    program.image
                      ? program.image
                      : "/images/image-placeholder.jpg"
                  }
                  alt="placeholder"
                />
                <h5>{program.title?.split(" ")?.slice(0, 5).join(" ")}</h5>
                <div className="description">
                  <p>{extractTextFromHtml(program.description)}</p>
                </div>
                <div className="likes-and-comments">
                  <i className="bi bi-heart"></i> {program.likesCount} &nbsp;
                  &nbsp;
                  <i className="bi bi-chat-dots"></i> {program.commentsCount}
                </div>
              </div>
            ))}
          </div>

          <Pagination
            from={from}
            to={to}
            page={page}
            totalResults={totalResults}
            totalPages={totalPages}
            setPage={setPage}
          />
        </div>
      </div>
      {addProgramForm && (
        <AddProgram setAddProgramForm={setAddProgramForm} setPrograms={null} />
      )}
      {openChatBox && <ChatBox setOpenChatBox={setOpenChatBox} />}
    </div>
  );
}

export default Marketplace;
