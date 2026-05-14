const principles = [
  'Judgment-centered learning',
  'Active learning',
  'Practical application, usable immediately',
  'AI as a tool, not the focus',
];

export default function Approach() {
  return (
    <section className="approach split-section section-shell" id="approach">
      <div>
        <p className="section-number">04</p>
        <h2>Learning should build usable judgment.</h2>
      </div>
      <div className="principle-list">
        {principles.map((principle) => (
          <div className="principle" key={principle}>
            <span aria-hidden="true" />
            <p>{principle}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
