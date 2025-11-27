import "../sass/AnnoucementsCard.scss";

export function AnnoucementCard() {
  return (
    <div className="annoucement-card !min-h-[361px]">
      <div className="text-white">
        <h1 className="!text-white">Announcement</h1>
        <div>
          GameGPT Alpha is live! Create, refine and improve your games, you’ll
          be allowed to submit your games for the arcade soon! Closed alpha for
          users with 500k duel on eth network or staked NFT's on base
        </div>
      </div>
      <a href="#" className="white-btn cta-btn">
        View Details
      </a>
    </div>
  );
}
