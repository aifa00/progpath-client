import "./TaskSearchFilterSort.css";
import React, { useState } from "react";

const TaskSearchFilterSort: React.FC<any> = ({
  dropDown,
  setDropDown,
  search,
  setSearch,
  setEndDate,
  priority,
  setPriority,
  status,
  setStatus,
  sortBy,
  setSortBy,
  order,
  setOrder,
  setDateFrom,
  setDateUpto,
}) => {
  const [filterByDates] = useState(["today", "thisweek", "thismonth"]);
  const [filterByStatus] = useState([
    "Not Started",
    "In Progress",
    "Done",
    "Stuck",
  ]);
  const [filterByPriority] = useState(["Low", "Medium", "High"]);
  const [currentDateOption, setCurrentDateOption] = useState("");
  const [from, setFrom] = useState("");
  const [upto, setUpto] = useState("");
  const [customDateError, setCustomDateError] = useState("");

  const handleFilterByDate = (opt: string) => {
    if (currentDateOption === opt) {
      setEndDate("");
      return setCurrentDateOption("");
    }

    if (currentDateOption === "custom" || from || upto) {
      setFrom("");
      setUpto("");
      setDateFrom("");
      setDateUpto("");
      setCurrentDateOption("");
    }

    setEndDate(opt);
    setCurrentDateOption(opt);
  };

  const handleFilterBystatus = (opt: string) => {
    if (status.includes(opt)) {
      setStatus((prevStatus: any) =>
        [...prevStatus].filter((status) => status !== opt)
      );
      return;
    }
    setStatus([...status, opt]);
  };

  const handleFilterByPriority = (opt: string) => {
    if (priority.includes(opt)) {
      setPriority((prevPriorities: any) =>
        [...prevPriorities].filter((priority) => priority !== opt)
      );
      return;
    }
    setPriority([...priority, opt]);
  };

  const handleSort = (opt: string) => {
    const [optionToSort, orderToSort] = opt.split("-");

    const orderValue = orderToSort === "asce" ? 1 : -1;

    if (orderValue === order) {
      setSortBy("");
      setOrder("");
      return;
    }

    setSortBy(optionToSort);
    setOrder(orderValue);
  };

  const handleApplyCustomDate = () => {
    if (!from && !upto) {
      return setCustomDateError('please provide "from" and "upto" date');
    } else if (new Date(upto) <= new Date(from)) {
      return setCustomDateError('"upto" cannot be greater than "from" date ');
    } else if (!from) {
      return setCustomDateError('"from" is required');
    } else if (!upto) {
      return setCustomDateError('"upto" is required');
    } else {
      setCustomDateError("");
    }

    setDateFrom(from);
    setDateUpto(upto);
    setEndDate("");
    setCurrentDateOption("custom");
  };

  const cancelCustomDateFilter = () => {
    setFrom("");
    setUpto("");
    setDateFrom("");
    setDateUpto("");
    setCurrentDateOption("");
  };

  const handleFilterByDropdown = () => {
    if (customDateError) setCustomDateError("");
    dropDown === "filter" ? setDropDown("") : setDropDown("filter");
  };

  return (
    <>
      <div className="taskSearchFilterSort">
        <input
          className="search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="search..."
        />

        <div
          className="filterBy"
          style={{
            backgroundColor: dropDown === "filter" ? "var(--color-violet)" : "",
          }}
        >
          <div onClick={handleFilterByDropdown} className="filterBySwitch">
            <span>Filter</span> &nbsp;
            <i className="bi bi-filter" style={{ fontSize: "small" }}></i>
          </div>

          {dropDown === "filter" && (
            <ul>
              <li className="listHeading">Task Due (Filter by custom date)</li>
              <li className="listOptions">
                <div className="custom-date-filter">
                  <p>from</p>
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                  <p>upto</p>
                  <input
                    type="date"
                    value={upto}
                    onChange={(e) => setUpto(e.target.value)}
                  />

                  <span className="error">{customDateError}</span>

                  {currentDateOption === "custom" && (
                    <button
                      className="btn-tertiary"
                      id="apply-button"
                      onClick={cancelCustomDateFilter}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    className="btn-secondary"
                    id="apply-button"
                    onClick={handleApplyCustomDate}
                  >
                    Apply
                  </button>
                </div>
              </li>

              <li className="listHeading">Task Due</li>
              {filterByDates.map((opt) => (
                <li
                  key={opt}
                  onClick={() => handleFilterByDate(opt)}
                  className="listOptions"
                >
                  {opt === "today" && "Today"}
                  {opt === "thisweek" && "This Week"}
                  {opt === "thismonth" && "This Month"}
                  {currentDateOption === opt && <i className="bi bi-check"></i>}
                </li>
              ))}

              <li className="listHeading">Status</li>
              {filterByStatus.map((opt) => (
                <li
                  key={opt}
                  onClick={() => handleFilterBystatus(opt)}
                  className="listOptions"
                >
                  {opt}
                  {status.includes(opt) && <i className="bi bi-check"></i>}
                </li>
              ))}

              <li className="listHeading">Priority</li>
              {filterByPriority.map((opt) => (
                <li
                  key={opt}
                  onClick={() => handleFilterByPriority(opt)}
                  className="listOptions"
                >
                  {opt}
                  {priority.includes(opt) && <i className="bi bi-check"></i>}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          className="sortBy"
          style={{
            backgroundColor: dropDown === "sort" ? "var(--color-violet)" : "",
          }}
        >
          <div
            onClick={() =>
              dropDown === "sort" ? setDropDown("") : setDropDown("sort")
            }
            className="sortBySwitch"
          >
            <span>Sort</span> &nbsp;
            <i
              className="bi bi-sort-alpha-down"
              style={{ fontSize: "small" }}
            ></i>
          </div>

          {dropDown === "sort" && (
            <ul>
              <li
                className="listOptions"
                onClick={() => handleSort("title-asce")}
              >
                Ascending
                {order === 1 && <i className="bi bi-check"></i>}
              </li>
              <li
                className="listOptions"
                onClick={() => handleSort("title-desc")}
              >
                Descending
                {order === -1 && <i className="bi bi-check"></i>}
              </li>
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default TaskSearchFilterSort;
