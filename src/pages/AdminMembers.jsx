
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080";

function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  // ดึงรายชื่อสมาชิกจริงจาก Backend
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/admin/members`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          response.status === 403
            ? "คุณไม่มีสิทธิ์เข้าถึงข้อมูลสมาชิก"
            : "ไม่สามารถโหลดข้อมูลสมาชิกได้"
        );
      }

      const result = await response.json();

      setMembers(result.data || []);
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // ค้นหาสมาชิก
  const filteredMembers = members.filter((member) =>
    `${member.username} ${member.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // นับจำนวนสมาชิกที่ Active
  const activeCount = members.filter(
    (member) => member.status === "active"
  ).length;

  const suspendedCount = members.length - activeCount;

  // เปลี่ยนสถานะสมาชิกในฐานข้อมูล
  const handleStatus = async (id, currentStatus) => {
    try {
      setSavingId(id);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
      }

      const newStatus =
        currentStatus === "active" ? "suspended" : "active";

      const response = await fetch(
        `${API_BASE_URL}/api/admin/members/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "ไม่สามารถเปลี่ยนสถานะสมาชิกได้");
      }

      const result = await response.json();

      // อัปเดตข้อมูลบนหน้าจอจากผลลัพธ์ Backend
      setMembers((previousMembers) =>
        previousMembers.map((member) =>
          member.id === id ? result.data : member
        )
      );
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาดในการเปลี่ยนสถานะ");
    } finally {
      setSavingId(null);
    }
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
            <h2>{suspendedCount}</h2>
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

        {error && (
          <p role="alert" className="members-empty">
            {error}
          </p>
        )}

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
              {loading ? (
                <tr>
                  <td colSpan="5" className="members-empty">
                    กำลังโหลดข้อมูลสมาชิก...
                  </td>
                </tr>
              ) : filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
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
                      <span
                        className={`member-role ${member.role.toLowerCase()}`}
                      >
                        {member.role === "admin" ? "Admin" : "Member"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`member-status ${member.status.toLowerCase()}`}
                      >
                        {member.status === "active"
                          ? "Active"
                          : "Suspended"}
                      </span>
                    </td>

                    <td>
                      <button
                        className="member-action-btn"
                        disabled={
                          member.role === "admin" ||
                          savingId === member.id
                        }
                        onClick={() =>
                          handleStatus(member.id, member.status)
                        }
                      >
                        {savingId === member.id
                          ? "Saving..."
                          : member.status === "active"
                          ? "Suspend"
                          : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
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
