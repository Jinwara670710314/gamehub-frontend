
import { useState } from "react";
import { Link } from "react-router-dom";

const initialMembers = [
  {
    id: 1,
    username: "gameplayer01",
    email: "player01@example.com",
    role: "Member",
    status: "Active",
  },
  {
    id: 2,
    username: "gamer_pro",
    email: "gamer@example.com",
    role: "Member",
    status: "Active",
  },
  {
    id: 3,
    username: "admin",
    email: "admin@gamehub.com",
    role: "Admin",
    status: "Active",
  },
  {
    id: 4,
    username: "player99",
    email: "player99@example.com",
    role: "Member",
    status: "Suspended",
  },
];

function AdminMembers() {
  const [members, setMembers] = useState(initialMembers);
  const [search, setSearch] = useState("");

  const filteredMembers = members.filter((member) =>
    `${member.username} ${member.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const activeCount = members.filter(
    (member) => member.status === "Active"
  ).length;

  const handleStatus = (id) => {
    setMembers((previousMembers) =>
      previousMembers.map((member) =>
        member.id === id
          ? {
              ...member,
              status:
                member.status === "Active"
                  ? "Suspended"
                  : "Active",
            }
          : member
      )
    );
  };

  return (
    <main className="manage-members-page">
      <div className="manage-members-container">

        <div className="members-header">
          <div>
            <span>GAMEHUB MANAGEMENT</span>
            <h1>Manage Members<span>.</span></h1>
            <p>จัดการบัญชีสมาชิกภายในระบบ GameHub</p>
          </div>

          <Link to="/admin" className="members-back-btn">
            ← Dashboard
          </Link>
        </div>

        <div className="members-stats">
          <div className="members-stat-card">
            <span>TOTAL MEMBERS</span>
            <h2>{members.length}</h2>
            <p>สมาชิกทั้งหมด</p>
          </div>

          <div className="members-stat-card">
            <span>ACTIVE MEMBERS</span>
            <h2>{activeCount}</h2>
            <p>บัญชีที่ใช้งานได้</p>
          </div>

          <div className="members-stat-card">
            <span>SUSPENDED</span>
            <h2>{members.length - activeCount}</h2>
            <p>บัญชีที่ถูกระงับ</p>
          </div>
        </div>

        <div className="members-list-header">
          <div>
            <h2>Member List</h2>
            <p>รายชื่อสมาชิกทั้งหมดในระบบ</p>
          </div>

          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="members-table-wrapper">
          <table className="members-table">
            <thead>
              <tr>
                <th>MEMBER</th>
                <th>EMAIL</th>
                <th>ROLE</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div className="member-name">
                      <div className="member-avatar">
                        {member.username.charAt(0).toUpperCase()}
                      </div>
                      {member.username}
                    </div>
                  </td>

                  <td>{member.email}</td>

                  <td>
                    <span className={`member-role ${member.role.toLowerCase()}`}>
                      {member.role}
                    </span>
                  </td>

                  <td>
                    <span className={`member-status ${member.status.toLowerCase()}`}>
                      {member.status}
                    </span>
                  </td>

                  <td>
                    <button
                      className="member-action-btn"
                      disabled={member.role === "Admin"}
                      onClick={() => handleStatus(member.id)}
                    >
                      {member.status === "Active"
                        ? "Suspend"
                        : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}

              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan="5" className="members-empty">
                    ไม่พบสมาชิกที่ค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}

export default AdminMembers;
