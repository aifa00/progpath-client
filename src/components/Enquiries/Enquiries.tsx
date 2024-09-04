import AdminSidebar from "../AdminSidebar/AdminSidebar";

function Enquiries() {
  return (
    <>
      <div className="users">
        <AdminSidebar />
        <div className="container">
          <div className="table">
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Profile</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>
                    Subscription <br />
                    Plan
                  </th>
                  <th>
                    Subsciption <br />
                    Status
                  </th>
                  <th>
                    Account <br />
                    Status
                  </th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {/* {
                    users.map ((user:any) => (
                      <tr key={user._id}>
                        <td>{user.slno}</td>
                        <td><img width={40}  height={40} style={{borderRadius: '50px'}} src={user.avatar ? user.avatar : 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'}/></td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td> basic plan</td>
                        <td>Expired</td>
                        <td style={{fontWeight: 'bold', color: user.blocked ? 'var(--color-error)': 'var(--color-success)'}}>{user.blocked ? 'Blocked' : 'Active'}</td>
                        <td>
                          <button>
                          <select defaultValue={user.role} onChange={(e) => handleChangeRole(user._id, e.currentTarget.value)}>
                              <option value="teamlead">Teamlead</option>
                              <option value="regular">Regular</option>
                          </select>
                          </button>
                          <button className='bock-button' onClick={() => handleActionBlock(user._id, user.blocked ? 'unblock' : 'block')}>{user.blocked ? 'Unblock' : 'Block'}</button>
                        </td>
                      </tr>
                    ))
                  } */}
              </tbody>
            </table>
            {/* {
            users.length > 0 && (
              <Pagination 
              from={users[0].slno} 
              to={users[users.length - 1].slno} 
              totalResults={totalUsers} 
              page={page} 
              totalPages={totalPages}
              setPage={setPage}
              />
            )
          } */}
          </div>
        </div>
      </div>
    </>
  );
}

export default Enquiries;
