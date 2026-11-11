
import RatingStars from "./RatingStars";

function ReviewCard({
  review,
  currentUserId,
  reviewLoading,
  onEdit,
  onDelete,
}) {
  const isMyReview =
    currentUserId !== null &&
    Number(review.user_id) === Number(currentUserId);

  const reviewDate = review.created_at
    ? new Date(review.created_at).toLocaleDateString("th-TH")
    : "";

  return (
    <article className="py-[22px] border-b border-[#30394f] first:pt-0 last:pb-0 last:border-b-0">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-[11px] text-white text-sm">
          <span className="flex items-center justify-center w-[38px] h-[38px] flex-[0_0_38px] rounded-full bg-gradient-to-br from-[#6579ff] to-[#8b5cf6] text-white text-[15px] font-bold">
            {(review.username || "U").charAt(0).toUpperCase()}
          </span>

          <strong>{review.username}</strong>
        </div>

        <span className="text-[#8995ad] text-xs">
          {reviewDate}
        </span>
      </div>

      <p className="mt-[13px] text-[17px]">
        <RatingStars value={review.rating} />
      </p>

      <p className="mt-[10px] text-[#c4ccdc] text-sm leading-[1.8] whitespace-pre-wrap [overflow-wrap:anywhere]">
        {review.content}
      </p>

      {isMyReview && (
        <div className="flex flex-wrap items-center gap-[10px] mt-[15px]">
          <button
            type="button"
            className="inline-block px-[22px] py-[13px] bg-[#30304f] text-white rounded-lg text-sm font-semibold transition duration-300 hover:bg-[#45416e] hover:-translate-y-0.5 border-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            onClick={() => onEdit(review)}
            disabled={reviewLoading}
          >
            แก้ไขรีวิว
          </button>

          <button
            type="button"
            className="inline-block px-[22px] py-[13px] bg-[#382333] text-[#fda4af] rounded-lg text-sm font-semibold transition duration-300 hover:bg-[#51283a] hover:-translate-y-0.5 border-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            onClick={() => onDelete(review)}
            disabled={reviewLoading}
          >
            ลบรีวิว
          </button>
        </div>
      )}
    </article>
  );
}

export default ReviewCard;
