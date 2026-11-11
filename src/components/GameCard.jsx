
import { Link } from "react-router-dom";

function GameCard({ game }) {
  return (
    <Link
      to={`/games/${game.id}`}
      className="block min-w-0 overflow-hidden bg-[#171d2b] border border-[#2b3449] rounded-xl transition-[transform,border-color] duration-[250ms] hover:-translate-y-1.5 hover:border-[#8b5cf6] no-underline text-inherit"
    >
      <img
        src={game.image}
        alt={game.name}
        className="block w-full aspect-video object-cover bg-[#20283a]"
      />

      <div className="p-[18px]">
        <h3 className="text-white text-[17px] mb-[9px]">
          {game.name}
        </h3>

        <p className="text-[#aab3ca] text-[14px]">
          {game.genre} · {game.year}
        </p>
      </div>
    </Link>
  );
}

export default GameCard;
