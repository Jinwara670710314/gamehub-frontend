
import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";

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

  // ข้อมูลสมาชิกที่เข้าสู่ระบบ
  const [currentUserId] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.id ? Number(user.id) : null;
    } catch {
      return null;
    }
  });

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

        const token = localStorage.getItem("token");

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
  }, [id]);

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

    const token = localStorage.getItem("token");

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

    const token = localStorage.getItem("token");

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

    const token = localStorage.getItem("token");

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

  // แสดงดาว โดยแยกสีดาวที่เลือกและยังไม่เลือก
  function renderStars(value) {
    const score = Math.max(0, Math.min(5, Number(value) || 0));

    return (
      <span className="review-stars" aria-label={`${score} จาก 5 ดาว`}>
        <span className="review-stars-filled">
          {"★".repeat(score)}
        </span>
        <span className="review-stars-empty">
          {"★".repeat(5 - score)}
        </span>
      </span>
    );
  }

  if (loading) {
    return (
      <main className="detail-page">
        <p>กำลังโหลดข้อมูลเกม...</p>
      </main>
    );
  }

  if (error || !game) {
    return (
      <main className="detail-page">
        <h2>{error || "ไม่พบข้อมูลเกม"}</h2>
        <Link to="/games" className="detail-back">
          ← กลับไปหน้าเกมทั้งหมด
        </Link>
      </main>
    );
  }

  return (
    <main className="detail-page">
      <Link to="/games" className="detail-back">
        ← กลับไปหน้าเกมทั้งหมด
      </Link>

      {/* รายละเอียดเกมเดิม */}
      <section className="detail-container">
        <div className="detail-image-wrapper">
          <img
            src={game.image}
            alt={game.name}
            className="detail-image"
          />
        </div>

        <div className="detail-content">
          <span className="detail-label">GAME DETAILS</span>

          <h1>{game.name}</h1>

          <div className="detail-tags">
            <span>{game.genre}</span>
            <span>Released {game.year}</span>
          </div>

          <div className="detail-divider"></div>

          <h3>เกี่ยวกับเกมนี้</h3>

          <p className="detail-description">
            {game.description}
          </p>

          <button
            className="wishlist-button"
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

          <Link to="/games" className="detail-button">
            สำรวจเกมอื่น ๆ →
          </Link>
        </div>
      </section>

      {/* คะแนนเฉลี่ยของเกม */}
      <section className="game-review-section game-rating-summary">
        <div className="game-review-heading">
          <span className="detail-label">PLAYER FEEDBACK</span>
          <h2>คะแนนและรีวิวเกม</h2>
          <p>ความคิดเห็นและคะแนนจากผู้เล่น GameHub</p>
        </div>

        <div className="rating-summary-content">
          <div className="rating-summary-score">
            <span className="rating-summary-label">คะแนนเฉลี่ย</span>

            {ratingSummary ? (
              <>
                <p className="rating-average-number">
                  {Number(
                    ratingSummary.average_rating || 0
                  ).toFixed(2)} / 5
                </p>

                <p className="rating-average-stars">
                  {renderStars(
                    Math.round(Number(ratingSummary.average_rating || 0))
                  )}
                </p>

                <p className="rating-summary-count">
                  ผู้ให้คะแนน {ratingSummary.total_ratings || 0} คน
                  {" · "}
                  รีวิว {ratingSummary.total_reviews || 0} รายการ
                </p>
              </>
            ) : (
              <p className="rating-summary-count">
                กำลังโหลดคะแนน...
              </p>
            )}
          </div>

          <div className="rating-summary-note">
            <span className="rating-summary-note-icon">★</span>
            <p>คะแนนเฉลี่ยจะคำนวณจากคะแนนรีวิวที่ผู้เล่นส่งเข้ามา</p>
          </div>
        </div>
      </section>

      {/* เขียนรีวิว */}
      <section className="game-review-section game-review-form-section">
        <div className="game-review-heading">
          <span className="detail-label">SHARE YOUR THOUGHTS</span>
          <h2>
            {editingReview !== null
              ? "แก้ไขรีวิวของคุณ"
              : myReview
                ? "คุณเขียนรีวิวเกมนี้แล้ว"
                : "เขียนรีวิวเกมนี้"}
          </h2>
          <p>บอกเล่าประสบการณ์และความประทับใจที่มีต่อเกมนี้</p>
        </div>

        {myReview && editingReview === null ? (
          <p className="review-existing-message">
            คุณสามารถแก้ไขหรือลบรีวิวเดิมของคุณได้จากรายการรีวิวด้านล่าง
          </p>
        ) : (
          <form onSubmit={submitReview}>
            <label className="review-form-label">
              คะแนนรีวิว
            </label>

            <div className="review-star-picker">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className={`review-star-button ${
                    star <= reviewRating ? "is-selected" : ""
                  }`}
                  aria-label={`ให้คะแนน ${star} ดาว`}
                  aria-pressed={star === reviewRating}
                >
                  ★
                </button>
              ))}
            </div>

            <label className="review-form-label">
              ข้อความรีวิว
            </label>

            <textarea
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              placeholder="แบ่งปันความคิดเห็นเกี่ยวกับเกมนี้..."
              maxLength={5000}
              rows={5}
              className="review-textarea"
              required
            />

            <p className="review-character-count">
              {reviewContent.length}/5000 ตัวอักษร
            </p>

            <div className="review-form-actions">
              <button
                type="submit"
                className="detail-button review-submit-button"
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
                  className="detail-button review-cancel-button"
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
          <p className="review-feedback review-feedback-error">
            {reviewError}
          </p>
        )}

        {reviewMessage && (
          <p className="review-feedback review-feedback-success">
            {reviewMessage}
          </p>
        )}
      </section>

      {/* รายการรีวิว */}
      <section className="game-review-section game-review-list-section">
        <div className="game-review-heading">
          <span className="detail-label">COMMUNITY REVIEWS</span>
          <h2>รีวิวจากผู้เล่น</h2>
          <p>อ่านความคิดเห็นจากผู้เล่นคนอื่น ๆ</p>
        </div>

        {reviewsLoading ? (
          <p className="review-empty-state">กำลังโหลดรีวิว...</p>
        ) : reviewsError ? (
          <p className="review-feedback review-feedback-error">
            {reviewsError}
          </p>
        ) : reviews.length === 0 ? (
          <div className="review-empty-state">
            <span className="review-empty-icon">✦</span>
            <strong>ยังไม่มีรีวิวเกมนี้</strong>
            <p>เป็นคนแรกที่แบ่งปันความคิดเห็นเกี่ยวกับเกมนี้ได้เลย!</p>
          </div>
        ) : (
          <div className="review-list">
            {reviews.map((review) => {
              const isMyReview =
                currentUserId !== null &&
                Number(review.user_id) === currentUserId;

              return (
                <article key={review.id} className="review-card">
                  <div className="review-card-header">
                    <div className="review-user">
                      <span className="review-user-avatar">
                        {(review.username || "U").charAt(0).toUpperCase()}
                      </span>
                      <strong>{review.username}</strong>
                    </div>

                    <span className="review-date">
                      {review.created_at
                        ? new Date(
                            review.created_at
                          ).toLocaleDateString("th-TH")
                        : ""}
                    </span>
                  </div>

                  <p className="review-card-stars">
                    {renderStars(review.rating)}
                  </p>

                  <p className="review-card-content">
                    {review.content}
                  </p>

                  {isMyReview && (
                    <div className="review-card-actions">
                      <button
                        type="button"
                        className="detail-button review-edit-button"
                        onClick={() => startEditReview(review)}
                        disabled={reviewLoading}
                      >
                        แก้ไขรีวิว
                      </button>

                      <button
                        type="button"
                        className="detail-button review-delete-button"
                        onClick={() => openDeleteConfirm(review)}
                        disabled={reviewLoading}
                      >
                        ลบรีวิว
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* กล่องยืนยันการลบรีวิว */}
      {deleteReviewTarget && (
        <div
          className="review-modal-overlay"
          onClick={closeDeleteConfirm}
        >
          <div
            className="review-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-review-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="review-modal-close"
              onClick={closeDeleteConfirm}
              disabled={reviewLoading}
              aria-label="ปิดหน้าต่าง"
            >
              ×
            </button>

            <div className="review-modal-icon">
              <span>⌫</span>
            </div>

            <h2 id="delete-review-title">
              ยืนยันการลบรีวิว
            </h2>

            <p className="review-modal-description">
              คุณต้องการลบรีวิวนี้ใช่หรือไม่?
            </p>

            <p className="review-modal-warning">
              เมื่อลบแล้ว รีวิวและคะแนนของคุณจะถูกนำออกจากระบบ
              และไม่สามารถกู้คืนได้
            </p>

            <div className="review-modal-actions">
              <button
                type="button"
                className="review-modal-cancel"
                onClick={closeDeleteConfirm}
                disabled={reviewLoading}
              >
                ยกเลิก
              </button>

              <button
                type="button"
                className="review-modal-confirm"
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
