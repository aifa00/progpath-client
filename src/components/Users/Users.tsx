import React, { ChangeEvent, useEffect, useState } from "react";
import AdminSidebar from "../AdminSidebar/AdminSidebar";
import "./Users.css";
import axios from "../../axiosConfig";
import { useDispatch } from "react-redux";
import Pagination from "../Pagination/Pagination";
import { setAlert } from "../../redux/alertSlice";

function Users() {
  const [users, setUsers] = useState<any>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [sortby, setSortby] = useState("");
  const [order, setOrder] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get("/admin/users", {
          params: {
            search,
            role,
            status,
            sortby,
            order,
            page,
          },
        });

        setUsers(data.users);
        setTotalPages(data.totalPages);
        setTotalUsers(data.totalUsers);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUsers();
  }, [search, role, status, sortby, order, page]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) =>
    setSearch(e.target.value);

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.currentTarget.value;
    if (value === "teamlead" || value === "regular") {
      setRole(value);
    } else if (value === "active" || value === "blocked") {
      setStatus(value);
    } else {
      setRole("");
      setStatus("");
    }
  };

  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const [sortField, sortOrder] = e.target.value.split("-");
    setSortby(sortField);
    setOrder(sortOrder);
  };

  const handleActionBlock = async (userId: string, action: string) => {
    try {
      const { data } = await axios.post(`/admin/users/${userId}/block`, {
        action,
      });

      dispatch(
        setAlert({
          message: `User ${action === "block" ? "blocked" : "unblocked"}`,
          type: "success",
        })
      );

      setUsers((prevUsers: any) =>
        [...prevUsers].map((user: any) => {
          if (user._id === userId) {
            return { ...user, blocked: action === "block" };
          } else {
            return user;
          }
        })
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleChangeRole = async (userId: string, role: string) => {
    try {
      const { data } = await axios.post(`/admin/users/${userId}/role`, {
        role,
      });

      dispatch(setAlert({ message: "Role changed", type: "success" }));

      if (data.success) {
        setUsers((prevUsers: any) =>
          [...prevUsers].map((user: any) => {
            if (user._id === userId) {
              return { ...user, role };
            } else {
              return user;
            }
          })
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="users">
        <AdminSidebar />
        <div className="container">
          <h5>USERS</h5>

          <div className="search-filter-sort">
            <input
              type="search"
              placeholder="search..."
              className="search"
              value={search}
              onChange={handleSearchChange}
            />
            <select
              className="filter"
              defaultValue={role || status}
              onChange={handleFilterChange}
            >
              <option value="">Filter</option>
              <option value="teamlead">Role - Teamlead</option>
              <option value="regular">Role - Regular</option>
              <option value="active">Status - Active</option>
              <option value="blocked">Status - Blocked</option>
            </select>
            <select
              className="filter"
              defaultValue={sortby}
              onChange={handleSortChange}
            >
              <option value="">Sort</option>
              <option value="username-asc">Name - Ascending</option>
              <option value="username-desc">Name - Descending</option>
              <option value="email-asc">Email - Ascending</option>
              <option value="email-desc">Email - Descending</option>
            </select>
          </div>

          <div className="table">
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Profile</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>
                    Account <br />
                    Status
                  </th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user: any) => (
                    <tr key={user._id}>
                      <td>{user.slno}</td>
                      <td>
                        <img
                          width={40}
                          height={40}
                          style={{ borderRadius: "50px" }}
                          src={
                            user.avatar
                              ? user?.avatar?.trim()
                              : "/images/avatar.jpg"
                          }
                          alt="profile"
                        />
                      </td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td
                        style={{
                          fontWeight: "bold",
                          color: user.blocked
                            ? "var(--color-error)"
                            : "var(--color-success)",
                        }}
                      >
                        {user.blocked ? "Blocked" : "Active"}
                      </td>
                      <td>
                        <button>
                          <select
                            defaultValue={user.role}
                            onChange={(e) =>
                              handleChangeRole(user._id, e.currentTarget.value)
                            }
                          >
                            <option value="teamlead">Teamlead</option>
                            <option value="regular">Regular</option>
                          </select>
                        </button>
                        <button
                          className="bock-button"
                          onClick={() =>
                            handleActionBlock(
                              user._id,
                              user.blocked ? "unblock" : "block"
                            )
                          }
                        >
                          {user.blocked ? "Unblock" : "Block"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>NO DATA FOUND</td>
                  </tr>
                )}
              </tbody>
            </table>
            {users.length > 0 && (
              <Pagination
                from={users[0]?.slno || 0}
                to={users[users.length - 1]?.slno || 0}
                totalResults={totalUsers}
                page={page}
                totalPages={totalPages}
                setPage={setPage}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Users;
