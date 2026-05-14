const topics = [
  'Active learning',
  'Leadership development',
  'Crucial Teams / 7 Habits',
  'FourSight',
  'Classroom engagement',
  'AI in teaching',
];

export default function Speaking() {
  return (
    <section className="speaking section-shell" id="speaking">
      <div className="speaking-intro">
        <p className="section-number">05</p>
        <h2>Sessions that people actually use the next day.</h2>
        <figure className="speaking-photo">
          <img
            src="/speaking.png"
            alt="S. Damico facilitating a professional workshop"
            onError={(event) => {
              event.currentTarget.hidden = true;
            }}
          />
          <figcaption>Facilitation built around practice, transfer, and usable tools.</figcaption>
        </figure>
      </div>
      <div className="topic-grid" aria-label="Speaking topics">
        {topics.map((topic) => (
          <p key={topic}>{topic}</p>
        ))}
      </div>
    </section>
  );
}
