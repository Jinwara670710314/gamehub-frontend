
import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import RatingStars from "../components/RatingStars";
import ReviewCard from "../components/ReviewCard";
import { useAuth } from "../auth/AuthContext";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080";

// อ่านข้อมูลจาก API และรองรับทั้ง JSON และข้อความธรรมดา
async function requestJSON(url, options = {}) {
  const response = await fetch(url, options);
  const responseText = await response.text();

  let result;

  try {
    result = JSON.parse(responseText);
  } catch {
    result = { message: responseText };
  }

  if (!response.ok) {
    throw new Error(result.message || "ไม่สามารถดำเนินการได้");
  }

  return result;
}

function GameDetail() {
  const { id } = useParams();
  const { token, user } = useAuth();

  // ข้อมูลสมาชิกที่เข้าสู่ระบบ
  const currentUserId = user?.id ? Number(user.id) : null;

  // รายละเอียดเกม
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Wishlist
  const [libraryEntry, setLibraryEntry] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState("");

  const isFavorite =
    libraryEntry?.status === "want_to_play";

  // Rating และ Review
  const [ratingSummary, setRatingSummary] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [reviewContent, setReviewContent] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [editingReview, setEditingReview] = useState(null);

  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");

  // เก็บรีวิวที่ผู้ใช้เลือกเพื่อลบ
  const [deleteReviewTarget, setDeleteReviewTarget] = useState(null);

  const myReview = reviews.find(
    (review) =>
      Number(review.user_id) === Number(currentUserId) &&
      currentUserId !== null
  );

  // โหลดรายละเอียดเกม
  useEffect(() => {
    async function loadGame() {
      try {
        setLoading(true);
        setError("");

        const result = await requestJSON(
          `${API_BASE_URL}/api/games/${id}/detail`
        );

        if (!result.data?.game) {
          throw new Error("ไม่พบข้อมูลเกม");
        }

        setGame(result.data.game);
      } catch (err) {
        console.error("Load game error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadGame();
  }, [id]);

  // ตรวจสอบสถานะ Wishlist
  useEffect(() => {
    async function loadWishlistStatus() {
      try {
        setLibraryEntry(null);

        if (!token) return;

        const result = await requestJSON(
          `${API_BASE_URL}/api/library`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const games = result.data || [];

        const foundGame = games.find(
          (item) => Number(item.game_id) === Number(id)
        );

        setLibraryEntry(foundGame || null);
      } catch (err) {
        console.error("Load wishlist status error:", err);
      }
    }

    loadWishlistStatus();
  }, [id, token]);

  // โหลดคะแนนเฉลี่ย
  const loadRatingSummary = useCallback(async () => {
    try {
      const result = await requestJSON(
        `${API_BASE_URL}/api/games/${id}/rating-summary`
      );

      setRatingSummary(result.data);
    } catch (err) {
      console.error("Load rating summary error:", err);
    }
  }, [id]);

  // โหลดรีวิวทั้งหมด
  const loadReviews = useCallback(async () => {
    try {
      setReviewsLoading(true);
      setReviewsError("");

      const result = await requestJSON(
        `${API_BASE_URL}/api/games/${id}/reviews`
      );

      setReviews(result.data || []);
    } catch (err) {
      console.error("Load reviews error:", err);
      setReviewsError(err.message);
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  // โหลดข้อมูล Rating และ Review เมื่อเปิดหน้าเกม
  useEffect(() => {
    loadRatingSummary();
    loadReviews();
  }, [loadRatingSummary, loadReviews]);

  // เพิ่มหรือนำเกมออกจาก Wishlist
  async function toggleWishlist() {
    if (!game || wishlistLoading) return;

    setWishlistError("");

    if (!token) {
      setWishlistError(
        "กรุณาเข้าสู่ระบบก่อนเพิ่มเกมใน Wishlist"
      );
      return;
    }

    try {
      setWishlistLoading(true);

      let result;

      if (isFavorite) {
        await requestJSON(
          `${API_BASE_URL}/api/library/${libraryEntry.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setLibraryEntry(null);
      } else if (libraryEntry) {
        await requestJSON(
          `${API_BASE_URL}/api/library/${libraryEntry.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              status: "want_to_play",
            }),
          }
        );

        setLibraryEntry({
          ...libraryEntry,
          status: "want_to_play",
        });
      } else {
        result = await requestJSON(
          `${API_BASE_URL}/api/library`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              game_id: game.id,
              status: "want_to_play",
            }),
          }
        );

        setLibraryEntry({
          id: result.library_id,
          game_id: game.id,
          status: "want_to_play",
        });
      }
    } catch (err) {
      console.error("Toggle wishlist error:", err);
      setWishlistError(err.message);
    } finally {
      setWishlistLoading(false);
    }
  }

  // ส่งรีวิวใหม่หรือแก้ไขรีวิวเดิม
  async function submitReview(e) {
    e.preventDefault();

    setReviewError("");
    setReviewMessage("");

    if (!token) {
      setReviewError("กรุณาเข้าสู่ระบบก่อนเขียนรีวิว");
      return;
    }

    if (reviewRating < 1 || reviewRating > 5) {
      setReviewError("กรุณาเลือกคะแนน 1-5 ดาว");
      return;
    }

    if (!reviewContent.trim()) {
      setReviewError("กรุณาเขียนข้อความรีวิว");
      return;
    }

    if (reviewContent.trim().length > 5000) {
      setReviewError("รีวิวต้องไม่เกิน 5,000 ตัวอักษร");
      return;
    }

    try {
      setReviewLoading(true);

      const isEditing = editingReview !== null;

      const url = isEditing
        ? `${API_BASE_URL}/api/reviews/${editingReview}`
        : `${API_BASE_URL}/api/games/${id}/reviews`;

      const result = await requestJSON(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: reviewContent.trim(),
          rating: reviewRating,
        }),
      });

      setReviewMessage(
        result.message || "บันทึกรีวิวสำเร็จ"
      );

      setReviewContent("");
      setReviewRating(0);
      setEditingReview(null);

      await loadReviews();
      await loadRatingSummary();
    } catch (err) {
      console.error("Submit review error:", err);
      setReviewError(err.message);
    } finally {
      setReviewLoading(false);
    }
  }

  // เริ่มแก้ไขรีวิวของตัวเอง
  function startEditReview(review) {
    setEditingReview(review.id);
    setReviewContent(review.content);
    setReviewRating(review.rating);
    setReviewError("");
    setReviewMessage("");
  }

  // ยกเลิกการแก้ไข
  function cancelEditReview() {
    setEditingReview(null);
    setReviewContent("");
    setReviewRating(0);
    setReviewError("");
    setReviewMessage("");
  }

  // เปิดหน้าต่างยืนยันการลบ
  function openDeleteConfirm(review) {
    setDeleteReviewTarget(review);
    setReviewError("");
    setReviewMessage("");
  }

  // ปิดหน้าต่างยืนยันการลบ
  function closeDeleteConfirm() {
    if (reviewLoading) return;
    setDeleteReviewTarget(null);
  }

  // ยืนยันการลบรีวิว
  async function confirmDeleteReview() {
    if (!deleteReviewTarget || reviewLoading) return;

    if (!token) {
      setReviewError("กรุณาเข้าสู่ระบบก่อน");
      setDeleteReviewTarget(null);
      return;
    }

    const reviewId = deleteReviewTarget.id;

    try {
      setReviewLoading(true);
      setReviewError("");
      setReviewMessage("");

      const result = await requestJSON(
        `${API_BASE_URL}/api/reviews/${reviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDeleteReviewTarget(null);

      setReviewMessage(
        result.message || "ลบรีวิวสำเร็จ"
      );

      if (editingReview === reviewId) {
        cancelEditReview();
      }

      await loadReviews();
      await loadRatingSummary();
    } catch (err) {
      console.error("Delete review error:", err);
      setReviewError(err.message);
      setDeleteReviewTarget(null);
    } finally {
      setReviewLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0e17] px-[7%] py-[45px] text-white max-[800px]:px-[5%] max-[800px]:py-[30px]">
        <p>กำลังโหลดข้อมูลเกม...</p>
      </main>
    );
  }

  if (error || !game) {
    return (
      <main className="min-h-screen bg-[#0b0e17] px-[7%] py-[45px] text-white max-[800px]:px-[5%] max-[800px]:py-[30px]">
        <h2>{error || "ไม่พบข้อมูลเกม"}</h2>
        <Link
          to="/games"
          className="inline-flex items-center gap-[10px] mb-[35px] text-[#aab3ca] no-underline text-sm transition-colors duration-300 hover:text-[#a78bfa]"
        >
          ← กลับไปหน้าเกมทั้งหมด
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0e17] px-[7%] py-[45px] text-white max-[800px]:px-[5%] max-[800px]:py-[30px]">
      <Link
        to="/games"
        className="inline-flex items-center gap-[10px] mb-[35px] text-[#aab3ca] no-underline text-sm transition-colors duration-300 hover:text-[#a78bfa]"
      >
        ← กลับไปหน้าเกมทั้งหมด
      </Link>

      {/* รายละเอียดเกมเดิม */}
      <section className="grid grid-cols-[1.15fr_1fr] items-center gap-[55px] max-w-[1250px] mx-auto p-[35px] bg-[#121827] border border-[#252e42] rounded-[18px] max-[800px]:grid-cols-1 max-[800px]:gap-[25px] max-[800px]:p-5">
        <div className="w-full overflow-hidden rounded-[14px] bg-[#171d2b]">
          <img
            src={game.image}
            alt={game.name}
            className="block w-full aspect-video object-cover transition-transform duration-[400ms] hover:scale-[1.04]"
          />
        </div>

        <div className="p-[15px_10px] max-[800px]:p-[5px]">
          <span className="inline-block text-[#a78bfa] text-xs font-bold tracking-[3px] mb-[18px]">
            GAME DETAILS
          </span>

          <h1 className="text-[clamp(30px,4vw,46px)] leading-[1.2] font-bold mt-0 mb-[22px]">
            {game.name}
          </h1>

          <div className="flex flex-wrap gap-[10px]">
            <span className="px-[15px] py-[9px] rounded-[7px] bg-[#222b40] text-[#c4b5fd] text-[13px]">
              {game.genre}
            </span>
            <span className="px-[15px] py-[9px] rounded-[7px] bg-[#222b40] text-[#c4b5fd] text-[13px]">
              Released {game.year}
            </span>
          </div>

          <div className="h-px bg-[#30394f] my-[30px]"></div>

          <h3 className="text-[19px] mb-[14px]">
            เกี่ยวกับเกมนี้
          </h3>

          <p className="text-[#aab3ca] text-[15px] leading-[1.9] mb-[30px]">
            {game.description}
          </p>

          <button
            type="button"
            className="inline-block px-[22px] py-[13px] mr-3 mb-3 bg-[#252b3d] text-white border border-[#7c3aed] rounded-lg text-sm font-semibold cursor-pointer transition duration-300 hover:bg-[#7c3aed] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={toggleWishlist}
            disabled={wishlistLoading}
          >
            {wishlistLoading
              ? "กำลังบันทึก..."
              : isFavorite
                ? "♥ อยู่ใน Wishlist แล้ว"
                : "♡ เพิ่มใน Wishlist"}
          </button>

          {wishlistError && (
            <p style={{ color: "#ef4444", fontSize: "13px" }}>
              {wishlistError}
            </p>
          )}

          <Link
            to="/games"
            className="inline-block px-[22px] py-[13px] bg-[#7c3aed] text-white rounded-lg no-underline text-sm font-semibold transition duration-300 hover:bg-[#6d28d9] hover:-translate-y-0.5"
          >
            สำรวจเกมอื่น ๆ →
          </Link>
        </div>
      </section>

      {/* คะแนนเฉลี่ยของเกม */}
      <section className="w-full max-w-[1000px] mx-auto mt-[50px] p-[30px] bg-[#121827] border border-[#252e42] rounded-[18px] shadow-[0_12px_35px_#00000024] max-[800px]:p-[23px] max-[600px]:mt-[35px] max-[600px]:p-[19px] max-[600px]:rounded-[14px]">
        <div className="mb-6">
          <span className="inline-block text-[#a78bfa] text-xs font-bold tracking-[3px] mb-[9px]">
            PLAYER FEEDBACK
          </span>
          <h2 className="text-white text-[23px] font-bold mt-0 mb-2 max-[600px]:text-xl">
            คะแนนและรีวิวเกม
          </h2>
          <p className="text-[#aab3ca] text-sm leading-[1.7]">
            ความคิดเห็นและคะแนนจากผู้เล่น GameHub
          </p>
        </div>

        <div className="flex items-center justify-between gap-[25px] p-[22px_24px] bg-[#171f31] border border-[#30394f] rounded-[13px] max-[800px]:items-start max-[800px]:flex-col max-[600px]:p-[18px]">
          <div className="min-w-0">
            <span className="block mb-2 text-[#aab3ca] text-sm">
              คะแนนเฉลี่ย
            </span>

            {ratingSummary ? (
              <>
                <p className="text-white text-[38px] leading-[1.2] font-extrabold mt-0 mb-[5px] max-[600px]:text-[34px]">
                  {Number(
                    ratingSummary.average_rating || 0
                  ).toFixed(2)} / 5
                </p>

                <p className="my-[5px] mb-2 text-[21px]">
                  <RatingStars
                    value={Math.round(
                      Number(ratingSummary.average_rating || 0)
                    )}
                  />
                </p>

                <p className="text-[#aab3ca] text-[13px] m-0">
                  ผู้ให้คะแนน {ratingSummary.total_ratings || 0} คน
                  {" · "}
                  รีวิว {ratingSummary.total_reviews || 0} รายการ
                </p>
              </>
            ) : (
              <p className="text-[#aab3ca] text-[13px]">
                กำลังโหลดคะแนน...
              </p>
            )}
          </div>

          <div className="flex items-center gap-[13px] max-w-[310px] pl-[22px] border-l border-[#30394f] max-[800px]:max-w-none max-[800px]:pl-0 max-[800px]:pt-[15px] max-[800px]:border-l-0 max-[800px]:border-t">
            <span className="text-[#a78bfa] text-[27px]">★</span>
            <p className="text-[#aab3ca] text-[13px] leading-[1.7]">
              คะแนนเฉลี่ยจะคำนวณจากคะแนนรีวิวที่ผู้เล่นส่งเข้ามา
            </p>
          </div>
        </div>
      </section>

      {/* เขียนรีวิว */}
      <section className="w-full max-w-[1000px] mx-auto mt-[28px] p-[30px] bg-[#121827] border border-[#252e42] rounded-[18px] shadow-[0_12px_35px_#00000024] max-[800px]:p-[23px] max-[600px]:mt-5 max-[600px]:p-[19px] max-[600px]:rounded-[14px]">
        <div className="mb-6">
          <span className="inline-block text-[#a78bfa] text-xs font-bold tracking-[3px] mb-[9px]">
            SHARE YOUR THOUGHTS
          </span>
          <h2 className="text-white text-[23px] font-bold mt-0 mb-2 max-[600px]:text-xl">
            {editingReview !== null
              ? "แก้ไขรีวิวของคุณ"
              : myReview
                ? "คุณเขียนรีวิวเกมนี้แล้ว"
                : "เขียนรีวิวเกมนี้"}
          </h2>
          <p className="text-[#aab3ca] text-sm leading-[1.7]">
            บอกเล่าประสบการณ์และความประทับใจที่มีต่อเกมนี้
          </p>
        </div>

        {myReview && editingReview === null ? (
          <p className="p-[15px_17px] border border-[#30394f] rounded-[10px] bg-[#171f31] text-[#aab3ca] text-sm leading-[1.7]">
            คุณสามารถแก้ไขหรือลบรีวิวเดิมของคุณได้จากรายการรีวิวด้านล่าง
          </p>
        ) : (
          <form
            onSubmit={submitReview}
            className="flex flex-col items-start"
          >
            <label className="block mt-1 mb-[10px] text-[#e2e8f0] text-sm font-semibold">
              คะแนนรีวิว
            </label>

            <div className="flex items-center gap-[5px] mb-[22px]">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className={`p-[0_2px] border-0 bg-transparent text-[32px] leading-none cursor-pointer transition-[color,transform] duration-[180ms] hover:scale-[1.12] max-[600px]:text-[29px] ${
                    star <= reviewRating
                      ? "text-[#f5b301]"
                      : "text-[#596174]"
                  }`}
                  aria-label={`ให้คะแนน ${star} ดาว`}
                  aria-pressed={star === reviewRating}
                >
                  ★
                </button>
              ))}
            </div>

            <label className="block mt-1 mb-[10px] text-[#e2e8f0] text-sm font-semibold">
              ข้อความรีวิว
            </label>

            <textarea
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              placeholder="แบ่งปันความคิดเห็นเกี่ยวกับเกมนี้..."
              maxLength={5000}
              rows={5}
              className="block w-full min-h-[135px] box-border p-[15px_16px] border border-[#30394f] rounded-[10px] outline-none resize-y bg-[#0f1626] text-white text-sm leading-[1.7] transition-[border-color,box-shadow] duration-200 placeholder:text-[#77839b] focus:border-[#8b5cf6] focus:shadow-[0_0_0_3px_#8b5cf622]"
              required
            />

            <p className="self-end mt-[7px] text-[#8995ad] text-xs">
              {reviewContent.length}/5000 ตัวอักษร
            </p>

            <div className="flex flex-wrap items-center gap-[10px] mt-[17px]">
              <button
                type="submit"
                className="inline-block px-[22px] py-[13px] bg-[#7c3aed] text-white border-0 rounded-lg text-sm font-semibold cursor-pointer transition duration-300 hover:bg-[#6d28d9] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                disabled={reviewLoading}
              >
                {reviewLoading
                  ? "กำลังบันทึก..."
                  : editingReview !== null
                    ? "บันทึกการแก้ไข"
                    : "ส่งรีวิว"}
              </button>

              {editingReview !== null && (
                <button
                  type="button"
                  className="inline-block px-[22px] py-[13px] bg-[#29334a] text-white border-0 rounded-lg text-sm font-semibold cursor-pointer transition duration-300 hover:bg-[#3a4660] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                  onClick={cancelEditReview}
                  disabled={reviewLoading}
                >
                  ยกเลิก
                </button>
              )}
            </div>
          </form>
        )}

        {reviewError && (
          <p className="mt-[14px] text-[13px] leading-[1.6] text-[#fca5a5]">
            {reviewError}
          </p>
        )}

        {reviewMessage && (
          <p className="mt-[14px] text-[13px] leading-[1.6] text-[#86efac]">
            {reviewMessage}
          </p>
        )}
      </section>

      {/* รายการรีวิว */}
      <section className="w-full max-w-[1000px] mx-auto mt-[28px] p-[30px] bg-[#121827] border border-[#252e42] rounded-[18px] shadow-[0_12px_35px_#00000024] max-[800px]:p-[23px] max-[600px]:mt-5 max-[600px]:p-[19px] max-[600px]:rounded-[14px]">
        <div className="mb-6">
          <span className="inline-block text-[#a78bfa] text-xs font-bold tracking-[3px] mb-[9px]">
            COMMUNITY REVIEWS
          </span>
          <h2 className="text-white text-[23px] font-bold mt-0 mb-2 max-[600px]:text-xl">
            รีวิวจากผู้เล่น
          </h2>
          <p className="text-[#aab3ca] text-sm leading-[1.7]">
            อ่านความคิดเห็นจากผู้เล่นคนอื่น ๆ
          </p>
        </div>

        {reviewsLoading ? (
          <p className="flex flex-col items-center justify-center gap-[9px] min-h-[155px] p-[25px] border border-dashed border-[#35415b] rounded-xl bg-[#171f31] text-[#aab3ca] text-center text-sm">
            กำลังโหลดรีวิว...
          </p>
        ) : reviewsError ? (
          <p className="mt-[14px] text-[13px] leading-[1.6] text-[#fca5a5]">
            {reviewsError}
          </p>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-[9px] min-h-[155px] p-[25px] border border-dashed border-[#35415b] rounded-xl bg-[#171f31] text-[#aab3ca] text-center text-sm">
            <span className="text-[#a78bfa] text-[27px]">✦</span>
            <strong className="text-[#e2e8f0] text-base">
              ยังไม่มีรีวิวเกมนี้
            </strong>
            <p className="text-[#8995ad] leading-[1.6]">
              เป็นคนแรกที่แบ่งปันความคิดเห็นเกี่ยวกับเกมนี้ได้เลย!
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                currentUserId={currentUserId}
                reviewLoading={reviewLoading}
                onEdit={startEditReview}
                onDelete={openDeleteConfirm}
              />
            ))}
          </div>
        )}
      </section>

      {/* กล่องยืนยันการลบรีวิว */}
      {deleteReviewTarget && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-5 bg-[rgba(5,10,22,0.78)] backdrop-blur-[5px]"
          onClick={closeDeleteConfirm}
        >
          <div
            className="relative w-full max-w-[430px] p-8 border border-[#30394f] rounded-[18px] bg-[#171f31] text-[#f1f5f9] text-center shadow-[0_20px_60px_rgba(0,0,0,0.45)] max-[480px]:px-5 max-[480px]:py-[26px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-review-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-3 right-[15px] w-8 h-8 border-0 rounded-lg bg-transparent text-[#aab3ca] text-[25px] cursor-pointer hover:bg-[#252e42] hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={closeDeleteConfirm}
              disabled={reviewLoading}
              aria-label="ปิดหน้าต่าง"
            >
              ×
            </button>

            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-[18px] rounded-full bg-[rgba(239,68,68,0.12)] text-[#f87171] text-[32px]">
              <span>⌫</span>
            </div>

            <h2
              id="delete-review-title"
              className="text-[#f1f5f9] text-[21px] font-bold mt-0 mb-3"
            >
              ยืนยันการลบรีวิว
            </h2>

            <p className="text-[#e2e8f0] text-[15px] mb-[10px]">
              คุณต้องการลบรีวิวนี้ใช่หรือไม่?
            </p>

            <p className="text-[#aab3ca] text-[13px] leading-[1.7]">
              เมื่อลบแล้ว รีวิวและคะแนนของคุณจะถูกนำออกจากระบบ
              และไม่สามารถกู้คืนได้
            </p>

            <div className="flex gap-3 mt-7 max-[480px]:flex-col-reverse">
              <button
                type="button"
                className="flex-1 min-h-11 px-4 py-[10px] border-0 rounded-[9px] bg-[#30394f] text-[#e2e8f0] text-sm font-semibold cursor-pointer transition-colors duration-200 hover:bg-[#3b4760] disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={closeDeleteConfirm}
                disabled={reviewLoading}
              >
                ยกเลิก
              </button>

              <button
                type="button"
                className="flex-1 min-h-11 px-4 py-[10px] border-0 rounded-[9px] bg-[#dc4444] text-white text-sm font-semibold cursor-pointer transition-colors duration-200 hover:bg-[#ef4444] disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={confirmDeleteReview}
                disabled={reviewLoading}
              >
                {reviewLoading ? "กำลังลบ..." : "ยืนยันการลบ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default GameDetail;
