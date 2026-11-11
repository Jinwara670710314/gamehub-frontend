
function RatingStars({ value }) {
  const score = Math.max(
    0,
    Math.min(5, Number(value) || 0)
  );

  return (
    <span
      className="inline-flex"
      aria-label={`${score} จาก 5 ดาว`}
    >
      <span className="text-yellow-400">
        {"★".repeat(score)}
      </span>

      <span className="text-gray-500">
        {"★".repeat(5 - score)}
      </span>
    </span>
  );
}

export default RatingStars;
