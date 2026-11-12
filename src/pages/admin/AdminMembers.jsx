
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080";

function AdminMembers() {
  const { token } = useAuth();

  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  // ดึงรายชื่อสมาชิกจริงจาก Backend
  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

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
  }, [token]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

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
    <main className="min-h-screen box-border px-[5%] py-[60px] text-white bg-[#0b0b12]">
      <div className="max-w-[1250px] mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center gap-5 mb-[35px] max-[768px]:items-start max-[768px]:flex-col">
          <div>
            <span className="text-[#a78bfa] text-xs tracking-[2px] font-bold">
              GAMEHUB MANAGEMENT
            </span>

            <h1 className="text-[38px] my-[10px] max-[768px]:text-[30px]">
              Manage Members<span className="text-[#8b5cf6]">.</span>
            </h1>

            <p className="text-[#999]">
              จัดการบัญชีสมาชิกภายในระบบ GameHub
            </p>
          </div>

          <Link
            to="/admin"
            className="no-underline text-[#ddd] border border-[#393344] px-[18px] py-[11px] rounded-[9px] transition duration-200 hover:bg-[#211832] hover:border-[#8b5cf6]"
          >
            ← Dashboard
          </Link>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-5 mb-10 max-[768px]:grid-cols-1">
          <div className="bg-[#15131f] border border-[#292437] rounded-[14px] p-[25px]">
            <span className="text-[#a78bfa] text-[11px] tracking-[1.5px]">
              TOTAL MEMBERS
            </span>

            <h2 className="text-[34px] mt-3 mb-[5px]">
              {members.length}
            </h2>

            <p className="text-[#888] text-[13px]">
              สมาชิกทั้งหมด
            </p>
          </div>

          <div className="bg-[#15131f] border border-[#292437] rounded-[14px] p-[25px]">
            <span className="text-[#a78bfa] text-[11px] tracking-[1.5px]">
              ACTIVE MEMBERS
            </span>

            <h2 className="text-[34px] mt-3 mb-[5px]">
              {activeCount}
            </h2>

            <p className="text-[#888] text-[13px]">
              บัญชีที่ใช้งานได้
            </p>
          </div>

          <div className="bg-[#15131f] border border-[#292437] rounded-[14px] p-[25px]">
            <span className="text-[#a78bfa] text-[11px] tracking-[1.5px]">
              SUSPENDED
            </span>

            <h2 className="text-[34px] mt-3 mb-[5px]">
              {suspendedCount}
            </h2>

            <p className="text-[#888] text-[13px]">
              บัญชีที่ถูกระงับ
            </p>
          </div>
        </div>

        {/* Member List Header */}
        <div className="flex justify-between items-center gap-5 mb-5 max-[768px]:items-start max-[768px]:flex-col">
          <div>
            <h2 className="text-[22px] mb-[5px]">
              Member List
            </h2>

            <p className="text-[#888] text-[13px]">
              รายชื่อสมาชิกทั้งหมดในระบบ
            </p>
          </div>

          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="box-border w-[260px] px-[15px] py-3 bg-[#15131f] border border-[#393344] rounded-[9px] text-white outline-none focus:border-[#8b5cf6] max-[768px]:w-full"
          />
        </div>

        {error && (
          <p
            role="alert"
            className="text-center p-[35px] text-[#888] bg-[#15131f] border border-[#292437] rounded-[14px] mb-5"
          >
            {error}
          </p>
        )}

        {/* Members Table */}
        <div className="overflow-x-auto bg-[#15131f] border border-[#292437] rounded-[14px]">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr>
                <th className="text-left p-[18px] text-[#a78bfa] text-[11px] tracking-[1px] bg-[#1b1827]">
                  MEMBER
                </th>

                <th className="text-left p-[18px] text-[#a78bfa] text-[11px] tracking-[1px] bg-[#1b1827]">
                  EMAIL
                </th>

                <th className="text-left p-[18px] text-[#a78bfa] text-[11px] tracking-[1px] bg-[#1b1827]">
                  ROLE
                </th>

                <th className="text-left p-[18px] text-[#a78bfa] text-[11px] tracking-[1px] bg-[#1b1827]">
                  STATUS
                </th>

                <th className="text-left p-[18px] text-[#a78bfa] text-[11px] tracking-[1px] bg-[#1b1827]">
                  ACTION
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center p-[35px] text-[#888]"
                  >
                    กำลังโหลดข้อมูลสมาชิก...
                  </td>
                </tr>
              ) : filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <tr key={member.id}>
                    <td className="p-[17px] px-[18px] border-t border-[#292437] text-[#ccc] text-sm">
                      <div className="flex items-center gap-3 text-white font-semibold">
                        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#35245a] text-[#c4b5fd] font-bold shrink-0">
                          {member.username.charAt(0).toUpperCase()}
                        </div>

                        {member.username}
                      </div>
                    </td>

                    <td className="p-[17px] px-[18px] border-t border-[#292437] text-[#ccc] text-sm">
                      {member.email}
                    </td>

                    <td className="p-[17px] px-[18px] border-t border-[#292437] text-[#ccc] text-sm">
                      <span
                        className={`inline-block px-[11px] py-[5px] rounded-[20px] text-[11px] font-bold ${
                          member.role.toLowerCase() === "admin"
                            ? "bg-[#3b2b18] text-[#fbbf24]"
                            : "bg-[#25213a] text-[#c4b5fd]"
                        }`}
                      >
                        {member.role === "admin" ? "Admin" : "Member"}
                      </span>
                    </td>

                    <td className="p-[17px] px-[18px] border-t border-[#292437] text-[#ccc] text-sm">
                      <span
                        className={`inline-block px-[11px] py-[5px] rounded-[20px] text-[11px] font-bold ${
                          member.status.toLowerCase() === "active"
                            ? "bg-[#153526] text-[#4ade80]"
                            : "bg-[#3b2025] text-[#fb7185]"
                        }`}
                      >
                        {member.status === "active"
                          ? "Active"
                          : "Suspended"}
                      </span>
                    </td>

                    <td className="p-[17px] px-[18px] border-t border-[#292437] text-[#ccc] text-sm">
                      <button
                        type="button"
                        className="px-[13px] py-2 border border-[#75404a] rounded-[7px] bg-[#321d26] text-[#fb7185] cursor-pointer transition duration-200 hover:bg-[#51232e] disabled:opacity-[0.35] disabled:cursor-not-allowed"
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
                  <td
                    colSpan="5"
                    className="text-center p-[35px] text-[#888]"
                  >
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
