const areas = [
  'Crucial Teams / Crucial Conversations',
  '7 Habits of Highly Effective People',
  'FourSight',
  'Active Learning',
  'Classroom Management',
  'Generative AI in Teaching',
  'Leadership Development',
];

export default function FacilitationAreas() {
  return (
    <section className="facilitation section-shell" id="facilitation">
      <div className="section-heading">
        <p className="section-number">03</p>
        <h2>Facilitation Areas</h2>
      </div>
      <div className="area-list" aria-label="Facilitation areas">
        {areas.map((area) => (
          <p key={area}>{area}</p>
        ))}
      </div>
    </section>
  );
}
