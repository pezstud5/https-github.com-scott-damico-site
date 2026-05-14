export default function Hero() {
  return (
    <section className="hero section-shell" id="top">
      <div className="hero-copy">
        <p className="kicker">Faculty Development / Political Science / Leadership</p>
        <h1>Teaching students to think, not just finish.</h1>
        <p className="hero-subtext">
          I design courses, workshops, and leadership learning that help people think clearly,
          act wisely, and teach better.
        </p>
        <div className="hero-actions" aria-label="Primary actions">
          <a className="button button-primary" href="#work">
            View Work
          </a>
          <a className="button button-secondary" href="#contact">
            Let&apos;s Collaborate
          </a>
        </div>
      </div>
      <div className="hero-image" aria-label="Professional profile photo">
        <div className="image-frame">
          <img
            className="profile-photo"
            src="/profile.jpg"
            alt="S. Damico speaking during a professional presentation"
            onError={(event) => {
              event.currentTarget.hidden = true;
            }}
          />
          <span>Faculty Development / Leadership Practice</span>
        </div>
      </div>
    </section>
  );
}
