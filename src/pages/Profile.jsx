
import { Link } from "react-router-dom";

function Profile() {
  return (
    <main className="profile-page">
      <div className="profile-container">

        <div className="profile-heading">
          <span>GAMEHUB ACCOUNT</span>
          <h1>My Profile</h1>
          <p>Manage your account and gaming collection.</p>
        </div>

        <section className="profile-card">

          <div className="profile-user">
            <div className="profile-avatar">
              <span>G</span>
            </div>

            <div>
              <h2>Your Username</h2>
              <p>GameHub Member</p>
            </div>
          </div>

          <div className="profile-divider"></div>

          <h3>Account Information</h3>

          <div className="profile-info">
            <div>
              <span>Username</span>
              <p>Your Username</p>
            </div>

            <div>
              <span>Email Address</span>
              <p>example@email.com</p>
            </div>

            <div>
              <span>Account Type</span>
              <p>Member</p>
            </div>
          </div>

          <div className="profile-divider"></div>

          <div className="profile-actions">
            <Link to="/wishlist" className="profile-wishlist-btn">
              My Wishlist →
            </Link>

            <Link to="/games" className="profile-games-btn">
              Explore Games
            </Link>
          </div>

        </section>
      </div>
    </main>
  );
}

export default Profile;
